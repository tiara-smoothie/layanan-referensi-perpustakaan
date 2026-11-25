import { useEffect, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Check,
  Download,
  FolderPlus,
  MapPin,
  X,
} from 'lucide-react';
import type { ReferenceItem, ResearchFolder } from '../types.ts';
import { CoverImage } from './CoverImage.tsx';
import { AvailabilityIndicator } from './StatusIndicator.tsx';

interface ReferenceDetailModalProps {
  reference: ReferenceItem | null;
  folders: ResearchFolder[];
  onClose: () => void;
  onAddToFolder: (referenceId: string, folderId: string) => void;
  onCreateFolderAndAdd: (referenceId: string, folderName: string) => void;
  onOpenReader?: (reference: ReferenceItem) => void;
  onOpenBorrow?: (reference: ReferenceItem) => void;
  onDownloadReference?: (reference: ReferenceItem) => void;
}

export function ReferenceDetailModal({
  reference,
  folders,
  onClose,
  onAddToFolder,
  onCreateFolderAndAdd,
  onOpenReader,
  onOpenBorrow,
  onDownloadReference,
}: ReferenceDetailModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    folders[0]?.id || ''
  );
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (folders.length > 0 && !folders.some((f) => f.id === selectedFolderId)) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  useEffect(() => {
    setAddedSuccess(null);
    setShowNewFolderInput(false);
    setNewFolderName('');
  }, [reference?.id]);

  if (!reference) return null;

  const alreadyInSelected =
    folders
      .find((f) => f.id === selectedFolderId)
      ?.referenceIds.includes(reference.id) ?? false;

  const handleAdd = () => {
    if (showNewFolderInput) {
      const trimmed = newFolderName.trim();
      if (!trimmed) return;
      onCreateFolderAndAdd(reference.id, trimmed);
      setAddedSuccess(`Disimpan ke folder baru "${trimmed}"`);
      setNewFolderName('');
      setShowNewFolderInput(false);
      return;
    }
    if (!selectedFolderId) return;
    const folderName =
      folders.find((f) => f.id === selectedFolderId)?.name || 'Workspace';
    onAddToFolder(reference.id, selectedFolderId);
    setAddedSuccess(`Ditambahkan ke folder "${folderName}"`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D68]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ref-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_24px_60px_rgba(16,45,104,0.22)] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-[#DCE8FF] flex items-center justify-between gap-4">
          <div className="text-xs font-medium text-[#2455B5]">
            Detail Referensi <span aria-hidden="true">·</span> {reference.type}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail referensi"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#102D68]/70 hover:bg-[#F3F7FF] hover:text-[#102D68] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-36 sm:w-44 shrink-0 mx-auto sm:mx-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#DCE8FF] shadow-[0_8px_20px_rgba(16,45,104,0.10)]">
                <CoverImage
                  src={reference.coverUrl}
                  title={reference.title}
                  type={reference.type}
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-[#2455B5]">
                  {reference.type} <span aria-hidden="true">·</span>{' '}
                  <span className="tabular-nums">{reference.year}</span>
                </span>
                <span aria-hidden="true" className="text-[#DCE8FF]">
                  |
                </span>
                <AvailabilityIndicator status={reference.availability} />
              </div>

              <h2
                id="ref-modal-title"
                className="font-display text-xl sm:text-2xl font-bold text-[#102D68] leading-snug"
              >
                {reference.title}
              </h2>

              <p className="text-sm font-medium text-[#102D68]/80">
                Penulis: {reference.author}
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-[#DCE8FF] text-xs">
                <div>
                  <dt className="text-[#102D68]/55">Penerbit / Repositori</dt>
                  <dd className="font-medium text-[#102D68] mt-0.5">
                    {reference.publisher}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102D68]/55">Nomor Panggil / ID</dt>
                  <dd className="font-mono font-medium text-[#102D68] mt-0.5">
                    {reference.callNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102D68]/55">Bahasa &amp; Halaman</dt>
                  <dd className="font-medium text-[#102D68] mt-0.5 tabular-nums">
                    {reference.language} · {reference.pages} halaman
                  </dd>
                </div>
                {reference.doi && (
                  <div>
                    <dt className="text-[#102D68]/55">DOI</dt>
                    <dd className="font-mono font-medium text-[#2455B5] mt-0.5 truncate">
                      {reference.doi}
                    </dd>
                  </div>
                )}
              </dl>

              {reference.isPhysical && reference.shelfLocation && (
                <div className="flex items-start gap-2 pt-2 text-xs text-[#102D68]/80">
                  <MapPin
                    className="w-4 h-4 text-[#5489E8] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    {reference.shelfLocation} (
                    <span className="font-semibold tabular-nums">
                      {reference.physicalCopiesAvailable ?? 0} dari{' '}
                      {reference.physicalCopiesTotal ?? 0} eksemplar tersedia
                    </span>
                    )
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE8FF]">
            <h3 className="text-sm font-semibold text-[#102D68] mb-2">
              Abstrak &amp; Ringkasan Materi
            </h3>
            <p className="text-sm text-[#102D68]/80 leading-relaxed">
              {reference.abstract}
            </p>
            <p className="text-xs text-[#102D68]/60 mt-3">
              Kata kunci: {reference.keywords.join(' · ')}
            </p>
          </div>

          {/* Workspace Add Section */}
          <div className="bg-[#F3F7FF] rounded-xl p-4 sm:p-5 border border-[#DCE8FF] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#102D68]">
                Simpan ke Workspace Riset
              </h3>
              <button
                type="button"
                onClick={() => setShowNewFolderInput((prev) => !prev)}
                className="text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
              >
                {showNewFolderInput
                  ? 'Pilih Folder yang Ada'
                  : '+ Buat Folder Baru'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {showNewFolderInput ? (
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nama folder riset baru (misal: Kajian Teori AI)"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-[#DCE8FF] text-sm text-[#102D68] placeholder:text-[#102D68]/45"
                />
              ) : (
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  aria-label="Pilih folder workspace"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-[#DCE8FF] text-sm text-[#102D68]"
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name} ({folder.referenceIds.length} referensi)
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleAdd}
                disabled={!showNewFolderInput && alreadyInSelected}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] disabled:bg-[#5489E8]/60 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {!showNewFolderInput && alreadyInSelected ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Sudah di Folder Ini</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" aria-hidden="true" />
                    <span>Tambahkan ke Workspace</span>
                  </>
                )}
              </button>
            </div>

            {addedSuccess && (
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>{addedSuccess}</span>
              </p>
            )}
          </div>

          {/* Direct Digital / Physical Actions */}
          {(reference.isDigital || reference.isPhysical) && (
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {reference.isDigital && onDownloadReference && (
                <button
                  type="button"
                  onClick={() => onDownloadReference(reference)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#102D68] bg-white border border-[#DCE8FF] hover:bg-[#F3F7FF] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#2455B5]" aria-hidden="true" />
                  <span>Unduh Ringkasan &amp; Sitasi</span>
                </button>
              )}
              {reference.isDigital && onOpenReader && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReader(reference);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#2455B5] bg-[#DCE8FF]/65 hover:bg-[#DCE8FF] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>Baca Dokumen Digital</span>
                </button>
              )}
              {reference.isPhysical && onOpenBorrow && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBorrow(reference);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#102D68] hover:bg-[#2455B5] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookMarked className="w-4 h-4" aria-hidden="true" />
                  <span>Ajukan Peminjaman Fisik</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
