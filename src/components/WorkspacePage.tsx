import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  CheckSquare,
  Edit3,
  Eye,
  Folder,
  FolderPlus,
  Plus,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { ACADEMIC_REFERENCES, getReferenceById } from '../data/references.ts';
import type {
  ReferenceItem,
  ResearchFolder,
  ValidationRequest,
} from '../types.ts';
import { formatIndonesianDate } from '../utils/storage.ts';
import { CoverImage } from './CoverImage.tsx';
import {
  AvailabilityIndicator,
  ValidationStatusIndicator,
} from './StatusIndicator.tsx';

interface WorkspacePageProps {
  folders: ResearchFolder[];
  validationRequests: ValidationRequest[];
  onCreateFolder: (name: string) => string;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddReferenceToFolder: (referenceId: string, folderId: string) => void;
  onRemoveReferenceFromFolder: (referenceId: string, folderId: string) => void;
  onViewDetail: (ref: ReferenceItem) => void;
  onRequestValidation: (references: ReferenceItem[]) => void;
}

export function WorkspacePage({
  folders,
  validationRequests,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddReferenceToFolder,
  onRemoveReferenceFromFolder,
  onViewDetail,
  onRequestValidation,
}: WorkspacePageProps) {
  const [activeFolderId, setActiveFolderId] = useState<string>(
    folders[0]?.id || ''
  );
  const [selectedRefIds, setSelectedRefIds] = useState<Set<string>>(new Set());
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'folder' | 'riwayat'>('folder');

  useEffect(() => {
    if (folders.length > 0 && !folders.some((f) => f.id === activeFolderId)) {
      setActiveFolderId(folders[0].id);
    }
  }, [folders, activeFolderId]);

  const activeFolder =
    folders.find((f) => f.id === activeFolderId) || folders[0] || null;

  const folderReferences: ReferenceItem[] = activeFolder
    ? activeFolder.referenceIds
        .map((id) => getReferenceById(id))
        .filter((r): r is ReferenceItem => Boolean(r))
    : [];

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setSelectedRefIds(new Set());
    setViewMode('folder');
  };

  const toggleSelectRef = (refId: string) => {
    setSelectedRefIds((prev) => {
      const next = new Set(prev);
      if (next.has(refId)) {
        next.delete(refId);
      } else {
        next.add(refId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (
      folderReferences.length > 0 &&
      selectedRefIds.size === folderReferences.length
    ) {
      setSelectedRefIds(new Set());
    } else {
      setSelectedRefIds(new Set(folderReferences.map((r) => r.id)));
    }
  };

  const handleCreateFolderSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const createdId = onCreateFolder(trimmed);
    setNewFolderName('');
    setShowNewFolderForm(false);
    setActiveFolderId(createdId);
    setSelectedRefIds(new Set());
    setViewMode('folder');
  };

  const handleRenameSubmit = (e: FormEvent, folderId: string) => {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    onRenameFolder(folderId, trimmed);
    setRenamingFolderId(null);
    setRenameValue('');
  };

  const selectedRefsList = folderReferences.filter((r) =>
    selectedRefIds.has(r.id)
  );

  const availableToAdd = ACADEMIC_REFERENCES.filter(
    (ref) => !activeFolder?.referenceIds.includes(ref.id)
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#2455B5]">
            Manajemen Materi Penelitian Mahasiswa
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
            Workspace Riset &amp; Folder Referensi
          </h1>
          <p className="text-sm text-[#102D68]/70 mt-1">
            Organisasikan referensi ke dalam folder bab penelitian dan pilih
            referensi untuk diajukan validasi ke pustakawan.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#DCE8FF]">
          <button
            type="button"
            onClick={() => setViewMode('folder')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'folder'
                ? 'bg-[#2455B5] text-white'
                : 'text-[#102D68]/75 hover:bg-[#F3F7FF]'
            }`}
          >
            Folder Riset ({folders.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('riwayat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'riwayat'
                ? 'bg-[#2455B5] text-white'
                : 'text-[#102D68]/75 hover:bg-[#F3F7FF]'
            }`}
          >
            Riwayat Validasi ({validationRequests.length})
          </button>
        </div>
      </div>

      {viewMode === 'riwayat' ? (
        <section className="bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE8FF]">
            <h2 className="font-display text-base font-bold text-[#102D68]">
              Riwayat Permintaan Validasi Referensi
            </h2>
            <p className="text-xs text-[#102D68]/65 mt-0.5">
              Pantau status peninjauan pustakawan dan catatan untuk setiap
              pengajuan Anda.
            </p>
          </div>
          {validationRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#102D68]/70">
              Belum ada pengajuan validasi referensi.
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8FF]">
              {validationRequests.map((req) => (
                <div key={req.id} className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-semibold text-[#2455B5]">
                        {req.id}
                      </span>
                      <span aria-hidden="true" className="text-[#DCE8FF]">
                        |
                      </span>
                      <ValidationStatusIndicator status={req.status} />
                    </div>
                    <span className="text-xs text-[#102D68]/60 tabular-nums">
                      Dikirim {formatIndonesianDate(req.submittedAt)} · Deadline:{' '}
                      {req.deadline}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-[#102D68]">
                      {req.topic}
                    </h3>
                    <p className="text-xs text-[#102D68]/70 mt-0.5">
                      Tujuan: {req.purpose} · Konsultasi:{' '}
                      {req.needsConsultation ? 'Ya' : 'Tidak'} ·{' '}
                      <span className="tabular-nums">
                        {req.referenceIds.length} referensi
                      </span>
                    </p>
                  </div>

                  {req.librarianNotes && (
                    <div className="p-3.5 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] text-xs text-[#102D68]/85">
                      <span className="font-semibold text-[#102D68]">
                        Catatan Pustakawan:{' '}
                      </span>
                      {req.librarianNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Folders */}
          <aside className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE8FF] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-[#102D68]">
                Daftar Folder Riset
              </h2>
              <button
                type="button"
                onClick={() => setShowNewFolderForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Folder Baru</span>
              </button>
            </div>

            {showNewFolderForm && (
              <form
                onSubmit={handleCreateFolderSubmit}
                className="p-3 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] space-y-2"
              >
                <label className="block text-xs font-semibold text-[#102D68]">
                  Nama Folder Baru
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Misal: Kajian Teori Bab II"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#DCE8FF] text-xs text-[#102D68]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderForm(false)}
                    className="px-2.5 py-1.5 rounded-md text-xs text-[#102D68]/75 hover:bg-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5">
              {folders.map((folder) => {
                const isActive = activeFolder?.id === folder.id;
                const isRenaming = renamingFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    className={`rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-[#DCE8FF]/60 border-[#2455B5]'
                        : 'bg-white border-[#DCE8FF]/80 hover:bg-[#F3F7FF]'
                    }`}
                  >
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => handleRenameSubmit(e, folder.id)}
                        className="p-2.5 flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          autoFocus
                          aria-label="Ubah nama folder"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#DCE8FF] text-xs text-[#102D68]"
                        />
                        <button
                          type="submit"
                          aria-label="Simpan nama folder"
                          className="p-1.5 rounded-lg bg-[#2455B5] text-white cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingFolderId(null)}
                          aria-label="Batal ubah nama"
                          className="p-1.5 rounded-lg bg-white text-[#102D68] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </form>
                    ) : (
                      <div className="px-3.5 py-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectFolder(folder.id)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <Folder
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#2455B5]' : 'text-[#5489E8]'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#102D68] truncate">
                              {folder.name}
                            </p>
                            <p className="text-[11px] text-[#102D68]/65 tabular-nums">
                              {folder.referenceIds.length} referensi
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingFolderId(folder.id);
                              setRenameValue(folder.name);
                            }}
                            aria-label={`Ubah nama folder ${folder.name}`}
                            className="p-1.5 rounded-lg text-[#102D68]/60 hover:text-[#2455B5] hover:bg-white cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          {folders.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteFolder(folder.id)}
                              aria-label={`Hapus folder ${folder.name}`}
                              className="p-1.5 rounded-lg text-[#102D68]/60 hover:text-rose-600 hover:bg-white cursor-pointer"
                            >
                              <Trash2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Main Area: Active Folder Contents */}
          <section className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
            {activeFolder ? (
              <>
                <div className="p-5 sm:p-6 border-b border-[#DCE8FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2455B5]">
                      <span>Folder Riset Aktif</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {folderReferences.length} Referensi
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-[#102D68] mt-0.5">
                      {activeFolder.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddPicker(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#102D68] bg-[#F3F7FF] border border-[#DCE8FF] hover:bg-[#DCE8FF] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#2455B5]" aria-hidden="true" />
                      <span>Tambah Referensi</span>
                    </button>
                    <button
                      type="button"
                      disabled={selectedRefsList.length === 0}
                      onClick={() => onRequestValidation(selectedRefsList)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] disabled:bg-[#5489E8]/45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      <span className="tabular-nums">
                        Ajukan Validasi ({selectedRefsList.length})
                      </span>
                    </button>
                  </div>
                </div>

                {folderReferences.length > 0 && (
                  <div className="px-5 sm:px-6 py-3 bg-[#F3F7FF]/70 border-b border-[#DCE8FF] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#102D68] hover:text-[#2455B5] cursor-pointer"
                    >
                      {selectedRefIds.size === folderReferences.length ? (
                        <CheckSquare
                          className="w-4 h-4 text-[#2455B5]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="w-4 h-4 text-[#5489E8]"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {selectedRefIds.size === folderReferences.length
                          ? 'Batalkan Pilih Semua'
                          : 'Pilih Semua Referensi'}
                      </span>
                    </button>

                    <span className="text-xs text-[#102D68]/65 tabular-nums">
                      {selectedRefIds.size} dipilih untuk validasi
                    </span>
                  </div>
                )}

                {folderReferences.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <p className="text-sm font-semibold text-[#102D68]">
                      Folder &ldquo;{activeFolder.name}&rdquo; belum memiliki
                      referensi.
                    </p>
                    <p className="text-xs text-[#102D68]/65 max-w-md mx-auto">
                      Tambahkan buku, jurnal, e-book, atau skripsi dari katalog
                      atau dari Asisten AI untuk mulai menyusun daftar pustaka.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddPicker(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Tambahkan Referensi Sekarang</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#DCE8FF]">
                    {folderReferences.map((ref) => {
                      const isSelected = selectedRefIds.has(ref.id);
                      return (
                        <div
                          key={ref.id}
                          className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                            isSelected ? 'bg-[#F3F7FF]' : 'bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelectRef(ref.id)}
                            aria-label={`Pilih ${ref.title} untuk validasi`}
                            aria-pressed={isSelected}
                            className="mt-1 p-1 rounded text-[#2455B5] cursor-pointer shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5" aria-hidden="true" />
                            ) : (
                              <Square
                                className="w-5 h-5 text-[#5489E8]"
                                aria-hidden="true"
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewDetail(ref)}
                            className="w-14 h-20 rounded-lg overflow-hidden border border-[#DCE8FF] shrink-0 cursor-pointer"
                          >
                            <CoverImage
                              src={ref.coverUrl}
                              title={ref.title}
                              type={ref.type}
                              className="w-full h-full"
                            />
                          </button>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5 text-xs">
                              <span className="font-semibold text-[#2455B5]">
                                {ref.type} ·{' '}
                                <span className="tabular-nums">{ref.year}</span>
                              </span>
                              <span aria-hidden="true" className="text-[#DCE8FF]">
                                |
                              </span>
                              <AvailabilityIndicator status={ref.availability} />
                            </div>
                            <h3 className="font-display text-sm sm:text-base font-bold text-[#102D68] leading-snug">
                              <button
                                type="button"
                                onClick={() => onViewDetail(ref)}
                                className="text-left hover:text-[#2455B5] cursor-pointer"
                              >
                                {ref.title}
                              </button>
                            </h3>
                            <p className="text-xs text-[#102D68]/70">
                              {ref.author}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onViewDetail(ref)}
                              aria-label={`Detail ${ref.title}`}
                              className="p-2 rounded-lg text-[#102D68]/70 hover:text-[#2455B5] hover:bg-[#F3F7FF] cursor-pointer"
                            >
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveReferenceFromFolder(
                                  ref.id,
                                  activeFolder.id
                                );
                                setSelectedRefIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(ref.id);
                                  return next;
                                });
                              }}
                              aria-label={`Hapus ${ref.title} dari folder`}
                              className="p-2 rounded-lg text-[#102D68]/70 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}

      {/* Quick Picker Modal to Add Reference into Current Folder */}
      {showAddPicker && activeFolder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D68]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Tambah referensi ke folder"
        >
          <div className="bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_24px_60px_rgba(16,45,104,0.22)] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE8FF] flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-[#102D68]">
                  Tambahkan ke &ldquo;{activeFolder.name}&rdquo;
                </h3>
                <p className="text-xs text-[#102D68]/65">
                  Pilih referensi dari katalog perpustakaan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                aria-label="Tutup pemilih referensi"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#102D68]/65 hover:bg-[#F3F7FF] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#DCE8FF] p-2">
              {availableToAdd.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#102D68]/70">
                  Seluruh koleksi katalog sudah berada di dalam folder ini.
                </div>
              ) : (
                availableToAdd.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[#F3F7FF]/60 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#2455B5]">
                        {ref.type} · <span className="tabular-nums">{ref.year}</span>
                      </p>
                      <p className="text-sm font-semibold text-[#102D68] truncate">
                        {ref.title}
                      </p>
                      <p className="text-xs text-[#102D68]/65 truncate">
                        {ref.author}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onAddReferenceToFolder(ref.id, activeFolder.id)
                      }
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] shrink-0 cursor-pointer"
                    >
                      Tambahkan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
