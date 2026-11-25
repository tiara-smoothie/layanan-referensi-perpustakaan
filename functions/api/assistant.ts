import {
  SYSTEM_INSTRUCTION,
  buildConversationTurns,
  classifyGeminiError,
  parseGeminiJsonOutput,
  type AssistantRequestPayload,
} from '../../src/lib/assistantCore.ts';

interface CloudflareEnv {
  GEMINI_API_KEY?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: CloudflareEnv;
}

interface GoogleModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

const PRIMARY_MODEL = 'gemini-2.5-flash';
const PER_MODEL_TIMEOUT_MS = 11000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
}

async function discoverFallbackModels(
  apiKey: string,
  excludeModel: string
): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',
      {
        headers: { 'x-goog-api-key': apiKey },
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: GoogleModelInfo[] };
    const candidates = (data.models || [])
      .filter((m) =>
        m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m) => (m.name || '').replace(/^models\//, ''))
      .filter((id) => {
        if (!id || id === excludeModel) return false;
        const lower = id.toLowerCase();
        // Exclude non-text, deprecated, or specialized modalities
        if (
          lower.includes('tts') ||
          lower.includes('image') ||
          lower.includes('audio') ||
          lower.includes('live') ||
          lower.includes('embedding') ||
          lower.includes('aqa') ||
          lower.includes('robotics') ||
          lower.includes('computer-use') ||
          lower.includes('deep-research') ||
          lower.includes('gemini-1.') ||
          lower.includes('gemini-2.0') ||
          lower.includes('gemma')
        ) {
          return false;
        }
        return (
          lower.includes('flash') ||
          lower.includes('lite') ||
          lower.includes('hydrogen') ||
          lower.includes('pro')
        );
      });

    // Prefer fast/lite models first so responses stay well under Cloudflare timeouts
    const score = (id: string): number => {
      const l = id.toLowerCase();
      if (l.includes('4-hydrogen')) return 10;
      if (l.includes('3.1-flash-lite')) return 20;
      if (l.includes('2.5-flash-lite')) return 30;
      if (l.includes('flash-lite')) return 35;
      if (l.includes('3-flash')) return 40;
      if (l.includes('flash')) return 50;
      if (l.includes('pro')) return 70;
      return 80;
    };

    return candidates.sort((a, b) => score(a) - score(b)).slice(0, 2);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; errorText: string }
> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        reply: { type: 'STRING' },
        recommendedIds: { type: 'ARRAY', items: { type: 'STRING' } },
        searchQueries: { type: 'ARRAY', items: { type: 'STRING' } },
        suggestedTopics: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: [
        'reply',
        'recommendedIds',
        'searchQueries',
        'suggestedTopics',
      ],
    },
  };

  if (model.startsWith('gemini-2.5-flash') && !model.includes('lite')) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const requestPayload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);

  try {
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    const resText = await geminiRes.text();
    if (!geminiRes.ok) {
      let errorText = resText || `HTTP ${geminiRes.status}`;
      try {
        const parsedErr = JSON.parse(resText) as {
          error?: { message?: string };
        };
        if (parsedErr.error?.message) {
          errorText = parsedErr.error.message;
        }
      } catch {
        // Keep raw error text
      }
      return { ok: false, status: geminiRes.status, errorText };
    }

    const geminiJson = JSON.parse(resText) as {
      candidates?: {
        content?: { parts?: { text?: string; thought?: boolean }[] };
      }[];
    };

    const parts = geminiJson.candidates?.[0]?.content?.parts || [];
    const textParts = parts
      .filter((p) => !p.thought && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('');

    if (!textParts.trim()) {
      return {
        ok: false,
        status: 502,
        errorText: 'Model mengembalikan respons kosong.',
      };
    }

    return { ok: true, text: textParts };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      status: isTimeout ? 504 : 503,
      errorText: isTimeout
        ? 'Permintaan ke model Gemini melebihi batas waktu.'
        : err instanceof Error
          ? err.message
          : 'Koneksi jaringan ke Gemini API terputus.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function onRequestPost(
  context: PagesFunctionContext
): Promise<Response> {
  try {
    const body = (await context.request.json()) as AssistantRequestPayload;
    const message = (body.message || '').trim();

    if (!message) {
      return jsonResponse(
        {
          error:
            'Silakan masukkan topik penelitian atau pertanyaan akademik Anda.',
        },
        400
      );
    }

    const apiKey = context.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return jsonResponse(
        {
          error:
            'Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi pada Cloudflare Pages Secrets.',
        },
        503
      );
    }

    const contents = buildConversationTurns(body);

    // 1. Try primary model first
    const primaryAttempt = await callGeminiModel(
      PRIMARY_MODEL,
      apiKey,
      contents
    );
    if (primaryAttempt.ok) {
      return jsonResponse(parseGeminiJsonOutput(primaryAttempt.text), 200);
    }

    let lastStatus = primaryAttempt.status;
    let lastErrorText = primaryAttempt.errorText;
    let lastModel = PRIMARY_MODEL;

    // 2. If auth/invalid key, fail immediately
    if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
      const classified = classifyGeminiError(lastErrorText, lastStatus);
      return jsonResponse(
        { error: `${classified.error} (${lastModel}, HTTP ${lastStatus})` },
        classified.status
      );
    }

    // 3. Dynamically discover live available fallback models on this API key
    const fallbackModels = await discoverFallbackModels(apiKey, PRIMARY_MODEL);
    for (const model of fallbackModels) {
      lastModel = model;
      const attempt = await callGeminiModel(model, apiKey, contents);
      if (attempt.ok) {
        return jsonResponse(parseGeminiJsonOutput(attempt.text), 200);
      }
      lastStatus = attempt.status;
      lastErrorText = attempt.errorText;
      if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
        break;
      }
    }

    const classified = classifyGeminiError(lastErrorText, lastStatus);
    return jsonResponse(
      { error: `${classified.error} (${lastModel}, HTTP ${lastStatus})` },
      classified.status
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Format permintaan tidak valid atau gagal membaca JSON.';
    return jsonResponse({ error: msg }, 400);
  }
}
