import React from 'react'
import { SearchFilters } from '../types/movie'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  filters?: SearchFilters
  onFiltersChange?: (f: SearchFilters) => void
  isLoading: boolean
  onQuickSearch: (term: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  isLoading,
  onQuickSearch,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onQuickSearch(query.trim())
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6">
      {/* Theme Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-1.5 sm:p-2.5 border-2 border-[#58BCB3] shadow-md sm:shadow-lg shadow-teal-900/5 flex items-center gap-2 sm:gap-3 transition-all focus-within:ring-4 focus-within:ring-teal-100"
      >
        <div className="pl-2.5 sm:pl-3 text-[#58BCB3] flex items-center shrink-0">
          {isLoading ? (
            <i className="fas fa-circle-notch fa-spin text-lg sm:text-xl"></i>
          ) : (
            <i className="fas fa-search text-base sm:text-xl"></i>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search movies, TV series"
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base md:text-lg font-normal py-1 min-w-0"
          style={{ fontFamily: 'var(--body-font)' }}
        />

        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition shrink-0 cursor-pointer"
            title="Clear search"
          >
            <i className="fas fa-times text-xs sm:text-sm"></i>
          </button>
        )}

        <button
          type="submit"
          className="bg-[#58BCB3] hover:bg-[#439d95] text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-base transition tracking-wide flex items-center gap-1.5 sm:gap-2 shrink-0 shadow-2xs active:scale-95 cursor-pointer"
          style={{ fontFamily: 'var(--heading-font)' }}
        >
          <span>SEARCH</span>
          <i className="fas fa-arrow-right text-[10px] sm:text-xs"></i>
        </button>
      </form>
    </div>
  )
}
