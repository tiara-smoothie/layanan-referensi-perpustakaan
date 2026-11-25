import { Eye, FolderPlus } from 'lucide-react';
import type { ReferenceItem } from '../types.ts';
import { CoverImage } from './CoverImage.tsx';
import { AvailabilityIndicator } from './StatusIndicator.tsx';

interface ReferenceCardProps {
  reference: ReferenceItem;
  onViewDetail: (ref: ReferenceItem) => void;
  onAddToWorkspace: (ref: ReferenceItem) => void;
  compact?: boolean;
  isAdded?: boolean;
}

export function ReferenceCard({
  reference,
  onViewDetail,
  onAddToWorkspace,
  compact = false,
  isAdded = false,
}: ReferenceCardProps) {
  return (
    <article className="bg-white rounded-xl border border-[#DCE8FF] shadow-[0_2px_12px_rgba(16,45,104,0.04)] hover:shadow-[0_8px_24px_rgba(16,45,104,0.08)] transition-all duration-150 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-5 flex gap-4 flex-1">
        <button
          type="button"
          onClick={() => onViewDetail(reference)}
          className={`shrink-0 rounded-lg overflow-hidden border border-[#DCE8FF] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2455B5] ${
            compact ? 'w-16 h-22' : 'w-20 h-28 sm:w-22 sm:h-30'
          }`}
          aria-label={`Lihat detail ${reference.title}`}
        >
          <CoverImage
            src={reference.coverUrl}
            title={reference.title}
            type={reference.type}
            className="w-full h-full"
          />
        </button>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#102D68]/65 mb-1.5">
            <span className="font-medium text-[#2455B5]">
              {reference.type} <span aria-hidden="true">·</span>{' '}
              <span className="tabular-nums">{reference.year}</span>
            </span>
            <AvailabilityIndicator status={reference.availability} />
          </div>

          <h3 className="font-display text-sm sm:text-base font-semibold text-[#102D68] leading-snug line-clamp-2">
            <button
              type="button"
              onClick={() => onViewDetail(reference)}
              className="text-left hover:text-[#2455B5] transition-colors cursor-pointer"
            >
              {reference.title}
            </button>
          </h3>

          <p className="text-xs sm:text-sm text-[#102D68]/70 mt-1 line-clamp-1">
            {reference.author}
          </p>

          {!compact && (
            <p className="text-xs text-[#102D68]/60 mt-2 line-clamp-2 leading-relaxed">
              {reference.abstract}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3 bg-[#F3F7FF]/60 border-t border-[#DCE8FF] flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetail(reference)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#102D68] bg-white border border-[#DCE8FF] hover:bg-[#DCE8FF]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-[#5489E8]" aria-hidden="true" />
          <span>Lihat Detail</span>
        </button>

        <button
          type="button"
          onClick={() => onAddToWorkspace(reference)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isAdded
              ? 'bg-[#DCE8FF] text-[#102D68] hover:bg-[#DCE8FF]/80'
              : 'bg-[#2455B5] text-white hover:bg-[#102D68]'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {isAdded ? 'Tambah ke Folder Lain' : 'Tambahkan ke Workspace'}
          </span>
        </button>
      </div>
    </article>
  );
}
