import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { ACADEMIC_REFERENCES } from './src/data/references.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'LibraMind API' });
  });

  app.post('/api/assistant', async (req, res) => {
    try {
      const body = req.body as {
        message?: string;
        categoryFilter?: string;
        history?: { sender: string; text: string }[];
      };

      const message = (body.message || '').trim();
      const categoryFilter = body.categoryFilter || 'Semua';

      if (!message) {
        return res.status(400).json({
          error: 'Silakan masukkan topik penelitian atau kebutuhan informasi Anda.',
        });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            'Kunci API Gemini belum dikonfigurasi pada server. Silakan periksa panel Settings > Secrets.',
        });
      }

      const catalogSummary = ACADEMIC_REFERENCES.map((ref) => ({
        id: ref.id,
        title: ref.title,
        author: ref.author,
        year: ref.year,
        type: ref.type,
        availability: ref.availability,
        keywords: ref.keywords,
        abstract: ref.abstract,
      }));

      const conversationHistory = Array.isArray(body.history)
        ? body.history
            .slice(-6)
            .map(
              (h) =>
                `${h.sender === 'user' ? 'Mahasiswa' : 'LibraMind AI'}: ${h.text}`
            )
            .join('\n')
        : '';

      const prompt = `
Konteks Katalog Perpustakaan LibraMind (JSON):
${JSON.stringify(catalogSummary, null, 2)}

Filter Kategori Aktif Saat Ini: ${categoryFilter}
Riwayat Percakapan Singkat:
${conversationHistory || '(Percakapan baru)'}

Pertanyaan / Topik Riset Mahasiswa:
"${message}"

Tugas Anda:
1. Berikan jawaban dalam bahasa Indonesia akademik yang ramah, terstruktur, dan ringkas (maksimal 3-4 kalimat utama atau poin ringkas) mengenai bagaimana topik tersebut dapat diteliti menggunakan koleksi LibraMind.
2. Pilih 2 hingga 5 ID referensi PALING RELEVAN dari katalog di atas (gunakan persis nilai "id" dari JSON katalog). Jika Filter Kategori bukan "Semua", prioritaskan koleksi dengan "type" yang sesuai filter tersebut, namun bila tidak ada yang cocok persis, tetap sarankan referensi paling relevan dan jelaskan alasannya.
3. Berikan 3 saran topik lanjutan singkat dalam bahasa Indonesia (maksimal 5 kata per topik) agar mahasiswa dapat memperdalam pencarian.
`.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah LibraMind AI, asisten referensi akademik perpustakaan universitas di Indonesia. Anda selalu menjawab dalam Bahasa Indonesia yang jelas, objektif, dan hanya merekomendasikan ID referensi yang benar-benar ada pada JSON katalog yang diberikan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description:
                  'Penjelasan ringkas dan membantu dalam Bahasa Indonesia mengenai relevansi referensi terhadap topik mahasiswa.',
              },
              recommendedIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Daftar ID referensi yang tepat dari katalog (misal: ["ref-01", "ref-03"]).',
              },
              suggestedTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  '3 saran kata kunci atau topik pencarian lanjutan berbahasa Indonesia.',
              },
            },
            required: ['reply', 'recommendedIds', 'suggestedTopics'],
          },
        },
      });

      const rawText = (response.text || '{}').trim();
      let parsed: {
        reply?: string;
        recommendedIds?: string[];
        suggestedTopics?: string[];
      };

      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {
          reply: rawText,
          recommendedIds: [],
          suggestedTopics: [],
        };
      }

      const validIds = new Set(ACADEMIC_REFERENCES.map((r) => r.id));
      const safeIds = Array.isArray(parsed.recommendedIds)
        ? parsed.recommendedIds.filter((id) => validIds.has(id))
        : [];

      return res.json({
        reply:
          parsed.reply ||
          'Berikut rekomendasi referensi akademik yang relevan dengan topik penelitian Anda.',
        recommendedIds: safeIds,
        suggestedTopics: Array.isArray(parsed.suggestedTopics)
          ? parsed.suggestedTopics.slice(0, 3)
          : [],
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan pada layanan AI.';
      console.error('Gemini assistant error:', err);
      return res.status(500).json({
        error: `Gagal menghubungi Asisten AI LibraMind: ${errorMessage}`,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LibraMind server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
