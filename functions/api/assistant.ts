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

const CLOUDFLARE_MODELS = ['gemini-2.5-flash', 'gemini-4-hydrogen'];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
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

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
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
      },
    };

    let lastStatus = 500;
    let lastErrorText = 'Gagal menghubungi Gemini API.';

    for (const model of CLOUDFLARE_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const geminiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestPayload),
      });

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
        // Only try fallback model if this model wasn't found (404)
        if (geminiRes.status === 404) {
          continue;
        }
        const classified = classifyGeminiError(lastErrorText, lastStatus);
        return jsonResponse({ error: classified.error }, classified.status);
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
    return jsonResponse({ error: classified.error }, classified.status);
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Format permintaan tidak valid atau gagal membaca JSON.';
    return jsonResponse({ error: msg }, 400);
  }
}
