import { ACADEMIC_REFERENCES } from '../data/references.ts';

export interface AssistantHistoryItem {
  sender: string;
  text: string;
}

export interface AssistantRequestPayload {
  message?: string;
  categoryFilter?: string;
  history?: AssistantHistoryItem[];
}

export interface AssistantSuccessResult {
  reply: string;
  recommendedIds: string[];
  searchQueries: string[];
  suggestedTopics: string[];
}

export interface AssistantErrorResult {
  status: number;
  error: string;
}

export const SYSTEM_INSTRUCTION = `
Anda adalah LibraMind AI, asisten referensi akademik dan riset perpustakaan universitas yang cerdas, akurat, dan objektif.
You also fluently assist students in English whenever the student writes in English. Always match the language of the student's latest message (Indonesian or English).

KEMAMPUAN UTAMA ANDA:
1. Penemuan Referensi Akademik (Academic Reference Discovery):
   - Memahami topik riset dan pertanyaan akademik mahasiswa.
   - Menyarankan kata kunci akademik yang tepat serta kueri pencarian efektif untuk database ilmiah (Google Scholar, SINTA, Garuda, IEEE Xplore, ScienceDirect, Scopus).
   - Merekomendasikan jenis koleksi yang sesuai (Buku, Jurnal, E-book, Skripsi) serta memilih referensi yang benar-benar relevan dari Katalog LibraMind yang diberikan.
2. Asistensi Riset (Research Assistance):
   - Membantu mempersempit atau merumuskan topik penelitian.
   - Menjelaskan konsep akademik dan kerangka teori yang relevan.
   - Memberikan arahan riset serta cara menyusun tinjauan pustaka (Bab II / Literature Review).
3. Bimbingan Akademik (Academic Guidance):
   - Menjelaskan metodologi penelitian (kualitatif, kuantitatif, mixed methods, SLR, R&D, dll.) dan terminologi ilmiah.
   - Memberikan panduan mengevaluasi kredibilitas sumber ilmiah dan menyusun strategi pencarian pustaka.

ATURAN KETAT ANTI-FABRIKASI (WAJIB DIPATUHI):
- DILARANG KERAS mengarang atau memalsukan judul publikasi, nama penulis, tahun terbit, DOI, atau URL apa pun.
- Anda HANYA boleh mencantumkan ID dari Katalog LibraMind JSON pada field "recommendedIds" jika referensi tersebut benar-benar ada di katalog dan relevan dengan pertanyaan mahasiswa.
- Jika tidak ada item di katalog LibraMind yang cocok dengan topik mahasiswa, kembalikan "recommendedIds": [] dan jelaskan secara jujur bahwa rekomendasi tambahan yang Anda berikan pada "searchQueries" adalah SARAN PENCARIAN (search suggestions) untuk ditelusuri di database akademik, bukan publikasi terverifikasi.
`.trim();

export function buildConversationTurns(
  payload: AssistantRequestPayload
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  const message = (payload.message || '').trim();
  const categoryFilter = payload.categoryFilter || 'Semua';

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

  const priorTurns: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  if (Array.isArray(payload.history)) {
    const cleaned = payload.history
      .filter((h) => h && typeof h.text === 'string' && h.text.trim() !== '')
      .slice(-10);

    for (const item of cleaned) {
      const role: 'user' | 'model' = item.sender === 'user' ? 'user' : 'model';
      if (priorTurns.length === 0 && role === 'model') {
        continue;
      }
      const prev = priorTurns[priorTurns.length - 1];
      if (prev && prev.role === role) {
        prev.parts[0].text += `\n\n${item.text.trim()}`;
      } else {
        priorTurns.push({ role, parts: [{ text: item.text.trim() }] });
      }
    }
    if (
      priorTurns.length > 0 &&
      priorTurns[priorTurns.length - 1].role === 'user'
    ) {
      priorTurns.pop();
    }
  }

  const currentPrompt = `
Konteks Katalog Terverifikasi Perpustakaan LibraMind (JSON):
${JSON.stringify(catalogSummary, null, 2)}

Filter Kategori Koleksi Aktif: ${categoryFilter}

Pesan Mahasiswa Saat Ini:
"${message}"

Instruksi Output (kembalikan JSON valid sesuai skema):
1. "reply": Berikan respons akademik yang terstruktur, jelas, dan membantu (dalam Bahasa Indonesia jika pesan berbahasa Indonesia, atau Bahasa Inggris jika pesan berbahasa Inggris). Jelaskan konsep/metode/arahan riset yang ditanyakan, relevansi referensi katalog (jika ada yang cocok), atau arahkan strategi pencarian bila topik berada di luar katalog lokal—dengan menegaskan mana yang merupakan saran pencarian dan tanpa mengarang kutipan/DOI palsu.
2. "recommendedIds": Pilih 0 hingga 5 ID referensi dari Katalog LibraMind JSON di atas yang benar-benar relevan (prioritaskan jenis koleksi "${categoryFilter}" jika bukan "Semua"). Jangan memaksa memilih ID yang tidak relevan.
3. "searchQueries": Berikan 2 hingga 3 saran kueri/kata kunci pencarian untuk database akademik (seperti Google Scholar, SINTA, Garuda, atau Scopus) sebagai saran pencarian (search suggestions).
4. "suggestedTopics": Berikan 3 saran pertanyaan atau topik lanjutan singkat sesuai bahasa mahasiswa agar percakapan dapat dilanjutkan.
`.trim();

  return [
    ...priorTurns,
    { role: 'user' as const, parts: [{ text: currentPrompt }] },
  ];
}

export function parseGeminiJsonOutput(rawText: string): AssistantSuccessResult {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: {
    reply?: string;
    recommendedIds?: string[];
    searchQueries?: string[];
    suggestedTopics?: string[];
  };

  try {
    parsed = JSON.parse(cleaned || '{}');
  } catch {
    parsed = {
      reply: cleaned,
      recommendedIds: [],
      searchQueries: [],
      suggestedTopics: [],
    };
  }

  const validIds = new Set(ACADEMIC_REFERENCES.map((r) => r.id));
  const safeIds = Array.isArray(parsed.recommendedIds)
    ? parsed.recommendedIds.filter((id) => validIds.has(id))
    : [];

  return {
    reply:
      (typeof parsed.reply === 'string' && parsed.reply.trim()) ||
      'Maaf, saya belum menerima teks jawaban dari model AI. Silakan ulangi pertanyaan Anda.',
    recommendedIds: safeIds,
    searchQueries: Array.isArray(parsed.searchQueries)
      ? parsed.searchQueries
          .filter((q) => typeof q === 'string' && q.trim() !== '')
          .slice(0, 3)
      : [],
    suggestedTopics: Array.isArray(parsed.suggestedTopics)
      ? parsed.suggestedTopics
          .filter((t) => typeof t === 'string' && t.trim() !== '')
          .slice(0, 3)
      : [],
  };
}

export function classifyGeminiError(
  rawMessage: string,
  statusHint?: number
): AssistantErrorResult {
  const lower = rawMessage.toLowerCase();

  if (
    statusHint === 400 &&
    (lower.includes('api_key_invalid') ||
      lower.includes('api key not valid') ||
      lower.includes('invalid api key'))
  ) {
    return {
      status: 400,
      error:
        'Kunci API Gemini tidak valid. Mohon periksa konfigurasi GEMINI_API_KEY di Settings > Secrets atau Cloudflare Pages Secrets.',
    };
  }

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid api key')
  ) {
    return {
      status: 400,
      error:
        'Kunci API Gemini tidak valid. Mohon periksa konfigurasi GEMINI_API_KEY di Settings > Secrets atau Cloudflare Pages Secrets.',
    };
  }

  if (
    statusHint === 403 ||
    lower.includes('permission_denied') ||
    lower.includes('permission denied')
  ) {
    return {
      status: 403,
      error:
        'Akses ke Gemini API ditolak (403). Pastikan GEMINI_API_KEY aktif dan memiliki izin akses model.',
    };
  }

  if (
    statusHint === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return {
      status: 429,
      error:
        'Batas permintaan Gemini API tercapai sementara (429). Silakan tunggu beberapa detik lalu coba kirim ulang pesan Anda.',
    };
  }

  if (statusHint === 404 || lower.includes('not_found')) {
    return {
      status: 404,
      error:
        'Model Gemini yang dikonfigurasi tidak ditemukan atau belum tersedia pada endpoint ini.',
    };
  }

  if (
    statusHint === 503 ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('overloaded')
  ) {
    return {
      status: 503,
      error:
        'Server Gemini sedang mengalami lonjakan permintaan sementara. Silakan tunggu beberapa detik lalu klik "Coba Kirim Ulang".',
    };
  }

  return {
    status: statusHint && statusHint >= 400 ? statusHint : 500,
    error: `Gagal menghubungi Asisten AI LibraMind: ${rawMessage}`,
  };
}
