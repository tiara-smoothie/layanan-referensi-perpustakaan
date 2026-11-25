import type { ExternalReference } from '../types.ts';

const FILLER_WORDS = new Set([
  'tolong',
  'carikan',
  'cariin',
  'cari',
  'mencari',
  'rekomendasi',
  'rekomendasikan',
  'referensi',
  'pustaka',
  'literatur',
  'sumber',
  'jurnal',
  'artikel',
  'buku',
  'ebook',
  'e-book',
  'skripsi',
  'tesis',
  'penelitian',
  'tentang',
  'mengenai',
  'terkait',
  'untuk',
  'yang',
  'dari',
  'pada',
  'dalam',
  'dengan',
  'dan',
  'atau',
  'apa',
  'itu',
  'bagaimana',
  'jelaskan',
  'ada',
  'gak',
  'ga',
  'tidak',
  'dong',
  'nih',
  'ya',
  'bisa',
  'keluar',
  'luar',
  'katalog',
  'please',
  'find',
  'search',
  'recommend',
  'references',
  'papers',
  'articles',
  'books',
  'about',
  'regarding',
  'for',
  'the',
  'what',
  'how',
]);

export function extractAcademicSearchQuery(rawInput: string): string {
  const cleaned = rawInput
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  const tokens = cleaned.split(' ');
  const keywords = tokens.filter(
    (t) => t.length > 1 && !FILLER_WORDS.has(t.toLowerCase())
  );

  const selected = (keywords.length >= 2 ? keywords : tokens).slice(0, 7);
  return selected.join(' ').trim();
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapCrossrefType(rawType?: string): string {
  switch (rawType) {
    case 'journal-article':
      return 'Jurnal';
    case 'book':
    case 'monograph':
    case 'edited-book':
      return 'Buku';
    case 'book-chapter':
      return 'Bab Buku';
    case 'proceedings-article':
      return 'Prosiding';
    case 'dissertation':
      return 'Disertasi/Tesis';
    default:
      return 'Artikel Ilmiah';
  }
}

interface CrossrefAuthor {
  given?: string;
  family?: string;
  name?: string;
}

interface CrossrefItem {
  DOI?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  published?: { 'date-parts'?: number[][] };
  'published-print'?: { 'date-parts'?: number[][] };
  'published-online'?: { 'date-parts'?: number[][] };
  created?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  publisher?: string;
  type?: string;
  URL?: string;
}

async function searchCrossref(
  query: string,
  categoryFilter: string | undefined,
  timeoutMs: number
): Promise<ExternalReference[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const params = new URLSearchParams({
      query,
      rows: '5',
      select:
        'DOI,title,author,published,published-print,published-online,created,container-title,publisher,type,URL',
      mailto: 'library@libramind.edu',
    });

    if (categoryFilter === 'Buku' || categoryFilter === 'E-book') {
      params.set('filter', 'type:book,type:monograph,type:book-chapter');
    } else if (categoryFilter === 'Jurnal') {
      params.set('filter', 'type:journal-article');
    }

    const res = await fetch(
      `https://api.crossref.org/works?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    if (!res.ok) return [];
    const json = (await res.json()) as {
      message?: { items?: CrossrefItem[] };
    };
    const items = json.message?.items || [];

    const results: ExternalReference[] = [];
    for (const item of items) {
      const rawTitle = item.title?.[0];
      if (!rawTitle) continue;
      const title = stripHtmlTags(rawTitle);
      if (!title) continue;

      const authorsList = (item.author || [])
        .map((a) =>
          [a.given, a.family].filter(Boolean).join(' ').trim() || a.name || ''
        )
        .filter(Boolean);

      const authors =
        authorsList.length === 0
          ? 'Penulis Tercatat di Crossref'
          : authorsList.length <= 2
            ? authorsList.join(' & ')
            : `${authorsList.slice(0, 2).join(', ')}, dkk.`;

      const year =
        item.published?.['date-parts']?.[0]?.[0] ||
        item['published-print']?.['date-parts']?.[0]?.[0] ||
        item['published-online']?.['date-parts']?.[0]?.[0] ||
        item.created?.['date-parts']?.[0]?.[0];

      const source =
        stripHtmlTags(item['container-title']?.[0] || '') ||
        stripHtmlTags(item.publisher || '') ||
        'Repositori Crossref';

      const doi = item.DOI?.trim();
      const url =
        item.URL?.trim() || (doi ? `https://doi.org/${doi}` : '');
      if (!url) continue;

      results.push({
        id: doi ? `ext-cr-${doi}` : `ext-cr-${results.length}-${title.slice(0, 20)}`,
        title,
        authors,
        year: typeof year === 'number' && year > 1800 ? year : undefined,
        source,
        type: mapCrossrefType(item.type),
        doi,
        url,
        provider: 'Crossref',
      });

      if (results.length >= 4) break;
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

interface OpenAlexWork {
  id?: string;
  title?: string;
  publication_year?: number;
  type?: string;
  doi?: string;
  authorships?: { author?: { display_name?: string } }[];
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  };
  open_access?: {
    is_oa?: boolean;
    oa_url?: string;
  };
}

async function searchOpenAlex(
  query: string,
  timeoutMs: number
): Promise<ExternalReference[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const params = new URLSearchParams({
      search: query,
      'per-page': '4',
      select:
        'id,title,publication_year,type,doi,authorships,primary_location,open_access',
    });

    const res = await fetch(
      `https://api.openalex.org/works?${params.toString()}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    if (!res.ok) return [];
    const json = (await res.json()) as { results?: OpenAlexWork[] };
    const works = json.results || [];

    const results: ExternalReference[] = [];
    for (const work of works) {
      if (!work.title) continue;
      const title = stripHtmlTags(work.title);
      const authorNames = (work.authorships || [])
        .map((a) => a.author?.display_name || '')
        .filter(Boolean);
      const authors =
        authorNames.length === 0
          ? 'Penulis Tercatat di OpenAlex'
          : authorNames.length <= 2
            ? authorNames.join(' & ')
            : `${authorNames.slice(0, 2).join(', ')}, dkk.`;

      const cleanDoi = work.doi
        ? work.doi.replace(/^https?:\/\/doi\.org\//i, '')
        : undefined;
      const url =
        work.open_access?.oa_url ||
        work.primary_location?.landing_page_url ||
        work.doi ||
        work.id ||
        '';
      if (!url) continue;

      const typeLabel =
        work.type === 'book' || work.type === 'monograph'
          ? 'Buku'
          : work.type === 'dissertation'
            ? 'Disertasi/Tesis'
            : 'Jurnal';

      results.push({
        id: work.id || `ext-oa-${results.length}`,
        title,
        authors,
        year: work.publication_year,
        source:
          work.primary_location?.source?.display_name || 'Indeks OpenAlex',
        type: typeLabel,
        doi: cleanDoi,
        url,
        isOpenAccess: Boolean(work.open_access?.is_oa),
        provider: 'OpenAlex',
      });
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchExternalAcademicReferences(
  rawQuery: string,
  categoryFilter?: string
): Promise<ExternalReference[]> {
  const query = extractAcademicSearchQuery(rawQuery);
  if (query.length < 3) return [];

  const deadline = Date.now() + 2500;
  const remaining = () => Math.max(400, deadline - Date.now());

  const filteredResults = await searchCrossref(query, categoryFilter, 2000);
  if (filteredResults.length > 0 || Date.now() >= deadline - 300) {
    return filteredResults;
  }

  if (categoryFilter && categoryFilter !== 'Semua') {
    const unfiltered = await searchCrossref(query, 'Semua', remaining());
    if (unfiltered.length > 0 || Date.now() >= deadline - 300) {
      return unfiltered;
    }
  }

  return searchOpenAlex(query, remaining());
}
