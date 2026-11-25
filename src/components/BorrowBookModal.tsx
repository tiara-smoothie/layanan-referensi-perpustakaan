import { useState, type FormEvent } from 'react';
import { BookMarked, Calendar, CheckCircle2, MapPin, X } from 'lucide-react';
import type { ReferenceItem } from '../types.ts';

interface BorrowBookModalProps {
  reference: ReferenceItem | null;
  onClose: () => void;
  onSubmitBorrow: (payload: {
    referenceId: string;
    studentName: string;
    studentNim: string;
    pickupDate: string;
    durationDays: 7 | 14;
    notes: string;
  }) => void;
}

export function BorrowBookModal({
  reference,
  onClose,
  onSubmitBorrow,
}: BorrowBookModalProps) {
  const defaultPickup = new Date(Date.now() + 86400000)
    .toISOString()
    .split('T')[0];

  const [studentName, setStudentName] = useState('Mutiara Sari');
  const [studentNim, setStudentNim] = useState('2106712044');
  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [durationDays, setDurationDays] = useState<7 | 14>(7);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reference) return null;

  const availableCount = reference.physicalCopiesAvailable ?? 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentNim.trim() || !pickupDate) {
      setError('Mohon lengkapi nama mahasiswa, NIM, dan tanggal pengambilan.');
      return;
    }
    if (availableCount <= 0) {
      setError(
        'Seluruh eksemplar sedang dipinjam. Silakan pilih referensi lain yang tersedia.'
      );
      return;
    }
    setError('');
    onSubmitBorrow({
      referenceId: reference.id,
      studentName: studentName.trim(),
      studentNim: studentNim.trim(),
      pickupDate,
      durationDays,
      notes: notes.trim(),
    });
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D68]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="borrow-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_24px_60px_rgba(16,45,104,0.22)] max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCE8FF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#102D68]">
            <BookMarked className="w-4 h-4 text-[#2455B5]" aria-hidden="true" />
            <span id="borrow-modal-title">Pengajuan Peminjaman Koleksi Fisik</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form peminjaman"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#102D68]/65 hover:bg-[#F3F7FF] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#102D68]">
                Permintaan Peminjaman Terkirim
              </h3>
              <p className="text-sm text-[#102D68]/75 mt-1.5 leading-relaxed">
                Buku{' '}
                <span className="font-semibold text-[#102D68]">
                  {reference.title}
                </span>{' '}
                telah dipesan untuk diambil pada{' '}
                <span className="font-semibold tabular-nums">{pickupDate}</span>.
                Status dapat dipantau di halaman Koleksi Fisik.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] space-y-1">
              <p className="text-xs font-medium text-[#2455B5]">
                {reference.type} · {reference.callNumber}
              </p>
              <p className="text-sm font-semibold text-[#102D68]">
                {reference.title}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#102D68]/70 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#5489E8]" aria-hidden="true" />
                <span>
                  {reference.shelfLocation} ·{' '}
                  <strong className="tabular-nums">
                    {availableCount} eksemplar tersedia
                  </strong>
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102D68] mb-1">
                  Nama Mahasiswa
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102D68] mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={studentNim}
                  onChange={(e) => setStudentNim(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE8FF] text-sm font-mono text-[#102D68]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102D68] mb-1">
                  Tanggal Pengambilan
                </label>
                <div className="relative">
                  <Calendar
                    className="w-4 h-4 text-[#5489E8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102D68] mb-1">
                  Durasi Peminjaman
                </label>
                <select
                  value={durationDays}
                  onChange={(e) =>
                    setDurationDays(Number(e.target.value) as 7 | 14)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
                >
                  <option value={7}>7 Hari Kalender</option>
                  <option value={14}>14 Hari Kalender</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102D68] mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Diambil pukul 10.00 WIB di loket sirkulasi..."
                className="w-full px-3 py-2 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={availableCount <= 0}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Kirim Pengajuan Pinjam
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
