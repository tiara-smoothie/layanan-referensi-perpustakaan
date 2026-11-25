import {
  ArrowRight,
  Bell,
  BookMarked,
  Bot,
  FolderKanban,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import type { PageRoute, UserRole } from '../types.ts';

interface ServicesPageProps {
  onNavigate: (page: PageRoute) => void;
  onSwitchRole: (role: UserRole) => void;
}

export function ServicesPage({ onNavigate, onSwitchRole }: ServicesPageProps) {
  const services = [
    {
      title: 'Asisten Referensi AI',
      subtitle: 'Penemuan Sumber Ilmiah Berbasis Topik',
      description:
        'Masukkan rumusan masalah atau topik skripsi Anda. Asisten AI akan menganalisis kebutuhan riset serta merekomendasikan buku, jurnal, e-book, dan skripsi yang relevan.',
      buttonText: 'Buka Asisten AI',
      icon: Bot,
      onClick: () => onNavigate('asisten'),
    },
    {
      title: 'Workspace Riset & Folder',
      subtitle: 'Organisasi Literatur Terstruktur',
      description:
        'Simpan temuan referensi ke dalam folder khusus seperti Skripsi Bab II atau Metode Penelitian, kelola isi folder, dan pilih referensi untuk divalidasi.',
      buttonText: 'Buka Workspace Riset',
      icon: FolderKanban,
      onClick: () => onNavigate('workspace'),
    },
    {
      title: 'Validasi Referensi Pustakawan',
      subtitle: 'Kurasi & Persetujuan Mutu Pustaka',
      description:
        'Ajukan daftar referensi terpilih lengkap dengan topik penelitian, tujuan penggunaan, deadline, serta opsi konsultasi tatap muka atau daring.',
      buttonText: 'Pilih Referensi di Workspace',
      icon: ShieldCheck,
      onClick: () => onNavigate('workspace'),
    },
    {
      title: 'Akses Koleksi Digital',
      subtitle: 'E-book, Jurnal & Repositori Skripsi',
      description:
        'Baca dokumen ilmiah langsung melalui pembaca web terintegrasi, salin format sitasi APA, dan unduh ringkasan dokumen resmi kampus.',
      buttonText: 'Akses Koleksi Digital',
      icon: Globe,
      onClick: () => onNavigate('koleksi'),
    },
    {
      title: 'Peminjaman Koleksi Fisik',
      subtitle: 'Sirkulasi Buku Cetak Perpustakaan',
      description:
        'Cek jumlah eksemplar tersedia beserta nomor rak lantai perpustakaan, ajukan tanggal pengambilan buku, dan pantau status peminjaman.',
      buttonText: 'Kelola Peminjaman Fisik',
      icon: BookMarked,
      onClick: () => onNavigate('koleksi'),
    },
    {
      title: 'Portal Dashboard Pustakawan',
      subtitle: 'Antarmuka Tinjauan & Validasi',
      description:
        'Khusus pustakawan subjek untuk meninjau permintaan validasi mahasiswa, menyetujui atau menolak referensi, menulis catatan, dan mengirim notifikasi status.',
      buttonText: 'Masuk Mode Pustakawan',
      icon: Bell,
      onClick: () => {
        onSwitchRole('pustakawan');
        onNavigate('pustakawan');
      },
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE8FF] shadow-[0_4px_20px_rgba(16,45,104,0.05)]">
        <p className="text-xs font-semibold text-[#2455B5]">
          Direktori Layanan Akademik
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
          Layanan Cerdas Perpustakaan LibraMind
        </h1>
        <p className="text-sm text-[#102D68]/75 mt-2 max-w-2xl leading-relaxed">
          Seluruh layanan dirancang untuk mendampingi proses riset mahasiswa
          secara sistematis—mulai dari eksplorasi literatur awal hingga
          validasi akhir oleh pustakawan universitas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-6 border border-[#DCE8FF] shadow-[0_2px_12px_rgba(16,45,104,0.04)] hover:shadow-[0_10px_28px_rgba(16,45,104,0.08)] transition-all duration-150 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#DCE8FF]/70 text-[#2455B5] flex items-center justify-center">
                  <IconComp className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#5489E8]">
                    {item.subtitle}
                  </p>
                  <h2 className="font-display text-lg font-bold text-[#102D68] mt-0.5">
                    {item.title}
                  </h2>
                </div>
                <p className="text-sm text-[#102D68]/75 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                onClick={item.onClick}
                className="inline-flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
              >
                <span>{item.buttonText}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
