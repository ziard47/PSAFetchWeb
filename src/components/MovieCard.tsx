import React from 'react'
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import MovieIcon from '@mui/icons-material/Movie'
import TvIcon from '@mui/icons-material/Tv'
import { MovieSummary } from '../types/movie'

interface MovieCardProps {
  movie: MovieSummary
  isBookmarked: boolean
  onToggleBookmark: (e: React.MouseEvent, movie: MovieSummary) => void
  onSelectMovie: (movie: MovieSummary) => void
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isBookmarked,
  onToggleBookmark,
  onSelectMovie,
}) => {
  const [imgError, setImgError] = React.useState(false)
  const isSeries = movie.Type?.toLowerCase() === 'series'

  return (
    <Card
      onClick={() => onSelectMovie(movie)}
      className="liquid-glass-card group cursor-pointer relative overflow-hidden flex flex-col h-full rounded-2xl"
      sx={{
        bgcolor: 'transparent',
        border: '1px solid rgba(52, 211, 153, 0.2)',
        borderRadius: '20px',
      }}
    >
      {/* Poster Container with Aspect Ratio */}
      <Box className="relative w-full aspect-2/3 overflow-hidden bg-emerald-950/40">
        {movie.Poster && !imgError ? (
          <CardMedia
            component="img"
            image={movie.Poster}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <Box className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-linear-to-br from-emerald-950/70 to-slate-950/90">
            {isSeries ? (
              <TvIcon sx={{ fontSize: 48, color: '#34d399', opacity: 0.7, mb: 1 }} />
            ) : (
              <MovieIcon sx={{ fontSize: 48, color: '#34d399', opacity: 0.7, mb: 1 }} />
            )}
            <Typography variant="body2" sx={{ color: '#a7f3d0', fontWeight: 600 }}>
              {movie.Title}
            </Typography>
          </Box>
        )}

        {/* Liquid Glass Overlay on Top Edge */}
        <Box
          className="absolute inset-0 bg-linear-to-t from-emerald-950/90 via-emerald-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none"
        />

        {/* Type Badge & Year Pill */}
        <Box className="absolute top-3 left-3 flex gap-1.5 z-10">
          <Chip
            size="small"
            icon={
              isSeries ? (
                <TvIcon sx={{ fontSize: '13px !important', color: '#ecfdf5 !important' }} />
              ) : (
                <MovieIcon sx={{ fontSize: '13px !important', color: '#ecfdf5 !important' }} />
              )
            }
            label={isSeries ? 'Series' : 'Movie'}
            sx={{
              bgcolor: 'rgba(6, 25, 20, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#ecfdf5',
              fontSize: '0.7rem',
              fontWeight: 700,
              height: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          />
        </Box>

        {/* Bookmark Button */}
        <Box className="absolute top-2 right-2 z-10">
          <Tooltip title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}>
            <IconButton
              size="small"
              onClick={(e) => onToggleBookmark(e, movie)}
              sx={{
                bgcolor: 'rgba(6, 25, 20, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: isBookmarked ? '#34d399' : '#a7f3d0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.3)',
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {isBookmarked ? (
                <BookmarkIcon sx={{ fontSize: 18, color: '#34d399' }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Release Year Badge */}
        {movie.Year && (
          <Box className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 shadow-md">
              {movie.Year}
            </span>
          </Box>
        )}
      </Box>

      {/* Card Details Bottom */}
      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(6, 25, 20, 0.85)',
        }}
      >
        <Typography
          variant="subtitle1"
          component="h3"
          className="line-clamp-2 font-bold text-slate-100 group-hover:text-emerald-300 transition-colors"
          sx={{
            fontSize: '0.98rem',
            lineHeight: 1.3,
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {movie.Title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#6ee7b7', opacity: 0.8, fontSize: '0.75rem' }}>
            ID: {movie.imdbID}
          </Typography>
          <span className="text-xs font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            Details &rarr;
          </span>
        </Box>
      </CardContent>
    </Card>
  )
}
