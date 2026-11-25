import { useState } from 'react';
import { BookOpen, Check, Copy, Download, X } from 'lucide-react';
import type { ReferenceItem } from '../types.ts';

interface DigitalReaderModalProps {
  reference: ReferenceItem | null;
  onClose: () => void;
  onDownload: (reference: ReferenceItem) => void;
}

export function DigitalReaderModal({
  reference,
  onClose,
  onDownload,
}: DigitalReaderModalProps) {
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!reference) return null;

  const citationText = `${reference.author} (${reference.year}). ${reference.title}. ${reference.publisher}.${reference.doi ? ` https://doi.org/${reference.doi}` : ''}`;

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      setCopiedCitation(false);
    }
  };

  const sections =
    reference.digitalSections && reference.digitalSections.length > 0
      ? reference.digitalSections
      : [
          {
            heading: 'Ringkasan Eksekutif Dokumen',
            content: reference.abstract,
          },
          {
            heading: 'Catatan Bibliografis',
            content: `Dokumen ini diterbitkan oleh ${reference.publisher} pada tahun ${reference.year} dengan nomor panggil ${reference.callNumber}. Tersedia dalam format ${reference.digitalFormat || 'PDF Akademik'} (${reference.pages} halaman).`,
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D68]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
    >
      <div className="bg-white rounded-2xl border border-[#DCE8FF] shadow-[0_24px_60px_rgba(16,45,104,0.22)] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-[#102D68] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 text-[#5489E8] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] text-[#DCE8FF]">
                Pembaca Koleksi Digital · {reference.digitalFormat || 'PDF'} (
                {reference.fileSize || '2,5 MB'})
              </p>
              <h2
                id="reader-title"
                className="font-display text-sm sm:text-base font-semibold truncate"
              >
                {reference.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pembaca dokumen"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#F3F7FF]/40">
          <div className="bg-white rounded-xl border border-[#DCE8FF] p-5 sm:p-7 space-y-5">
            <div className="border-b border-[#DCE8FF] pb-4">
              <p className="text-xs font-medium text-[#2455B5]">
                {reference.type} · {reference.year} · {reference.publisher}
              </p>
              <h3 className="font-display text-xl font-bold text-[#102D68] mt-1">
                {reference.title}
              </h3>
              <p className="text-sm text-[#102D68]/75 mt-1">
                Oleh: {reference.author}
              </p>
            </div>

            {sections.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h4 className="font-display text-base font-semibold text-[#102D68]">
                  {sec.heading}
                </h4>
                <p className="text-sm text-[#102D68]/85 leading-relaxed">
                  {sec.content}
                </p>
              </section>
            ))}

            <div className="pt-4 border-t border-[#DCE8FF] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#102D68]">
                  Format Sitasi APA
                </span>
                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2455B5] hover:underline cursor-pointer"
                >
                  {copiedCitation ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Salin Sitasi</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono text-[#102D68]/75 bg-[#F3F7FF] p-3 rounded-lg border border-[#DCE8FF]">
                {citationText}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-[#DCE8FF] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#102D68]/65">
            Akses resmi repositori perpustakaan kampus
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#102D68] bg-[#F3F7FF] hover:bg-[#DCE8FF] transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => onDownload(reference)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2455B5] hover:bg-[#102D68] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Unduh Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
