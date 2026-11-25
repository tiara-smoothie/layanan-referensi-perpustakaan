import { GoogleGenAI, Type } from '@google/genai';
import {
  SYSTEM_INSTRUCTION,
  buildConversationTurns,
  classifyGeminiError,
  parseGeminiJsonOutput,
  type AssistantErrorResult,
  type AssistantRequestPayload,
  type AssistantSuccessResult,
} from './assistantCore.ts';

export type { AssistantRequestPayload };

const MODEL_NAME = 'gemini-4-hydrogen';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runGeminiAssistant(
  payload: AssistantRequestPayload,
  apiKey: string | undefined
): Promise<
  | { ok: true; data: AssistantSuccessResult }
  | { ok: false; error: AssistantErrorResult }
> {
  const message = (payload.message || '').trim();

  if (!message) {
    return {
      ok: false,
      error: {
        status: 400,
        error:
          'Silakan masukkan topik penelitian atau pertanyaan akademik Anda.',
      },
    };
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return {
      ok: false,
      error: {
        status: 503,
        error:
          'Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi pada server. Silakan tambahkan GEMINI_API_KEY di panel Settings > Secrets (AI Studio) atau Environment Variables / Secrets (Cloudflare Pages).',
      },
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const contents = buildConversationTurns(payload);
  let lastError: AssistantErrorResult | null = null;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description:
                  'Jawaban akademik terstruktur dalam bahasa yang sama dengan pesan mahasiswa.',
              },
              recommendedIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Daftar ID referensi terverifikasi dari katalog LibraMind (0-5 item).',
              },
              searchQueries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  '2-3 saran kata kunci atau kueri pencarian database akademik.',
              },
              suggestedTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 saran pertanyaan atau topik lanjutan singkat.',
              },
            },
            required: [
              'reply',
              'recommendedIds',
              'searchQueries',
              'suggestedTopics',
            ],
          },
        },
      });

      const rawText = (response.text || '').trim();
      if (!rawText) {
        throw new Error('Model Gemini mengembalikan respons kosong.');
      }

      return {
        ok: true,
        data: parseGeminiJsonOutput(rawText),
      };
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan pada layanan AI.';
      const classified = classifyGeminiError(rawMessage);
      lastError = classified;
      if (attempt < maxAttempts && classified.status >= 500) {
        await sleep(500 * attempt);
        continue;
      }
      break;
    }
  }

  return {
    ok: false,
    error: lastError || {
      status: 500,
      error: 'Terjadi kesalahan saat menghubungi layanan Asisten AI.',
    },
  };
}
