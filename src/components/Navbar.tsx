import React, { useState } from 'react'
import logoImg from '../assets/logo.png'

interface NavbarProps {
  watchlistCount: number
  onOpenWatchlist: () => void
  onResetSearch: () => void
  onRandomMovie: () => void
  onQuickSearch?: (term: string) => void
  onSelectType?: (type: string) => void
  activeType?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  watchlistCount,
  onOpenWatchlist,
  onResetSearch,
  onRandomMovie,
  onQuickSearch,
  onSelectType,
  activeType = '',
}) => {
  const [headerSearchQuery, setHeaderSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (headerSearchQuery.trim() && onQuickSearch) {
      onQuickSearch(headerSearchQuery.trim())
      setIsMobileSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const handleNavClick = (callback: () => void) => {
    callback()
    setIsMobileMenuOpen(false)
  }

  return (
    <header id="masthead" className="site-header sticky top-0 z-50">
      <div className="header-menu-box">
        <div className="artblog-container">
          <div className="flex-row">
            {/* Left Branding */}
            <div className="nav-menu-header-left">
              <div
                className="site-branding cursor-pointer"
                onClick={() => {
                  onResetSearch()
                  setIsMobileMenuOpen(false)
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={logoImg} alt="PSA Fetch Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="site-title text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-slate-900 m-0 leading-none">
                      PSA<span className="brand-accent text-[#58BCB3]">FETCH</span>
                    </h1>
                    <p className="site-description text-[10px] sm:text-xs text-slate-500 m-0 uppercase tracking-widest hidden xs:block">
                      Cinema & Series Discovery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Navigation Menu (Desktop) */}
            <div className="nav-menu-header-center">
              <nav id="site-navigation" className="main-navigation">
                <ul>
                  <li>
                    <button
                      type="button"
                      className={`nav-link-btn ${activeType === '' ? 'active' : ''}`}
                      onClick={onResetSearch}
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`nav-link-btn ${activeType === 'movie' ? 'active' : ''}`}
                      onClick={() => onSelectType?.('movie')}
                    >
                      Movies
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`nav-link-btn ${activeType === 'series' ? 'active' : ''}`}
                      onClick={() => onSelectType?.('series')}
                    >
                      TV Shows
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="nav-link-btn flex items-center gap-1 text-[#58BCB3]"
                      onClick={onRandomMovie}
                    >
                      <i className="fas fa-dice mr-1"></i> Lucky Pick
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Right Quick Search Pill & Watchlist & Mobile Toggles */}
            <div className="nav-menu-header-right">
              {/* Desktop Pill Search Bar */}
              <form onSubmit={handleHeaderSearchSubmit} className="product-search-form">
                <input
                  type="search"
                  placeholder="Search titles..."
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  aria-label="Quick search"
                />
                <button type="submit" className="search-submit-btn" title="Search">
                  <i className="fas fa-search text-xs"></i>
                </button>
              </form>

              {/* Mobile Search Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(!isMobileSearchOpen)
                  if (isMobileMenuOpen) setIsMobileMenuOpen(false)
                }}
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-[#439d95] flex items-center justify-center border border-slate-200/80 transition shadow-2xs"
                title="Search"
                aria-label="Toggle search bar"
              >
                <i className={`fas ${isMobileSearchOpen ? 'fa-times' : 'fa-search'} text-xs`}></i>
              </button>

              {/* Watchlist Badge Pill */}
              <button
                type="button"
                onClick={() => {
                  onOpenWatchlist()
                  setIsMobileMenuOpen(false)
                }}
                className="header-watchlist-btn"
                title="View Watchlist"
              >
                <i className="fas fa-bookmark text-xs sm:text-sm"></i>
                <span className="hidden sm:inline">Saved</span>
                <span className="badge-pill">{watchlistCount}</span>
              </button>

              {/* Mobile Menu Hamburger Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  if (isMobileSearchOpen) setIsMobileSearchOpen(false)
                }}
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-[#439d95] flex items-center justify-center border border-slate-200/80 transition shadow-2xs"
                title="Menu"
                aria-label="Toggle navigation menu"
              >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xs`}></i>
              </button>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-slate-100 animate-fadeIn">
              <form onSubmit={handleHeaderSearchSubmit} className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center bg-slate-100 rounded-full border border-slate-200 px-3 py-1.5 focus-within:border-[#58BCB3] focus-within:bg-white transition">
                  <i className="fas fa-search text-xs text-slate-400 mr-2"></i>
                  <input
                    type="search"
                    placeholder="Search movies, TV shows, actors..."
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                    autoFocus
                  />
                  {headerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHeaderSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#58BCB3] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs active:scale-95 transition"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Expandable Mobile Navigation Panel */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-100 space-y-3 animate-fadeIn">
              {/* Quick Search inside menu */}
              <form onSubmit={handleHeaderSearchSubmit} className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center bg-slate-100 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-[#58BCB3] focus-within:bg-white transition">
                  <i className="fas fa-search text-xs text-slate-400 mr-2"></i>
                  <input
                    type="search"
                    placeholder="Quick search titles..."
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#58BCB3] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  Go
                </button>
              </form>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavClick(onResetSearch)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition ${
                    activeType === ''
                      ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  <i className="fas fa-home text-xs text-[#58BCB3]"></i>
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick(() => onSelectType?.('movie'))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition ${
                    activeType === 'movie'
                      ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  <i className="fas fa-film text-xs text-[#58BCB3]"></i>
                  <span>Movies</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick(() => onSelectType?.('series'))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition ${
                    activeType === 'series'
                      ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  <i className="fas fa-tv text-xs text-[#58BCB3]"></i>
                  <span>TV Shows</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick(onRandomMovie)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 shadow-2xs transition"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  <i className="fas fa-dice text-xs text-amber-600"></i>
                  <span>Lucky Pick</span>
                </button>
              </div>

              {/* Watchlist Shortcut */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleNavClick(onOpenWatchlist)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80 text-teal-900 text-xs font-bold"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-bookmark text-[#58BCB3]"></i>
                    <span>Saved Watchlist</span>
                  </div>
                  <span className="bg-[#58BCB3] text-white px-2 py-0.5 rounded-md text-[11px]">
                    {watchlistCount} {watchlistCount === 1 ? 'item' : 'items'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
