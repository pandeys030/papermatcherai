import React, { useState, useEffect } from 'react';

export default function Navbar({ 
  onExploreClick, 
  savedCount = 0, 
  onViewSavedClick, 
  currentView = 'explore',
  onHomeClick,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`w-full bg-white border-b border-[#DDE9EF] sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'shadow-[0_2px_8px_rgba(24,59,86,0.06)] h-16' 
          : 'h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between">
        
        {/* Left: Brand with paper-inspired mark */}
        <div 
          onClick={() => {
            if (onHomeClick) onHomeClick();
          }}
          className="flex items-center gap-3.5 cursor-pointer select-none"
        >
          <div className="relative w-7 h-8 sm:w-8 sm:h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#DDF3FB] border border-[#9DDCF5] rounded-[2px] transform -rotate-3 transition-transform hover:-rotate-6" />
            <div className="absolute inset-0 bg-white border border-[#DDE9EF] rounded-[2px] shadow-sm flex flex-col justify-between p-1.5">
              <div className="w-full flex justify-between items-center">
                <div className="w-2.5 h-0.5 bg-[#9DDCF5]" />
                <div className="w-1.5 h-1.5 bg-[#EAF7FC] border-t border-r border-[#9DDCF5] rounded-tr-[1px]" />
              </div>
              <div className="space-y-0.5">
                <div className="w-full h-0.5 bg-[#DDE9EF]" />
                <div className="w-3/4 h-0.5 bg-[#DDE9EF]" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl tracking-tight text-[#183B56] font-normal leading-tight">
              PaperMatcher <span className="font-sans text-[11px] font-semibold tracking-wider text-[#667786] uppercase ml-0.5">AI</span>
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-[#667786]/70 block">
              ARXIV LITERATURE INDEX
            </span>
          </div>
        </div>

        {/* Center: Editorial Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#667786]">
          <button
            type="button"
            onClick={() => {
              if (onHomeClick) onHomeClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'explore' 
                ? 'text-[#183B56] relative after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#9DDCF5]' 
                : 'hover:text-[#183B56]'
            }`}
          >
            Home
          </button>
          
          <button
            type="button"
            onClick={onExploreClick}
            className="hover:text-[#183B56] transition-colors py-1 cursor-pointer"
          >
            Explore Research
          </button>

          <a
            href="#methodology"
            className="hover:text-[#183B56] transition-colors py-1"
          >
            Methodology
          </a>

          <a
            href="#preview"
            className="hover:text-[#183B56] transition-colors py-1"
          >
            Index Preview
          </a>

          {/* Saved Papers Link with Dynamic Pill */}
          <button
            type="button"
            onClick={onViewSavedClick}
            className={`inline-flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
              currentView === 'saved'
                ? 'text-[#183B56] font-semibold relative after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#9DDCF5]'
                : 'hover:text-[#183B56]'
            }`}
          >
            <span>Saved Papers</span>
            <span className="px-1.5 py-0.2 bg-[#EAF7FC] border border-[#9DDCF5] text-[#183B56] rounded-full text-[10px] font-mono">
              {savedCount}
            </span>
          </button>
        </div>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExploreClick}
            className="hidden sm:inline-flex group items-center gap-2 text-xs font-mono font-medium text-[#183B56] hover:text-[#183B56] px-3.5 py-2 border border-[#DDE9EF] rounded-[2px] bg-[#F7FBFD] hover:bg-[#EAF7FC] hover:border-[#9DDCF5] transition-all cursor-pointer"
          >
            <span>SEARCH CORPUS</span>
            <span className="font-serif text-sm leading-none group-hover:translate-x-0.5 transition-transform">→</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#183B56] hover:bg-[#F7FBFD] border border-[#DDE9EF] rounded-[2px] text-xs font-mono"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#DDE9EF] px-6 py-4 space-y-3 font-mono text-xs shadow-md">
          <button
            type="button"
            onClick={() => {
              if (onHomeClick) onHomeClick();
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="block w-full text-left py-1 text-[#183B56]"
          >
            § HOME
          </button>
          <button
            type="button"
            onClick={() => {
              if (onExploreClick) onExploreClick();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1 text-[#183B56]"
          >
            § EXPLORE RESEARCH
          </button>
          <a
            href="#methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left py-1 text-[#667786] hover:text-[#183B56]"
          >
            § METHODOLOGY
          </a>
          <button
            type="button"
            onClick={() => {
              if (onViewSavedClick) onViewSavedClick();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between w-full text-left py-1 text-[#183B56]"
          >
            <span>§ SAVED PAPERS</span>
            <span className="px-2 py-0.5 bg-[#EAF7FC] border border-[#9DDCF5] rounded-full text-[10px]">
              {savedCount}
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}
