import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import type { PageRoute } from '../types.ts';

interface HelpPageProps {
  onNavigate: (page: PageRoute) => void;
}

const FAQS = [
  {
    q: 'Bagaimana cara menggunakan Asisten Referensi AI LibraMind?',
    a: 'Buka menu Layanan lalu pilih Asisten Referensi AI. Ketik topik penelitian atau rumusan masalah Anda dalam bahasa Indonesia, lalu gunakan filter Buku, Jurnal, E-book, atau Skripsi untuk menyaring rekomendasi.',
  },
  {
    q: 'Bagaimana alur validasi referensi oleh pustakawan?',
    a: 'Simpan referensi yang Anda temukan ke dalam folder di Workspace Riset, centang referensi yang ingin diperiksa, klik Ajukan Validasi, lalu lengkapi Topik Penelitian, Tujuan Penggunaan, Deadline, dan opsi Konsultasi.',
  },
  {
    q: 'Berapa lama proses peninjauan permintaan validasi?',
    a: 'Pustakawan subjek meninjau pengajuan dalam waktu maksimal 1 x 24 jam hari kerja. Anda akan menerima notifikasi otomatis saat status berubah menjadi Sedang Ditinjau, Disetujui, atau Perlu Revisi.',
  },
  {
    q: 'Apakah saya bisa meminjam buku fisik dan mengakses koleksi digital secara bersamaan?',
    a: 'Ya. Di menu Koleksi, pilih Akses Koleksi Digital untuk membaca serta mengunduh dokumen elektronik, atau pilih Peminjaman Koleksi Fisik untuk memeriksa stok rak dan memesan jadwal pengambilan buku cetak.',
  },
];

export function HelpPage({ onNavigate }: HelpPageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleHelpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE8FF]">
        <p className="text-xs font-semibold text-[#2455B5]">
          Pusat Informasi &amp; Dukungan Riset
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
          Bantuan &amp; Panduan Penggunaan LibraMind
        </h1>
        <p className="text-sm text-[#102D68]/70 mt-1.5 max-w-2xl">
          Temukan jawaban cepat seputar penelusuran referensi AI, pengelolaan
          workspace riset, validasi pustakawan, dan layanan sirkulasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FAQ Accordion */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE8FF] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2455B5]" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-[#102D68]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="divide-y divide-[#DCE8FF]">
            {FAQS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F3F7FF]/70 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-[#102D68]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#2455B5] shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-[#102D68]/80 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-[#F3F7FF]/70 border-t border-[#DCE8FF] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#102D68]/70">
              Ingin langsung mencoba mencari referensi?
            </span>
            <button
              type="button"
              onClick={() => onNavigate('asisten')}
              className="text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
            >
              Buka Asisten Referensi AI
            </button>
          </div>
        </section>

        {/* Contact & Desk Info */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE8FF] p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-[#102D68]">
              Meja Layanan Pustakawan
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[#102D68]/80">
              <div className="flex items-start gap-2.5">
                <Clock
                  className="w-4 h-4 text-[#2455B5] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  Senin – Jumat: 08.00 – 17.00 WIB · Sabtu: 09.00 – 14.00 WIB
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="w-4 h-4 text-[#2455B5] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  Gedung Perpustakaan Pusat Lt. 2, Ruang Konsultasi Riset
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail
                  className="w-4 h-4 text-[#2455B5] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>layanan.pustaka@libramind.ac.id</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE8FF] p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-[#102D68]">
              Kirim Pertanyaan ke Pustakawan
            </h2>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Pesan Anda berhasil dikirim</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Tim pustakawan subjek akan membalas pertanyaan Anda melalui
                  email kampus.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
                >
                  Kirim pertanyaan lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#102D68] mb-1">
                    Subjek Pertanyaan
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Akses jurnal terindeks di luar kampus"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE8FF] text-xs sm:text-sm text-[#102D68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102D68] mb-1">
                    Pesan / Kebutuhan Bantuan
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan kendala atau pertanyaan Anda secara singkat..."
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE8FF] text-xs sm:text-sm text-[#102D68]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Kirim Pertanyaan</span>
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
