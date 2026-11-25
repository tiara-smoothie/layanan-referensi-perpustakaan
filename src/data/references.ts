import type { ReferenceItem } from '../types.ts';

export const HERO_LIBRARY_IMAGE =
  '/src/assets/images/hero_library_study_1795577363605.jpg';

const COVER_AI = '/src/assets/images/cover_ai_monograph_1795577362678.jpg';
const COVER_METHOD =
  '/src/assets/images/cover_research_methodology_1795577363189.jpg';
const COVER_JOURNAL =
  '/src/assets/images/cover_digital_journal_1795577363873.jpg';
const COVER_THESIS =
  '/src/assets/images/cover_university_thesis_1795577364311.jpg';

export const ACADEMIC_REFERENCES: ReferenceItem[] = [
  {
    id: 'ref-01',
    title: 'Kecerdasan Buatan dalam Layanan Perpustakaan Perguruan Tinggi Modern',
    author: 'Prof. Dr. Bambang Setiawan & Larasati Putri, M.Hum.',
    year: 2024,
    type: 'Buku',
    availability: 'Tersedia',
    coverUrl: COVER_AI,
    publisher: 'Penerbit Universitas Indonesia Press',
    callNumber: 'Z 678.9 .S48 2024',
    language: 'Indonesia',
    pages: 312,
    abstract:
      'Monograf komprehensif yang membahas penerapan sistem temu balik informasi berbasis kecerdasan buatan, pemrosesan bahasa alami untuk katalogisasi otomatis, serta etika kurasi sumber ilmiah di perpustakaan akademik Indonesia.',
    keywords: [
      'kecerdasan buatan',
      'perpustakaan digital',
      'temu balik informasi',
      'katalogisasi',
    ],
    isDigital: false,
    isPhysical: true,
    physicalCopiesTotal: 4,
    physicalCopiesAvailable: 3,
    shelfLocation: 'Rak A-14 · Lantai 2 (Koleksi Ilmu Perpustakaan)',
  },
  {
    id: 'ref-02',
    title: 'Metodologi Penelitian Kuantitatif, Kualitatif, dan Kombinasi (Mixed Methods)',
    author: 'Prof. Dr. Sugiyono',
    year: 2023,
    type: 'Buku',
    availability: 'Tersedia',
    coverUrl: COVER_METHOD,
    publisher: 'Alfabeta Bandung',
    callNumber: 'H 62 .S84 2023',
    language: 'Indonesia',
    pages: 486,
    abstract:
      'Panduan utama perancangan penelitian akademik mulai dari perumusan masalah, penyusunan kerangka teori Bab II, teknik pengambilan sampel, validasi instrumen, hingga analisis data kuantitatif dan kualitatif.',
    keywords: [
      'metode penelitian',
      'kualitatif',
      'kuantitatif',
      'skripsi',
      'instrumen penelitian',
    ],
    isDigital: false,
    isPhysical: true,
    physicalCopiesTotal: 6,
    physicalCopiesAvailable: 4,
    shelfLocation: 'Rak B-03 · Lantai 1 (Referensi Umum)',
  },
  {
    id: 'ref-03',
    title: 'Implementasi Retrieval-Augmented Generation untuk Pencarian Referensi Akademik Berbahasa Indonesia',
    author: 'Raka Pratama, S.Kom., M.T. & Dr. Nadia Kusuma',
    year: 2025,
    type: 'Jurnal',
    availability: 'Tersedia Digital',
    coverUrl: COVER_JOURNAL,
    publisher: 'Jurnal Ilmu Komputer dan Informasi (JIKI)',
    callNumber: 'JRN-2025-041',
    doi: '10.21609/jiki.v18i1.1248',
    language: 'Indonesia',
    pages: 18,
    abstract:
      'Penelitian ini mengevaluasi arsitektur Retrieval-Augmented Generation (RAG) pada korpus repositori skripsi dan jurnal terakreditasi SINTA guna meningkatkan presisi sitasi mahasiswa tingkat akhir hingga 34%.',
    keywords: [
      'RAG',
      'AI',
      'pencarian referensi',
      'perpustakaan',
      'pemrosesan bahasa alami',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'PDF & Teks Terstruktur',
    fileSize: '2,4 MB',
    digitalSections: [
      {
        heading: '1. Pendahuluan & Latar Belakang',
        content:
          'Mahasiswa tingkat akhir sering mengalami hambatan dalam menavigasi ribuan artikel repositori menggunakan kata kunci konvensional. Pendekatan berbasis semantik melalui embedding dan model bahasa generatif memungkinkan pemetaan niat riset secara kontekstual.',
      },
      {
        heading: '2. Arsitektur Sistem & Dataset Evaluasi',
        content:
          'Pengujian dilakukan menggunakan 12.500 abstrak jurnal terindeks SINTA 1–3 dengan indeks vektor hibrida BM25 dan dense embedding. Validasi relevansi dilakukan oleh tiga pustakawan subjek senior.',
      },
      {
        heading: '3. Temuan Utama & Rekomendasi',
        content:
          'Pendekatan hibrida menghasilkan nilai MRR@10 sebesar 0,84, melampaui pencarian leksikal tradisional sebesar 0,59, sekaligus menekan risiko halusinasi rujukan saat dipadukan dengan kurasi pustakawan.',
      },
    ],
  },
  {
    id: 'ref-04',
    title: 'Pengantar Sistem Informasi Manajemen & Transformasi Digital Kampus',
    author: 'Dr. Ir. Eko Indrajit & Mira Kartika, M.Kom.',
    year: 2023,
    type: 'E-book',
    availability: 'Tersedia Digital',
    coverUrl: COVER_AI,
    publisher: 'Penerbit Andi Digital',
    callNumber: 'EBK-2023-118',
    doi: '10.5554/ebk.sim.2023.118',
    language: 'Indonesia',
    pages: 274,
    abstract:
      'Buku elektronik yang menguraikan arsitektur sistem informasi perguruan tinggi, tata kelola data akademik, integrasi layanan perpustakaan digital, dan keamanan informasi berbasis standar ISO/IEC 27001.',
    keywords: [
      'sistem informasi',
      'transformasi digital',
      'tata kelola data',
      'kampus',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'EPUB / PDF Interaktif',
    fileSize: '5,8 MB',
    digitalSections: [
      {
        heading: 'Bab 1: Ekosistem Informasi Akademik',
        content:
          'Transformasi digital di perguruan tinggi menuntut interoperabilitas antara sistem informasi akademik, repositori karya ilmiah, dan portal layanan mahasiswa.',
      },
      {
        heading: 'Bab 4: Integrasi Repositori & Layanan Riset',
        content:
          'Perpustakaan modern bertindak sebagai pusat manajemen pengetahuan yang menghubungkan katalog fisik, basis data jurnal berlangganan, serta ruang kerja riset kolaboratif.',
      },
    ],
  },
  {
    id: 'ref-05',
    title: 'Analisis Sentimen Kebijakan Publik Menggunakan Model Transformer pada Media Sosial Indonesia',
    author: 'Dinda Ayu Permatasari (NIM 1906342108)',
    year: 2024,
    type: 'Skripsi',
    availability: 'Tersedia Digital',
    coverUrl: COVER_THESIS,
    publisher: 'Repositori Fakultas Ilmu Komputer',
    callNumber: 'SKR-FIK-2024-089',
    language: 'Indonesia',
    pages: 138,
    abstract:
      'Skripsi sarjana yang membandingkan performa IndoBERT dan XLM-RoBERTa dalam mengklasifikasikan sentimen publik terhadap kebijakan pendidikan tinggi dengan akurasi F1-score 89,4%.',
    keywords: [
      'IndoBERT',
      'analisis sentimen',
      'pembelajaran mesin',
      'skripsi',
      'kebijakan publik',
    ],
    isDigital: true,
    isPhysical: true,
    digitalFormat: 'PDF Repositori Resmi',
    fileSize: '3,9 MB',
    physicalCopiesTotal: 2,
    physicalCopiesAvailable: 2,
    shelfLocation: 'Rak Tugas Akhir C-08 · Lantai 3',
    digitalSections: [
      {
        heading: 'Abstrak & Kontribusi Penelitian',
        content:
          'Penelitian ini menyusun korpus berlabel 8.400 unggahan publik berbahasa Indonesia baku dan non-baku untuk melatih model klasifikasi sentimen tiga kelas (positif, netral, negatif).',
      },
      {
        heading: 'Bab II: Tinjauan Pustaka Ringkas',
        content:
          'Mengulas arsitektur transformer, mekanisme self-attention, serta adaptasi domain bahasa Indonesia pada korpus IndoLEM dan IndoNLU.',
      },
    ],
  },
  {
    id: 'ref-06',
    title: 'Literasi Informasi Akademik dan Etika Sitasi di Era Kecerdasan Buatan Generatif',
    author: 'Dr. Ratna Dewi Puspitasari',
    year: 2024,
    type: 'Jurnal',
    availability: 'Tersedia Digital',
    coverUrl: COVER_JOURNAL,
    publisher: 'Jurnal Kajian Informasi & Perpustakaan',
    callNumber: 'JRN-2024-077',
    doi: '10.24198/jkip.v12i2.50192',
    language: 'Indonesia',
    pages: 22,
    abstract:
      'Kajian literatur mendalam mengenai peran pustakawan akademik dalam memvalidasi keabsahan sumber referensi mahasiswa di tengah maraknya penggunaan asisten penulisan AI generatif.',
    keywords: [
      'literasi informasi',
      'etika sitasi',
      'validasi referensi',
      'pustakawan',
      'AI generatif',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'PDF Open Access',
    fileSize: '1,7 MB',
    digitalSections: [
      {
        heading: 'Peran Kurasi Pustakawan di Era AI',
        content:
          'Validasi bibliografis oleh pustakawan menjadi benteng mutu akademik guna memastikan setiap rujukan dalam bab tinjauan pustaka benar-benar terverifikasi, mutakhir, dan memiliki DOI atau ISBN sah.',
      },
      {
        heading: 'Kerangka Evaluasi Sumber (CRAAP-AI)',
        content:
          'Artikel ini merumuskan lima dimensi evaluasi sumber ilmiah: Kemutakhiran, Relevansi, Otoritas, Akurasi Verifikasi, serta Tujuan Penelitian.',
      },
    ],
  },
  {
    id: 'ref-07',
    title: 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches (6th Ed.)',
    author: 'John W. Creswell & J. David Creswell',
    year: 2023,
    type: 'Buku',
    availability: 'Terbatas',
    coverUrl: COVER_METHOD,
    publisher: 'SAGE Publications',
    callNumber: 'H 62 .C74 2023',
    language: 'Inggris',
    pages: 320,
    abstract:
      'Edisi terbaru buku rujukan internasional metode penelitian sosial dan terapan yang membahas penyusunan tinjauan pustaka sistematis, paradigma riset, serta integrasi data kualitatif dan kuantitatif.',
    keywords: [
      'research design',
      'metode penelitian',
      'tinjauan pustaka',
      'mixed methods',
    ],
    isDigital: false,
    isPhysical: true,
    physicalCopiesTotal: 3,
    physicalCopiesAvailable: 1,
    shelfLocation: 'Rak B-01 · Lantai 1 (Reserve Koleksi Utama)',
  },
  {
    id: 'ref-08',
    title: 'Desain Antarmuka Pengguna Berbasis Aksesibilitas untuk Platform Pembelajaran Daring',
    author: 'Fajar Nugroho, S.Ds., M.Sc.',
    year: 2024,
    type: 'E-book',
    availability: 'Tersedia Digital',
    coverUrl: COVER_METHOD,
    publisher: 'Penerbit ITB Digital',
    callNumber: 'EBK-2024-205',
    doi: '10.5614/itb.ebook.2024.205',
    language: 'Indonesia',
    pages: 218,
    abstract:
      'Membahas prinsip desain UI/UX akademik, keterbacaan tipografi, standar kontras WCAG 2.2 AA, serta arsitektur informasi untuk sistem manajemen pembelajaran dan perpustakaan kampus.',
    keywords: [
      'UI/UX',
      'aksesibilitas',
      'pembelajaran daring',
      'arsitektur informasi',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'PDF & HTML Reader',
    fileSize: '4,6 MB',
    digitalSections: [
      {
        heading: 'Prinsip Hierarki Visual Akademik',
        content:
          'Antarmuka layanan pendidikan membutuhkan ketenangan visual, kontras teks yang memadai, serta navigasi yang meminimalkan beban kognitif mahasiswa saat mencari literatur.',
      },
    ],
  },
  {
    id: 'ref-09',
    title: 'Evaluasi Sistem Informasi Perpustakaan Menggunakan Metode Delone & McLean IS Success Model',
    author: 'Siti Aminah Azzahra (NIM 2005113042)',
    year: 2024,
    type: 'Skripsi',
    availability: 'Tersedia',
    coverUrl: COVER_THESIS,
    publisher: 'Repositori Fakultas Ilmu Budaya & Perpustakaan',
    callNumber: 'SKR-FIB-2024-034',
    language: 'Indonesia',
    pages: 152,
    abstract:
      'Studi empiris terhadap 240 mahasiswa S1 pengguna portal perpustakaan universitas yang menguji pengaruh kualitas informasi, kualitas sistem, dan kualitas layanan pustakawan terhadap kepuasan riset.',
    keywords: [
      'Delone McLean',
      'evaluasi sistem',
      'perpustakaan universitas',
      'kepuasan pengguna',
    ],
    isDigital: true,
    isPhysical: true,
    digitalFormat: 'PDF Repositori',
    fileSize: '3,1 MB',
    physicalCopiesTotal: 2,
    physicalCopiesAvailable: 1,
    shelfLocation: 'Rak Tugas Akhir C-12 · Lantai 3',
    digitalSections: [
      {
        heading: 'Ringkasan Hasil Pengujian Hipotesis',
        content:
          'Kualitas informasi dan responsivitas layanan pustakawan memberikan kontribusi paling signifikan (R² = 0,71) terhadap intensi pemanfaatan berkelanjutan portal perpustakaan digital.',
      },
    ],
  },
  {
    id: 'ref-10',
    title: 'Tata Kelola Data Penelitian dan Repositori Terbuka di Ekosistem Sains Terbuka',
    author: 'Dr. Hendra Gunawan & Tim Pusat Data Ilmiah',
    year: 2025,
    type: 'Jurnal',
    availability: 'Tersedia Digital',
    coverUrl: COVER_JOURNAL,
    publisher: 'Jurnal Dokumentasi dan Informasi Ilmiah',
    callNumber: 'JRN-2025-019',
    doi: '10.14203/jdii.v46i1.903',
    language: 'Indonesia',
    pages: 26,
    abstract:
      'Analisis penerapan prinsip FAIR (Findable, Accessible, Interoperable, Reusable) pada repositori data riset universitas di Indonesia serta pedoman manajemen folder literatur mahasiswa pascasarjana.',
    keywords: [
      'sains terbuka',
      'prinsip FAIR',
      'manajemen data riset',
      'repositori',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'PDF Terindeks',
    fileSize: '2,1 MB',
    digitalSections: [
      {
        heading: 'Penerapan Prinsip FAIR pada Literatur Kampus',
        content:
          'Standarisasi metadata bibliografis (Dublin Core dan MARC21) mempercepat pengindeksan lintas institusi dan mendukung verifikasi sitasi secara otomatis.',
      },
    ],
  },
  {
    id: 'ref-11',
    title: 'Statistika Terapan untuk Penelitian Pendidikan dan Ilmu Sosial dengan R & SPSS',
    author: 'Dr. Wahyu Wibowo, M.Si.',
    year: 2022,
    type: 'Buku',
    availability: 'Dipinjam',
    coverUrl: COVER_METHOD,
    publisher: 'Rajawali Pers',
    callNumber: 'QA 276 .W53 2022',
    language: 'Indonesia',
    pages: 364,
    abstract:
      'Membahas uji asumsi klasik, regresi linear berganda, ANOVA, uji validitas dan reliabilitas, serta interpretasi keluaran SPSS dan R untuk penyusunan Bab IV skripsi dan tesis.',
    keywords: [
      'statistika terapan',
      'SPSS',
      'analisis data',
      'regresi',
      'metode penelitian',
    ],
    isDigital: false,
    isPhysical: true,
    physicalCopiesTotal: 3,
    physicalCopiesAvailable: 0,
    shelfLocation: 'Rak D-05 · Lantai 2 (Statistika & Matematika)',
  },
  {
    id: 'ref-12',
    title: 'Artificial Intelligence Ethics and Academic Integrity in Higher Education',
    author: 'Elena Rostova, Ph.D. & Marcus Chen',
    year: 2025,
    type: 'E-book',
    availability: 'Tersedia Digital',
    coverUrl: COVER_AI,
    publisher: 'Cambridge Academic Digital Press',
    callNumber: 'EBK-2025-044',
    doi: '10.1017/9781009482110',
    language: 'Inggris',
    pages: 295,
    abstract:
      'Monograf berbahasa Inggris yang membedah kebijakan integritas akademik global, transparansi penggunaan AI dalam penelusuran pustaka, serta model kolaborasi mahasiswa dan pustakawan.',
    keywords: [
      'academic integrity',
      'AI ethics',
      'higher education',
      'literature review',
    ],
    isDigital: true,
    isPhysical: false,
    digitalFormat: 'PDF & EPUB',
    fileSize: '4,2 MB',
    digitalSections: [
      {
        heading: 'Chapter 3: Human-in-the-Loop Reference Validation',
        content:
          'Integrating AI discovery assistants with formal librarian review workflows creates a verifiable audit trail that strengthens scholarly rigor.',
      },
    ],
  },
];

export function getReferenceById(id: string): ReferenceItem | undefined {
  return ACADEMIC_REFERENCES.find((item) => item.id === id);
}
