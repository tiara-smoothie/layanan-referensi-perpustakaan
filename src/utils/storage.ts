import type {
  AppNotification,
  BorrowRequest,
  ResearchFolder,
  ValidationRequest,
} from '../types.ts';

export interface PersistedAppState {
  folders: ResearchFolder[];
  validationRequests: ValidationRequest[];
  borrowRequests: BorrowRequest[];
  notifications: AppNotification[];
}

const STORAGE_KEY = 'libramind_state_v1';

export const DEFAULT_APP_STATE: PersistedAppState = {
  folders: [
    {
      id: 'fld-skripsi-bab-2',
      name: 'Skripsi Bab II',
      createdAt: '2026-11-12T09:15:00Z',
      referenceIds: ['ref-01', 'ref-06', 'ref-09'],
    },
    {
      id: 'fld-metode-penelitian',
      name: 'Metode Penelitian',
      createdAt: '2026-11-15T14:20:00Z',
      referenceIds: ['ref-02', 'ref-07'],
    },
    {
      id: 'fld-ai-perpustakaan',
      name: 'AI dan Perpustakaan',
      createdAt: '2026-11-18T11:05:00Z',
      referenceIds: ['ref-03', 'ref-04', 'ref-12'],
    },
  ],
  validationRequests: [
    {
      id: 'VAL-2026-018',
      studentName: 'Mutiara Sari',
      studentNim: '2106712044',
      studentProgram: 'S1 Ilmu Perpustakaan & Informasi',
      studentEmail: 'mutiara.sari@univ.ac.id',
      topic: 'Penerapan Asisten AI dalam Penemuan Referensi Skripsi Mahasiswa',
      purpose: 'Skripsi / Tugas Akhir',
      deadline: '2026-12-05',
      needsConsultation: true,
      attachmentName: 'Kerangka_Bab_2_Mutiara.pdf',
      attachmentSize: '1,2 MB',
      submittedAt: '2026-11-21T08:30:00Z',
      updatedAt: '2026-11-22T14:10:00Z',
      status: 'Disetujui',
      referenceIds: ['ref-01', 'ref-03', 'ref-06'],
      referenceDecisions: {
        'ref-01': 'Disetujui',
        'ref-03': 'Disetujui',
        'ref-06': 'Disetujui',
      },
      librarianNotes:
        'Ketiga referensi sangat relevan, mutakhir (2024–2025), dan memiliki metadata bibliografis yang lengkap. Disetujui untuk digunakan pada Bab II Tinjauan Pustaka.',
    },
    {
      id: 'VAL-2026-021',
      studentName: 'Bagas Aditya Pratama',
      studentNim: '2106712089',
      studentProgram: 'S1 Sistem Informasi',
      studentEmail: 'bagas.aditya@univ.ac.id',
      topic: 'Evaluasi Kualitas Layanan Portal Repositori Kampus',
      purpose: 'Proposal Penelitian',
      deadline: '2026-12-10',
      needsConsultation: false,
      attachmentName: 'Draft_Proposal_Bagas.docx',
      attachmentSize: '840 KB',
      submittedAt: '2026-11-24T10:15:00Z',
      updatedAt: '2026-11-24T10:15:00Z',
      status: 'Menunggu Validasi',
      referenceIds: ['ref-02', 'ref-09', 'ref-10'],
      referenceDecisions: {
        'ref-02': 'Menunggu',
        'ref-09': 'Menunggu',
        'ref-10': 'Menunggu',
      },
      librarianNotes: '',
    },
  ],
  borrowRequests: [
    {
      id: 'PJM-2026-104',
      referenceId: 'ref-07',
      studentName: 'Mutiara Sari',
      studentNim: '2106712044',
      pickupDate: '2026-11-20',
      durationDays: 7,
      notes: 'Digunakan untuk penyusunan instrumen wawancara Bab III.',
      status: 'Sedang Dipinjam',
      requestedAt: '2026-11-19T13:45:00Z',
    },
  ],
  notifications: [
    {
      id: 'notif-01',
      title: 'Referensi Validasi Disetujui Pustakawan',
      message:
        'Permintaan validasi VAL-2026-018 untuk topik "Penerapan Asisten AI dalam Penemuan Referensi Skripsi Mahasiswa" telah disetujui oleh pustakawan dengan catatan lengkap.',
      kind: 'approved',
      createdAt: '2026-11-22T14:10:00Z',
      read: false,
      requestId: 'VAL-2026-018',
      statusSnapshot: 'Disetujui',
    },
    {
      id: 'notif-02',
      title: 'Permintaan Validasi Berhasil Dikirim',
      message:
        'Permintaan validasi VAL-2026-018 telah masuk ke antrean peninjauan pustakawan subjek.',
      kind: 'submitted',
      createdAt: '2026-11-21T08:30:00Z',
      read: true,
      requestId: 'VAL-2026-018',
      statusSnapshot: 'Menunggu Validasi',
    },
  ],
};

export function loadAppState(): PersistedAppState {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      folders:
        Array.isArray(parsed.folders) && parsed.folders.length > 0
          ? parsed.folders
          : DEFAULT_APP_STATE.folders,
      validationRequests: Array.isArray(parsed.validationRequests)
        ? parsed.validationRequests
        : DEFAULT_APP_STATE.validationRequests,
      borrowRequests: Array.isArray(parsed.borrowRequests)
        ? parsed.borrowRequests
        : DEFAULT_APP_STATE.borrowRequests,
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : DEFAULT_APP_STATE.notifications,
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function saveAppState(state: PersistedAppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function formatIndonesianDate(isoString: string, includeTime = false): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return isoString;
  }
}
