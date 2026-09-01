import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
import { MovieDetails, MovieSummary } from '../types/movie'

interface MovieDetailsModalProps {
  movie: MovieDetails | null
  loading: boolean
  open: boolean
  onClose: () => void
  isBookmarked: boolean
  onToggleBookmark: (movie: MovieSummary) => void
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  loading,
  open,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [posterError, setPosterError] = useState(false)

  useEffect(() => {
    setPosterError(false)
  }, [movie?.imdbID])

  if (!open) return null

  const handleShare = () => {
    if (!movie) return
    const text = `Check out ${movie.Title} (${movie.Year}) on PSA Fetch!\nIMDb Rating: ${movie.imdbRating}/10\nPlot: ${movie.Plot}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setSnackbarMessage('Movie details copied to clipboard!')
      setSnackbarOpen(true)
    }
  }

  // Parse Ratings
  const rottenTomatoes = movie?.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value
  const metacritic =
    movie?.Ratings?.find((r) => r.Source === 'Metacritic')?.Value ||
    (movie?.Metascore && movie.Metascore !== 'N/A' ? `${movie.Metascore}/100` : null)

  const genres = movie?.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(',').map((g) => g.trim()) : []
  const actors = movie?.Actors && movie.Actors !== 'N/A' ? movie.Actors.split(',').map((a) => a.trim()) : []

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="body"
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(5, 22, 17, 0.92)',
              backdropFilter: 'blur(30px) saturate(200%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%)',
              border: '1.5px solid rgba(52, 211, 153, 0.3)',
              borderRadius: { xs: '20px', md: '28px' },
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 45px rgba(16, 185, 129, 0.25)',
              color: '#f0fdf4',
              overflow: 'hidden',
              m: { xs: 1.5, md: 3 },
            },
          },
        }}
      >
        {/* Floating Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#a7f3d0',
            bgcolor: 'rgba(6, 25, 20, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
              <CircularProgress size={48} sx={{ color: '#34d399', mb: 2 }} />
              <Typography sx={{ color: '#6ee7b7', fontWeight: 600 }}>Fetching movie details...</Typography>
            </Box>
          ) : movie ? (
            <Box>
              {/* Header Hero Section: Poster + Main Info */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Left: Movie Poster with Glow Aura */}
                <div className="sm:col-span-4">
                  <Box className="relative group">
                    {/* Glowing Backlight */}
                    <Box className="absolute -inset-1 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-400 opacity-30 blur-xl group-hover:opacity-60 transition duration-500" />

                    {/* Poster Card */}
                    <Box
                      component="div"
                      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 shadow-2xl bg-emerald-950/60 aspect-2/3 w-full"
                    >
                      {movie.Poster && movie.Poster !== 'N/A' && !posterError ? (
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setPosterError(true)}
                        />
                      ) : (
                        <Box className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <MovieIcon sx={{ fontSize: 60, color: '#34d399', opacity: 0.6, mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#a7f3d0' }}>No Poster Available</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Action Buttons under Poster */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        onClick={() => onToggleBookmark(movie)}
                        sx={{
                          bgcolor: isBookmarked ? 'rgba(16, 185, 129, 0.4)' : undefined,
                          borderColor: 'rgba(52, 211, 153, 0.4)',
                          fontSize: '0.85rem',
                        }}
                      >
                        {isBookmarked ? 'Saved' : 'Watchlist'}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={handleShare}
                        sx={{
                          minWidth: '46px',
                          p: 1,
                          borderColor: 'rgba(52, 211, 153, 0.35)',
                          color: '#34d399',
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                </div>

                {/* Right: Title, Quick Badges, Plot, Ratings */}
                <div className="sm:col-span-8">
                  <Box>
                    {/* Title */}
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.6rem', md: '2.1rem' },
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 70%, #6ee7b7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1.5,
                      }}
                    >
                      {movie.Title}
                    </Typography>

                    {/* Metadata Chips Bar */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                      {movie.Rated && movie.Rated !== 'N/A' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-900/60 border border-emerald-500/40 text-emerald-200">
                          {movie.Rated}
                        </span>
                      )}

                      {movie.Year && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a7f3d0', fontSize: '0.82rem' }}>
                          <CalendarTodayIcon sx={{ fontSize: 15, color: '#34d399' }} />
                          <span>{movie.Released !== 'N/A' ? movie.Released : movie.Year}</span>
                        </Box>
                      )}

                      {movie.Runtime && movie.Runtime !== 'N/A' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#a7f3d0', fontSize: '0.82rem' }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: '#34d399' }} />
                          <span>{movie.Runtime}</span>
                        </Box>
                      )}

                      {movie.Type && (
                        <span className="px-2 py-0.5 rounded-md text-xs uppercase tracking-wider font-semibold bg-teal-900/50 border border-teal-500/30 text-teal-200">
                          {movie.Type}
                        </span>
                      )}
                    </Box>

                    {/* Ratings Section */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                        gap: 1.5,
                        mb: 3,
                      }}
                    >
                      {/* IMDb Rating */}
                      {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            textAlign: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <StarIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                            <Typography component="div" sx={{ fontWeight: 800, color: '#fef3c7', fontSize: '1rem' }}>
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
                            p: 1.5,
                            borderRadius: '16px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, color: '#fecaca', fontSize: '1rem', mb: 0.5 }}>
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
                            p: 1.5,
                            borderRadius: '16px',
                            background: 'rgba(59, 130, 246, 0.12)',
                            border: '1px solid rgba(96, 165, 250, 0.3)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, color: '#bfdbfe', fontSize: '1rem', mb: 0.5 }}>
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2.5 }}>
                        {genres.map((g) => (
                          <Chip
                            key={g}
                            label={g}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.18)',
                              border: '1px solid rgba(52, 211, 153, 0.35)',
                              color: '#ecfdf5',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Plot Synopsis Container */}
                    <Box
                      sx={{
                        p: 2.2,
                        borderRadius: '16px',
                        background: 'rgba(6, 25, 20, 0.75)',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        backdropFilter: 'blur(12px)',
                        mb: 3,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 700, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Plot Synopsis
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ecfdf5', lineHeight: 1.6, fontSize: '0.92rem' }}>
                        {movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No detailed plot summary available for this title.'}
                      </Typography>
                    </Box>
                  </Box>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <Divider sx={{ my: 3, borderColor: 'rgba(52, 211, 153, 0.2)' }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Director */}
                {movie.Director && movie.Director !== 'N/A' && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      Director
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f0fdf4', fontWeight: 600 }}>
                      {movie.Director}
                    </Typography>
                  </Box>
                )}

                {/* Writers */}
                {movie.Writer && movie.Writer !== 'N/A' && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      Writers
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f0fdf4', fontWeight: 500 }}>
                      {movie.Writer}
                    </Typography>
                  </Box>
                )}

                {/* Awards */}
                {movie.Awards && movie.Awards !== 'N/A' && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <EmojiEventsIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                        Awards
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#f0fdf4', fontSize: '0.85rem' }}>
                      {movie.Awards}
                    </Typography>
                  </Box>
                )}

                {/* Box Office */}
                {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <MonetizationOnIcon sx={{ color: '#34d399', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                        Box Office
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
                      {movie.BoxOffice}
                    </Typography>
                  </Box>
                )}

                {/* Language & Origin */}
                {(movie.Language || movie.Country) && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <LanguageIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                        Language & Origin
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#f0fdf4', fontSize: '0.85rem' }}>
                      {movie.Language !== 'N/A' ? movie.Language : ''} {movie.Country !== 'N/A' ? `(${movie.Country})` : ''}
                    </Typography>
                  </Box>
                )}

                {/* Cast */}
                {actors.length > 0 && (
                  <Box sx={{ p: 2, borderRadius: '14px', background: 'rgba(6, 25, 20, 0.55)', border: '1px solid rgba(52, 211, 153, 0.18)', gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                    <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                      Starring Cast
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {actors.map((actor) => (
                        <Chip
                          key={actor}
                          icon={<PersonIcon sx={{ fontSize: '15px !important', color: '#34d399 !important' }} />}
                          label={actor}
                          size="small"
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
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ color: '#f87171', fontWeight: 600 }}>Failed to load movie details.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
    </>
  )
}
