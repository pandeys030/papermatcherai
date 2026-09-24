import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PaperStack from './components/PaperStack';
import Methodology from './components/Methodology';
import ResearchPreview from './components/ResearchPreview';
import FilterBar from './components/FilterBar';
import PaperDetailModal from './components/PaperDetailModal';
import PaperCompareModal from './components/PaperCompareModal';
import { getFilterOptions, getRecommendations } from './services/api';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [selectedPaperDetail, setSelectedPaperDetail] = useState(null);
  const [livePapers, setLivePapers] = useState(null);
  const [isLiveResults, setIsLiveResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStage, setSearchStage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentView, setCurrentView] = useState('explore'); // 'explore' | 'saved'
  const [highlightSearchBtn, setHighlightSearchBtn] = useState(false);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopK, setSelectedTopK] = useState(5);

  // Bookmarks (Saved Papers) in localStorage
  const [savedPapers, setSavedPapers] = useState(() => {
    try {
      const stored = localStorage.getItem('papermatcher_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Compare List (up to 2 papers)
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const searchInputRef = useRef(null);

  // Persist saved papers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('papermatcher_saved', JSON.stringify(savedPapers));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [savedPapers]);

  // Global Keyboard Shortcuts: "/" to focus search, "Escape" handled by modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If user presses '/' when not typing in an input/textarea, focus search
      if (
        e.key === '/' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load dynamic filter options on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const data = await getFilterOptions();
        if (data && data.categories) {
          setCategories(data.categories);
        }
        if (data && data.years) {
          setYears(data.years);
        }
      } catch (err) {
        console.warn('Could not load dynamic filter options from API:', err);
      }
    }
    loadFilters();
  }, []);

  const quickSuggestions = [
    { label: "Explainable AI in healthcare", category: "cs.AI" },
    { label: "Fake news detection", category: "cs.CL" },
    { label: "Robotics for elderly", category: "cs.RO" },
    { label: "NLP for low-resource languages", category: "cs.CL" },
  ];

  // Active filter label tag
  const activeCategoryCode = selectedCategory && selectedCategory !== 'all' ? selectedCategory.toUpperCase() : 'ALL';
  const activeYearCode = selectedYear && selectedYear !== 'all' ? selectedYear : 'ALL YEARS';
  const activeFilterTag = `${activeCategoryCode} · ${activeYearCode} · TOP ${selectedTopK}`;

  // Toggle saving a paper
  const handleToggleSave = (paper) => {
    if (!paper || !paper.id) return;
    setSavedPapers((prev) => {
      const exists = prev.some((p) => p.id === paper.id);
      if (exists) {
        return prev.filter((p) => p.id !== paper.id);
      } else {
        return [paper, ...prev];
      }
    });
  };

  // Toggle comparing a paper (max 2)
  const handleToggleCompare = (paper) => {
    if (!paper || !paper.id) return;
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === paper.id);
      if (exists) {
        return prev.filter((p) => p.id !== paper.id);
      } else {
        if (prev.length >= 2) {
          // Replace second paper if already 2
          return [prev[0], paper];
        }
        return [...prev, paper];
      }
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
    setIsCompareModalOpen(false);
  };

  // Execute recommendation query with multi-stage progress ticker
  const performSearch = async (queryText = searchQuery, cat = selectedCategory, yr = selectedYear, k = selectedTopK) => {
    const q = queryText.trim();
    if (!q || q.length < 3) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentView('explore');

    // Stage 1: Understanding Query
    setSearchStage('UNDERSTANDING QUERY');
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await sleep(160);
      setSearchStage('BUILDING SEMANTIC VECTOR');

      // Start API request in parallel
      const apiPromise = getRecommendations({
        query: q,
        top_k: k,
        category_code: cat !== 'all' ? cat : null,
        published_year: yr !== 'all' ? yr : null,
      });

      await sleep(180);
      setSearchStage('MATCHING RESEARCH');

      const data = await apiPromise;

      setSearchStage('RANKING PAPERS');
      await sleep(140);

      if (data && data.results && data.results.length > 0) {
        setLivePapers(data.results);
        setIsLiveResults(true);

        const top = data.results[0];
        setActivePaper({
          id: top.id,
          title: top.title,
          authors: top.authors || top.first_author || 'arXiv Contributor',
          first_author: top.first_author || (top.authors ? top.authors.split(',')[0].trim() : 'Primary Investigator'),
          category: top.category || 'Computer Science',
          category_code: top.category_code || 'cs.AI',
          published_date: top.published_date || 'N/A',
          similarity_score: top.similarity_score,
          key_concepts: [top.category_code, "Direct Semantic Match", `Score: ${top.similarity_score.toFixed(3)}`],
          summary: top.summary,
        });

        // Smooth scroll down to results section
        setTimeout(() => {
          const el = document.getElementById('preview');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setLivePapers([]);
        setIsLiveResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMessage(err.message || 'Failed to generate recommendations from backend.');
    } finally {
      setIsLoading(false);
      setSearchStage(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Click suggestion STAGES text into search input without instant auto-search
  const handleSuggestionClick = (item) => {
    setSearchQuery(item.label);
    setHighlightSearchBtn(true);
    setTimeout(() => setHighlightSearchBtn(false), 1200);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    if (searchQuery.trim().length >= 3) {
      performSearch(searchQuery, newCat, selectedYear, selectedTopK);
    }
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    if (searchQuery.trim().length >= 3) {
      performSearch(searchQuery, selectedCategory, newYear, selectedTopK);
    }
  };

  const handleTopKChange = (newK) => {
    setSelectedTopK(newK);
    if (searchQuery.trim().length >= 3) {
      performSearch(searchQuery, selectedCategory, selectedYear, newK);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedYear('all');
    setSelectedTopK(5);
    if (searchQuery.trim().length >= 3) {
      performSearch(searchQuery, 'all', 'all', 5);
    }
  };

  const handleOpenPaperDetail = (paper) => {
    if (!paper) return;
    setSelectedPaperDetail(paper);
  };

  const handleClosePaperDetail = () => {
    setSelectedPaperDetail(null);
  };

  const scrollToExplore = () => {
    setCurrentView('explore');
    const el = document.getElementById('explore');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleViewSavedClick = () => {
    setCurrentView('saved');
    const el = document.getElementById('preview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setCurrentView('explore');
  };

  return (
    <div className="min-h-screen bg-[#F7FBFD] text-[#183B56] flex flex-col font-sans">
      {/* Navbar with dynamic saved count */}
      <Navbar 
        onExploreClick={scrollToExplore}
        savedCount={savedPapers.length}
        onViewSavedClick={handleViewSavedClick}
        currentView={currentView}
        onHomeClick={handleHomeClick}
      />

      {/* Hero Section */}
      <main id="home" className="relative w-full overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Subtle Background Scientific Line-Art */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
          <svg className="absolute -top-24 right-0 w-[800px] h-[800px] text-[#DDE9EF]" viewBox="0 0 600 600" fill="none">
            <circle cx="450" cy="150" r="300" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
            <circle cx="450" cy="150" r="200" stroke="currentColor" strokeWidth="0.5" />
            <line x1="150" y1="150" x2="600" y2="150" stroke="currentColor" strokeWidth="0.5" />
            <line x1="450" y1="0" x2="450" y2="450" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: Editorial Typography, Search Hero & Compact Filters */}
            <div id="explore" className="lg:col-span-7 space-y-7">
              {/* Category / Scope Tag */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2">
                  <span className="w-5 h-px bg-[#9DDCF5]" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#667786]">
                    ARXIV REPOSITORY · LITERATURE DISCOVERY
                  </span>
                </div>
                <span className="text-[#DDE9EF]">/</span>
                <span className="text-[10px] font-mono text-[#667786]/70 uppercase tracking-wider hidden sm:inline">
                  VOL. 2026
                </span>
              </div>

              {/* Huge Serif Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] leading-[1.06] text-[#183B56] font-normal tracking-tight">
                Find research<br />
                that understands<br />
                <span className="relative inline-block italic text-[#183B56]">
                  your idea.
                  {/* Subtle organic baby blue underline */}
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[#9DDCF5] pointer-events-none"
                    viewBox="0 0 250 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 8.5C65 3 155 3.5 247.5 7C185 10.5 95 11 35 11.5"
                      stroke="currentColor"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Editorial Description */}
              <p className="text-base sm:text-lg text-[#667786] max-w-xl font-normal leading-relaxed font-sans">
                PaperMatcher AI uses deterministic n-gram vectorization and sparse cosine geometry to discover research papers based on underlying scientific thesis, mathematical context, and conceptual relevance.
              </p>

              {/* HERO SEARCH INTERACTION */}
              <div className="space-y-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white border border-[#DDE9EF] hover:border-[#9DDCF5] focus-within:border-[#9DDCF5] focus-within:ring-2 focus-within:ring-[#DDF3FB] rounded-[2px] shadow-[0_3px_10px_rgba(24,59,86,0.05)] transition-all"
                >
                  <div className="pl-4 pr-1 text-[#667786]/60 pointer-events-none font-mono text-sm select-none">
                    ⌕
                  </div>
                  
                  <input
                    ref={searchInputRef}
                    type="text"
                    maxLength={500}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your thesis, research hypothesis, or core topic... (Press '/' to focus)"
                    className="w-full py-4 pl-2 pr-28 text-sm sm:text-base text-[#183B56] placeholder-[#667786]/55 bg-transparent focus:outline-none"
                  />

                  {/* Clear Button (X) when text exists */}
                  {searchQuery.length > 0 && !isLoading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        if (searchInputRef.current) searchInputRef.current.focus();
                      }}
                      className="text-[#667786] hover:text-[#183B56] p-1.5 rounded-full mr-1 text-sm font-mono leading-none cursor-pointer"
                      title="Clear search text"
                    >
                      ✕
                    </button>
                  )}

                  {/* Character count / length hint */}
                  <div className="hidden sm:block text-[10px] font-mono text-[#667786]/70 pr-2 select-none">
                    {searchQuery.length}/500
                  </div>

                  {/* Search Button with 3-dot pulse state */}
                  <button
                    type="submit"
                    disabled={isLoading || searchQuery.trim().length < 3}
                    className={`w-11 h-11 mr-1.5 flex items-center justify-center rounded-[2px] transition-all cursor-pointer ${
                      highlightSearchBtn
                        ? 'bg-[#183B56] text-white ring-2 ring-[#9DDCF5]'
                        : isLoading
                        ? 'bg-[#F7FBFD] text-[#183B56]'
                        : 'text-[#183B56] hover:bg-[#EAF7FC] disabled:opacity-40 disabled:hover:bg-transparent'
                    }`}
                    aria-label="Search"
                    title={searchQuery.trim().length < 3 ? "Enter at least 3 characters" : "Execute Search"}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#183B56] editorial-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#183B56] editorial-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#183B56] editorial-dot" />
                      </div>
                    ) : (
                      <span className="font-serif text-2xl leading-none">→</span>
                    )}
                  </button>
                </form>

                {/* Real-time Multi-Stage Progress Ticker */}
                {isLoading && searchStage && (
                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#EAF7FC]/70 border border-[#9DDCF5]/70 rounded-[1px] text-xs font-mono text-[#183B56] animate-fade-in-rise">
                    <span className="w-2 h-2 rounded-full bg-[#183B56] animate-ping" />
                    <span className="uppercase tracking-wider font-medium">
                      PIPELINE PHASE: {searchStage}...
                    </span>
                  </div>
                )}

                {/* Compact Research Filter Bar */}
                <FilterBar
                  categories={categories}
                  years={years}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                  selectedYear={selectedYear}
                  onSelectYear={handleYearChange}
                  selectedTopK={selectedTopK}
                  onSelectTopK={handleTopKChange}
                  onResetFilters={handleResetFilters}
                />

                {/* Academic Suggestions (Stages query into search input) */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[#667786] pt-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#667786] mr-1">
                    TOPICAL INVARIANTS:
                  </span>
                  {quickSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(item)}
                      className="px-2 py-0.5 bg-[#F7FBFD] hover:bg-[#EAF7FC] border border-[#DDE9EF] hover:border-[#9DDCF5] text-[#183B56] rounded-[1px] transition-colors font-mono text-[11px] cursor-pointer"
                      title="Click to stage this thesis into the search field"
                    >
                      <span className="text-[#9DDCF5] mr-1 font-semibold">§</span>
                      {item.label}
                    </button>
                  ))}
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-[1px] font-mono">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Fine Corpus Footnote */}
              <div className="flex items-center gap-3 text-xs text-[#667786] font-mono pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DDCF5]" />
                <span>Indexed against 287,421 verified arXiv preprints · Press '/' to search anytime</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Physical Research Paper Stack */}
            <div className="lg:col-span-5 lg:pl-4 pt-4 lg:pt-0">
              <PaperStack 
                paper={activePaper} 
                onViewPaper={handleOpenPaperDetail}
                isSaved={activePaper ? savedPapers.some((p) => p.id === activePaper.id) : false}
                onToggleSave={handleToggleSave}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Four-Step Methodology Accordion Section */}
      <Methodology />

      {/* Editorial Research Preview / Results / Saved Papers Section */}
      <ResearchPreview 
        papers={livePapers}
        onSelectPaper={(paper) => setActivePaper(paper)}
        onViewPaper={handleOpenPaperDetail}
        activeFilterTag={activeFilterTag}
        isLiveResults={isLiveResults}
        query={searchQuery}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRetry={() => performSearch()}
        onClearFilters={handleResetFilters}
        onSuggestionClick={handleSuggestionClick}
        savedPapers={savedPapers}
        onToggleSave={handleToggleSave}
        compareList={compareList}
        onToggleCompare={handleToggleCompare}
        currentView={currentView}
        onClearSaved={() => setSavedPapers([])}
      />

      {/* Floating Bottom Comparison Drawer (when 1 or 2 papers are queued for comparison) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#183B56] text-white px-5 py-3 rounded-[3px] shadow-2xl border border-[#9DDCF5] flex items-center gap-4 animate-fade-in-rise font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DDCF5]" />
            <span>
              {compareList.length} of 2 papers selected for comparison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={compareList.length < 2}
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3 py-1 bg-[#9DDCF5] hover:bg-[#DDF3FB] text-[#183B56] font-semibold rounded-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Compare Papers →
            </button>
            <button
              type="button"
              onClick={handleClearCompare}
              className="text-[#DDE9EF] hover:text-white text-[11px] underline ml-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Digital Academic Paper Detail Modal */}
      {selectedPaperDetail && (
        <PaperDetailModal 
          paper={selectedPaperDetail} 
          onClose={handleClosePaperDetail}
          isSaved={savedPapers.some((p) => p.id === selectedPaperDetail.id)}
          onToggleSave={handleToggleSave}
          isInCompare={compareList.some((p) => p.id === selectedPaperDetail.id)}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {/* Side-by-Side Paper Comparison Modal */}
      {isCompareModalOpen && compareList.length >= 2 && (
        <PaperCompareModal
          papers={compareList}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectPaper={handleOpenPaperDetail}
          onClearCompare={handleClearCompare}
        />
      )}
    </div>
  );
}
