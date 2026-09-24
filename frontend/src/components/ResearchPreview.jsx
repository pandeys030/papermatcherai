import React, { useState, useMemo } from 'react';

export default function ResearchPreview({ 
  papers = null, 
  onSelectPaper, 
  onViewPaper,
  activeFilterTag = '', 
  isLiveResults = false,
  query = '',
  isLoading = false,
  errorMessage = null,
  onRetry,
  onClearFilters,
  onSuggestionClick,
  savedPapers = [],
  onToggleSave,
  compareList = [],
  onToggleCompare,
  currentView = 'explore', // 'explore' or 'saved'
  onClearSaved,
}) {
  const [sortOrder, setSortOrder] = useState('relevance'); // 'relevance' | 'newest' | 'oldest'

  const defaultSampleEntries = [
    {
      num: "01",
      id: "abs-1910.03771v5",
      title: "HuggingFace's Transformers: State-of-the-art Natural Language Processing",
      authors: "Thomas Wolf, Lysandre Debut, Victor Sanh, Julien Chaumond, Clement Delangue, Anthony Moi, Pierric Cistac, et al.",
      first_author: "Thomas Wolf",
      category: "Computation and Language",
      category_code: "cs.CL",
      published_date: "10/9/19",
      year: "2019",
      match_pct: 94,
      similarity_score: 0.942,
      summary: "Recent progress in natural language processing has been driven by deep learning transformer models such as BERT, RoBERTa, and GPT. We present Transformers, an open-source library providing state-of-the-art general-purpose architectures across text comprehension and translation.",
      key_concepts: ["Attention Mechanisms", "Cross-lingual Transfer", "Token Pruning", "Model Distillation"],
    },
    {
      num: "02",
      id: "abs-2406.12221v1",
      title: "On-Policy Fine-grained Knowledge Feedback for Hallucination Mitigation",
      authors: "Haozhe Ji, Nikolay Malkin, Malihe Alikhani, et al.",
      first_author: "Haozhe Ji",
      category: "Computation and Language",
      category_code: "cs.CL",
      published_date: "6/18/24",
      year: "2024",
      match_pct: 88,
      similarity_score: 0.884,
      summary: "Large language models often hallucinate ungrounded statements. This work designs a fine-grained knowledge feedback framework that aligns model outputs on-policy, drastically curbing factual drift across medical and legal question-answering benchmarks.",
      key_concepts: ["Hallucination Mitigation", "Knowledge Grounding", "On-Policy Alignment", "Factual Verification"],
    },
    {
      num: "03",
      id: "abs-2012.08752v4",
      title: "Graph Neural Networks: Taxonomy, Advances and Trends",
      authors: "Zonghan Wu, Shirui Pan, Fengwen Chen, Guodong Long, Chengqi Zhang, S Yu Philip",
      first_author: "Zonghan Wu",
      category: "Machine Learning",
      category_code: "cs.LG",
      published_date: "12/16/20",
      year: "2020",
      match_pct: 85,
      similarity_score: 0.851,
      summary: "Deep learning on non-Euclidean domains has gained immense momentum. We provide a comprehensive taxonomy of graph neural networks (GNNs), categorizing architectures into recurrent, convolutional, and spatial-temporal graph networks.",
      key_concepts: ["Graph Neural Networks", "Non-Euclidean Domains", "Message Passing", "Spatial-Temporal Graphs"],
    },
  ];

  // Derive display entries based on current view: 'saved' or normal results
  const rawList = currentView === 'saved'
    ? savedPapers
    : (papers && papers.length > 0 ? papers : (isLiveResults && papers ? [] : defaultSampleEntries));

  // Map and sort entries
  const displayEntries = useMemo(() => {
    if (!rawList) return [];

    const mapped = rawList.map((p, idx) => {
      const pct = Math.round((p.similarity_score || 0) * 100);
      let yr = p.published_date;
      let numericYear = 2024;
      if (yr && yr.includes('/')) {
        const parts = yr.split('/');
        const y = parseInt(parts[parts.length - 1], 10);
        numericYear = y < 100 ? (y >= 90 ? 1900 + y : 2000 + y) : y;
        yr = `${numericYear}`;
      } else if (p.year) {
        numericYear = parseInt(p.year, 10) || 2024;
        yr = `${numericYear}`;
      }

      return {
        ...p,
        num: String(idx + 1).padStart(2, '0'),
        numericYear,
        year: yr || '2024',
        match_pct: pct,
        similarity_score: typeof p.similarity_score === 'number' ? p.similarity_score : 0,
        authors: p.authors || p.first_author || 'arXiv Contributor',
        first_author: p.first_author || (p.authors ? p.authors.split(',')[0].trim() : 'Primary Investigator'),
        category: p.category || 'Computer Science',
        category_code: p.category_code || 'cs.AI',
        published_date: p.published_date || 'N/A',
        key_concepts: p.key_concepts || [p.category_code || 'cs.AI', "TF-IDF Vector", `Score: ${(p.similarity_score || 0).toFixed(3)}`],
      };
    });

    if (sortOrder === 'newest') {
      return [...mapped].sort((a, b) => b.numericYear - a.numericYear);
    } else if (sortOrder === 'oldest') {
      return [...mapped].sort((a, b) => a.numericYear - b.numericYear);
    }
    // Default: relevance (similarity_score descending)
    return [...mapped].sort((a, b) => b.similarity_score - a.similarity_score);
  }, [rawList, sortOrder]);

  const isSavedMode = currentView === 'saved';

  return (
    <section id="preview" className="w-full py-20 bg-white border-t border-[#DDE9EF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#DDE9EF] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#667786] mb-3">
              <span className="w-6 h-px bg-[#9DDCF5]" />
              <span>
                {isSavedMode
                  ? 'PERSONAL REFERENCE COLLECTION'
                  : isLiveResults 
                  ? 'SEMANTIC SEARCH MATCHES' 
                  : 'RESEARCH PREVIEW'}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#183B56] font-normal tracking-tight">
              {isSavedMode
                ? `Saved Papers (${savedPapers.length})`
                : isLiveResults && query 
                ? `Results for “${query}”` 
                : 'Selected Literature Matches'}
            </h2>
            <p className="mt-2 text-[#667786] text-sm max-w-xl font-sans">
              {isSavedMode
                ? 'Monographs and preprints bookmarked during your research exploration, persisted locally.'
                : isLiveResults 
                ? 'Ranked via cosine similarity across 287k arXiv preprints with pre-ranking filters applied.'
                : 'Editorial inspection entries demonstrating how semantic matching scores and contextualizes candidate papers from the 287k corpus.'}
            </p>
          </div>

          {/* Subtly displayed active filtering & Sort Controls */}
          <div className="flex flex-col md:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="archival-stamp">
                {isSavedMode 
                  ? 'SAVED COLLECTION' 
                  : isLiveResults 
                  ? 'VERIFIED MATCH' 
                  : 'SAMPLE RESULT'}
              </span>
              {!isSavedMode && activeFilterTag && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F7FBFD] border border-[#DDE9EF] rounded-[2px] font-mono text-xs text-[#183B56] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9DDCF5]" />
                  <span>{activeFilterTag}</span>
                </span>
              )}
            </div>

            {/* Sort Controls & Count Indicator */}
            {displayEntries.length > 0 && !isLoading && !errorMessage && (
              <div className="flex items-center gap-4 text-xs font-mono pt-1">
                <span className="text-[#667786]">
                  <strong className="text-[#183B56] font-semibold">{displayEntries.length}</strong> papers found · 287,421 indexed
                </span>

                <div className="flex items-center gap-1 border-l border-[#DDE9EF] pl-3">
                  <span className="text-[#667786] text-[10px] uppercase tracking-wider mr-1">Sort:</span>
                  {[
                    { key: 'relevance', label: 'Most Relevant' },
                    { key: 'newest', label: 'Newest' },
                    { key: 'oldest', label: 'Oldest' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSortOrder(s.key)}
                      className={`px-2 py-0.5 rounded-[1px] transition-colors ${
                        sortOrder === s.key
                          ? 'bg-[#EAF7FC] text-[#183B56] font-semibold border border-[#9DDCF5]'
                          : 'text-[#667786] hover:text-[#183B56]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State: Multi-stage progress indicator */}
        {isLoading && (
          <div className="py-24 text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#183B56] editorial-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#183B56] editorial-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#183B56] editorial-dot" />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#667786]">
              Vectorizing query & searching 287,421 arXiv documents...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="py-16 px-8 max-w-xl mx-auto text-center border border-rose-200 bg-rose-50/50 rounded-[2px] space-y-4">
            <span className="archival-stamp bg-rose-100 border-rose-300 text-rose-800">
              RESEARCH INDEX NOTICE
            </span>
            <h3 className="font-serif text-2xl text-[#183B56]">
              Retrieval Pipeline Unreachable
            </h3>
            <p className="text-xs text-[#667786] font-sans leading-relaxed">
              {errorMessage}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#183B56] text-white font-mono text-xs rounded-[1px] hover:bg-[#183B56]/90 transition-colors"
              >
                <span>Retry Retrieval</span>
                <span className="font-serif">→</span>
              </button>
            )}
          </div>
        )}

        {/* Empty State: No results found */}
        {!isLoading && !errorMessage && isLiveResults && displayEntries.length === 0 && (
          <div className="py-20 px-8 max-w-lg mx-auto text-center space-y-4 border border-[#DDE9EF] bg-[#F7FBFD] rounded-[2px]">
            <span className="archival-stamp">
              ZERO MATCHING PREPRINTS
            </span>
            <h3 className="font-serif text-2xl text-[#183B56]">
              No Close Matches Found
            </h3>
            <p className="text-xs text-[#667786] font-sans leading-relaxed">
              No papers met the semantic threshold under your current subject and epoch constraints. Consider broadening your research phrase or resetting the filter criteria.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="px-3.5 py-1.5 bg-white border border-[#DDE9EF] hover:border-[#9DDCF5] text-xs font-mono text-[#183B56] rounded-[1px] transition-colors"
                >
                  Clear Active Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State: Saved papers is empty */}
        {isSavedMode && displayEntries.length === 0 && (
          <div className="py-20 px-8 max-w-lg mx-auto text-center space-y-4 border border-[#DDE9EF] bg-[#F7FBFD] rounded-[2px]">
            <span className="archival-stamp">
              EMPTY FOLIO
            </span>
            <h3 className="font-serif text-2xl text-[#183B56]">
              No Saved Papers Yet
            </h3>
            <p className="text-xs text-[#667786] font-sans leading-relaxed">
              Click the star or bookmark icon (☆) on any paper monograph to save it to your local reference archive for instant side-by-side comparison and review.
            </p>
          </div>
        )}

        {/* Editorial Research Entries List with Staggered Entrance */}
        {!isLoading && !errorMessage && displayEntries.length > 0 && (
          <div className="space-y-0 divide-y divide-[#DDE9EF]">
            {displayEntries.map((entry, idx) => {
              const isSaved = savedPapers.some((p) => p.id === entry.id);
              const isInCompare = compareList.some((p) => p.id === entry.id);

              return (
                <article
                  key={entry.id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => {
                    if (onSelectPaper) onSelectPaper(entry);
                    if (onViewPaper) onViewPaper(entry);
                  }}
                  className="animate-fade-in-rise group py-9 px-4 sm:px-6 hover:bg-[#F4FBFE] border-l-2 border-transparent hover:border-[#9DDCF5] transition-all duration-200 cursor-pointer flex flex-col lg:flex-row lg:items-start justify-between gap-8"
                >
                  {/* Left Column: Number and Main Content */}
                  <div className="flex items-start gap-5 sm:gap-7 flex-1">
                    {/* Archival Folio Stamp Numeral */}
                    <div className="shrink-0 w-10 sm:w-12 flex flex-col items-center pt-1 select-none">
                      <span className="font-serif text-3xl sm:text-4xl text-[#DDE9EF] group-hover:text-[#9DDCF5] transition-colors leading-none font-normal">
                        {entry.num}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#667786]/70 mt-1">
                        FOLIO
                      </span>
                    </div>

                    {/* Content Block */}
                    <div className="space-y-3.5 flex-1">
                      {/* Category & Date Metadata */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#667786] font-mono text-[11px]">
                        <span className="archival-stamp text-[9px] py-0.5">
                          {isSavedMode 
                            ? 'SAVED PREPRINT' 
                            : isLiveResults 
                            ? 'ARXIV MONOGRAPH' 
                            : 'SAMPLE MONOGRAPH'}
                        </span>
                        <span className="font-semibold text-[#183B56] bg-[#EAF7FC] px-1.5 py-0.5 rounded-[1px] border border-[#DDF3FB]">
                          {entry.category_code}
                        </span>
                        <span className="text-[#DDE9EF]">/</span>
                        <span className="text-[#183B56]">{entry.category}</span>
                        <span className="text-[#DDE9EF]">/</span>
                        <span>{entry.year}</span>
                        <span className="text-[#DDE9EF]">/</span>
                        <span className="text-[#667786]">{entry.id}</span>
                      </div>

                      {/* Paper Title (Serif) */}
                      <h3 className="font-serif text-2xl sm:text-[25px] text-[#183B56] font-normal leading-snug tracking-tight group-hover:text-[#183B56]/90 transition-colors">
                        {entry.title}
                      </h3>

                      {/* Authors */}
                      <p className="text-xs text-[#667786] font-sans">
                        By <span className="text-[#183B56] font-medium">{entry.authors}</span>
                      </p>

                      {/* Summary with high readability */}
                      <p className="text-sm text-[#183B56]/85 leading-relaxed max-w-3xl pt-0.5 font-sans">
                        {entry.summary}
                      </p>

                      {/* Key concept tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(entry.key_concepts || []).map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-mono px-2 py-0.5 bg-white group-hover:bg-[#EAF7FC] border border-[#DDE9EF] text-[#183B56] rounded-[1px] transition-colors"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Similarity Bar and Quick Actions */}
                  <div className="lg:w-64 shrink-0 pl-16 lg:pl-0 flex flex-col justify-between self-stretch space-y-6">
                    {/* Interactive Similarity Bar */}
                    <div className="space-y-1.5 bg-[#F7FBFD] p-3 border border-[#DDE9EF]/70 rounded-[1px] group-hover:border-[#9DDCF5] transition-colors">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="uppercase tracking-widest text-[#667786] text-[9px]">
                          COSINE METRIC
                        </span>
                        <span className="font-semibold text-[#183B56] text-[11px]">
                          MATCH {entry.match_pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#DDE9EF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#9DDCF5] group-hover:bg-[#183B56] transition-colors duration-300"
                          style={{ width: `${entry.match_pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-[#667786]/70 pt-0.5">
                        <span>0.00</span>
                        <span className="text-[#183B56] font-medium">{entry.similarity_score.toFixed(4)}</span>
                        <span>1.00</span>
                      </div>
                    </div>

                    {/* Quick Row Actions: Bookmark, Compare, View */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-1">
                      {onToggleSave && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(entry);
                          }}
                          className={`p-1.5 rounded-[1px] border text-xs transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-[#183B56] text-white border-[#183B56]'
                              : 'bg-white text-[#667786] border-[#DDE9EF] hover:border-[#9DDCF5] hover:text-[#183B56]'
                          }`}
                          title={isSaved ? "Remove from bookmarks" : "Save bookmark"}
                        >
                          {isSaved ? '★' : '☆'}
                        </button>
                      )}

                      {onToggleCompare && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(entry);
                          }}
                          className={`px-2 py-1 text-xs font-mono rounded-[1px] border transition-colors cursor-pointer ${
                            isInCompare
                              ? 'bg-[#EAF7FC] text-[#183B56] border-[#9DDCF5]'
                              : 'bg-white text-[#667786] border-[#DDE9EF] hover:border-[#9DDCF5] hover:text-[#183B56]'
                          }`}
                          title={isInCompare ? "Remove from comparison" : "Add to 2-paper comparison"}
                        >
                          {isInCompare ? '✓ In Compare' : '+ Compare'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewPaper) onViewPaper(entry);
                        }}
                        className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#183B56] hover:text-[#667786] transition-colors uppercase font-mono cursor-pointer"
                      >
                        <span>VIEW PAPER</span>
                        <span className="font-serif text-sm leading-none group-hover/btn:translate-x-0.5 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Clean End Annotation (No Footer) */}
        <div className="pt-14 mt-16 border-t border-[#DDE9EF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#667786] gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DDCF5]" />
            <span className="font-mono text-[11px]">arXiv Registry · 287,421 Indexed Scientific Monograph Vectors</span>
          </div>
          <div className="font-mono text-[11px]">
            PaperMatcher AI · Deterministic TF-IDF Sparse Linear Algebra
          </div>
        </div>
      </div>
    </section>
  );
}
