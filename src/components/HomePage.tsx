import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  FolderKanban,
  Library,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ACADEMIC_REFERENCES, HERO_LIBRARY_IMAGE } from '../data/references.ts';
import type { PageRoute, ReferenceItem } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
  onSearchToAssistant: (query: string) => void;
  onViewDetail: (ref: ReferenceItem) => void;
  onAddToWorkspace: (ref: ReferenceItem) => void;
  savedReferenceIds: Set<string>;
}

export function HomePage({
  onNavigate,
  onSearchToAssistant,
  onViewDetail,
  onAddToWorkspace,
  savedReferenceIds,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    if (!q) return [];
    return ACADEMIC_REFERENCES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.abstract.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [activeQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      onNavigate('koleksi');
      return;
    }
    setActiveQuery(trimmed);
    setHasSearched(true);
    const resultsEl = document.getElementById('hasil-pencarian-beranda');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const quickTopics = [
    'Kecerdasan Buatan',
    'Metode Penelitian',
    'Sistem Informasi',
    'Etika Sitasi',
  ];

  const featuredReferences = ACADEMIC_REFERENCES.slice(0, 3);

  const mainServices = [
    {
      title: 'Asisten Referensi AI',
      description:
        'Konsultasikan topik skripsi atau makalah Anda untuk mendapatkan rekomendasi buku, jurnal, e-book, dan skripsi yang tepat.',
      actionLabel: 'Buka Asisten AI',
      icon: Bot,
      target: 'asisten' as PageRoute,
    },
    {
      title: 'Workspace Riset',
      description:
        'Kelompokkan literatur ke dalam folder penelitian seperti Skripsi Bab II atau Metode Penelitian, lalu pilih untuk validasi.',
      actionLabel: 'Kelola Workspace',
      icon: FolderKanban,
      target: 'workspace' as PageRoute,
    },
    {
      title: 'Validasi Pustakawan',
      description:
        'Ajukan daftar referensi terpilih agar ditinjau dan divalidasi langsung oleh pustakawan subjek sebelum penyusunan naskah.',
      actionLabel: 'Ajukan Validasi',
      icon: ShieldCheck,
      target: 'workspace' as PageRoute,
    },
    {
      title: 'Akses Koleksi Digital & Fisik',
      description:
        'Baca dan unduh koleksi digital secara langsung atau cek ketersediaan eksemplar dan ajukan peminjaman buku fisik.',
      actionLabel: 'Jelajahi Koleksi',
      icon: Library,
      target: 'koleksi' as PageRoute,
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Split Section */}
      <section className="bg-white border-b border-[#DCE8FF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#2455B5] tracking-wide">
                  Perpustakaan Cerdas &amp; Asisten Riset Akademik
                </p>
                <h1
                  className="font-display font-extrabold text-[#102D68] leading-[1.12] tracking-tight"
                  style={{
                    fontSize: 'clamp(2.15rem, 3.8vw, 3.35rem)',
                    textWrap: 'balance',
                  }}
                >
                  Temukan Referensi, Kembangkan Pengetahuan.
                </h1>
                <p className="text-base sm:text-lg text-[#102D68]/75 max-w-2xl leading-relaxed">
                  Platform terpadu bagi mahasiswa untuk menelusuri referensi ilmiah,
                  mengelola materi riset dalam folder terstruktur, dan memperoleh
                  validasi resmi dari pustakawan universitas.
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-2xl"
              >
                <div className="relative flex-1">
                  <Search
                    className="w-5 h-5 text-[#5489E8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul buku, jurnal, penulis, atau topik penelitian..."
                    aria-label="Cari referensi akademik"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] text-sm text-[#102D68] placeholder:text-[#102D68]/45 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-[0_6px_18px_rgba(36,85,181,0.24)]"
                >
                  <span>Mulai Pencarian</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#102D68]/70">
                <span className="font-medium">Topik populer:</span>
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setSearchQuery(topic);
                      setActiveQuery(topic);
                      setHasSearched(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F3F7FF] hover:bg-[#DCE8FF] text-[#2455B5] font-medium transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-64 sm:h-80 lg:h-full min-h-[300px] rounded-2xl overflow-hidden border border-[#DCE8FF] shadow-[0_14px_34px_rgba(16,45,104,0.10)] bg-[#102D68]">
                <img
                  src={HERO_LIBRARY_IMAGE}
                  alt="Suasana ruang baca modern perpustakaan universitas LibraMind"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Institutional Metrics Strip */}
          <div className="mt-10 pt-8 border-t border-[#DCE8FF] grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] tabular-nums">
                {ACADEMIC_REFERENCES.length}
              </p>
              <p className="text-xs sm:text-sm text-[#102D68]/65 mt-1">
                Koleksi Akademik Terkurasi
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] tabular-nums">
                4 Jenis
              </p>
              <p className="text-xs sm:text-sm text-[#102D68]/65 mt-1">
                Buku, Jurnal, E-book, Skripsi
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] tabular-nums">
                &lt; 24 Jam
              </p>
              <p className="text-xs sm:text-sm text-[#102D68]/65 mt-1">
                Rata-rata Validasi Pustakawan
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] tabular-nums">
                24/7
              </p>
              <p className="text-xs sm:text-sm text-[#102D68]/65 mt-1">
                Akses Repositori &amp; Asisten AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Search Results (shown when user searches on Homepage) */}
      {hasSearched && (
        <section
          id="hasil-pencarian-beranda"
          className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl p-5 border border-[#DCE8FF]">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102D68]">
                Hasil Pencarian untuk &ldquo;{activeQuery}&rdquo;
              </h2>
              <p className="text-xs text-[#102D68]/65 mt-0.5 tabular-nums">
                Ditemukan {searchResults.length} referensi yang cocok di katalog
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSearchToAssistant(activeQuery)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4" aria-hidden="true" />
                <span>Tanya Asisten AI untuk Topik Ini</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasSearched(false);
                  setSearchQuery('');
                  setActiveQuery('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] cursor-pointer"
              >
                Bersihkan
              </button>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map((ref) => (
                <ReferenceCard
                  key={ref.id}
                  reference={ref}
                  onViewDetail={onViewDetail}
                  onAddToWorkspace={onAddToWorkspace}
                  isAdded={savedReferenceIds.has(ref.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-[#DCE8FF] text-center space-y-3">
              <p className="text-sm font-semibold text-[#102D68]">
                Tidak ada judul yang cocok secara langsung dengan kata kunci tersebut.
              </p>
              <p className="text-xs text-[#102D68]/65">
                Gunakan Asisten Referensi AI untuk mendapatkan rekomendasi semantik
                berdasarkan deskripsi topik penelitian Anda.
              </p>
              <button
                type="button"
                onClick={() => onSearchToAssistant(activeQuery)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
              >
                <Bot className="w-4 h-4" aria-hidden="true" />
                <span>Konsultasikan ke Asisten AI</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Main Library Services Overview */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#102D68]">
              Layanan Utama Perpustakaan
            </h2>
            <p className="text-sm text-[#102D68]/70 mt-1">
              Alur lengkap dari penemuan literatur hingga validasi pustakawan
              dalam satu platform.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('layanan')}
            className="text-sm font-semibold text-[#2455B5] hover:text-[#102D68] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lihat Semua Layanan</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mainServices.map((srv) => {
            const IconComponent = srv.icon;
            return (
              <div
                key={srv.title}
                className="bg-white rounded-xl p-6 border border-[#DCE8FF] shadow-[0_2px_14px_rgba(16,45,104,0.04)] hover:shadow-[0_8px_24px_rgba(16,45,104,0.08)] transition-all duration-150 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#DCE8FF]/70 text-[#2455B5] flex items-center justify-center">
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#102D68]">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#102D68]/70 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(srv.target)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2455B5] hover:text-[#102D68] cursor-pointer w-fit"
                >
                  <span>{srv.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Academic References */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#102D68]">
              Referensi Akademik Pilihan
            </h2>
            <p className="text-sm text-[#102D68]/70 mt-1">
              Sumber rujukan terpopuler untuk penyusunan proposal dan bab
              tinjauan pustaka.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('koleksi')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#2455B5] bg-[#DCE8FF]/60 hover:bg-[#DCE8FF] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Buka Katalog Lengkap</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredReferences.map((ref) => (
            <ReferenceCard
              key={ref.id}
              reference={ref}
              onViewDetail={onViewDetail}
              onAddToWorkspace={onAddToWorkspace}
              isAdded={savedReferenceIds.has(ref.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
