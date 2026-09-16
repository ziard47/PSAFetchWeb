import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ThemeProvider,
  CssBaseline,
} from '@mui/material'
import { artBlogMuiTheme } from './theme'
import { Navbar } from './components/Navbar'
import { ThemeHeroSlider } from './components/ThemeHeroSlider'
import { SearchBar } from './components/SearchBar'
import { MovieCard } from './components/MovieCard'
import { ThemeSidebar } from './components/ThemeSidebar'
import { ThemeFooter } from './components/ThemeFooter'
import { MovieDetailsPage } from './components/MovieDetailsPage'
import { WatchlistDrawer } from './components/WatchlistDrawer'
import { LatestReleasesGrid } from './components/LatestReleasesGrid'
import { ExtensionModal } from './components/ExtensionModal'
import { FloatingExtensionButton } from './components/FloatingExtensionButton'
import { AgeWarningModal } from './components/AgeWarningModal'
import {
  searchMovies,
  getMovieDetails,
  fetchLatestReleases,
  fetchMoviesByGenre,
  getSearchCollectionTitle,
} from './services/movieApi'
import { MovieDetails, MovieSummary, SearchFilters, WatchlistItem } from './types/movie'
import { enable as enableDarkReader, disable as disableDarkReader, setFetchMethod } from 'darkreader'

const WATCHLIST_STORAGE_KEY = 'psa_fetch_watchlist_v1'
const THEME_MODE_STORAGE_KEY = 'psa_fetch_theme_mode_v1'

function isAdultCategory(termOrGenre?: string | null): boolean {
  if (!termOrGenre) return false
  const clean = termOrGenre.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  return clean === 'adult' || clean === '18' || clean === 'xxx' || clean === 'porn' || clean === 'erotic' || clean === 'erotica'
}

function extractMovieIdFromUrl(): string | null {
  try {
    // Check pathname: /movie/tt1234567, /movie tt1234567, /movie-tt1234567 or /tt1234567
    const pathname = decodeURIComponent(window.location.pathname)

    // Format 1: /movie/id or /movie id or /movie-id
    const moviePrefixMatch = pathname.match(/^\/movie(?:[\/\s_]+([a-zA-Z0-9_-]+))?$/i)
    if (moviePrefixMatch && moviePrefixMatch[1]) {
      return moviePrefixMatch[1].trim()
    }

    // Format 2: /tt1234567 or other alphanumeric IDs directly
    const directIdMatch = pathname.match(/^\/(tt\d+|tvmaze-\d+|[a-zA-Z0-9_-]{5,})$/i)
    if (directIdMatch && directIdMatch[1]) {
      return directIdMatch[1].trim()
    }

    // Format 3: Hash support #/movie/id or #id
    const hash = decodeURIComponent(window.location.hash)
    const hashMatch = hash.match(/^#\/?(?:movie[\/\s_]*)?([a-zA-Z0-9_-]+)/i)
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1].trim()
    }

    // Format 4: Query parameter ?movie=id or ?id=id
    const params = new URLSearchParams(window.location.search)
    const queryId = params.get('movie') || params.get('id')
    if (queryId) {
      return queryId.trim()
    }
  } catch (e) {
    console.error('Failed to parse URL for movie ID', e)
  }
  return null
}

function extractSearchQueryFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('s') || params.get('search') || params.get('q')
    if (query && query.trim()) {
      return query.trim()
    }
  } catch (e) {
    console.error('Failed to parse URL for search query', e)
  }
  return null
}

function extractGenreFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const genre = params.get('genre')
    if (genre && genre.trim()) {
      return genre.trim()
    }
  } catch (e) {
    console.error('Failed to parse URL for genre', e)
  }
  return null
}

function formatSearchUrl(searchTerm: string): string {
  const encoded = encodeURIComponent(searchTerm).replace(/%20/g, '+')
  return `/?s=${encoded}`
}

export default function App() {
  const [query, setQuery] = useState(() => extractSearchQueryFromUrl() || '')
  const [debouncedQuery, setDebouncedQuery] = useState(() => extractSearchQueryFromUrl() || '')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(() => extractGenreFromUrl())
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    page: 1,
  })

  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Featured Movie for Hero Slider
  const [featuredMovie, setFeaturedMovie] = useState<MovieSummary | null>(null)

  // Full-Page Selected Movie State
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null)
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<MovieDetails | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Watchlist State (stored in localStorage)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false)
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false)

  // Dark Mode State powered by DarkReader
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY)
      if (saved) return saved === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  // Age Warning Modal State (Prompts every time Adult genre is opened)
  const [isAdultUnlocked, setIsAdultUnlocked] = useState<boolean>(false)
  const [isAgeWarningOpen, setIsAgeWarningOpen] = useState(false)
  const [pendingGenre, setPendingGenre] = useState<string | null>(null)

  // Check URL parameters on mount for adult category
  useEffect(() => {
    if ((isAdultCategory(selectedGenre) || isAdultCategory(debouncedQuery)) && !isAdultUnlocked) {
      setIsAgeWarningOpen(true)
    }
  }, [isAdultUnlocked, selectedGenre, debouncedQuery])

  // Synchronize DarkReader with isDarkMode
  useEffect(() => {
    try {
      setFetchMethod(window.fetch)
      if (isDarkMode) {
        enableDarkReader({
          brightness: 100,
          contrast: 95,
          sepia: 0,
        })
        localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark')
      } else {
        disableDarkReader()
        localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')
      }
    } catch (e) {
      console.error('Failed to toggle DarkReader', e)
    }
  }, [isDarkMode])

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  // Load movie by ID helper (used for direct URL navigation)
  const loadMovieById = useCallback(async (id: string, updateHistory = false) => {
    setSelectedMovieId(id)
    setIsDetailsLoading(true)
    setSelectedMovieDetails(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (updateHistory) {
      const newPath = `/movie/${encodeURIComponent(id)}`
      if (window.location.pathname !== newPath) {
        window.history.pushState({ movieId: id }, '', newPath)
      }
    }

    const details = await getMovieDetails(id)
    if (details) {
      setSelectedMovieDetails(details)
      if (details.imdbID && details.imdbID.startsWith('tt') && id !== details.imdbID) {
        setSelectedMovieId(details.imdbID)
        const newPath = `/movie/${encodeURIComponent(details.imdbID)}`
        window.history.replaceState({ movieId: details.imdbID }, '', newPath)
      }
    } else {
      setSelectedMovieDetails({
        imdbID: id,
        Title: id,
        Year: 'N/A',
        Rated: 'N/A',
        Released: 'N/A',
        Runtime: 'N/A',
        Genre: 'Feature Film',
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'Information available in main index',
        Plot: 'Detailed synopsis not available.',
        Language: 'English',
        Country: 'USA',
        Awards: 'N/A',
        Poster: 'N/A',
        Ratings: [],
        Metascore: 'N/A',
        imdbRating: 'N/A',
        imdbVotes: 'N/A',
        Type: 'movie',
        Response: 'True',
      })
    }
    setIsDetailsLoading(false)
  }, [])

  // Listen for browser Back/Forward (popstate) and initial page load URL
  useEffect(() => {
    const handlePopState = () => {
      const movieId = extractMovieIdFromUrl()
      if (movieId) {
        loadMovieById(movieId, false)
      } else {
        setSelectedMovieId(null)
        setSelectedMovieDetails(null)
        const s = extractSearchQueryFromUrl()
        const g = extractGenreFromUrl()
        if (s) {
          setSelectedGenre(null)
          setQuery(s)
          setDebouncedQuery(s)
        } else if (g) {
          setQuery('')
          setDebouncedQuery('')
          setSelectedGenre(g)
        } else {
          setQuery('')
          setDebouncedQuery('')
          setSelectedGenre(null)
          setMovies([])
          setTotalResults(0)
        }
      }
    }

    // Initial check on mount
    const initialId = extractMovieIdFromUrl()
    if (initialId) {
      loadMovieById(initialId, false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [loadMovieById])

  // Sync URL with search query or genre
  useEffect(() => {
    if (selectedMovieId) return

    const currentSearch = extractSearchQueryFromUrl()
    const currentGenre = extractGenreFromUrl()

    if (debouncedQuery.trim()) {
      if (currentSearch !== debouncedQuery.trim()) {
        const newUrl = formatSearchUrl(debouncedQuery.trim())
        if (currentSearch !== null) {
          window.history.replaceState({ s: debouncedQuery.trim() }, '', newUrl)
        } else {
          window.history.pushState({ s: debouncedQuery.trim() }, '', newUrl)
        }
      }
    } else if (selectedGenre) {
      if (currentGenre !== selectedGenre) {
        const newUrl = `/?genre=${encodeURIComponent(selectedGenre)}`
        window.history.pushState({ genre: selectedGenre }, '', newUrl)
      }
    } else {
      if (currentSearch !== null || currentGenre !== null || (window.location.pathname !== '/' && !window.location.pathname.startsWith('/movie'))) {
        window.history.replaceState({}, '', '/')
      }
    }
  }, [debouncedQuery, selectedGenre, selectedMovieId])

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (val.trim()) {
      setSelectedGenre(null)
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(val)
      setFilters((prev) => ({ ...prev, page: 1 }))
    }, 350)
  }

  const handleConfirmAge = () => {
    setIsAdultUnlocked(true)
    setIsAgeWarningOpen(false)
    const target = pendingGenre || 'Adult'
    setPendingGenre(null)
    setSelectedGenre(target)
    window.history.pushState({ genre: target }, '', `/?genre=${encodeURIComponent(target)}`)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleCancelAge = () => {
    setIsAgeWarningOpen(false)
    setPendingGenre(null)
    setIsAdultUnlocked(false)
    if (isAdultCategory(selectedGenre)) {
      setSelectedGenre(null)
      window.history.pushState({}, '', '/')
    }
    if (isAdultCategory(query) || isAdultCategory(debouncedQuery)) {
      setQuery('')
      setDebouncedQuery('')
      window.history.pushState({}, '', '/')
    }
  }

  const handleQuickSearch = (term: string) => {
    const trimmed = term.trim()
    if (isAdultCategory(trimmed)) {
      setIsAdultUnlocked(false)
      setPendingGenre('Adult')
      setIsAgeWarningOpen(true)
      return
    }

    // Navigating to non-adult search locks adult state
    setIsAdultUnlocked(false)

    if (selectedMovieId) {
      setSelectedMovieId(null)
      setSelectedMovieDetails(null)
    }
    setSelectedGenre(null)
    setQuery(trimmed)
    setDebouncedQuery(trimmed)
    setFilters((prev) => ({ ...prev, page: 1 }))
    if (trimmed) {
      const newUrl = formatSearchUrl(trimmed)
      if (window.location.search !== `?s=${encodeURIComponent(trimmed).replace(/%20/g, '+')}` || window.location.pathname !== '/') {
        window.history.pushState({ s: trimmed }, '', newUrl)
      }
    } else {
      window.history.pushState({}, '', '/')
    }
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleSelectGenre = (genre: string) => {
    if (isAdultCategory(genre)) {
      // If clicking to deselect active adult genre
      if (selectedGenre && isAdultCategory(selectedGenre)) {
        setIsAdultUnlocked(false)
        setSelectedGenre(null)
        window.history.pushState({}, '', '/')
        return
      }
      // Opening adult genre: Always prompt every time
      setIsAdultUnlocked(false)
      setPendingGenre(genre)
      setIsAgeWarningOpen(true)
      return
    }

    // Navigating to other genre locks adult state
    setIsAdultUnlocked(false)

    if (selectedMovieId) {
      setSelectedMovieId(null)
      setSelectedMovieDetails(null)
    }
    setQuery('')
    setDebouncedQuery('')
    setSelectedGenre((prev) => {
      const next = prev === genre ? null : genre
      if (next) {
        window.history.pushState({ genre: next }, '', `/?genre=${encodeURIComponent(next)}`)
      } else {
        window.history.pushState({}, '', '/')
      }
      return next
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleResetSearch = () => {
    setIsAdultUnlocked(false)
    if (selectedMovieId || window.location.pathname !== '/' || window.location.search !== '') {
      window.history.pushState({}, '', '/')
    }
    setSelectedMovieId(null)
    setSelectedMovieDetails(null)
    setSelectedGenre(null)
    setQuery('')
    setDebouncedQuery('')
    setMovies([])
    setTotalResults(0)
    setErrorMessage(null)
    setFilters({ type: '', page: 1 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Save watchlist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e)
    }
  }, [watchlist])

  // Fetch Movies when query, selectedGenre, or filters change
  useEffect(() => {
    if (!selectedGenre && !debouncedQuery.trim()) {
      setMovies([])
      setTotalResults(0)
      setErrorMessage(null)
      return
    }

    // If attempting to load adult category while unverified, block load until confirmed
    if ((isAdultCategory(selectedGenre) || isAdultCategory(debouncedQuery)) && !isAdultUnlocked) {
      setMovies([])
      setTotalResults(0)
      setIsLoading(false)
      return
    }

    let isSubscribed = true
    const doSearch = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      let result
      if (selectedGenre) {
        result = await fetchMoviesByGenre(selectedGenre, filters.type)
      } else {
        result = await searchMovies(debouncedQuery, { ...filters, page: 1 })
      }

      if (!isSubscribed) return

      if (result.error) {
        setErrorMessage(result.error)
        setMovies([])
        setTotalResults(0)
      } else {
        setMovies(result.movies)
        setTotalResults(result.totalResults)
      }
      setIsLoading(false)
    }

    doSearch()

    return () => {
      isSubscribed = false
    }
  }, [selectedGenre, debouncedQuery, filters.type, isAdultUnlocked])

  // Load More Pages (for query searches)
  const handleLoadMore = async () => {
    if (selectedGenre) return
    const nextPage = filters.page + 1
    setIsLoadingMore(true)

    const result = await searchMovies(debouncedQuery, { ...filters, page: nextPage })
    if (result.movies.length > 0) {
      setMovies((prev) => [...prev, ...result.movies])
      setFilters((prev) => ({ ...prev, page: nextPage }))
    }
    setIsLoadingMore(false)
  }

  // Navigate to Full Page Details
  const handleSelectMovie = useCallback((summary: MovieSummary) => {
    loadMovieById(summary.imdbID, true)
  }, [loadMovieById])

  // Random Movie Handler
  const handleRandomMovie = useCallback(async () => {
    setIsDetailsLoading(true)
    const list = await fetchLatestReleases()
    if (list.length > 0) {
      const randomItem = list[Math.floor(Math.random() * list.length)]
      handleSelectMovie(randomItem)
    }
  }, [handleSelectMovie])

  const handleBackToSearch = () => {
    if (debouncedQuery.trim()) {
      window.history.pushState({ s: debouncedQuery.trim() }, '', formatSearchUrl(debouncedQuery.trim()))
    } else if (selectedGenre) {
      window.history.pushState({ genre: selectedGenre }, '', `/?genre=${encodeURIComponent(selectedGenre)}`)
    } else {
      window.history.pushState({}, '', '/')
    }
    setSelectedMovieId(null)
    setSelectedMovieDetails(null)
  }

  // Bookmark toggling
  const handleToggleBookmark = (e: React.MouseEvent | null, movie: MovieSummary) => {
    if (e) e.stopPropagation()
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.imdbID === movie.imdbID)
      if (exists) {
        return prev.filter((item) => item.imdbID !== movie.imdbID)
      } else {
        return [
          {
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Type: movie.Type,
            Poster: movie.Poster,
            addedAt: Date.now(),
          },
          ...prev,
        ]
      }
    })
  }

  const handleRemoveWatchlistItem = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.imdbID !== id))
  }

  const handleClearWatchlist = () => {
    setWatchlist([])
  }

  const isCurrentMovieBookmarked = (id: string) => watchlist.some((item) => item.imdbID === id)

  const hasMore = !selectedGenre && movies.length < totalResults

  return (
    <ThemeProvider theme={artBlogMuiTheme}>
      <CssBaseline />

      {/* Main Page Canvas */}
      <div className="min-h-screen bg-[#f7faf9] text-slate-800 flex flex-col">
        {/* WordPress Header (header.php) */}
        <Navbar
          watchlistCount={watchlist.length}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          onResetSearch={handleResetSearch}
          onRandomMovie={handleRandomMovie}
          onQuickSearch={handleQuickSearch}
          onSelectType={(type) => setFilters((prev) => ({ ...prev, type: type as any, page: 1 }))}
          activeType={filters.type}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        />

        {/* Main Body Container */}
        <div className="artblog-container flex-1 w-full pt-4">
          {selectedMovieId ? (
            /* Single Post Movie Details View (single.php) */
            <div className="my-6">
              <MovieDetailsPage
                movie={selectedMovieDetails}
                loading={isDetailsLoading}
                onBack={handleBackToSearch}
                isBookmarked={isCurrentMovieBookmarked(selectedMovieId)}
                onToggleBookmark={(movie) => handleToggleBookmark(null, movie)}
                onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
              />
            </div>
          ) : (
            /* Home / Blog Archive View (revolution-home.php & index.php) */
            <>
              {/* Hero Slider Feature (Only on home when not searching or filtering genre) */}
              {!debouncedQuery && !selectedGenre && (
                <ThemeHeroSlider
                  featuredMovie={featuredMovie}
                  onSelectMovie={handleSelectMovie}
                  onExploreClick={() => {
                    const el = document.getElementById('search-input-area')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                />
              )}

              {/* Central Search Controls */}
              <div id="search-input-area" className="my-6">
                <SearchBar
                  query={query}
                  onQueryChange={handleQueryChange}
                  isLoading={isLoading}
                  onQuickSearch={handleQuickSearch}
                />
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <i className="fas fa-exclamation-circle text-red-500"></i>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 2-Column WordPress Layout: Main Feed + Sidebar */}
              <div className="main-wrapper">
                {/* Main Content Column (main#primary.lay-width) */}
                <main id="primary" className="site-main lay-width">
                  {movies.length > 0 ? (
                    <div>
                      {/* Search Results / Genre Header */}
                      <div className="flex flex-wrap items-center justify-between mb-6 pb-2 border-b border-slate-200 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className="text-xl sm:text-2xl font-normal tracking-wide text-slate-800 m-0 uppercase"
                            style={{ fontFamily: 'var(--heading-font)' }}
                          >
                            {selectedGenre
                              ? `${selectedGenre.toUpperCase()} TITLES (${totalResults})`
                              : getSearchCollectionTitle(debouncedQuery)
                              ? `${getSearchCollectionTitle(debouncedQuery)} (${totalResults})`
                              : `Found ${totalResults} ${totalResults === 1 ? 'Result' : 'Results'} for "${debouncedQuery}"`}
                          </h2>
                          {selectedGenre && (
                            <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Genre
                            </span>
                          )}
                          {!selectedGenre && getSearchCollectionTitle(debouncedQuery) && (
                            <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                              <i className="fas fa-sparkles text-[10px]"></i> Curated Universe
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleResetSearch}
                          className="text-xs font-semibold text-[#58BCB3] hover:underline cursor-pointer"
                        >
                          {selectedGenre ? 'Clear Genre Filter' : 'Clear Results'}
                        </button>
                      </div>

                      {/* Adult 18+ Notice Banner */}
                      {selectedGenre?.toLowerCase() === 'adult' && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 shadow-2xs animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              18+
                            </div>
                            <div>
                              <h4 className="text-sm font-bold m-0 text-rose-950" style={{ fontFamily: 'var(--heading-font)' }}>
                                Mature &amp; Adult Content (18+)
                              </h4>
                              <p className="text-xs text-rose-700 m-0">
                                You have confirmed you are 18 or older. Titles indexed in this catalog are restricted to adult audiences.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetSearch}
                            className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-rose-300 transition shrink-0 self-start sm:self-auto cursor-pointer"
                          >
                            Exit Adult Section
                          </button>
                        </div>
                      )}

                      {/* Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {movies.map((movie) => (
                          <MovieCard
                            key={movie.imdbID}
                            movie={movie}
                            isBookmarked={isCurrentMovieBookmarked(movie.imdbID)}
                            onToggleBookmark={handleToggleBookmark}
                            onSelectMovie={() => handleSelectMovie(movie)}
                          />
                        ))}
                      </div>

                      {/* Load More Button (only for query search) */}
                      {hasMore && (
                        <div className="flex justify-center mt-10 mb-4">
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="bg-[#58BCB3] hover:bg-[#439d95] text-white px-8 py-3 rounded-full font-medium tracking-wide flex items-center gap-2 shadow-md transition disabled:opacity-50"
                            style={{ fontFamily: 'var(--heading-font)' }}
                          >
                            {isLoadingMore ? (
                              <>
                                <i className="fas fa-circle-notch fa-spin text-sm"></i>
                                <span>Loading More...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-chevron-down text-xs"></i>
                                <span>Load More ({movies.length} of {totalResults})</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : !isLoading && !errorMessage ? (
                    /* Latest Movie & Series Releases Grid on Initial Home */
                    <LatestReleasesGrid
                      filterType={filters.type}
                      onSelectMovie={handleSelectMovie}
                      isBookmarked={isCurrentMovieBookmarked}
                      onToggleBookmark={handleToggleBookmark}
                      onFeaturedMovieLoaded={(movie) => {
                        if (!featuredMovie) setFeaturedMovie(movie)
                      }}
                    />
                  ) : null}
                </main>

                {/* Sidebar Column (aside#secondary.sidebar-width) */}
                <ThemeSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onQuickSearch={handleQuickSearch}
                  watchlist={watchlist}
                  onOpenWatchlist={() => setIsWatchlistOpen(true)}
                  onSelectMovieId={(id) => {
                    loadMovieById(id, true)
                  }}
                  selectedGenre={selectedGenre}
                  onSelectGenre={handleSelectGenre}
                  onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
                />
              </div>
            </>
          )}
        </div>

        {/* WordPress Theme Footer (footer.php) */}
        <ThemeFooter
          onQuickSearch={handleQuickSearch}
          onResetSearch={handleResetSearch}
          onSelectGenre={handleSelectGenre}
          onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        />

        {/* Watchlist Slide-out Drawer */}
        <WatchlistDrawer
          open={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          watchlist={watchlist}
          onRemoveItem={handleRemoveWatchlistItem}
          onClearAll={handleClearWatchlist}
          onSelectMovie={handleSelectMovie}
        />

        {/* Browser Extension Download Modal */}
        <ExtensionModal
          open={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
        />

        {/* Age Warning (18+) Modal */}
        <AgeWarningModal
          open={isAgeWarningOpen}
          onConfirm={handleConfirmAge}
          onCancel={handleCancelAge}
        />

        {/* Floating Extension Action Button (Bottom Right) */}
        <FloatingExtensionButton
          onOpen={() => setIsExtensionModalOpen(true)}
        />
      </div>
    </ThemeProvider>
  )
}
