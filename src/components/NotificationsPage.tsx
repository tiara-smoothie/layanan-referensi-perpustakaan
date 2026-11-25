import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  RotateCcw,
} from 'lucide-react';
import { getReferenceById } from '../data/references.ts';
import type {
  AppNotification,
  NotificationKind,
  PageRoute,
  ValidationRequest,
} from '../types.ts';
import { formatIndonesianDate } from '../utils/storage.ts';
import { ValidationStatusIndicator } from './StatusIndicator.tsx';

interface NotificationsPageProps {
  notifications: AppNotification[];
  validationRequests: ValidationRequest[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (page: PageRoute) => void;
}

function NotificationKindIcon({ kind }: { kind: NotificationKind }) {
  if (kind === 'approved') {
    return (
      <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      </span>
    );
  }
  if (kind === 'reviewing') {
    return (
      <span className="w-9 h-9 rounded-lg bg-[#DCE8FF] text-[#2455B5] flex items-center justify-center shrink-0">
        <Eye className="w-4 h-4" aria-hidden="true" />
      </span>
    );
  }
  if (kind === 'revision') {
    return (
      <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="w-9 h-9 rounded-lg bg-[#F3F7FF] text-[#102D68] flex items-center justify-center shrink-0">
      <Clock className="w-4 h-4" aria-hidden="true" />
    </span>
  );
}

export function NotificationsPage({
  notifications,
  validationRequests,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}: NotificationsPageProps) {
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<string>(
    notifications[0]?.id || ''
  );

  const visibleNotifications = filterUnread
    ? notifications.filter((n) => !n.read)
    : notifications;

  const selectedNotification =
    notifications.find((n) => n.id === selectedNotifId) ||
    visibleNotifications[0] ||
    null;

  useEffect(() => {
    if (selectedNotification && !selectedNotification.read) {
      onMarkAsRead(selectedNotification.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNotification?.id]);

  const linkedRequest = selectedNotification
    ? validationRequests.find((r) => r.id === selectedNotification.requestId)
    : undefined;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#2455B5]">
            Pembaruan Validasi &amp; Layanan
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
            Pusat &amp; Detail Notifikasi
          </h1>
          <p className="text-sm text-[#102D68]/70 mt-1">
            Pantau setiap pembaruan pengajuan validasi, tinjauan pustakawan,
            persetujuan referensi, hingga permintaan revisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setFilterUnread((prev) => !prev)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              filterUnread
                ? 'bg-[#2455B5] text-white border-[#2455B5]'
                : 'bg-white text-[#102D68] border-[#DCE8FF] hover:bg-[#F3F7FF]'
            }`}
          >
            {filterUnread
              ? 'Tampilkan Semua'
              : `Belum Dibaca (${unreadCount})`}
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#2455B5] bg-[#DCE8FF]/60 hover:bg-[#DCE8FF] transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Notification Feed */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DCE8FF] flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-[#102D68]">
              Daftar Notifikasi ({visibleNotifications.length})
            </h2>
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell
                className="w-8 h-8 text-[#5489E8] mx-auto"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-[#102D68]">
                Tidak ada notifikasi yang ditampilkan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8FF] max-h-[600px] overflow-y-auto">
              {visibleNotifications.map((notif) => {
                const isSelected = selectedNotification?.id === notif.id;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      setSelectedNotifId(notif.id);
                      if (!notif.read) onMarkAsRead(notif.id);
                    }}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#DCE8FF]/45'
                        : notif.read
                          ? 'bg-white hover:bg-[#F3F7FF]/60'
                          : 'bg-[#F3F7FF] hover:bg-[#DCE8FF]/30'
                    }`}
                  >
                    <NotificationKindIcon kind={notif.kind} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-semibold text-[#2455B5]">
                          {notif.requestId}
                        </span>
                        <span className="text-[11px] text-[#102D68]/55 tabular-nums">
                          {formatIndonesianDate(notif.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-snug ${
                          notif.read
                            ? 'font-medium text-[#102D68]'
                            : 'font-bold text-[#102D68]'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-[#102D68]/70 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Dedicated Notification Detail Page View */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE8FF] p-6 space-y-6">
          {!selectedNotification ? (
            <div className="p-10 text-center text-sm text-[#102D68]/70">
              Pilih notifikasi di sebelah kiri untuk melihat halaman detail.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#DCE8FF]">
                <div className="flex items-start gap-3.5">
                  <NotificationKindIcon kind={selectedNotification.kind} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#102D68]/65">
                      <span className="font-mono font-semibold text-[#2455B5]">
                        {selectedNotification.requestId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatIndonesianDate(
                          selectedNotification.createdAt,
                          true
                        )}
                      </span>
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#102D68] mt-1">
                      {selectedNotification.title}
                    </h2>
                  </div>
                </div>

                <ValidationStatusIndicator
                  status={
                    linkedRequest?.status || selectedNotification.statusSnapshot
                  }
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[#102D68]/60">
                  Isi Pemberitahuan
                </h3>
                <p className="text-sm text-[#102D68]/85 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {linkedRequest && (
                <div className="space-y-4 pt-4 border-t border-[#DCE8FF]">
                  <h3 className="font-display text-sm font-bold text-[#102D68]">
                    Detail Permintaan Validasi Terkait
                  </h3>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F3F7FF] rounded-xl p-4 border border-[#DCE8FF] text-xs">
                    <div>
                      <dt className="text-[#102D68]/55">Topik Penelitian</dt>
                      <dd className="font-semibold text-[#102D68] mt-0.5">
                        {linkedRequest.topic}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#102D68]/55">
                        Tujuan &amp; Deadline
                      </dt>
                      <dd className="font-medium text-[#102D68] mt-0.5 tabular-nums">
                        {linkedRequest.purpose} · {linkedRequest.deadline}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#102D68]/55">Konsultasi</dt>
                      <dd className="font-medium text-[#102D68] mt-0.5">
                        {linkedRequest.needsConsultation
                          ? 'Ya (Dijadwalkan)'
                          : 'Tidak'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#102D68]/55">Status Saat Ini</dt>
                      <dd className="mt-0.5">
                        <ValidationStatusIndicator
                          status={linkedRequest.status}
                        />
                      </dd>
                    </div>
                  </dl>

                  {linkedRequest.librarianNotes && (
                    <div className="p-4 rounded-xl bg-[#F3F7FF] border border-[#DCE8FF] space-y-1">
                      <p className="text-xs font-semibold text-[#102D68]">
                        Catatan Pustakawan
                      </p>
                      <p className="text-sm text-[#102D68]/85 leading-relaxed">
                        {linkedRequest.librarianNotes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#102D68]">
                      Keputusan Per Referensi (
                      <span className="tabular-nums">
                        {linkedRequest.referenceIds.length}
                      </span>
                      )
                    </p>
                    <ul className="divide-y divide-[#DCE8FF] border border-[#DCE8FF] rounded-xl overflow-hidden">
                      {linkedRequest.referenceIds.map((refId) => {
                        const ref = getReferenceById(refId);
                        const dec =
                          linkedRequest.referenceDecisions[refId] || 'Menunggu';
                        if (!ref) return null;
                        return (
                          <li
                            key={refId}
                            className="px-4 py-3 flex items-center justify-between gap-3 text-xs bg-white"
                          >
                            <span className="font-medium text-[#102D68] truncate">
                              {ref.title}
                            </span>
                            <span
                              className={`font-semibold shrink-0 ${
                                dec === 'Disetujui'
                                  ? 'text-emerald-700'
                                  : dec === 'Ditolak'
                                    ? 'text-rose-700'
                                    : 'text-[#102D68]/60'
                              }`}
                            >
                              {dec}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('workspace')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
                >
                  <FolderKanban className="w-4 h-4" aria-hidden="true" />
                  <span>Buka di Workspace Riset</span>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
