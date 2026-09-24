import React, { useEffect } from 'react';

export default function PaperCompareModal({ papers = [], onClose, onSelectPaper, onClearCompare }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!papers || papers.length < 2) return null;

  const [paperA, paperB] = papers;

  const scoreA = typeof paperA.similarity_score === 'number' ? paperA.similarity_score : 0;
  const scoreB = typeof paperB.similarity_score === 'number' ? paperB.similarity_score : 0;
  const pctA = Math.round(scoreA * 100);
  const pctB = Math.round(scoreB * 100);
  const diffPct = Math.abs(pctA - pctB);
  const diffCosine = Math.abs(scoreA - scoreB).toFixed(4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#183B56]/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-[#DDE9EF] shadow-2xl rounded-[3px] overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F7FBFD] border-b border-[#DDE9EF]">
          <div className="flex items-center gap-3">
            <span className="archival-stamp text-[10px] tracking-wider py-0.5">
              COMPARATIVE FOLIO
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-[#DDE9EF]" />
            <span className="text-[11px] font-mono text-[#667786]">
              SIDE-BY-SIDE CORPUS ANALYSIS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearCompare}
              className="text-[11px] font-mono text-[#667786] hover:text-rose-600 transition-colors"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-1.5 text-xs font-mono text-[#667786] hover:text-[#183B56] px-2 py-1 rounded-[2px] hover:bg-white border border-transparent hover:border-[#DDE9EF] transition-all"
              aria-label="Close modal"
            >
              <span className="text-[10px] text-[#667786]/70 group-hover:text-[#183B56]">[ESC]</span>
              <span className="font-semibold text-sm leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* Delta Summary Banner */}
        <div className="px-6 py-2.5 bg-[#EAF7FC]/60 border-b border-[#DDE9EF] flex items-center justify-between text-xs font-mono text-[#183B56]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DDCF5]" />
            <span>
              {scoreA > scoreB
                ? `Paper A demonstrates higher semantic affinity (+${diffPct}% / +${diffCosine} cosine delta)`
                : scoreB > scoreA
                ? `Paper B demonstrates higher semantic affinity (+${diffPct}% / +${diffCosine} cosine delta)`
                : 'Both candidate preprints demonstrate equivalent cosine affinity'}
            </span>
          </div>
          <span className="text-[#667786] hidden sm:inline text-[11px]">
            L2 Normalized TF-IDF Coordinates
          </span>
        </div>

        {/* 2-Column Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#DDE9EF]">
            {/* Paper A Column */}
            <div className="space-y-6 md:pr-4">
              <div className="flex items-center justify-between">
                <span className="archival-stamp text-[9px] bg-white border-[#DDE9EF]">
                  DOCUMENT [A]
                </span>
                <span className="font-mono text-[11px] text-[#667786]">
                  {paperA.id}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#183B56] font-normal leading-snug">
                  {paperA.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#667786] font-sans">
                  By <span className="text-[#183B56] font-medium">{paperA.authors || paperA.first_author}</span>
                </p>
              </div>

              {/* Similarity Metric */}
              <div className="bg-[#F7FBFD] p-3.5 border border-[#DDE9EF] rounded-[2px] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#667786] text-[10px] uppercase tracking-wider">Semantic Match</span>
                  <span className="font-semibold text-[#183B56]">{pctA}% ({scoreA.toFixed(4)})</span>
                </div>
                <div className="w-full h-1.5 bg-[#DDE9EF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9DDCF5]" style={{ width: `${pctA}%` }} />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#FFFFFF] p-3 border border-[#DDE9EF] rounded-[2px]">
                <div>
                  <span className="text-[#667786] text-[9px] uppercase tracking-wider block">SUBJECT</span>
                  <span className="text-[#183B56] font-medium text-[11px]">{paperA.category_code} · {paperA.category}</span>
                </div>
                <div>
                  <span className="text-[#667786] text-[9px] uppercase tracking-wider block">PUBLISHED</span>
                  <span className="text-[#183B56] font-medium text-[11px]">{paperA.published_date}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                  SUMMARY
                </span>
                <p className="text-xs sm:text-[13px] text-[#183B56]/90 leading-relaxed font-sans bg-[#F7FBFD]/40 p-4 border border-[#DDE9EF]/70 rounded-[2px]">
                  {paperA.summary}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSelectPaper) onSelectPaper(paperA);
                  }}
                  className="w-full py-2 bg-[#F7FBFD] hover:bg-[#EAF7FC] border border-[#DDE9EF] hover:border-[#9DDCF5] text-xs font-mono text-[#183B56] font-medium rounded-[1px] transition-colors"
                >
                  Inspect Paper A in Detail →
                </button>
              </div>
            </div>

            {/* Paper B Column */}
            <div className="space-y-6 pt-6 md:pt-0 md:pl-8">
              <div className="flex items-center justify-between">
                <span className="archival-stamp text-[9px] bg-white border-[#DDE9EF]">
                  DOCUMENT [B]
                </span>
                <span className="font-mono text-[11px] text-[#667786]">
                  {paperB.id}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#183B56] font-normal leading-snug">
                  {paperB.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#667786] font-sans">
                  By <span className="text-[#183B56] font-medium">{paperB.authors || paperB.first_author}</span>
                </p>
              </div>

              {/* Similarity Metric */}
              <div className="bg-[#F7FBFD] p-3.5 border border-[#DDE9EF] rounded-[2px] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#667786] text-[10px] uppercase tracking-wider">Semantic Match</span>
                  <span className="font-semibold text-[#183B56]">{pctB}% ({scoreB.toFixed(4)})</span>
                </div>
                <div className="w-full h-1.5 bg-[#DDE9EF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9DDCF5]" style={{ width: `${pctB}%` }} />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#FFFFFF] p-3 border border-[#DDE9EF] rounded-[2px]">
                <div>
                  <span className="text-[#667786] text-[9px] uppercase tracking-wider block">SUBJECT</span>
                  <span className="text-[#183B56] font-medium text-[11px]">{paperB.category_code} · {paperB.category}</span>
                </div>
                <div>
                  <span className="text-[#667786] text-[9px] uppercase tracking-wider block">PUBLISHED</span>
                  <span className="text-[#183B56] font-medium text-[11px]">{paperB.published_date}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                  SUMMARY
                </span>
                <p className="text-xs sm:text-[13px] text-[#183B56]/90 leading-relaxed font-sans bg-[#F7FBFD]/40 p-4 border border-[#DDE9EF]/70 rounded-[2px]">
                  {paperB.summary}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSelectPaper) onSelectPaper(paperB);
                  }}
                  className="w-full py-2 bg-[#F7FBFD] hover:bg-[#EAF7FC] border border-[#DDE9EF] hover:border-[#9DDCF5] text-xs font-mono text-[#183B56] font-medium rounded-[1px] transition-colors"
                >
                  Inspect Paper B in Detail →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F7FBFD] border-t border-[#DDE9EF] flex items-center justify-between text-xs font-mono text-[#667786]">
          <span>Direct side-by-side comparative examination of candidate preprints.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#183B56] hover:bg-[#183B56]/90 text-white font-mono text-xs rounded-[2px] transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
