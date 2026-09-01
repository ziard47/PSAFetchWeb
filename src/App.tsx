import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { liquidGlassTheme } from './theme'
import { Navbar } from './components/Navbar'
import { SearchBar } from './components/SearchBar'
import { MovieCard } from './components/MovieCard'
import { MovieDetailsPage } from './components/MovieDetailsPage'
import { WatchlistDrawer } from './components/WatchlistDrawer'
import { LatestReleasesGrid } from './components/LatestReleasesGrid'
import { searchMovies, getMovieDetails, fetchLatestReleases } from './services/movieApi'
import { MovieDetails, MovieSummary, SearchFilters, WatchlistItem } from './types/movie'

const WATCHLIST_STORAGE_KEY = 'psa_fetch_watchlist_v1'

export default function App() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    page: 1,
  })

  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(val)
      setFilters((prev) => ({ ...prev, page: 1 }))
    }, 350)
  }

  const handleQuickSearch = (term: string) => {
    setSelectedMovieId(null)
    setQuery(term)
    setDebouncedQuery(term)
    setFilters((prev) => ({ ...prev, page: 1 }))
  }

  const handleResetSearch = () => {
    setSelectedMovieId(null)
    setQuery('')
    setDebouncedQuery('')
    setMovies([])
    setTotalResults(0)
    setErrorMessage(null)
    setFilters({ type: '', page: 1 })
  }

  // Save watchlist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e)
    }
  }, [watchlist])

  // Fetch Movies when query or filters change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMovies([])
      setTotalResults(0)
      setErrorMessage(null)
      return
    }

    let isSubscribed = true
    const doSearch = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      const result = await searchMovies(debouncedQuery, { ...filters, page: 1 })
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
  }, [debouncedQuery, filters.type])

  // Load More Pages
  const handleLoadMore = async () => {
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
  const handleSelectMovie = useCallback(async (summary: MovieSummary) => {
    setSelectedMovieId(summary.imdbID)
    setIsDetailsLoading(true)
    setSelectedMovieDetails(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const details = await getMovieDetails(summary.imdbID)
    if (details) {
      setSelectedMovieDetails(details)
    } else {
      // Fallback details
      setSelectedMovieDetails({
        imdbID: summary.imdbID,
        Title: summary.Title,
        Year: summary.Year,
        Rated: 'N/A',
        Released: summary.Year,
        Runtime: 'N/A',
        Genre: 'Feature Film',
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'Cast information available in main listing',
        Plot: 'Detailed synopsis not available.',
        Language: 'English',
        Country: 'USA',
        Awards: 'N/A',
        Poster: summary.Poster,
        Ratings: [],
        Metascore: 'N/A',
        imdbRating: 'N/A',
        imdbVotes: 'N/A',
        Type: summary.Type,
        Response: 'True',
      })
    }
    setIsDetailsLoading(false)
  }, [])

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

  const hasMore = movies.length < totalResults

  return (
    <ThemeProvider theme={liquidGlassTheme}>
      <CssBaseline />

      {/* Main Liquid Canvas Background */}
      <Box className="relative min-h-screen bg-[#030e0a] text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-emerald-950">
        {/* Animated Fluid Liquid Blobs */}
        <Box className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Primary Top Emerald Orb */}
          <Box className="animate-blob-1 absolute -top-40 left-1/4 w-96 h-96 md:w-150 md:h-150 rounded-full bg-emerald-500/20 blur-[130px]" />
          {/* Secondary Teal Orb */}
          <Box className="animate-blob-2 absolute top-1/3 -right-32 w-80 h-80 md:w-125 md:h-125 rounded-full bg-teal-500/20 blur-[140px]" />
          {/* Tertiary Mint Liquid Glow */}
          <Box className="animate-blob-3 absolute -bottom-20 left-1/3 w-80 h-80 md:w-137.5 md:h-137.5 rounded-full bg-emerald-600/15 blur-[120px]" />
          {/* Dark Glass Overlay Grid */}
          <Box
            className="absolute inset-0 opacity-[0.03]"
            sx={{
              backgroundImage: `radial-gradient(rgba(52, 211, 153, 0.4) 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
            }}
          />
        </Box>

        {/* Liquid Glass Header */}
        <Navbar
          watchlistCount={watchlist.length}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          onResetSearch={handleResetSearch}
          onRandomMovie={handleRandomMovie}
        />

        {/* Content Body */}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: { xs: 3, md: 5 }, pb: 10 }}>
          {selectedMovieId ? (
            /* Full-Page Movie / TV Show Details View */
            <MovieDetailsPage
              movie={selectedMovieDetails}
              loading={isDetailsLoading}
              onBack={handleBackToSearch}
              isBookmarked={isCurrentMovieBookmarked(selectedMovieId)}
              onToggleBookmark={(movie) => handleToggleBookmark(null, movie)}
            />
          ) : (
            /* Search & Browse Home View */
            <>
              {/* Hero Banner Section */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                    letterSpacing: '-0.035em',
                    lineHeight: 1.15,
                    background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #34d399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                  }}
                >
                  Discover Cinema with PSA Fetch
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#a7f3d0',
                    maxWidth: '620px',
                    mx: 'auto',
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  Instant search across millions of movies, TV shows, and series with comprehensive ratings, seasons, and episode guides.
                </Typography>
              </Box>

              {/* Search Bar with Glass Controls */}
              <SearchBar
                query={query}
                onQueryChange={handleQueryChange}
                filters={filters}
                onFiltersChange={setFilters}
                isLoading={isLoading}
                onQuickSearch={handleQuickSearch}
              />

              {/* Error Notice */}
              {errorMessage && (
                <Box sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
                  <Alert
                    severity="info"
                    sx={{
                      bgcolor: 'rgba(6, 25, 20, 0.85)',
                      color: '#a7f3d0',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '16px',
                    }}
                  >
                    {errorMessage}
                  </Alert>
                </Box>
              )}

              {/* Results Grid or Latest Releases Home State */}
              {movies.length > 0 ? (
                <Box>
                  {/* Search Results Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ecfdf5' }}>
                      Found {totalResults} {totalResults === 1 ? 'Result' : 'Results'} for "{debouncedQuery}"
                    </Typography>
                  </Box>

                  {/* Movie Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {movies.map((movie) => (
                      <div key={movie.imdbID} className="h-full">
                        <MovieCard
                          movie={movie}
                          isBookmarked={isCurrentMovieBookmarked(movie.imdbID)}
                          onToggleBookmark={handleToggleBookmark}
                          onSelectMovie={() => handleSelectMovie(movie)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                      <Button
                        variant="contained"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        startIcon={isLoadingMore ? <CircularProgress size={18} sx={{ color: '#ffffff' }} /> : <ExpandMoreIcon />}
                        sx={{
                          px: 4,
                          py: 1.4,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '16px',
                        }}
                      >
                        {isLoadingMore ? 'Loading More Movies...' : `Load More (${movies.length} of ${totalResults})`}
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : !isLoading && !errorMessage ? (
                /* Latest Movie & Series Releases Grid on Initial Home */
                <LatestReleasesGrid
                  filterType={filters.type}
                  onSelectMovie={handleSelectMovie}
                  isBookmarked={isCurrentMovieBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                />
              ) : null}
            </>
          )}
        </Container>

        {/* Watchlist Slide-out Drawer */}
        <WatchlistDrawer
          open={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          watchlist={watchlist}
          onRemoveItem={handleRemoveWatchlistItem}
          onClearAll={handleClearWatchlist}
          onSelectMovie={handleSelectMovie}
        />
      </Box>
    </ThemeProvider>
  )
}
