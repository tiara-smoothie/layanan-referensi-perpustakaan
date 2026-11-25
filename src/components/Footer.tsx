import { BookOpenCheck } from 'lucide-react';
import type { PageRoute } from '../types.ts';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-[#DCE8FF] mt-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-[#102D68] text-white flex items-center justify-center">
              <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold text-[#102D68]">
              LibraMind
            </span>
          </div>
          <p className="text-xs text-[#102D68]/65">
            Asisten Perpustakaan &amp; Riset Akademik Universitas · © 2026
            LibraMind
          </p>
        </div>

        <nav
          aria-label="Navigasi footer"
          className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#102D68]/75"
        >
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onNavigate('koleksi')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Koleksi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('asisten')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Asisten AI
          </button>
          <button
            type="button"
            onClick={() => onNavigate('workspace')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Workspace Riset
          </button>
          <button
            type="button"
            onClick={() => onNavigate('notifikasi')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Notifikasi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bantuan')}
            className="hover:text-[#2455B5] cursor-pointer"
          >
            Bantuan
          </button>
        </nav>
      </div>
    </footer>
  );
}
