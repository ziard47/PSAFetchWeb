import React from 'react'

interface ThemeFooterProps {
  onQuickSearch?: (term: string) => void
  onResetSearch?: () => void
  onSelectGenre?: (genre: string) => void
  onOpenExtensionModal?: () => void
}

export const ThemeFooter: React.FC<ThemeFooterProps> = ({
  onQuickSearch,
  onResetSearch,
  onSelectGenre,
  onOpenExtensionModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="colophon" className="site-footer">
      <section className="footer-top">
        <div className="artblog-container">
          <div className="footer-grid">
            {/* Footer Col 1: About & Info */}
            <div className="footer-col">
              <h2 className="widget-title">PSA FETCH</h2>
              <p className="mb-3">
                Your premier media indexer for cinema, series, and high-efficiency encodes. Featuring verified releases, episode guides, and real-time IMDb data.
              </p>
              <div className="text-sm text-slate-400 space-y-2">
                <p className="m-0">
                  <i className="fas fa-shield-alt text-[#58BCB3] mr-2"></i>
                  Safe, light, and optimized for all devices.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenExtensionModal}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#58BCB3]/20 hover:bg-[#58BCB3] text-[#58BCB3] hover:text-white border border-[#58BCB3]/40 text-xs font-bold transition cursor-pointer"
                  >
                    <i className="fas fa-puzzle-piece"></i>
                    <span>Get PSA Grabber Extension (v2.1.3)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Col 2: Popular Categories / Tags */}
            <div className="footer-col">
              <h2 className="widget-title">DISCOVER GENRES</h2>
              <div className="tagcloud flex flex-wrap gap-2">
                {['Action', 'Sci-Fi', 'Comedy', 'Thriller', 'Animation', 'Horror', 'Drama', 'Adventure', 'Mystery', 'Fantasy'].map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    className="tag-link inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-200 bg-white/10 hover:bg-[#58BCB3] hover:text-white border border-white/15 hover:border-[#58BCB3] transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5"
                    onClick={() => {
                      if (onSelectGenre) {
                        onSelectGenre(genre)
                      } else if (onQuickSearch) {
                        onQuickSearch(genre)
                      }
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Col 3: Quick Links */}
            <div className="footer-col">
              <h2 className="widget-title">QUICK LINKS</h2>
              <ul className="footer-links">
                <li>
                  <button type="button" onClick={onResetSearch}>
                    <i className="fas fa-home text-[#58BCB3]"></i>
                    <span>Home & Latest Releases</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenExtensionModal}>
                    <i className="fas fa-puzzle-piece text-[#58BCB3]"></i>
                    <span>PSA Grabber Browser Extension</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onQuickSearch?.('Marvel')}>
                    <i className="fas fa-film text-[#58BCB3]"></i>
                    <span>Marvel Cinematic Universe</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onQuickSearch?.('Batman')}>
                    <i className="fas fa-mask text-[#58BCB3]"></i>
                    <span>DC & Batman Universe</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onQuickSearch?.('Star Wars')}>
                    <i className="fas fa-jedi text-[#58BCB3]"></i>
                    <span>Star Wars Universe</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={scrollToTop}>
                    <i className="fas fa-arrow-up text-[#58BCB3]"></i>
                    <span>Back to Top</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="artblog-container">
          <div className="flex-row">
            <div className="site-info">
              <span>© {new Date().getFullYear()} PSA Fetch. Designed and Developed by Mohomed Ziard | Voltrex Digital</span>
            </div>

            <div className="social-links">
              <a href="https://github.com/ziard47" target="_blank" rel="noreferrer" title="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <button
                type="button"
                onClick={scrollToTop}
                className="w-9 h-9 rounded-full bg-teal-500/20 text-[#58BCB3] hover:bg-[#58BCB3] hover:text-white flex items-center justify-center transition"
                title="Scroll to Top"
              >
                <i className="fas fa-chevron-up text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
