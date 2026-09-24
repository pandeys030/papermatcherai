import React, { useEffect, useState } from 'react';

export default function PaperDetailModal({ 
  paper, 
  onClose,
  isSaved = false,
  onToggleSave,
  isInCompare = false,
  onToggleCompare,
}) {
  const [copiedStatus, setCopiedStatus] = useState(null);

  // Handle ESC key press and body scroll locking
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

  if (!paper) return null;

  // Compute percentage and cosine score
  const similarityScore = typeof paper.similarity_score === 'number' ? paper.similarity_score : 0;
  const percentage = Math.round(similarityScore * 100);
  const formattedCosineScore = similarityScore.toFixed(4);

  // Determine match strength
  let matchStrength = "Contextual Match";
  if (percentage >= 80) {
    matchStrength = "High Semantic Match";
  } else if (percentage >= 50) {
    matchStrength = "Moderate Semantic Match";
  }

  // Extract or format clean publication date & year
  const publishedDate = paper.published_date || 'Unknown';
  let pubYear = '2024';
  if (publishedDate.includes('/')) {
    const parts = publishedDate.split('/');
    const y = parseInt(parts[parts.length - 1], 10);
    pubYear = y < 100 ? (y >= 90 ? `19${y}` : `20${y}`) : `${y}`;
  } else if (paper.year) {
    pubYear = paper.year;
  }
  
  // Extract or derive first author
  let firstAuthor = paper.first_author;
  if (!firstAuthor && paper.authors) {
    const splitAuthors = paper.authors.split(/,|;|\band\b/);
    if (splitAuthors.length > 0) {
      firstAuthor = splitAuthors[0].trim();
    }
  }
  if (!firstAuthor) {
    firstAuthor = 'Primary Investigator';
  }

  // Sanitize arXiv ID for link
  const rawId = paper.id ? String(paper.id).replace(/^abs-/, '').replace(/^cs-/, '') : '';
  const arxivUrl = rawId ? `https://arxiv.org/abs/${rawId}` : null;

  const copyCitation = () => {
    const citation = `${paper.authors || firstAuthor} (${pubYear}). ${paper.title}. arXiv:${rawId || paper.id}.`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedStatus('citation');
      setTimeout(() => setCopiedStatus(null), 2000);
    });
  };

  const copyId = () => {
    navigator.clipboard.writeText(paper.id || '').then(() => {
      setCopiedStatus('id');
      setTimeout(() => setCopiedStatus(null), 2000);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#183B56]/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Paper Sheet Container (Digital Academic Folio) */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-[#DDE9EF] shadow-2xl rounded-[3px] overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual paper corner fold */}
        <div className="paper-corner-fold pointer-events-none z-20" />

        {/* Archival Sheet Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F7FBFD] border-b border-[#DDE9EF]">
          <div className="flex items-center gap-3">
            <span className="archival-stamp text-[10px] tracking-wider py-0.5">
              DIGITAL ACADEMIC PAPER
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-[#DDE9EF]" />
            <span className="text-[11px] font-mono text-[#667786]">
              ARXIV PREPRINT RECORD
            </span>
          </div>

          {/* Quick Actions & Close Button */}
          <div className="flex items-center gap-3">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(paper)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-[1px] border transition-colors ${
                  isSaved
                    ? 'bg-[#183B56] text-white border-[#183B56]'
                    : 'bg-white text-[#667786] border-[#DDE9EF] hover:border-[#9DDCF5] hover:text-[#183B56]'
                }`}
                title={isSaved ? "Remove from saved papers" : "Save to reference collection"}
              >
                <span>{isSaved ? '★' : '☆'}</span>
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(paper)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-[1px] border transition-colors ${
                  isInCompare
                    ? 'bg-[#EAF7FC] text-[#183B56] border-[#9DDCF5]'
                    : 'bg-white text-[#667786] border-[#DDE9EF] hover:border-[#9DDCF5] hover:text-[#183B56]'
                }`}
                title={isInCompare ? "Remove from comparison" : "Select for 2-paper comparison"}
              >
                <span>{isInCompare ? '✓ In Compare' : '+ Compare'}</span>
              </button>
            )}

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

        {/* Scrollable Document Content */}
        <div className="p-6 sm:p-9 md:p-10 overflow-y-auto space-y-7">
          
          {/* Header Line: PAPER 001 · CS.CL · 2024 */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#DDE9EF] pb-4">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] uppercase tracking-widest text-[#667786]">
                MONOGRAPH:
              </span>
              <span className="font-semibold text-[#183B56] bg-[#EAF7FC] px-2 py-0.5 rounded-[2px] border border-[#DDF3FB]">
                {paper.num ? `PAPER ${paper.num}` : 'FOLIO'}
              </span>
              <span className="text-[#DDE9EF]">·</span>
              <span className="font-semibold text-[#183B56]">
                {paper.category_code || 'cs.AI'}
              </span>
              <span className="text-[#DDE9EF]">·</span>
              <span className="text-[#667786]">
                {pubYear}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#667786]">{paper.id}</span>
              <button
                type="button"
                onClick={copyId}
                className="text-[10px] text-[#667786] hover:text-[#183B56] underline"
              >
                {copiedStatus === 'id' ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
          </div>

          {/* Title (Serif Display) */}
          <div className="space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-[32px] leading-[1.2] text-[#183B56] font-normal tracking-tight">
              {paper.title}
            </h2>
            <div className="text-sm text-[#667786] font-sans">
              <span className="font-medium text-[#183B56]">First Author:</span> {firstAuthor}
            </div>
          </div>

          {/* Baby-Blue Similarity Visualization Panel */}
          <div className="bg-[#F7FBFD] border border-[#DDE9EF] rounded-[2px] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#667786] font-semibold">
                  SEMANTIC MATCH
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-[#DDE9EF] rounded-[1px] text-[#183B56]">
                  {matchStrength}
                </span>
              </div>
              <span className="font-serif text-2xl sm:text-3xl text-[#183B56] font-normal">
                {percentage}%
              </span>
            </div>

            {/* Baby-blue hairline progress bar */}
            <div className="w-full h-2 bg-[#DDE9EF] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#9DDCF5] transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#667786] pt-1">
              <span>TF-IDF Vector Cosine Similarity</span>
              <span className="text-[#183B56] font-semibold">
                cosine score {formattedCosineScore}
              </span>
            </div>
          </div>

          {/* Academic Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 px-4 bg-[#FFFFFF] border border-[#DDE9EF] rounded-[2px] text-xs">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                ARXIV ACCESSION
              </span>
              <p className="text-[#183B56] font-medium text-sm font-mono">
                {paper.id}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                CATEGORY CLASSIFICATION
              </span>
              <p className="text-[#183B56] font-medium text-sm">
                {paper.category_code} · {paper.category || 'Computer Science'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                PUBLICATION DATE
              </span>
              <p className="text-[#183B56] font-medium text-sm">
                {publishedDate}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                MATCH STRENGTH
              </span>
              <p className="text-[#183B56] font-medium text-sm">
                {matchStrength} ({formattedCosineScore})
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-[#DDE9EF]/70">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] block">
                COMPLETE AUTHORS LIST
              </span>
              <p className="text-[#183B56] leading-relaxed text-xs">
                {paper.authors || firstAuthor}
              </p>
            </div>
          </div>

          {/* Fine Stationery Rule */}
          <div className="relative flex items-center justify-center">
            <div className="w-full h-px bg-[#DDE9EF]" />
            <span className="absolute px-3 bg-white text-[10px] font-mono tracking-widest text-[#9DDCF5]">
              ✦
            </span>
          </div>

          {/* SUMMARY Section (Strictly SUMMARY, not abstract) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9DDCF5]" />
                <h3 className="font-mono text-xs uppercase tracking-widest font-semibold text-[#183B56]">
                  SUMMARY
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#667786]">
                OFFICIAL AUTHOR PREPRINT SUMMARY
              </span>
            </div>
            
            <div className="text-[#183B56]/90 text-sm sm:text-[15px] leading-relaxed font-sans bg-[#F7FBFD]/50 border border-[#DDE9EF]/80 p-5 rounded-[2px]">
              <p className="whitespace-pre-line text-justify">
                {paper.summary}
              </p>
            </div>
          </div>

        </div>

        {/* Archival Sheet Footer */}
        <div className="px-6 py-4 bg-[#F7FBFD] border-t border-[#DDE9EF] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#667786] font-mono text-[11px]">
            <button
              type="button"
              onClick={copyCitation}
              className="hover:text-[#183B56] transition-colors underline cursor-pointer"
            >
              {copiedStatus === 'citation' ? '✓ Citation Copied to Clipboard' : '📋 Copy Citation (APA / arXiv)'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {arxivUrl && (
              <a
                href={arxivUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DDE9EF] hover:border-[#9DDCF5] hover:bg-[#EAF7FC] text-[#183B56] font-mono text-xs rounded-[2px] transition-colors"
              >
                <span>Read on arXiv</span>
                <span className="text-sm leading-none">↗</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#183B56] hover:bg-[#183B56]/90 text-white font-mono text-xs rounded-[2px] transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
