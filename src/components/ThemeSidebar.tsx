import React from 'react'
import { SearchFilters, WatchlistItem } from '../types/movie'

interface ThemeSidebarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onQuickSearch: (term: string) => void
  watchlist: WatchlistItem[]
  onOpenWatchlist: () => void
  onSelectMovieId?: (imdbID: string) => void
  selectedGenre?: string | null
  onSelectGenre?: (genre: string) => void
}

const POPULAR_GENRES = [
  'Action',
  'Sci-Fi',
  'Drama',
  'Thriller',
  'Comedy',
  'Animation',
  'Crime',
  'Mystery',
  'Adventure',
  'Horror',
  'Fantasy',
  'Romance',
]

export const ThemeSidebar: React.FC<ThemeSidebarProps> = ({
  filters,
  onFiltersChange,
  watchlist,
  onOpenWatchlist,
  onSelectMovieId,
  selectedGenre,
  onSelectGenre,
}) => {
  const handleTypeSelect = (type: SearchFilters['type']) => {
    onFiltersChange({
      ...filters,
      type: filters.type === type ? '' : type,
      page: 1,
    })
  }

  return (
    <aside id="secondary" className="site-sidebar sidebar-width">
      {/* Widget 1: Format & Type Filters */}
      <div className="widget widget_categories">
        <h2 className="widget-title">
          <i className="fas fa-filter text-[#58BCB3] text-sm"></i>
          <span>Filter</span>
        </h2>
        <div className="filter-type-list">
          <div
            className={`filter-type-item ${filters.type === '' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('')}
          >
            <span>All</span>
          </div>
          <div
            className={`filter-type-item ${filters.type === 'movie' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('movie')}
          >
            <span>Movies</span>
          </div>
          <div
            className={`filter-type-item ${filters.type === 'series' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('series')}
          >
            <span>TV Shows</span>
          </div>
        </div>
      </div>

      {/* Widget 2: Genre Tag Cloud */}
      <div className="widget widget_tag_cloud">
        <h2 className="widget-title">
          <i className="fas fa-tags text-[#58BCB3] text-sm"></i>
          <span>Popular Genres</span>
        </h2>
        <div className="tagcloud">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`tag-link ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => onSelectGenre?.(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Widget 3: Saved Watchlist Preview */}
      <div className="widget widget_recent_entries">
        <h2 className="widget-title flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-bookmark text-[#58BCB3] text-sm"></i>
            <span>Your Watchlist</span>
          </div>
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
            {watchlist.length}
          </span>
        </h2>

        {watchlist.length === 0 ? (
          <p className="text-sm text-slate-500 my-2 italic">
            No titles bookmarked yet. Tap the bookmark icon on any title to save it for later.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 mb-3">
            {watchlist.slice(0, 4).map((item) => (
              <div
                key={item.imdbID}
                className="sidebar-mini-movie"
                onClick={() => onSelectMovieId?.(item.imdbID)}
              >
                {item.Poster && item.Poster !== 'N/A' ? (
                  <img src={item.Poster} alt={item.Title} />
                ) : (
                  <div className="w-11 h-14 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                    <i className="fas fa-film"></i>
                  </div>
                )}
                <div className="mini-info flex-1 min-w-0">
                  <h4 className="truncate">{item.Title}</h4>
                  <span>{item.Year} • {item.Type || 'Film'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="btn read-btn mt-2"
          onClick={onOpenWatchlist}
        >
          <span>Open Full Library ({watchlist.length})</span>
          <i className="fas fa-external-link-alt text-xs"></i>
        </button>
      </div>

      {/* Widget 4: About PSA Fetch */}
      <div className="widget widget_text">
        <h2 className="widget-title">
          <i className="fas fa-info-circle text-[#58BCB3] text-sm"></i>
          <span>About PSA Fetch</span>
        </h2>
        <div className="text-sm text-slate-600 leading-relaxed">
          <p className="mb-2">
            PSA Fetch indexes thousands of verified high-efficiency x265/HEVC encodes, providing seamless metadata lookup, IMDb ratings, and direct release sources.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#58BCB3] font-semibold mt-3">
            <i className="fas fa-check-circle"></i>
            <span>100% Free & Curated</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
