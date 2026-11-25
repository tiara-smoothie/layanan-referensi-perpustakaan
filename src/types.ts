export type CollectionType = 'Buku' | 'Jurnal' | 'E-book' | 'Skripsi';

export type AvailabilityStatus =
  | 'Tersedia'
  | 'Tersedia Digital'
  | 'Dipinjam'
  | 'Terbatas';

export type UserRole = 'mahasiswa' | 'pustakawan';

export type PageRoute =
  | 'beranda'
  | 'koleksi'
  | 'layanan'
  | 'asisten'
  | 'workspace'
  | 'pustakawan'
  | 'notifikasi'
  | 'bantuan';

export type ValidationStatus =
  | 'Menunggu Validasi'
  | 'Sedang Ditinjau'
  | 'Disetujui'
  | 'Perlu Revisi';

export type ReferenceDecision = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type BorrowStatus =
  | 'Menunggu Pengambilan'
  | 'Sedang Dipinjam'
  | 'Dikembalikan';

export interface ReferenceItem {
  id: string;
  title: string;
  author: string;
  year: number;
  type: CollectionType;
  availability: AvailabilityStatus;
  coverUrl: string;
  publisher: string;
  callNumber: string;
  doi?: string;
  language: 'Indonesia' | 'Inggris';
  pages: number;
  abstract: string;
  keywords: string[];
  isDigital: boolean;
  isPhysical: boolean;
  digitalFormat?: string;
  fileSize?: string;
  digitalSections?: { heading: string; content: string }[];
  physicalCopiesTotal?: number;
  physicalCopiesAvailable?: number;
  shelfLocation?: string;
}

export interface ResearchFolder {
  id: string;
  name: string;
  createdAt: string;
  referenceIds: string[];
}

export interface ValidationRequest {
  id: string;
  studentName: string;
  studentNim: string;
  studentProgram: string;
  studentEmail: string;
  topic: string;
  purpose: string;
  deadline: string;
  needsConsultation: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  submittedAt: string;
  updatedAt: string;
  status: ValidationStatus;
  referenceIds: string[];
  referenceDecisions: Record<string, ReferenceDecision>;
  librarianNotes: string;
}

export interface BorrowRequest {
  id: string;
  referenceId: string;
  studentName: string;
  studentNim: string;
  pickupDate: string;
  durationDays: 7 | 14;
  notes: string;
  status: BorrowStatus;
  requestedAt: string;
}

export type NotificationKind = 'submitted' | 'reviewing' | 'approved' | 'revision';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  requestId: string;
  statusSnapshot: ValidationStatus;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedIds?: string[];
  searchQueries?: string[];
  suggestedTopics?: string[];
  timestamp: string;
  isError?: boolean;
  retryQuery?: string;
}
