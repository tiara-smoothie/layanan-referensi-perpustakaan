import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Paperclip,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getReferenceById } from '../data/references.ts';
import type {
  ReferenceDecision,
  ReferenceItem,
  ValidationRequest,
  ValidationStatus,
} from '../types.ts';
import { formatIndonesianDate } from '../utils/storage.ts';
import { ValidationStatusIndicator } from './StatusIndicator.tsx';

interface LibrarianDashboardPageProps {
  requests: ValidationRequest[];
  onUpdateRequestReview: (payload: {
    requestId: string;
    status: ValidationStatus;
    librarianNotes: string;
    referenceDecisions: Record<string, ReferenceDecision>;
  }) => void;
  onViewDetail: (ref: ReferenceItem) => void;
}

const STATUS_FILTERS: ('Semua' | ValidationStatus)[] = [
  'Semua',
  'Menunggu Validasi',
  'Sedang Ditinjau',
  'Disetujui',
  'Perlu Revisi',
];

export function LibrarianDashboardPage({
  requests,
  onUpdateRequestReview,
  onViewDetail,
}: LibrarianDashboardPageProps) {
  const [statusFilter, setStatusFilter] = useState<'Semua' | ValidationStatus>(
    'Semua'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests[0]?.id || ''
  );

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((req) => {
      if (statusFilter !== 'Semua' && req.status !== statusFilter) return false;
      if (!q) return true;
      return (
        req.studentName.toLowerCase().includes(q) ||
        req.studentNim.toLowerCase().includes(q) ||
        req.topic.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q)
      );
    });
  }, [requests, statusFilter, searchQuery]);

  const activeRequest =
    requests.find((r) => r.id === selectedRequestId) ||
    filteredRequests[0] ||
    null;

  const [draftStatus, setDraftStatus] = useState<ValidationStatus>(
    activeRequest?.status || 'Menunggu Validasi'
  );
  const [draftNotes, setDraftNotes] = useState<string>(
    activeRequest?.librarianNotes || ''
  );
  const [draftDecisions, setDraftDecisions] = useState<
    Record<string, ReferenceDecision>
  >(activeRequest?.referenceDecisions || {});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    if (activeRequest) {
      setDraftStatus(activeRequest.status);
      setDraftNotes(activeRequest.librarianNotes);
      setDraftDecisions({ ...activeRequest.referenceDecisions });
      setSaveSuccessMsg('');
    }
  }, [activeRequest?.id]);

  const counts = useMemo(() => {
    return {
      total: requests.length,
      waiting: requests.filter((r) => r.status === 'Menunggu Validasi').length,
      reviewing: requests.filter((r) => r.status === 'Sedang Ditinjau').length,
      approved: requests.filter((r) => r.status === 'Disetujui').length,
      revision: requests.filter((r) => r.status === 'Perlu Revisi').length,
    };
  }, [requests]);

  const handleSetDecision = (refId: string, decision: ReferenceDecision) => {
    setDraftDecisions((prev) => ({ ...prev, [refId]: decision }));
  };

  const handleApproveAllRefs = () => {
    if (!activeRequest) return;
    const allApproved: Record<string, ReferenceDecision> = {};
    activeRequest.referenceIds.forEach((id) => {
      allApproved[id] = 'Disetujui';
    });
    setDraftDecisions(allApproved);
  };

  const handleSaveReview = () => {
    if (!activeRequest) return;
    onUpdateRequestReview({
      requestId: activeRequest.id,
      status: draftStatus,
      librarianNotes: draftNotes.trim(),
      referenceDecisions: draftDecisions,
    });
    setSaveSuccessMsg(
      `Status permintaan ${activeRequest.id} diperbarui menjadi "${draftStatus}" dan notifikasi dikirim ke mahasiswa.`
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#2455B5]">
            Portal Validator Pustakawan Subjek
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102D68] mt-1">
            Dashboard Validasi Referensi Pustakawan
          </h1>
          <p className="text-sm text-[#102D68]/70 mt-1">
            Tinjau permintaan validasi mahasiswa, evaluasi kesesuaian sumber
            pustaka, dan berikan catatan kurasi.
          </p>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Permintaan', val: counts.total },
          { label: 'Menunggu Validasi', val: counts.waiting },
          { label: 'Sedang Ditinjau', val: counts.reviewing },
          { label: 'Disetujui', val: counts.approved },
          { label: 'Perlu Revisi', val: counts.revision },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl p-4 border border-[#DCE8FF]"
          >
            <p className="font-display text-2xl font-bold text-[#102D68] tabular-nums">
              {c.val}
            </p>
            <p className="text-xs text-[#102D68]/65 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#DCE8FF] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#2455B5] text-white'
                  : 'text-[#102D68]/75 hover:bg-[#F3F7FF]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative lg:w-72">
          <Search
            className="w-4 h-4 text-[#5489E8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama mahasiswa, NIM, topik..."
            aria-label="Cari permintaan validasi"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F3F7FF] border border-[#DCE8FF] text-xs sm:text-sm text-[#102D68]"
          />
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Request List */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE8FF] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DCE8FF]">
            <h2 className="font-display text-sm font-bold text-[#102D68]">
              Daftar Permintaan Masuk ({filteredRequests.length})
            </h2>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#102D68]/65">
              Tidak ada permintaan validasi dengan filter ini.
            </div>
          ) : (
            <div className="divide-y divide-[#DCE8FF] max-h-[650px] overflow-y-auto">
              {filteredRequests.map((req) => {
                const isSelected = activeRequest?.id === req.id;
                return (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`w-full text-left p-4 sm:p-5 space-y-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#DCE8FF]/45'
                        : 'bg-white hover:bg-[#F3F7FF]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-semibold text-[#2455B5]">
                        {req.id}
                      </span>
                      <ValidationStatusIndicator status={req.status} />
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#102D68] line-clamp-2">
                      {req.topic}
                    </h3>
                    <div className="text-xs text-[#102D68]/70 space-y-0.5">
                      <p className="font-medium text-[#102D68]/85">
                        {req.studentName} · NIM {req.studentNim}
                      </p>
                      <p className="tabular-nums">
                        Dikirim {formatIndonesianDate(req.submittedAt)} ·{' '}
                        {req.referenceIds.length} referensi
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Review Detail Panel */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE8FF] p-5 sm:p-6 space-y-6">
          {!activeRequest ? (
            <div className="p-10 text-center text-sm text-[#102D68]/70">
              Pilih salah satu permintaan validasi di sebelah kiri untuk mulai
              meninjau.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#DCE8FF]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="font-mono font-semibold text-[#2455B5]">
                      {activeRequest.id}
                    </span>
                    <span aria-hidden="true" className="text-[#DCE8FF]">
                      |
                    </span>
                    <ValidationStatusIndicator status={activeRequest.status} />
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#102D68]">
                    {activeRequest.topic}
                  </h2>
                </div>
              </div>

              {/* Student & Submission Details */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F3F7FF] rounded-xl p-4 border border-[#DCE8FF] text-xs">
                <div>
                  <dt className="text-[#102D68]/55">Mahasiswa Pengaju</dt>
                  <dd className="font-semibold text-[#102D68] mt-0.5">
                    {activeRequest.studentName} (NIM {activeRequest.studentNim})
                  </dd>
                  <dd className="text-[#102D68]/70 mt-0.5">
                    {activeRequest.studentProgram}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102D68]/55">Tanggal &amp; Deadline</dt>
                  <dd className="font-medium text-[#102D68] mt-0.5 tabular-nums">
                    Diajukan: {formatIndonesianDate(activeRequest.submittedAt, true)}
                  </dd>
                  <dd className="font-semibold text-[#2455B5] mt-0.5 tabular-nums">
                    Deadline: {activeRequest.deadline}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102D68]/55">
                    Tujuan Penggunaan &amp; Konsultasi
                  </dt>
                  <dd className="font-medium text-[#102D68] mt-0.5">
                    {activeRequest.purpose} · Konsultasi:{' '}
                    <strong>
                      {activeRequest.needsConsultation ? 'Ya' : 'Tidak'}
                    </strong>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#102D68]/55">Lampiran Berkas</dt>
                  <dd className="font-medium text-[#102D68] mt-0.5 flex items-center gap-1.5">
                    <Paperclip
                      className="w-3.5 h-3.5 text-[#5489E8]"
                      aria-hidden="true"
                    />
                    <span>
                      {activeRequest.attachmentName
                        ? `${activeRequest.attachmentName} (${activeRequest.attachmentSize})`
                        : 'Tidak ada lampiran'}
                    </span>
                  </dd>
                </div>
              </dl>

              {/* Selected References Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-sm font-bold text-[#102D68]">
                    Peninjauan Referensi Terpilih (
                    <span className="tabular-nums">
                      {activeRequest.referenceIds.length}
                    </span>
                    )
                  </h3>
                  <button
                    type="button"
                    onClick={handleApproveAllRefs}
                    className="text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
                  >
                    Setujui Semua Referensi
                  </button>
                </div>

                <div className="divide-y divide-[#DCE8FF] border border-[#DCE8FF] rounded-xl overflow-hidden">
                  {activeRequest.referenceIds.map((refId) => {
                    const ref = getReferenceById(refId);
                    const decision = draftDecisions[refId] || 'Menunggu';
                    if (!ref) return null;
                    return (
                      <div
                        key={refId}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <FileText
                              className="w-3.5 h-3.5 text-[#5489E8] shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-semibold text-[#2455B5]">
                              {ref.type} ·{' '}
                              <span className="tabular-nums">{ref.year}</span>
                            </span>
                            <span aria-hidden="true" className="text-[#DCE8FF]">
                              ·
                            </span>
                            <span
                              className={`font-semibold ${
                                decision === 'Disetujui'
                                  ? 'text-emerald-700'
                                  : decision === 'Ditolak'
                                    ? 'text-rose-700'
                                    : 'text-[#102D68]/60'
                              }`}
                            >
                              {decision}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#102D68]">
                            {ref.title}
                          </p>
                          <p className="text-xs text-[#102D68]/65">
                            {ref.author}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onViewDetail(ref)}
                            aria-label={`Lihat detail ${ref.title}`}
                            className="p-2 rounded-lg text-[#102D68]/70 hover:bg-[#F3F7FF] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDecision(refId, 'Disetujui')
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              decision === 'Disetujui'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#F3F7FF] text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Setujui</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDecision(refId, 'Ditolak')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              decision === 'Ditolak'
                                ? 'bg-rose-600 text-white'
                                : 'bg-[#F3F7FF] text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update & Librarian Notes */}
              <div className="space-y-4 pt-3 border-t border-[#DCE8FF]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="lib-status"
                      className="block text-xs font-semibold text-[#102D68] mb-1.5"
                    >
                      Perbarui Status Permintaan
                    </label>
                    <select
                      id="lib-status"
                      value={draftStatus}
                      onChange={(e) =>
                        setDraftStatus(e.target.value as ValidationStatus)
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68] bg-white font-medium"
                    >
                      <option value="Menunggu Validasi">
                        Menunggu Validasi
                      </option>
                      <option value="Sedang Ditinjau">Sedang Ditinjau</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Perlu Revisi">Perlu Revisi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lib-notes"
                    className="block text-xs font-semibold text-[#102D68] mb-1.5"
                  >
                    Catatan Pustakawan
                  </label>
                  <textarea
                    id="lib-notes"
                    rows={3}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Tulis catatan evaluasi relevansi, saran sumber tambahan, atau alasan revisi..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE8FF] text-sm text-[#102D68]"
                  />
                </div>

                {saveSuccessMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Simpan Hasil Validasi &amp; Kirim Notifikasi</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
