import React, { useState } from 'react';

export default function Methodology() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleStep = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const steps = [
    {
      num: "01",
      section: "§ 01 / FORMULATION",
      title: "Query Formulation",
      formula: "q ∈ 𝒯^(1..N)",
      desc: "Enter your research thesis, hypothesis, or topic in natural scientific prose. No synthetic prompt engineering or brittle boolean operators required.",
      technicalDetail: {
        concept: "Lexical & Morphological Invariants",
        bullets: [
          "Tokenization & case-folding normalize freeform hypothesis inputs into canonical lexical tokens.",
          "Strip punctuation, symbols, and formatting noise while retaining technical hyphens and domain notation.",
          "Excludes non-informative general-corpus stopwords while preserving discriminative academic phrasing.",
        ],
      },
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          <path d="M15 5l3 3" />
        </svg>
      ),
    },
    {
      num: "02",
      section: "§ 02 / PROJECTION",
      title: "Sublinear Vectorization",
      formula: "v_q = tf(t,q) · idf(t)",
      desc: "Sublinear TF-IDF vectorizer extracts unigram and bigram features, dampening corpus-wide stopwords while amplifying discriminative scientific terminology.",
      technicalDetail: {
        concept: "Sublinear Logarithmic Frequency & Smooth IDF",
        bullets: [
          "Sublinear term frequency tf_sub = 1 + log(tf) prevents dominant repeated terms from biasing recommendations.",
          "Smooth IDF idf(t) = log((1 + N) / (1 + df(t))) + 1 guarantees stable numerical gradients across all tokens.",
          "Unigram and bigram (1, 2) n-gram vocabulary captures composite technical concepts (e.g. 'attention mechanism', 'few-shot learning').",
        ],
      },
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M7.5 7.5L10.5 16.5" strokeDasharray="2 2" />
          <path d="M16.5 7.5L13.5 16.5" strokeDasharray="2 2" />
          <path d="M8.5 6h7" />
        </svg>
      ),
    },
    {
      num: "03",
      section: "§ 03 / CORRELATION",
      title: "Cosine Similarity Dot Product",
      formula: "S(q,d) = v_q · v_d",
      desc: "A sparse matrix-vector dot product projects your query across 287,421 arXiv preprints, evaluating exact angular cosine similarities in under 25 milliseconds.",
      technicalDetail: {
        concept: "Sparse Compressed Sparse Row (CSR) Linear Algebra",
        bullets: [
          "Unit L2-normalization maps all document vectors onto the unit hypersphere: ||v||₂ = 1.",
          "Sparse dot product skips zero elements, providing exact O(non-zeros) lookup time without dense memory expansion.",
          "Cosine similarity S(q,d) = cos(θ) directly measures angular orientation, invariant to document length.",
        ],
      },
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="0.5" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
          <path d="M14 14l3 3" />
          <path d="M17 14v3h-3" />
        </svg>
      ),
    },
    {
      num: "04",
      section: "§ 04 / SYNTHESIS",
      title: "Top-K Literature Synthesis",
      formula: "Rank_k(d_i) | C, Y",
      desc: "Pre-ranking filters constrain the candidate corpus by arXiv classification code and publication epoch before ranking, returning verified preprints without hallucination.",
      technicalDetail: {
        concept: "Pre-Ranking Bitmask Constraints & Min-Heap Ranking",
        bullets: [
          "Boolean index bitmask filters corpus indices by category_code and publication year prior to score sort.",
          "Partial argpartition / min-heap selects Top-K items in O(N + K log K) runtime without full corpus sorting.",
          "Returns authentic precomputed arXiv preprints, strictly preserving genuine author metadata and raw summaries.",
        ],
      },
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M9 7h7" />
          <path d="M9 11h5" />
        </svg>
      ),
    },
  ];

  return (
    <section id="methodology" className="w-full py-20 border-t border-[#DDE9EF] bg-[#F7FBFD]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header: Classical Journal Monograph Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-widest text-[#667786] mb-3">
            <span className="w-5 h-px bg-[#9DDCF5]" />
            <span>RETRIEVAL ARCHITECTURE · MATHEMATICAL FORMULATION</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#183B56] font-normal tracking-tight">
            Methodology & Vector Correlation
          </h2>
          <p className="mt-3 text-[#667786] text-sm sm:text-base leading-relaxed font-sans">
            A deterministic, high-dimensional retrieval methodology engineered specifically for academic literature exploration without synthetic hallucination. Click any phase below to examine technical parameters.
          </p>
        </div>

        {/* 4 Interactive Editorial Accordion Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#DDE9EF] bg-white">
          {steps.map((step, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={step.num}
                onClick={() => toggleStep(idx)}
                className={`p-7 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                  isExpanded 
                    ? 'bg-[#F4FBFE] ring-1 ring-inset ring-[#9DDCF5]' 
                    : 'hover:bg-[#F7FBFD]'
                } ${
                  idx !== steps.length - 1 ? 'lg:border-r border-[#DDE9EF]' : ''
                } ${idx % 2 === 0 ? 'md:border-r lg:border-r' : ''} ${
                  idx < 2 ? 'border-b lg:border-b-0 border-[#DDE9EF]' : ''
                }`}
              >
                <div className="space-y-5">
                  {/* Section Tag & Draft Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#667786] font-medium">
                      {step.section}
                    </span>
                    <div className={`transition-colors ${isExpanded ? 'text-[#183B56]' : 'text-[#667786]/70'}`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Mathematical Schematic / Formula Badge */}
                  <div className="inline-block px-2 py-1 bg-[#F7FBFD] border border-[#DDE9EF] rounded-[1px] font-mono text-[11px] text-[#183B56]">
                    {step.formula}
                  </div>

                  {/* Step Title */}
                  <h3 className="font-serif text-xl sm:text-[22px] text-[#183B56] font-normal leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#667786] leading-relaxed font-sans">
                    {step.desc}
                  </p>

                  {/* Deep Technical Detail Accordion Reveal */}
                  {isExpanded && (
                    <div className="pt-4 mt-2 border-t border-[#DDE9EF] space-y-2.5 animate-fade-in-rise">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#183B56] font-semibold block">
                        {step.technicalDetail.concept}
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-[#183B56]/85 font-sans leading-relaxed list-disc list-inside">
                        {step.technicalDetail.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-justify">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Decorative Notation & Interactive Hint */}
                <div className="pt-6 mt-6 border-t border-[#DDE9EF]/60 flex items-center justify-between text-[10px] font-mono text-[#667786]">
                  <span className="tracking-widest">PHASE {step.num}</span>
                  <span className="text-[#183B56] font-medium">
                    {isExpanded ? '▲ CLOSE SPEC' : '▼ EXPAND SPEC'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
