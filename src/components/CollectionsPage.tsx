import { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Download,
  Eye,
  FolderPlus,
  Globe,
  MapPin,
  Search,
} from 'lucide-react';
import { ACADEMIC_REFERENCES, getReferenceById } from '../data/references.ts';
import type {
  BorrowRequest,
  CollectionType,
  ReferenceItem,
} from '../types.ts';
import { formatIndonesianDate } from '../utils/storage.ts';
import { CoverImage } from './CoverImage.tsx';
import {
  AvailabilityIndicator,
  BorrowStatusIndicator,
} from './StatusIndicator.tsx';

interface CollectionsPageProps {
  borrowRequests: BorrowRequest[];
  onViewDetail: (ref: ReferenceItem) => void;
  onAddToWorkspace: (ref: ReferenceItem) => void;
  onOpenReader: (ref: ReferenceItem) => void;
  onDownloadReference: (ref: ReferenceItem) => void;
  onOpenBorrow: (ref: ReferenceItem) => void;
  onUpdateBorrowStatus: (
    borrowId: string,
    nextStatus: 'Menunggu Pengambilan' | 'Sedang Dipinjam' | 'Dikembalikan'
  ) => void;
  savedReferenceIds: Set<string>;
}

type CollectionTab = 'semua' | 'digital' | 'fisik' | 'status-pinjam';

export function CollectionsPage({
  borrowRequests,
  onViewDetail,
  onAddToWorkspace,
  onOpenReader,
  onDownloadReference,
  onOpenBorrow,
  onUpdateBorrowStatus,
  savedReferenceIds,
}: CollectionsPageProps) {
  const [activeTab, setActiveTab] = useState<CollectionTab>('semua');
  const [typeFilter, setTypeFilter] = useState<'Semua' | CollectionType>(
    'Semua'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ACADEMIC_REFERENCES.filter((ref) => {
      if (activeTab === 'digital' && !ref.isDigital) return false;
      if (activeTab === 'fisik' && !ref.isPhysical) return false;
      if (typeFilter !== 'Semua' && ref.type !== typeFilter) return false;
      if (!q) return true;
      return (
        ref.title.toLowerCase().includes(q) ||
        ref.author.toLowerCase().includes(q) ||
        ref.keywords.some((k) => k.toLowerCase().includes(q)) ||
        ref.callNumber.toLowerCase().includes(q)
      );
    });
  }, [activeTab, typeFilter, searchQuery]);

  const digitalCount = ACADEMIC_REFERENCES.filter((r) => r.isDigital).length;
  const physicalCount = ACADEMIC_REFERENCES.filter((r) => r.isPhysical).length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#2455B5]">
          Katalog &amp; Akses Koleksi Perpustakaan
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
          Akses Koleksi Digital &amp; Peminjaman Fisik
        </h1>
        <p className="text-sm text-[#102D68]/70 mt-1 max-w-2xl">
          Telusuri repositori digital untuk membaca dan mengunduh dokumen ilmiah,
          atau periksa ketersediaan rak untuk mengajukan peminjaman buku cetak.
        </p>
      </div>

      {/* Two Main Collection Access Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className={`rounded-2xl p-6 border transition-all duration-150 flex flex-col justify-between space-y-4 ${
            activeTab === 'digital'
              ? 'bg-[#DCE8FF]/45 border-[#2455B5] shadow-[0_6px_24px_rgba(36,85,181,0.10)]'
              : 'bg-white border-[#DCE8FF] shadow-[0_2px_12px_rgba(16,45,104,0.04)]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#2455B5] text-white flex items-center justify-center">
                <Globe className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-[#2455B5] tabular-nums">
                {digitalCount} Dokumen Digital
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-[#102D68]">
              Akses Koleksi Digital
            </h2>
            <p className="text-sm text-[#102D68]/75 leading-relaxed">
              Jelajahi jurnal elektronik, e-book akademik, dan repositori skripsi
              yang dapat dibaca langsung secara daring maupun diunduh lengkap
              dengan sitasi APA.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('digital');
                setTypeFilter('Semua');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
            >
              Jelajahi Koleksi Digital
            </button>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 border transition-all duration-150 flex flex-col justify-between space-y-4 ${
            activeTab === 'fisik' || activeTab === 'status-pinjam'
              ? 'bg-[#DCE8FF]/45 border-[#2455B5] shadow-[0_6px_24px_rgba(36,85,181,0.10)]'
              : 'bg-white border-[#DCE8FF] shadow-[0_2px_12px_rgba(16,45,104,0.04)]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#102D68] text-white flex items-center justify-center">
                <BookMarked className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-[#102D68] tabular-nums">
                {physicalCount} Judul Cetak · {borrowRequests.length} Riwayat
                Pinjam
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-[#102D68]">
              Peminjaman Koleksi Fisik
            </h2>
            <p className="text-sm text-[#102D68]/75 leading-relaxed">
              Periksa ketersediaan eksemplar buku cetak dan lokasi rak di gedung
              perpustakaan, ajukan peminjaman daring, dan pantau status
              pengambilan Anda.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('fisik');
                setTypeFilter('Semua');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#102D68] hover:bg-[#2455B5] transition-colors cursor-pointer"
            >
              Lihat Buku Fisik
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status-pinjam')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#102D68] bg-[#F3F7FF] border border-[#DCE8FF] hover:bg-[#DCE8FF] transition-colors cursor-pointer"
            >
              Status Peminjaman ({borrowRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs & Search Controls */}
      <div className="bg-white rounded-xl p-4 border border-[#DCE8FF] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'semua', label: 'Semua Koleksi' },
            { id: 'digital', label: 'Koleksi Digital' },
            { id: 'fisik', label: 'Koleksi Fisik' },
            {
              id: 'status-pinjam',
              label: `Status Peminjaman (${borrowRequests.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CollectionTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2455B5] text-white'
                  : 'text-[#102D68]/75 hover:bg-[#F3F7FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'status-pinjam' && (
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1 lg:max-w-lg">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#5489E8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, nomor panggil..."
                aria-label="Cari dalam koleksi"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F3F7FF] border border-[#DCE8FF] text-xs sm:text-sm text-[#102D68] placeholder:text-[#102D68]/45"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as 'Semua' | CollectionType)
              }
              aria-label="Filter jenis koleksi"
              className="px-3 py-2 rounded-lg bg-[#F3F7FF] border border-[#DCE8FF] text-xs sm:text-sm text-[#102D68]"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Buku">Buku</option>
              <option value="Jurnal">Jurnal</option>
              <option value="E-book">E-book</option>
              <option value="Skripsi">Skripsi</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'status-pinjam' ? (
        <section className="bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE8FF] flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#102D68]">
                Daftar Status Peminjaman Koleksi Fisik
              </h2>
              <p className="text-xs text-[#102D68]/65 mt-0.5">
                Pantau pengajuan pengambilan buku dan riwayat pengembalian
                Anda.
              </p>
            </div>
          </div>

          {borrowRequests.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-[#102D68]">
                Belum ada pengajuan peminjaman buku fisik.
              </p>
              <p className="text-xs text-[#102D68]/65">
                Pilih tab Koleksi Fisik untuk melihat buku yang tersedia dan
                mengajukan peminjaman.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('fisik')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
              >
                Lihat Koleksi Fisik
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8FF]">
              {borrowRequests.map((req) => {
                const refItem = getReferenceById(req.referenceId);
                return (
                  <div
                    key={req.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-mono font-semibold text-[#2455B5]">
                          {req.id}
                        </span>
                        <span aria-hidden="true" className="text-[#DCE8FF]">
                          |
                        </span>
                        <BorrowStatusIndicator status={req.status} />
                      </div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-[#102D68]">
                        {refItem?.title || 'Referensi Perpustakaan'}
                      </h3>
                      <p className="text-xs text-[#102D68]/70">
                        Peminjam: {req.studentName} ({req.studentNim}) · Ambil:{' '}
                        <span className="tabular-nums">{req.pickupDate}</span> ·
                        Durasi:{' '}
                        <span className="tabular-nums">
                          {req.durationDays} hari
                        </span>{' '}
                        · Diajukan {formatIndonesianDate(req.requestedAt)}
                      </p>
                      {req.notes && (
                        <p className="text-xs text-[#102D68]/60">
                          Catatan: {req.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {req.status === 'Menunggu Pengambilan' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBorrowStatus(req.id, 'Sedang Dipinjam')
                          }
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
                        >
                          Konfirmasi Diambil
                        </button>
                      )}
                      {req.status === 'Sedang Dipinjam' && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateBorrowStatus(req.id, 'Dikembalikan')
                          }
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#102D68] bg-[#DCE8FF] hover:bg-[#5489E8]/30 cursor-pointer"
                        >
                          Tandai Sudah Dikembalikan
                        </button>
                      )}
                      {refItem && (
                        <button
                          type="button"
                          onClick={() => onViewDetail(refItem)}
                          className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] cursor-pointer"
                        >
                          Lihat Buku
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : filteredCollections.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#DCE8FF] text-center space-y-2">
          <p className="text-sm font-semibold text-[#102D68]">
            Tidak ada koleksi yang sesuai dengan filter pencarian Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('Semua');
              setActiveTab('semua');
            }}
            className="text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
          >
            Reset semua filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollections.map((ref) => {
            const isAdded = savedReferenceIds.has(ref.id);
            return (
              <article
                key={ref.id}
                className="bg-white rounded-xl border border-[#DCE8FF] shadow-[0_2px_12px_rgba(16,45,104,0.04)] flex flex-col overflow-hidden"
              >
                <div className="p-5 flex gap-4 flex-1">
                  <button
                    type="button"
                    onClick={() => onViewDetail(ref)}
                    className="w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-[#DCE8FF] cursor-pointer"
                  >
                    <CoverImage
                      src={ref.coverUrl}
                      title={ref.title}
                      type={ref.type}
                      className="w-full h-full"
                    />
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#2455B5]">
                        {ref.type} · <span className="tabular-nums">{ref.year}</span>
                      </span>
                      <AvailabilityIndicator status={ref.availability} />
                    </div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-[#102D68] leading-snug line-clamp-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(ref)}
                        className="text-left hover:text-[#2455B5] cursor-pointer"
                      >
                        {ref.title}
                      </button>
                    </h3>
                    <p className="text-xs text-[#102D68]/70 line-clamp-1">
                      {ref.author}
                    </p>

                    {ref.isPhysical && ref.shelfLocation && (
                      <p className="text-[11px] text-[#102D68]/65 flex items-center gap-1 pt-1">
                        <MapPin
                          className="w-3 h-3 text-[#5489E8] shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {ref.physicalCopiesAvailable ?? 0}/
                          {ref.physicalCopiesTotal ?? 0} eks · {ref.shelfLocation}
                        </span>
                      </p>
                    )}

                    {ref.isDigital && (
                      <p className="text-[11px] text-[#2455B5] font-medium pt-0.5">
                        Digital: {ref.digitalFormat || 'PDF'} ({ref.fileSize || '2 MB'})
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#F3F7FF]/70 border-t border-[#DCE8FF] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetail(ref)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#102D68] bg-white border border-[#DCE8FF] hover:bg-[#DCE8FF]/40 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5489E8]" aria-hidden="true" />
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToWorkspace(ref)}
                      title="Tambahkan ke Workspace"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#102D68] bg-white border border-[#DCE8FF] hover:bg-[#DCE8FF]/40 cursor-pointer"
                    >
                      <FolderPlus
                        className="w-3.5 h-3.5 text-[#2455B5]"
                        aria-hidden="true"
                      />
                      <span>{isAdded ? 'Tersimpan' : 'Workspace'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {ref.isDigital && (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenReader(ref)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Baca</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownloadReference(ref)}
                          aria-label={`Unduh ${ref.title}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#2455B5] bg-[#DCE8FF] hover:bg-[#5489E8]/30 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Unduh</span>
                        </button>
                      </>
                    )}
                    {ref.isPhysical && (
                      <button
                        type="button"
                        onClick={() => onOpenBorrow(ref)}
                        disabled={(ref.physicalCopiesAvailable ?? 0) <= 0}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#102D68] hover:bg-[#2455B5] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {(ref.physicalCopiesAvailable ?? 0) > 0
                            ? 'Pinjam'
                            : 'Habis'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
