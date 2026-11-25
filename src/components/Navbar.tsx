import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  FolderKanban,
  Menu,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import type { PageRoute, UserRole } from '../types.ts';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  unreadNotifications: number;
}

export function Navbar({
  currentPage,
  onNavigate,
  role,
  onRoleChange,
  unreadNotifications,
}: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: PageRoute; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'koleksi', label: 'Koleksi' },
    { id: 'layanan', label: 'Layanan' },
    {
      id: role === 'pustakawan' ? 'pustakawan' : 'workspace',
      label: role === 'pustakawan' ? 'Pustakawan' : 'Workspace',
    },
    { id: 'bantuan', label: 'Bantuan' },
  ];

  const handleNavClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DCE8FF]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Mark */}
        <button
          type="button"
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <span className="w-9 h-9 rounded-lg bg-[#102D68] text-white flex items-center justify-center transition-colors duration-150 group-hover:bg-[#2455B5]">
            <BookOpenCheck className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-[#102D68] whitespace-nowrap">
            LibraMind
          </span>
        </button>

        {/* Zone 2: Single-line Nav Links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6 lg:gap-8"
        >
          {navItems.map((item) => {
            const isActive =
              currentPage === item.id ||
              (item.id === 'layanan' && currentPage === 'asisten');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[#2455B5] font-semibold'
                    : 'text-[#102D68]/75 hover:text-[#102D68]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#2455B5] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Notification & User Profile Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('notifikasi')}
            aria-label={`Notifikasi (${unreadNotifications} belum dibaca)`}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 cursor-pointer ${
              currentPage === 'notifikasi'
                ? 'bg-[#DCE8FF] text-[#102D68]'
                : 'text-[#102D68]/80 hover:bg-[#F3F7FF] hover:text-[#102D68]'
            }`}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2455B5] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-label="Profil pengguna dan pengalih peran"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#DCE8FF] bg-white hover:bg-[#F3F7FF] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="w-7 h-7 rounded-md bg-[#2455B5] text-white flex items-center justify-center">
                {role === 'pustakawan' ? (
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <User className="w-4 h-4" aria-hidden="true" />
                )}
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-[#102D68]">
                {role === 'pustakawan' ? 'Pustakawan' : 'Mahasiswa'}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 text-[#102D68]/60"
                aria-hidden="true"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#DCE8FF] shadow-[0_12px_32px_rgba(16,45,104,0.12)] py-2 z-50">
                <div className="px-4 py-2.5 border-b border-[#DCE8FF]/70">
                  <p className="text-sm font-semibold text-[#102D68]">
                    {role === 'pustakawan'
                      ? 'Drs. Hendra Wijaya, M.I.Kom.'
                      : 'Mutiara Sari'}
                  </p>
                  <p className="text-xs text-[#102D68]/65 mt-0.5">
                    {role === 'pustakawan'
                      ? 'Pustakawan Subjek · NIP 19780412200501'
                      : 'Ilmu Perpustakaan · NIM 2106712044'}
                  </p>
                </div>

                <div className="px-2 py-2 border-b border-[#DCE8FF]/70">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold text-[#102D68]/55">
                    Ganti Antarmuka Peran
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('mahasiswa');
                      setProfileOpen(false);
                      if (currentPage === 'pustakawan') {
                        onNavigate('workspace');
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      role === 'mahasiswa'
                        ? 'bg-[#DCE8FF]/70 text-[#102D68] font-semibold'
                        : 'text-[#102D68]/80 hover:bg-[#F3F7FF]'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#2455B5]" aria-hidden="true" />
                    <span>Mode Mahasiswa (Peneliti)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('pustakawan');
                      setProfileOpen(false);
                      onNavigate('pustakawan');
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer mt-0.5 ${
                      role === 'pustakawan'
                        ? 'bg-[#DCE8FF]/70 text-[#102D68] font-semibold'
                        : 'text-[#102D68]/80 hover:bg-[#F3F7FF]'
                    }`}
                  >
                    <ShieldCheck
                      className="w-4 h-4 text-[#2455B5]"
                      aria-hidden="true"
                    />
                    <span>Mode Pustakawan (Validator)</span>
                  </button>
                </div>

                <div className="px-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('workspace');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#102D68]/80 hover:bg-[#F3F7FF] cursor-pointer"
                  >
                    <FolderKanban
                      className="w-4 h-4 text-[#5489E8]"
                      aria-hidden="true"
                    />
                    <span>Buka Workspace Riset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('notifikasi');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-[#102D68]/80 hover:bg-[#F3F7FF] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bell
                        className="w-4 h-4 text-[#5489E8]"
                        aria-hidden="true"
                      />
                      <span>Pusat Notifikasi</span>
                    </span>
                    {unreadNotifications > 0 && (
                      <span className="text-xs font-semibold text-[#2455B5] tabular-nums">
                        {unreadNotifications} baru
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#102D68] hover:bg-[#F3F7FF] cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden bg-white border-t border-[#DCE8FF] px-4 py-3 space-y-1"
        >
          {navItems.map((item) => {
            const isActive =
              currentPage === item.id ||
              (item.id === 'layanan' && currentPage === 'asisten');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#DCE8FF]/60 text-[#2455B5] font-semibold'
                    : 'text-[#102D68]/80 hover:bg-[#F3F7FF]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleNavClick('asisten')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'asisten'
                ? 'bg-[#DCE8FF]/60 text-[#2455B5] font-semibold'
                : 'text-[#102D68]/80 hover:bg-[#F3F7FF]'
            }`}
          >
            Asisten Referensi AI
          </button>
        </nav>
      )}
    </header>
  );
}
