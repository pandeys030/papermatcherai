import React from 'react';

export default function FilterBar({
  categories = [],
  years = [],
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear,
  selectedTopK,
  onSelectTopK,
  onResetFilters,
}) {
  const topKOptions = [5, 10, 15, 20];

  const hasCategoryFilter = selectedCategory && selectedCategory !== 'all';
  const hasYearFilter = selectedYear && selectedYear !== 'all';
  const isFiltered = hasCategoryFilter || hasYearFilter || selectedTopK !== 5;

  return (
    <div className="w-full bg-white border border-[#DDE9EF] rounded-[2px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(24,59,86,0.03)] space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Compact Archival Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          
          {/* Subject Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="cat-filter" className="font-mono text-[9px] uppercase tracking-widest text-[#667786]">
              Subject:
            </label>
            <div className="relative">
              <select
                id="cat-filter"
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="appearance-none bg-[#F7FBFD] hover:bg-[#EAF7FC] border border-[#DDE9EF] hover:border-[#9DDCF5] focus:border-[#9DDCF5] text-[#183B56] font-medium text-xs rounded-[1px] py-1.5 pl-2.5 pr-6 focus:outline-none focus:ring-1 focus:ring-[#9DDCF5] cursor-pointer transition-colors"
              >
                <option value="all">All Subjects</option>
                {categories.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code} · {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#667786] text-[8px]">
                ▼
              </div>
            </div>
          </div>

          {/* Publication Year Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="year-filter" className="font-mono text-[9px] uppercase tracking-widest text-[#667786]">
              Publication year:
            </label>
            <div className="relative">
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => onSelectYear(e.target.value)}
                className="appearance-none bg-[#F7FBFD] hover:bg-[#EAF7FC] border border-[#DDE9EF] hover:border-[#9DDCF5] focus:border-[#9DDCF5] text-[#183B56] font-medium text-xs rounded-[1px] py-1.5 pl-2.5 pr-6 focus:outline-none focus:ring-1 focus:ring-[#9DDCF5] cursor-pointer transition-colors"
              >
                <option value="all">Any year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#667786] text-[8px]">
                ▼
              </div>
            </div>
          </div>

          {/* Results (Top K) Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DDE9EF]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#667786]">
              Results:
            </span>
            <div className="inline-flex rounded-[1px] border border-[#DDE9EF] bg-[#F7FBFD] p-0.5">
              {topKOptions.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onSelectTopK(k)}
                  className={`px-2 py-0.5 text-xs font-mono rounded-[1px] transition-colors ${
                    selectedTopK === k
                      ? 'bg-white text-[#183B56] font-bold shadow-xs border border-[#9DDCF5]'
                      : 'text-[#667786] hover:text-[#183B56]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Filter Tags with removable '×' & Clear All */}
        <div className="flex flex-wrap items-center gap-2">
          {hasCategoryFilter && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EAF7FC] border border-[#9DDCF5] text-[#183B56] rounded-[1px] font-mono text-[11px]">
              <span>{selectedCategory.toUpperCase()}</span>
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="text-[#667786] hover:text-rose-600 font-bold ml-0.5 text-xs leading-none"
                title="Remove subject filter"
              >
                ×
              </button>
            </span>
          )}

          {hasYearFilter && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EAF7FC] border border-[#9DDCF5] text-[#183B56] rounded-[1px] font-mono text-[11px]">
              <span>{selectedYear}</span>
              <button
                type="button"
                onClick={() => onSelectYear('all')}
                className="text-[#667786] hover:text-rose-600 font-bold ml-0.5 text-xs leading-none"
                title="Remove year filter"
              >
                ×
              </button>
            </span>
          )}

          {selectedTopK !== 5 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F7FBFD] border border-[#DDE9EF] text-[#183B56] rounded-[1px] font-mono text-[11px]">
              <span>Top {selectedTopK}</span>
              <button
                type="button"
                onClick={() => onSelectTopK(5)}
                className="text-[#667786] hover:text-rose-600 font-bold ml-0.5 text-xs leading-none"
                title="Reset to 5 results"
              >
                ×
              </button>
            </span>
          )}

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-mono text-[#667786] hover:text-[#183B56] transition-colors underline cursor-pointer pl-1"
            >
              Clear all
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
