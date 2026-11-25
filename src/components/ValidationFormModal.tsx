import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle2,
  FileText,
  Paperclip,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { ReferenceItem } from '../types.ts';

interface ValidationFormModalProps {
  isOpen: boolean;
  selectedReferences: ReferenceItem[];
  onClose: () => void;
  onSubmitValidation: (payload: {
    topic: string;
    purpose: string;
    deadline: string;
    needsConsultation: boolean;
    attachmentName?: string;
    attachmentSize?: string;
    referenceIds: string[];
  }) => string;
  onGoToNotifications: () => void;
}

export function ValidationFormModal({
  isOpen,
  selectedReferences,
  onClose,
  onSubmitValidation,
  onGoToNotifications,
}: ValidationFormModalProps) {
  const defaultDeadline = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split('T')[0];

  const [topic, setTopic] = useState('');
  const [purpose, setPurpose] = useState('Skripsi / Tugas Akhir');
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [needsConsultation, setNeedsConsultation] = useState(true);
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [attachmentSize, setAttachmentSize] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentName(undefined);
      setAttachmentSize(undefined);
      return;
    }
    setAttachmentName(file.name);
    const kb = Math.round(file.size / 1024);
    setAttachmentSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, kb)} KB`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedReferences.length === 0) {
      setError('Pilih minimal satu referensi terlebih dahulu sebelum mengajukan validasi.');
      return;
    }
    if (!topic.trim()) {
      setError('Topik penelitian wajib diisi.');
      return;
    }
    if (!purpose.trim()) {
      setError('Tujuan penggunaan wajib diisi.');
      return;
    }
    if (!deadline) {
      setError('Tanggal deadline wajib dipilih.');
      return;
    }

    setError('');
    const newId = onSubmitValidation({
      topic: topic.trim(),
      purpose: purpose.trim(),
      deadline,
      needsConsultation,
      attachmentName,
      attachmentSize,
      referenceIds: selectedReferences.map((r) => r.id),
    });
    setCreatedRequestId(newId);
  };

  const handleResetAndClose = () => {
    setTopic('');
    setAttachmentName(undefined);
    setAttachmentSize(undefined);
    setCreatedRequestId(null);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D68]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="validation-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_24px_60px_rgba(16,45,104,0.22)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-[#DCE8FF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#102D68]">
            <ShieldCheck className="w-5 h-5 text-[#2455B5]" aria-hidden="true" />
            <span id="validation-modal-title">
              Formulir Permintaan Validasi Referensi
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Tutup formulir validasi"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#102D68]/65 hover:bg-[#F3F7FF] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {createdRequestId ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-xs font-mono font-semibold text-[#2455B5]">
                Nomor Permintaan: {createdRequestId}
              </p>
              <h3 className="font-display text-xl font-bold text-[#102D68]">
                Permintaan Validasi Berhasil Dikirim
              </h3>
              <p className="text-sm text-[#102D68]/75 leading-relaxed">
                Sebanyak{' '}
                <strong className="tabular-nums">
                  {selectedReferences.length} referensi
                </strong>{' '}
                untuk topik{' '}
                <strong className="text-[#102D68]">"{topic}"</strong> telah masuk ke
                antrean peninjauan pustakawan dengan status{' '}
                <strong>Menunggu Validasi</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] transition-colors cursor-pointer"
              >
                Kembali ke Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  onGoToNotifications();
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
              >
                Lihat Notifikasi Pengajuan
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-[#F3F7FF] rounded-xl p-4 border border-[#DCE8FF]">
              <p className="text-xs font-semibold text-[#102D68] mb-2">
                Referensi yang Diajukan (
                <span className="tabular-nums">{selectedReferences.length}</span>)
              </p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedReferences.map((ref) => (
                  <li
                    key={ref.id}
                    className="flex items-start gap-2 text-xs text-[#102D68]/85"
                  >
                    <FileText
                      className="w-3.5 h-3.5 text-[#5489E8] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-medium">{ref.title}</strong> ({ref.type},{' '}
                      <span className="tabular-nums">{ref.year}</span>)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="val-topic"
                className="block text-xs font-semibold text-[#102D68] mb-1.5"
              >
                Topik Penelitian <span className="text-rose-600">*</span>
              </label>
              <input
                id="val-topic"
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Pemanfaatan Asisten AI untuk Kurasi Referensi Skripsi"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68] placeholder:text-[#102D68]/45"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="val-purpose"
                  className="block text-xs font-semibold text-[#102D68] mb-1.5"
                >
                  Tujuan Penggunaan <span className="text-rose-600">*</span>
                </label>
                <select
                  id="val-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68] bg-white"
                >
                  <option value="Skripsi / Tugas Akhir">
                    Skripsi / Tugas Akhir
                  </option>
                  <option value="Proposal Penelitian">
                    Proposal Penelitian
                  </option>
                  <option value="Artikel Jurnal Ilmiah">
                    Artikel Jurnal Ilmiah
                  </option>
                  <option value="Kajian Pustaka Mata Kuliah">
                    Kajian Pustaka Mata Kuliah
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="val-deadline"
                  className="block text-xs font-semibold text-[#102D68] mb-1.5"
                >
                  Deadline <span className="text-rose-600">*</span>
                </label>
                <input
                  id="val-deadline"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#102D68] mb-2">
                Konsultasi dengan Pustakawan
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNeedsConsultation(true)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    needsConsultation
                      ? 'bg-[#DCE8FF]/70 border-[#2455B5] text-[#102D68]'
                      : 'bg-white border-[#DCE8FF] text-[#102D68]/70 hover:bg-[#F3F7FF]'
                  }`}
                >
                  Ya, Jadwalkan Konsultasi
                </button>
                <button
                  type="button"
                  onClick={() => setNeedsConsultation(false)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    !needsConsultation
                      ? 'bg-[#DCE8FF]/70 border-[#2455B5] text-[#102D68]'
                      : 'bg-white border-[#DCE8FF] text-[#102D68]/70 hover:bg-[#F3F7FF]'
                  }`}
                >
                  Tidak, Cukup Validasi Tertulis
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="val-attachment"
                className="block text-xs font-semibold text-[#102D68] mb-1.5"
              >
                Lampiran Outline / Draft (Opsional)
              </label>
              <label
                htmlFor="val-attachment"
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-dashed border-[#5489E8]/60 bg-[#F3F7FF]/60 hover:bg-[#F3F7FF] cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2 text-xs text-[#102D68]/80 truncate">
                  <Paperclip
                    className="w-4 h-4 text-[#2455B5] shrink-0"
                    aria-hidden="true"
                  />
                  {attachmentName
                    ? `${attachmentName} (${attachmentSize})`
                    : 'Unggah berkas PDF, DOCX, atau TXT (maks. 5 MB)'}
                </span>
                <span className="text-xs font-semibold text-[#2455B5] shrink-0">
                  Pilih Berkas
                </span>
                <input
                  id="val-attachment"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE8FF]">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-lg text-xs font-medium text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Kirim Permintaan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
