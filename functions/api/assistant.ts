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

const CLOUDFLARE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

const PER_MODEL_TIMEOUT_MS = 9500;

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

    let lastStatus = 500;
    let lastErrorText = 'Gagal menghubungi Gemini API.';
    let lastModel = CLOUDFLARE_MODELS[0];

    for (let i = 0; i < CLOUDFLARE_MODELS.length; i++) {
      const model = CLOUDFLARE_MODELS[i];
      lastModel = model;
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

      // Disable thinking latency on gemini-2.5-flash so responses arrive in ~1-3s
      if (model === 'gemini-2.5-flash') {
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
      const timeoutId = setTimeout(
        () => controller.abort(),
        PER_MODEL_TIMEOUT_MS
      );

      let geminiRes: Response;
      try {
        geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
      } catch (networkErr: unknown) {
        clearTimeout(timeoutId);
        const isTimeout =
          networkErr instanceof Error && networkErr.name === 'AbortError';
        lastStatus = 504;
        lastErrorText = isTimeout
          ? 'Permintaan ke model Gemini melebihi batas waktu.'
          : networkErr instanceof Error
            ? networkErr.message
            : 'Koneksi jaringan ke Gemini API terputus.';

        if (i < CLOUDFLARE_MODELS.length - 1) {
          continue;
        }
        return jsonResponse(
          {
            error: `Koneksi ke layanan Gemini terlalu lama (${lastModel}). Silakan klik "Coba Kirim Ulang".`,
          },
          504
        );
      } finally {
        clearTimeout(timeoutId);
      }

      const resText = await geminiRes.text();
      if (!geminiRes.ok) {
        lastStatus = geminiRes.status;
        try {
          const parsedErr = JSON.parse(resText) as {
            error?: { message?: string };
          };
          lastErrorText = parsedErr.error?.message || resText;
        } catch {
          lastErrorText = resText || `HTTP ${geminiRes.status}`;
        }

        const shouldFallback =
          geminiRes.status === 404 ||
          geminiRes.status === 429 ||
          geminiRes.status >= 500;

        if (shouldFallback && i < CLOUDFLARE_MODELS.length - 1) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }

        const classified = classifyGeminiError(lastErrorText, lastStatus);
        return jsonResponse(
          { error: `${classified.error} (${lastModel}, HTTP ${lastStatus})` },
          classified.status
        );
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
        if (i < CLOUDFLARE_MODELS.length - 1) {
          continue;
        }
        return jsonResponse(
          {
            error:
              'Gemini API mengembalikan respons kosong. Silakan coba ulangi pertanyaan Anda.',
          },
          502
        );
      }

      const result = parseGeminiJsonOutput(textParts);
      return jsonResponse(result, 200);
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
