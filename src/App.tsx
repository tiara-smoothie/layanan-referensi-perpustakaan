import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AiAssistantPage } from './components/AiAssistantPage.tsx';
import { BorrowBookModal } from './components/BorrowBookModal.tsx';
import { CollectionsPage } from './components/CollectionsPage.tsx';
import { DigitalReaderModal } from './components/DigitalReaderModal.tsx';
import { Footer } from './components/Footer.tsx';
import { HelpPage } from './components/HelpPage.tsx';
import { HomePage } from './components/HomePage.tsx';
import { LibrarianDashboardPage } from './components/LibrarianDashboardPage.tsx';
import { Navbar } from './components/Navbar.tsx';
import { NotificationsPage } from './components/NotificationsPage.tsx';
import { ReferenceDetailModal } from './components/ReferenceDetailModal.tsx';
import { ServicesPage } from './components/ServicesPage.tsx';
import { ValidationFormModal } from './components/ValidationFormModal.tsx';
import { WorkspacePage } from './components/WorkspacePage.tsx';
import type {
  AppNotification,
  BorrowStatus,
  NotificationKind,
  PageRoute,
  ReferenceDecision,
  ReferenceItem,
  UserRole,
  ValidationRequest,
  ValidationStatus,
} from './types.ts';
import {
  loadAppState,
  saveAppState,
  type PersistedAppState,
} from './utils/storage.ts';

export default function App() {
  const [appState, setAppState] = useState<PersistedAppState>(() =>
    loadAppState()
  );
  const [currentPage, setCurrentPage] = useState<PageRoute>('beranda');
  const [role, setRole] = useState<UserRole>('mahasiswa');
  const [assistantTopic, setAssistantTopic] = useState<string | undefined>();

  // Modal States
  const [detailReference, setDetailReference] = useState<ReferenceItem | null>(
    null
  );
  const [readerReference, setReaderReference] = useState<ReferenceItem | null>(
    null
  );
  const [borrowReference, setBorrowReference] = useState<ReferenceItem | null>(
    null
  );
  const [validationRefs, setValidationRefs] = useState<ReferenceItem[] | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const savedReferenceIds = useMemo(() => {
    const set = new Set<string>();
    appState.folders.forEach((folder) => {
      folder.referenceIds.forEach((id) => set.add(id));
    });
    return set;
  }, [appState.folders]);

  const unreadNotifications = useMemo(
    () => appState.notifications.filter((n) => !n.read).length,
    [appState.notifications]
  );

  // Folder Operations
  const handleCreateFolder = (name: string): string => {
    const id = `fld-${Date.now()}`;
    setAppState((prev) => ({
      ...prev,
      folders: [
        ...prev.folders,
        {
          id,
          name,
          createdAt: new Date().toISOString(),
          referenceIds: [],
        },
      ],
    }));
    showToast(`Folder "${name}" berhasil dibuat.`);
    return id;
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setAppState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === folderId ? { ...f, name: newName } : f
      ),
    }));
    showToast(`Nama folder diubah menjadi "${newName}".`);
  };

  const handleDeleteFolder = (folderId: string) => {
    const target = appState.folders.find((f) => f.id === folderId);
    setAppState((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== folderId),
    }));
    if (target) {
      showToast(`Folder "${target.name}" telah dihapus.`);
    }
  };

  const handleAddReferenceToFolder = (referenceId: string, folderId: string) => {
    setAppState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => {
        if (f.id !== folderId) return f;
        if (f.referenceIds.includes(referenceId)) return f;
        return { ...f, referenceIds: [...f.referenceIds, referenceId] };
      }),
    }));
    const folder = appState.folders.find((f) => f.id === folderId);
    showToast(
      `Referensi ditambahkan ke folder "${folder?.name || 'Workspace'}".`
    );
  };

  const handleCreateFolderAndAdd = (
    referenceId: string,
    folderName: string
  ) => {
    const id = `fld-${Date.now()}`;
    setAppState((prev) => ({
      ...prev,
      folders: [
        ...prev.folders,
        {
          id,
          name: folderName,
          createdAt: new Date().toISOString(),
          referenceIds: [referenceId],
        },
      ],
    }));
    showToast(`Referensi disimpan ke folder baru "${folderName}".`);
  };

  const handleRemoveReferenceFromFolder = (
    referenceId: string,
    folderId: string
  ) => {
    setAppState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              referenceIds: f.referenceIds.filter((id) => id !== referenceId),
            }
          : f
      ),
    }));
    showToast('Referensi dihapus dari folder.');
  };

  // Digital Download Handler
  const handleDownloadReference = (ref: ReferenceItem) => {
    const content = [
      'LIBRAMIND – DOKUMEN RINGKASAN & SITASI AKADEMIK',
      '==================================================',
      `Judul         : ${ref.title}`,
      `Penulis       : ${ref.author}`,
      `Tahun Terbit  : ${ref.year}`,
      `Jenis Koleksi : ${ref.type}`,
      `Penerbit      : ${ref.publisher}`,
      `Nomor Panggil : ${ref.callNumber}`,
      ref.doi ? `DOI           : ${ref.doi}` : '',
      '',
      'ABSTRAK',
      ref.abstract,
      '',
      'SITASI APA',
      `${ref.author} (${ref.year}). ${ref.title}. ${ref.publisher}.${ref.doi ? ` https://doi.org/${ref.doi}` : ''}`,
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ref.id}-${ref.type.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Mengunduh ringkasan & sitasi "${ref.title}".`);
  };

  // Physical Borrow Handler
  const handleSubmitBorrow = (payload: {
    referenceId: string;
    studentName: string;
    studentNim: string;
    pickupDate: string;
    durationDays: 7 | 14;
    notes: string;
  }) => {
    const id = `PJM-2026-${String(105 + appState.borrowRequests.length).padStart(3, '0')}`;
    setAppState((prev) => ({
      ...prev,
      borrowRequests: [
        {
          id,
          ...payload,
          status: 'Menunggu Pengambilan',
          requestedAt: new Date().toISOString(),
        },
        ...prev.borrowRequests,
      ],
    }));
    showToast(`Pengajuan peminjaman ${id} berhasil dikirim.`);
  };

  const handleUpdateBorrowStatus = (
    borrowId: string,
    nextStatus: BorrowStatus
  ) => {
    setAppState((prev) => ({
      ...prev,
      borrowRequests: prev.borrowRequests.map((req) =>
        req.id === borrowId ? { ...req, status: nextStatus } : req
      ),
    }));
    showToast(`Status peminjaman ${borrowId} diperbarui: ${nextStatus}.`);
  };

  // Validation Request & Notification Dispatch
  const handleSubmitValidation = (payload: {
    topic: string;
    purpose: string;
    deadline: string;
    needsConsultation: boolean;
    attachmentName?: string;
    attachmentSize?: string;
    referenceIds: string[];
  }): string => {
    const id = `VAL-2026-${String(22 + appState.validationRequests.length).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const decisions: Record<string, ReferenceDecision> = {};
    payload.referenceIds.forEach((refId) => {
      decisions[refId] = 'Menunggu';
    });

    const newRequest: ValidationRequest = {
      id,
      studentName: 'Mutiara Sari',
      studentNim: '2106712044',
      studentProgram: 'S1 Ilmu Perpustakaan & Informasi',
      studentEmail: 'mutiara.sari@univ.ac.id',
      topic: payload.topic,
      purpose: payload.purpose,
      deadline: payload.deadline,
      needsConsultation: payload.needsConsultation,
      attachmentName: payload.attachmentName,
      attachmentSize: payload.attachmentSize,
      submittedAt: now,
      updatedAt: now,
      status: 'Menunggu Validasi',
      referenceIds: payload.referenceIds,
      referenceDecisions: decisions,
      librarianNotes: '',
    };

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Permintaan Validasi Berhasil Dikirim',
      message: `Permintaan validasi ${id} untuk topik "${payload.topic}" (${payload.referenceIds.length} referensi) telah dikirim ke pustakawan.`,
      kind: 'submitted',
      createdAt: now,
      read: false,
      requestId: id,
      statusSnapshot: 'Menunggu Validasi',
    };

    setAppState((prev) => ({
      ...prev,
      validationRequests: [newRequest, ...prev.validationRequests],
      notifications: [newNotification, ...prev.notifications],
    }));

    return id;
  };

  // Librarian Review Update & Automatic Notification
  const handleUpdateRequestReview = (payload: {
    requestId: string;
    status: ValidationStatus;
    librarianNotes: string;
    referenceDecisions: Record<string, ReferenceDecision>;
  }) => {
    const now = new Date().toISOString();
    const targetReq = appState.validationRequests.find(
      (r) => r.id === payload.requestId
    );
    if (!targetReq) return;

    let notifKind: NotificationKind = 'reviewing';
    let notifTitle = 'Permintaan Validasi Sedang Ditinjau';
    let notifMessage = `Pustakawan sedang meninjau permintaan ${payload.requestId} untuk topik "${targetReq.topic}".`;

    if (payload.status === 'Disetujui') {
      notifKind = 'approved';
      notifTitle = 'Referensi Validasi Disetujui Pustakawan';
      notifMessage = `Permintaan ${payload.requestId} ("${targetReq.topic}") telah disetujui oleh pustakawan.${
        payload.librarianNotes ? ` Catatan: ${payload.librarianNotes}` : ''
      }`;
    } else if (payload.status === 'Perlu Revisi') {
      notifKind = 'revision';
      notifTitle = 'Permintaan Validasi Memerlukan Revisi';
      notifMessage = `Pustakawan meminta revisi pada pengajuan ${payload.requestId} ("${targetReq.topic}").${
        payload.librarianNotes ? ` Catatan: ${payload.librarianNotes}` : ''
      }`;
    }

    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      kind: notifKind,
      createdAt: now,
      read: false,
      requestId: payload.requestId,
      statusSnapshot: payload.status,
    };

    setAppState((prev) => ({
      ...prev,
      validationRequests: prev.validationRequests.map((req) =>
        req.id === payload.requestId
          ? {
              ...req,
              status: payload.status,
              librarianNotes: payload.librarianNotes,
              referenceDecisions: payload.referenceDecisions,
              updatedAt: now,
            }
          : req
      ),
      notifications: [notification, ...prev.notifications],
    }));
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    setAppState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const handleMarkAllNotificationsRead = () => {
    setAppState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7FF] text-[#102D68]">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        role={role}
        onRoleChange={setRole}
        unreadNotifications={unreadNotifications}
      />

      {/* Contextual Role Banner when in Librarian Mode (below header) */}
      {role === 'pustakawan' && (
        <div className="bg-[#102D68] text-white border-b border-[#2455B5]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              Mode Aktif: <strong>Dashboard Pustakawan (Validator)</strong> ·
              Drs. Hendra Wijaya, M.I.Kom.
            </span>
            <div className="flex items-center gap-3">
              {currentPage !== 'pustakawan' && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('pustakawan')}
                  className="font-semibold text-[#DCE8FF] hover:text-white underline cursor-pointer"
                >
                  Buka Dashboard Pustakawan
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRole('mahasiswa');
                  if (currentPage === 'pustakawan') {
                    setCurrentPage('workspace');
                  }
                }}
                className="font-semibold text-white/85 hover:text-white cursor-pointer"
              >
                Kembali ke Mode Mahasiswa
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {currentPage === 'beranda' && (
          <HomePage
            onNavigate={setCurrentPage}
            onSearchToAssistant={(query) => {
              setAssistantTopic(query);
              setCurrentPage('asisten');
            }}
            onViewDetail={(ref) => setDetailReference(ref)}
            onAddToWorkspace={(ref) => setDetailReference(ref)}
            savedReferenceIds={savedReferenceIds}
          />
        )}

        {currentPage === 'asisten' && (
          <AiAssistantPage
            initialTopic={assistantTopic}
            onConsumeInitialTopic={() => setAssistantTopic(undefined)}
            onViewDetail={(ref) => setDetailReference(ref)}
            onAddToWorkspace={(ref) => setDetailReference(ref)}
            savedReferenceIds={savedReferenceIds}
          />
        )}

        {currentPage === 'koleksi' && (
          <CollectionsPage
            borrowRequests={appState.borrowRequests}
            onViewDetail={(ref) => setDetailReference(ref)}
            onAddToWorkspace={(ref) => setDetailReference(ref)}
            onOpenReader={(ref) => setReaderReference(ref)}
            onDownloadReference={handleDownloadReference}
            onOpenBorrow={(ref) => setBorrowReference(ref)}
            onUpdateBorrowStatus={handleUpdateBorrowStatus}
            savedReferenceIds={savedReferenceIds}
          />
        )}

        {currentPage === 'layanan' && (
          <ServicesPage onNavigate={setCurrentPage} onSwitchRole={setRole} />
        )}

        {currentPage === 'workspace' && (
          <WorkspacePage
            folders={appState.folders}
            validationRequests={appState.validationRequests}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onAddReferenceToFolder={handleAddReferenceToFolder}
            onRemoveReferenceFromFolder={handleRemoveReferenceFromFolder}
            onViewDetail={(ref) => setDetailReference(ref)}
            onRequestValidation={(refs) => setValidationRefs(refs)}
          />
        )}

        {currentPage === 'pustakawan' && (
          <LibrarianDashboardPage
            requests={appState.validationRequests}
            onUpdateRequestReview={handleUpdateRequestReview}
            onViewDetail={(ref) => setDetailReference(ref)}
          />
        )}

        {currentPage === 'notifikasi' && (
          <NotificationsPage
            notifications={appState.notifications}
            validationRequests={appState.validationRequests}
            onMarkAsRead={handleMarkNotificationRead}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'bantuan' && (
          <HelpPage onNavigate={setCurrentPage} />
        )}
      </main>

      <Footer onNavigate={setCurrentPage} />

      {/* Modals */}
      <ReferenceDetailModal
        reference={detailReference}
        folders={appState.folders}
        onClose={() => setDetailReference(null)}
        onAddToFolder={handleAddReferenceToFolder}
        onCreateFolderAndAdd={handleCreateFolderAndAdd}
        onOpenReader={(ref) => setReaderReference(ref)}
        onOpenBorrow={(ref) => setBorrowReference(ref)}
        onDownloadReference={handleDownloadReference}
      />

      <DigitalReaderModal
        reference={readerReference}
        onClose={() => setReaderReference(null)}
        onDownload={handleDownloadReference}
      />

      <BorrowBookModal
        reference={borrowReference}
        onClose={() => setBorrowReference(null)}
        onSubmitBorrow={handleSubmitBorrow}
      />

      <ValidationFormModal
        isOpen={Boolean(validationRefs)}
        selectedReferences={validationRefs || []}
        onClose={() => setValidationRefs(null)}
        onSubmitValidation={handleSubmitValidation}
        onGoToNotifications={() => setCurrentPage('notifikasi')}
      />

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#102D68] text-white px-4 py-3 rounded-xl shadow-[0_12px_32px_rgba(16,45,104,0.28)] flex items-center gap-3 text-xs font-medium"
        >
          <CheckCircle2
            className="w-4 h-4 text-[#5489E8] shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup pesan"
            className="text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
