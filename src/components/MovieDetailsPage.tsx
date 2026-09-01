import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ShareIcon from '@mui/icons-material/Share'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import LanguageIcon from '@mui/icons-material/Language'
import PersonIcon from '@mui/icons-material/Person'
import MovieIcon from '@mui/icons-material/Movie'
import TvIcon from '@mui/icons-material/Tv'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { MovieDetails, MovieSummary, SeasonData, EpisodeSummary } from '../types/movie'
import { getSeasonEpisodes, getMovieDetails } from '../services/movieApi'
import { PsaDownloadsSection } from './PsaDownloadsSection'

interface MovieDetailsPageProps {
  movie: MovieDetails | null
  loading: boolean
  onBack: () => void
  isBookmarked: boolean
  onToggleBookmark: (movie: MovieSummary) => void
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({
  movie,
  loading,
  onBack,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [posterError, setPosterError] = useState(false)

  // Reset poster error when movie changes
  useEffect(() => {
    setPosterError(false)
  }, [movie?.imdbID])

  // TV Seasons & Episodes State
  const isSeries = movie?.Type?.toLowerCase() === 'series' || (movie?.totalSeasons && parseInt(movie.totalSeasons, 10) > 0)
  const totalSeasonsCount = parseInt(movie?.totalSeasons || '1', 10) || 1
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
  const [isSeasonLoading, setIsSeasonLoading] = useState(false)

  // Episode Details Modal state
  const [selectedEpisode, setSelectedEpisode] = useState<MovieDetails | null>(null)
  const [isEpisodeLoading, setIsEpisodeLoading] = useState(false)
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false)

  // Fetch season episodes when selected season changes
  useEffect(() => {
    if (!isSeries || !movie?.imdbID) return

    let isSubscribed = true
    const fetchSeason = async () => {
      setIsSeasonLoading(true)
      const data = await getSeasonEpisodes(movie.imdbID, selectedSeason)
      if (isSubscribed) {
        setSeasonData(data)
        setIsSeasonLoading(false)
      }
    }

    fetchSeason()
    return () => {
      isSubscribed = false
    }
  }, [movie?.imdbID, isSeries, selectedSeason])

  // Open individual episode details
  const handleOpenEpisodeDetails = async (ep: EpisodeSummary) => {
    setIsEpisodeModalOpen(true)
    setIsEpisodeLoading(true)
    setSelectedEpisode(null)

    const details = await getMovieDetails(ep.imdbID)
    if (details) {
      setSelectedEpisode(details)
    } else {
      setSelectedEpisode({
        imdbID: ep.imdbID,
        Title: ep.Title,
        Year: ep.Released?.slice(0, 4) || 'N/A',
        Rated: 'N/A',
        Released: ep.Released,
        Runtime: 'N/A',
        Genre: movie?.Genre || 'N/A',
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'N/A',
        Plot: 'Details could not be fetched for this episode.',
        Language: 'N/A',
        Country: 'N/A',
        Awards: 'N/A',
        Poster: movie?.Poster || '',
        Ratings: [],
        Metascore: 'N/A',
        imdbRating: ep.imdbRating,
        imdbVotes: 'N/A',
        Type: 'episode',
        Season: selectedSeason.toString(),
        Episode: ep.Episode,
        Response: 'False',
      })
    }
    setIsEpisodeLoading(false)
  }

  const handleShare = () => {
    if (!movie) return
    const text = `Check out ${movie.Title} (${movie.Year}) on PSA Fetch!\nIMDb Rating: ${movie.imdbRating}/10\nPlot: ${movie.Plot}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setSnackbarMessage('Movie details copied to clipboard!')
      setSnackbarOpen(true)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', py: 12 }}>
        <CircularProgress size={56} sx={{ color: '#34d399', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#a7f3d0', fontWeight: 600 }}>
          Fetching Full Movie & Cast Details...
        </Typography>
      </Box>
    )
  }

  if (!movie) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f87171', mb: 3 }}>
          Could not load details for this title.
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to Search
        </Button>
      </Box>
    )
  }

  // Parse Ratings
  const rottenTomatoes = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value
  const metacritic =
    movie.Ratings?.find((r) => r.Source === 'Metacritic')?.Value ||
    (movie.Metascore && movie.Metascore !== 'N/A' ? `${movie.Metascore}/100` : null)

  const genres = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(',').map((g) => g.trim()) : []
  const actors = movie.Actors && movie.Actors !== 'N/A' ? movie.Actors.split(',').map((a) => a.trim()) : []

  return (
    <Box className="animate-fadeIn" sx={{ pb: 8 }}>
      {/* Top Back Navigation Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2.5, sm: 4 }, gap: 1 }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          sx={{
            color: '#ecfdf5',
            bgcolor: 'rgba(6, 25, 20, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '12px',
            px: { xs: 1.6, sm: 2.5 },
            py: { xs: 0.8, sm: 1 },
            fontWeight: 600,
            fontSize: { xs: '0.82rem', sm: '0.9rem' },
            whiteSpace: 'nowrap',
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.22)',
              borderColor: '#34d399',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
              transform: 'translateX(-3px)',
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back to Search</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Back</Box>
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Button
            variant="contained"
            startIcon={isBookmarked ? <BookmarkIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <BookmarkBorderIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            onClick={() => onToggleBookmark(movie)}
            sx={{
              bgcolor: isBookmarked ? 'rgba(16, 185, 129, 0.4)' : undefined,
              borderColor: 'rgba(52, 211, 153, 0.4)',
              borderRadius: '12px',
              px: { xs: 1.6, sm: 2.5 },
              py: { xs: 0.8, sm: 1 },
              fontSize: { xs: '0.82rem', sm: '0.88rem' },
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {isBookmarked ? 'Saved to Watchlist' : 'Add to Watchlist'}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {isBookmarked ? 'Saved' : 'Watchlist'}
            </Box>
          </Button>

          <Button
            variant="outlined"
            onClick={handleShare}
            sx={{
              minWidth: { xs: '38px', sm: '46px' },
              p: { xs: 0.8, sm: 1.1 },
              borderColor: 'rgba(52, 211, 153, 0.35)',
              color: '#34d399',
              borderRadius: '12px',
            }}
          >
            <ShareIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Button>
        </Box>
      </Box>

      {/* Main Glass Hero Card */}
      <Box
        className="liquid-glass rounded-3xl p-4 sm:p-7 md:p-10 mb-6 sm:mb-8"
        sx={{
          border: '1.5px solid rgba(52, 211, 153, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.2)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left: Poster */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center">
            <Box className="relative group max-w-50 sm:max-w-65 md:max-w-none w-full">
              {/* Glowing Aura */}
              <Box className="absolute -inset-1.5 rounded-3xl bg-linear-to-r from-emerald-500 to-teal-400 opacity-40 blur-2xl group-hover:opacity-75 transition duration-500" />

              <Box className="relative overflow-hidden rounded-2xl border border-emerald-500/40 shadow-2xl bg-emerald-950/70 aspect-2/3 w-full">
                {movie.Poster && movie.Poster !== 'N/A' && !posterError ? (
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setPosterError(true)}
                  />
                ) : (
                  <Box className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    {isSeries ? (
                      <TvIcon sx={{ fontSize: { xs: 48, md: 72 }, color: '#34d399', opacity: 0.6, mb: 1 }} />
                    ) : (
                      <MovieIcon sx={{ fontSize: { xs: 48, md: 72 }, color: '#34d399', opacity: 0.6, mb: 1 }} />
                    )}
                    <Typography variant="body2" sx={{ color: '#a7f3d0' }}>
                      No Poster Available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </div>

          {/* Right: Header Details */}
          <div className="md:col-span-8 lg:col-span-9">
            <Box>
              {/* Title */}
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.65rem', sm: '2.4rem', md: '3.2rem' },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 60%, #6ee7b7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                {movie.Title}
              </Typography>

              {/* Badges Bar */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: { xs: 2, sm: 3 } }}>
                {movie.Rated && movie.Rated !== 'N/A' && (
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs font-bold bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 shadow-md">
                    {movie.Rated}
                  </span>
                )}

                {movie.Year && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a7f3d0', fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#34d399' }} />
                    <span>{movie.Released !== 'N/A' ? movie.Released : movie.Year}</span>
                  </Box>
                )}

                {movie.Runtime && movie.Runtime !== 'N/A' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a7f3d0', fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
                    <AccessTimeIcon sx={{ fontSize: 17, color: '#34d399' }} />
                    <span>{movie.Runtime}</span>
                  </Box>
                )}

                {movie.Type && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs uppercase tracking-wider font-bold bg-teal-900/60 border border-teal-500/40 text-teal-200">
                    {movie.Type}
                  </span>
                )}

                {isSeries && movie.totalSeasons && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold bg-emerald-950/90 border border-emerald-500/50 text-emerald-300">
                    {movie.totalSeasons} {parseInt(movie.totalSeasons, 10) === 1 ? 'Season' : 'Seasons'}
                  </span>
                )}
              </Box>

              {/* Ratings Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: { xs: 1.2, sm: 2 },
                  mb: { xs: 2.5, sm: 3.5 },
                }}
              >
                {/* IMDb Rating */}
                {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                  <Box
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, mb: 0.3 }}>
                      <StarIcon sx={{ color: '#fbbf24', fontSize: { xs: 18, sm: 22 } }} />
                      <Typography component="div" sx={{ fontWeight: 800, color: '#fef3c7', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                        {movie.imdbRating}
                        <Typography component="span" sx={{ fontSize: '0.75rem', color: '#a7f3d0' }}>/10</Typography>
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontSize: '0.7rem', display: 'block' }}>
                      IMDb ({movie.imdbVotes !== 'N/A' ? movie.imdbVotes : 'Votes'})
                    </Typography>
                  </Box>
                )}

                {/* Rotten Tomatoes */}
                {rottenTomatoes && (
                  <Box
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '16px',
                      background: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(248, 113, 113, 0.35)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: '#fecaca', fontSize: { xs: '1rem', sm: '1.2rem' }, mb: 0.3 }}>
                      🍅 {rottenTomatoes}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#fca5a5', fontSize: '0.7rem', display: 'block' }}>
                      Rotten Tomatoes
                    </Typography>
                  </Box>
                )}

                {/* Metacritic */}
                {metacritic && (
                  <Box
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '16px',
                      background: 'rgba(59, 130, 246, 0.14)',
                      border: '1px solid rgba(96, 165, 250, 0.35)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: '#bfdbfe', fontSize: { xs: '1rem', sm: '1.2rem' }, mb: 0.3 }}>
                      {metacritic}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#93c5fd', fontSize: '0.7rem', display: 'block' }}>
                      Metascore
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Genres */}
              {genres.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: { xs: 2, sm: 3 } }}>
                  {genres.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: 0.8,
                        bgcolor: 'rgba(16, 185, 129, 0.18)',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        color: '#ecfdf5',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.85rem' },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Plot Summary */}
              <Box
                sx={{
                  p: { xs: 2.2, sm: 3 },
                  borderRadius: '18px',
                  background: 'rgba(6, 25, 20, 0.8)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#34d399', fontWeight: 700, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Plot Synopsis
                </Typography>
                <Typography variant="body2" sx={{ color: '#ecfdf5', lineHeight: 1.65, fontSize: { xs: '0.9rem', sm: '0.98rem' } }}>
                  {movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No detailed plot summary available for this title.'}
                </Typography>
              </Box>
            </Box>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <Divider sx={{ my: 4, borderColor: 'rgba(52, 211, 153, 0.2)' }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Director */}
          {movie.Director && movie.Director !== 'N/A' && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Director
              </Typography>
              <Typography variant="body2" sx={{ color: '#f0fdf4', fontWeight: 600, fontSize: '0.95rem' }}>
                {movie.Director}
              </Typography>
            </Box>
          )}

          {/* Writers */}
          {movie.Writer && movie.Writer !== 'N/A' && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Writers
              </Typography>
              <Typography variant="body2" sx={{ color: '#f0fdf4', fontWeight: 500, fontSize: '0.95rem' }}>
                {movie.Writer}
              </Typography>
            </Box>
          )}

          {/* Awards */}
          {movie.Awards && movie.Awards !== 'N/A' && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                <EmojiEventsIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                  Awards
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#f0fdf4', fontSize: '0.9rem' }}>
                {movie.Awards}
              </Typography>
            </Box>
          )}

          {/* Box Office */}
          {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                <MonetizationOnIcon sx={{ color: '#34d399', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                  Box Office
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 700, fontSize: '1rem' }}>
                {movie.BoxOffice}
              </Typography>
            </Box>
          )}

          {/* Language & Origin */}
          {(movie.Language || movie.Country) && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                <LanguageIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                  Language & Origin
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#f0fdf4', fontSize: '0.9rem' }}>
                {movie.Language !== 'N/A' ? movie.Language : ''} {movie.Country !== 'N/A' ? `(${movie.Country})` : ''}
              </Typography>
            </Box>
          )}

          {/* Cast Chips */}
          {actors.length > 0 && (
            <Box sx={{ p: 2.5, borderRadius: '16px', background: 'rgba(6, 25, 20, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)', gridColumn: { sm: 'span 2', md: 'span 3' } }}>
              <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1.2 }}>
                Starring Cast
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {actors.map((actor) => (
                  <Chip
                    key={actor}
                    icon={<PersonIcon sx={{ fontSize: '16px !important', color: '#34d399 !important' }} />}
                    label={actor}
                    size="medium"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.25)',
                      color: '#ecfdf5',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </div>
      </Box>

      {/* Movie PSA Downloads Section (Only for Movies) */}
      {!isSeries && <PsaDownloadsSection movieTitle={movie.Title} year={movie.Year} />}

      {/* TV Series Seasons & Episodes Section */}
      {isSeries && (
        <Box
          className="liquid-glass rounded-3xl p-6 sm:p-8"
          sx={{
            border: '1.5px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.15)',
          }}
        >
          {/* Section Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#34d399',
                display: 'flex',
              }}
            >
              <TvIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ecfdf5', letterSpacing: '-0.02em' }}>
                Seasons & Episode Guide
              </Typography>
              <Typography variant="caption" sx={{ color: '#6ee7b7', opacity: 0.85 }}>
                Select a season to view and explore individual episode details
              </Typography>
            </Box>
          </Box>

          {/* Season Tabs */}
          <Box sx={{ borderBottom: '1px solid rgba(52, 211, 153, 0.2)', mb: 3.5 }}>
            <Tabs
              value={selectedSeason}
              onChange={(_, val) => setSelectedSeason(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  bgcolor: '#34d399',
                  height: 3,
                  borderRadius: '3px',
                  boxShadow: '0 0 12px rgba(52, 211, 153, 0.8)',
                },
                '& .MuiTab-root': {
                  color: '#a7f3d0',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px 12px 0 0',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#ffffff',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#ffffff',
                  },
                },
              }}
            >
              {Array.from({ length: totalSeasonsCount }, (_, i) => i + 1).map((seasonNum) => (
                <Tab key={seasonNum} label={`Season ${seasonNum}`} value={seasonNum} />
              ))}
            </Tabs>
          </Box>

          {/* Episode List */}
          {isSeasonLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#34d399', mb: 2 }} />
              <Typography sx={{ color: '#6ee7b7' }}>Loading Season {selectedSeason} episodes...</Typography>
            </Box>
          ) : seasonData && seasonData.Episodes && seasonData.Episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonData.Episodes.map((ep) => (
                <Box
                  key={ep.imdbID || ep.Episode}
                  onClick={() => handleOpenEpisodeDetails(ep)}
                  className="liquid-glass-card group cursor-pointer p-4 rounded-2xl flex flex-col justify-between"
                  sx={{
                    border: '1px solid rgba(52, 211, 153, 0.22)',
                    background: 'linear-gradient(135deg, rgba(8, 30, 24, 0.75) 0%, rgba(4, 18, 14, 0.9) 100%)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300">
                        EP {ep.Episode}
                      </span>

                      {ep.imdbRating && ep.imdbRating !== 'N/A' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <StarIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
                          <span className="text-xs font-bold text-amber-200">{ep.imdbRating}</span>
                        </Box>
                      )}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: '#f0fdf4',
                        lineHeight: 1.3,
                        mb: 0.5,
                      }}
                      className="group-hover:text-emerald-300 transition-colors line-clamp-2"
                    >
                      {ep.Title}
                    </Typography>

                    {ep.Released && ep.Released !== 'N/A' && (
                      <Typography variant="caption" sx={{ color: '#6ee7b7', opacity: 0.8, display: 'block' }}>
                        Aired: {ep.Released}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid rgba(52, 211, 153, 0.15)' }}>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <PlayArrowIcon sx={{ fontSize: 16 }} />
                      View Episode Details &rarr;
                    </span>
                  </Box>
                </Box>
              ))}
            </div>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#a7f3d0', opacity: 0.8 }}>
                No episode listings found for Season {selectedSeason}.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Individual Episode Details Modal */}
      <Dialog
        open={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(6, 25, 20, 0.94)',
              backdropFilter: 'blur(30px) saturate(190%)',
              WebkitBackdropFilter: 'blur(30px) saturate(190%)',
              border: '1.5px solid rgba(52, 211, 153, 0.35)',
              borderRadius: '24px',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.25)',
              color: '#f0fdf4',
              p: { xs: 2.5, sm: 3.5 },
            },
          },
        }}
      >
        <IconButton
          onClick={() => setIsEpisodeModalOpen(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#a7f3d0',
            bgcolor: 'rgba(6, 25, 20, 0.7)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)', color: '#ffffff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          {isEpisodeLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ color: '#34d399', mb: 2 }} />
              <Typography sx={{ color: '#6ee7b7' }}>Fetching Episode Details...</Typography>
            </Box>
          ) : selectedEpisode ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-900/70 border border-emerald-500/40 text-emerald-200">
                  Season {selectedEpisode.Season || selectedSeason} • Episode {selectedEpisode.Episode}
                </span>
                {selectedEpisode.imdbRating && selectedEpisode.imdbRating !== 'N/A' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                    <StarIcon sx={{ fontSize: 16 }} />
                    <span>{selectedEpisode.imdbRating}/10</span>
                  </Box>
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f0fdf4', mb: 1 }}>
                {selectedEpisode.Title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5, color: '#a7f3d0', fontSize: '0.82rem' }}>
                {selectedEpisode.Released && selectedEpisode.Released !== 'N/A' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 15, color: '#34d399' }} />
                    <span>Aired: {selectedEpisode.Released}</span>
                  </Box>
                )}
                {selectedEpisode.Runtime && selectedEpisode.Runtime !== 'N/A' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 15, color: '#34d399' }} />
                    <span>{selectedEpisode.Runtime}</span>
                  </Box>
                )}
              </Box>

              {/* Episode Poster if available */}
              {selectedEpisode.Poster && selectedEpisode.Poster !== 'N/A' && (
                <Box className="relative overflow-hidden rounded-xl border border-emerald-500/30 mb-3 aspect-video w-full">
                  <img src={selectedEpisode.Poster} alt={selectedEpisode.Title} className="w-full h-full object-cover" />
                </Box>
              )}

              {/* Episode Synopsis */}
              <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.65)', border: '1px solid rgba(52, 211, 153, 0.2)', mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Episode Overview
                </Typography>
                <Typography variant="body2" sx={{ color: '#f0fdf4', lineHeight: 1.6 }}>
                  {selectedEpisode.Plot && selectedEpisode.Plot !== 'N/A' ? selectedEpisode.Plot : 'No detailed synopsis available.'}
                </Typography>
              </Box>

              {/* Director & Cast info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedEpisode.Director && selectedEpisode.Director !== 'N/A' && (
                  <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(6, 25, 20, 0.5)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, display: 'block' }}>
                      Director:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f0fdf4' }}>{selectedEpisode.Director}</Typography>
                  </Box>
                )}
                {selectedEpisode.Writer && selectedEpisode.Writer !== 'N/A' && (
                  <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(6, 25, 20, 0.5)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, display: 'block' }}>
                      Writer:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f0fdf4' }}>{selectedEpisode.Writer}</Typography>
                  </Box>
                )}
              </div>

              {/* Episode PSA Downloads Section */}
              <PsaDownloadsSection
                isEpisode
                showTitle={movie.Title}
                season={selectedEpisode.Season || selectedSeason}
                episode={selectedEpisode.Episode}
                year={movie.Year}
              />
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{
            bgcolor: 'rgba(6, 30, 24, 0.95)',
            color: '#a7f3d0',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
