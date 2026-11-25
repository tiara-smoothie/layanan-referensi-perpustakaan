import {
  AlertCircle,
  BookCheck,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  RotateCcw,
} from 'lucide-react';
import type {
  AvailabilityStatus,
  BorrowStatus,
  ValidationStatus,
} from '../types.ts';

export function AvailabilityIndicator({
  status,
}: {
  status: AvailabilityStatus;
}) {
  if (status === 'Tersedia') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Tersedia</span>
      </span>
    );
  }
  if (status === 'Tersedia Digital') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2455B5] whitespace-nowrap">
        <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Tersedia Digital</span>
      </span>
    );
  }
  if (status === 'Terbatas') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Terbatas</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 whitespace-nowrap">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Dipinjam</span>
    </span>
  );
}

export function ValidationStatusIndicator({
  status,
}: {
  status: ValidationStatus;
}) {
  if (status === 'Disetujui') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Disetujui</span>
      </span>
    );
  }
  if (status === 'Sedang Ditinjau') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2455B5] whitespace-nowrap">
        <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Sedang Ditinjau</span>
      </span>
    );
  }
  if (status === 'Perlu Revisi') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Perlu Revisi</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Menunggu Validasi</span>
    </span>
  );
}

export function BorrowStatusIndicator({ status }: { status: BorrowStatus }) {
  if (status === 'Sedang Dipinjam') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2455B5] whitespace-nowrap">
        <BookCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Sedang Dipinjam</span>
      </span>
    );
  }
  if (status === 'Dikembalikan') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Dikembalikan</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Menunggu Pengambilan</span>
    </span>
  );
}
