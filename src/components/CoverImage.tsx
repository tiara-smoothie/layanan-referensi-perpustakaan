import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { CollectionType } from '../types.ts';

interface CoverImageProps {
  src: string;
  title: string;
  type: CollectionType;
  className?: string;
}

export function CoverImage({
  src,
  title,
  type,
  className = '',
}: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col justify-between bg-[#102D68] text-white p-4 select-none ${className}`}
        aria-label={`Sampul ${title}`}
      >
        <div className="flex items-center justify-between text-[11px] font-medium text-[#DCE8FF] border-b border-white/15 pb-2">
          <span>{type}</span>
          <BookOpen className="w-3.5 h-3.5 text-[#5489E8]" aria-hidden="true" />
        </div>
        <div className="my-auto py-3">
          <p className="font-display text-xs font-semibold leading-snug line-clamp-4 text-white">
            {title}
          </p>
        </div>
        <div className="text-[10px] font-mono text-[#DCE8FF]/80 border-t border-white/15 pt-2">
          LibraMind
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Sampul ${title}`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover bg-[#DCE8FF] ${className}`}
    />
  );
}
