import React, { useState } from 'react';

export default function PaperStack({ 
  paper, 
  onViewPaper,
  isSaved = false,
  onToggleSave,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Default sample result data if none passed
  const currentPaper = paper || {
    id: "abs-1910.03771v5",
    title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing",
    authors: "Thomas Wolf, Lysandre Debut, Victor Sanh, Julien Chaumond, Clement Delangue, Anthony Moi, Pierric Cistac, et al.",
    category: "Computation and Language",
    category_code: "cs.CL",
    published_date: "10/9/19",
    similarity_score: 0.942,
    key_concepts: ["Attention Mechanisms", "Cross-lingual Transfer", "Token Pruning", "Model Distillation"],
    summary: "Recent progress in natural language processing has been driven by deep learning transformer models such as BERT, RoBERTa, and GPT. We present Transformers, an open-source library providing state-of-the-art general-purpose architectures across text comprehension and translation.",
  };

  const percentage = Math.round((currentPaper.similarity_score || 0.942) * 100);
  const scoreFormatted = Number(currentPaper.similarity_score || 0.942).toFixed(4);

  // Soft highlighter for key academic terms in summary
  const renderAnnotatedSummary = (text) => {
    if (!text) return null;
    const highlightWords = ['transformer models', 'deep learning', 'BERT', 'natural language processing', 'neural network', 'semantic'];
    let rendered = text;
    for (const phrase of highlightWords) {
      const idx = rendered.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx !== -1) {
        const matched = rendered.substring(idx, idx + phrase.length);
        return (
          <>
            {rendered.substring(0, idx)}
            <mark className="research-highlighter text-[#183B56] not-italic font-normal">
              {matched}
            </mark>
            {rendered.substring(idx + phrase.length)}
          </>
        );
      }
    }
    return text;
  };

  return (
    <div 
      className="relative w-full max-w-lg mx-auto lg:max-w-none pt-6 pb-8 select-none group/stack cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewPaper && onViewPaper(currentPaper)}
    >
      {/* Informative Floating Label: Live Preview of Top Match */}
      <div className="absolute -top-1.5 right-4 z-40 bg-[#EAF7FC] border border-[#9DDCF5] text-[#183B56] font-mono text-[9px] px-2 py-0.5 rounded-[1px] tracking-wider shadow-xs uppercase flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#183B56] animate-pulse" />
        <span>LIVE PREVIEW · TOP MATCH</span>
      </div>

      {/* Physical tactile brass paperclip holding the folio */}
      <div className="absolute -top-1 left-9 w-3.5 h-10 border-[1.5px] border-[#667786]/50 rounded-full z-30 pointer-events-none opacity-85 shadow-[0_1px_2px_rgba(24,59,86,0.1)]">
        <div className="absolute top-1.5 left-0.5 right-0.5 bottom-1.5 border-[1px] border-[#667786]/40 rounded-full" />
      </div>

      {/* Underlying Sheet 4 (Bottom Layer) - Separates further on hover */}
      <div 
        className={`absolute inset-0 bg-[#EAF7FC]/70 border border-[#DDE9EF] rounded-[2px] shadow-sm pointer-events-none transition-all duration-300 ${
          isHovered
            ? 'transform -rotate-[4.5deg] translate-y-5 -translate-x-4'
            : 'transform -rotate-[3.2deg] translate-y-3.5 -translate-x-2.5'
        }`}
      />

      {/* Underlying Sheet 3 (Middle Layer) - Separates further on hover */}
      <div 
        className={`absolute inset-0 bg-[#F7FBFD] border border-[#DDE9EF] rounded-[2px] shadow-sm pointer-events-none transition-all duration-300 ${
          isHovered
            ? 'transform rotate-[3.2deg] translate-y-3 translate-x-3.5'
            : 'transform rotate-[2.1deg] translate-y-2 translate-x-2'
        }`}
      />

      {/* Underlying Sheet 2 (Near Layer) - Separates further on hover */}
      <div 
        className={`absolute inset-0 bg-white border border-[#DDE9EF] rounded-[2px] shadow-sm pointer-events-none transition-all duration-300 ${
          isHovered
            ? 'transform -rotate-[1.8deg] translate-y-2 -translate-x-2'
            : 'transform -rotate-[1deg] translate-y-1 -translate-x-1'
        }`}
      />

      {/* Front Sheet 1 (Physical Research Monograph Sheet) - Elevates 4px on hover */}
      <div 
        className={`relative bg-white border border-[#DDE9EF] rounded-[2px] p-7 sm:p-9 transition-all duration-300 ${
          isHovered 
            ? 'transform -translate-y-1 shadow-[0_6px_12px_rgba(24,59,86,0.06),0_18px_36px_rgba(24,59,86,0.09)]' 
            : 'transform rotate-[0.4deg] shadow-[0_2px_4px_rgba(24,59,86,0.04),0_12px_28px_rgba(24,59,86,0.06)]'
        }`}
      >
        {/* Subtle stationery corner fold indication */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#F7FBFD] border-b border-l border-[#DDE9EF] transform rotate-45 translate-x-7 -translate-y-7 shadow-[inset_1px_1px_2px_rgba(24,59,86,0.04)]" />
        </div>

        {/* Top Archival Accession Stamp & Marginalia with Bookmark Button */}
        <div className="flex items-center justify-between border-b border-[#DDE9EF] pb-3.5 mb-5">
          <div className="flex items-center gap-2">
            <span className="archival-stamp">
              SAMPLE FOLIO
            </span>
            <span className="text-[10px] font-mono text-[#667786] hidden sm:inline">
              REF. §4.2
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(currentPaper);
                }}
                className={`p-1 rounded-[1px] border text-xs transition-colors ${
                  isSaved
                    ? 'bg-[#183B56] text-white border-[#183B56]'
                    : 'bg-white text-[#667786] border-[#DDE9EF] hover:border-[#9DDCF5] hover:text-[#183B56]'
                }`}
                title={isSaved ? "Saved to collection" : "Save this preprint"}
              >
                {isSaved ? '★' : '☆'}
              </button>
            )}

            <span className="text-[11px] font-mono tracking-wider text-[#667786]">
              {currentPaper.id} · <span className="font-semibold text-[#183B56]">{currentPaper.category_code}</span>
            </span>
          </div>
        </div>

        {/* Paper Title (Serif) */}
        <div className="space-y-2 mb-4">
          <h3 className="font-serif text-2xl sm:text-[25px] leading-snug text-[#183B56] font-normal tracking-tight group-hover/stack:text-[#183B56]/90 transition-colors">
            {currentPaper.title}
          </h3>
          <p className="text-xs text-[#667786] line-clamp-1 font-sans">
            By <span className="text-[#183B56] font-medium">{currentPaper.authors}</span>
          </p>
        </div>

        {/* Archival Catalog Line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#667786] mb-5 pb-3 border-b border-[#DDE9EF]/60 font-mono text-[11px]">
          <span className="text-[#183B56] font-medium">{currentPaper.category}</span>
          <span className="text-[#DDE9EF]">/</span>
          <span>PUB. {currentPaper.published_date}</span>
          <span className="text-[#DDE9EF]">/</span>
          <span className="text-[#667786]">ARXIV PREPRINT</span>
        </div>

        {/* Coordinate Similarity Ruler (Art-directed scientific coordinate) */}
        <div className="space-y-1.5 mb-5 bg-[#F7FBFD] p-3.5 border border-[#DDE9EF] rounded-[2px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-[#667786]">
              SEMANTIC COORDINATE
            </span>
            <span className="font-semibold text-[#183B56]">
              MATCH {percentage}% <span className="text-[#667786] font-normal text-[10px] ml-1">({scoreFormatted})</span>
            </span>
          </div>
          
          <div className="relative w-full h-1.5 bg-[#DDE9EF] rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-[#9DDCF5] group-hover/stack:bg-[#183B56] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#667786]/70 pt-0.5">
            <span>0.00 (ORTHOGONAL)</span>
            <span>1.00 (EXACT)</span>
          </div>
        </div>

        {/* Identified Topical Concepts */}
        <div className="mb-5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#667786] mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#9DDCF5]" />
            <span>Topical Invariants</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(currentPaper.key_concepts || [currentPaper.category_code, "Top Match"]).map((concept, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 bg-[#EAF7FC] border border-[#DDF3FB] text-[#183B56] rounded-[1px] font-mono"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Summary Excerpt with subtle researcher highlight */}
        <div className="relative pl-3.5 border-l-2 border-[#9DDCF5] mb-6">
          <p className="text-xs text-[#183B56]/85 leading-relaxed font-sans line-clamp-3">
            "{renderAnnotatedSummary(currentPaper.summary)}"
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#DDE9EF]">
          <span className="text-[10px] text-[#667786] font-mono tracking-wider">
            [ FOLIO Nº 287,421 ]
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewPaper) onViewPaper(currentPaper);
            }}
            className="group inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#183B56] hover:text-[#667786] transition-colors cursor-pointer"
          >
            <span>VIEW SAMPLE PAPER</span>
            <span className="font-serif text-sm leading-none group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
