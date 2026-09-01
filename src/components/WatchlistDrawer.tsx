import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import MovieIcon from '@mui/icons-material/Movie'
import { MovieSummary, WatchlistItem } from '../types/movie'

interface WatchlistDrawerProps {
  open: boolean
  onClose: () => void
  watchlist: WatchlistItem[]
  onRemoveItem: (imdbID: string) => void
  onClearAll: () => void
  onSelectMovie: (movie: MovieSummary) => void
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  open,
  onClose,
  watchlist,
  onRemoveItem,
  onClearAll,
  onSelectMovie,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '88vw', sm: 400 },
            maxWidth: '100vw',
            background: 'rgba(5, 20, 16, 0.94)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            borderLeft: '1.5px solid rgba(52, 211, 153, 0.3)',
            color: '#f0fdf4',
            p: { xs: 2.2, sm: 3 },
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '12px',
              bgcolor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              display: 'flex',
            }}
          >
            <MovieIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ecfdf5', letterSpacing: '-0.02em' }}>
            My Watchlist ({watchlist.length})
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: '#a7f3d0',
            bgcolor: 'rgba(6, 25, 20, 0.6)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#ffffff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(52, 211, 153, 0.2)', mb: 2 }} />

      {/* List / Empty State */}
      {watchlist.length === 0 ? (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: '#34d399',
            }}
          >
            <BookmarkBorderIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f0fdf4', mb: 0.5 }}>
            Your Watchlist is empty
          </Typography>
          <Typography variant="body2" sx={{ color: '#a7f3d0', opacity: 0.8, maxWidth: 260 }}>
            Click the bookmark icon on any movie card or detail view to save it here for later.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {watchlist.map((item) => (
              <ListItem
                key={item.imdbID}
                onClick={() => {
                  onSelectMovie(item)
                  onClose()
                }}
                sx={{
                  bgcolor: 'rgba(6, 25, 20, 0.65)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  borderRadius: '16px',
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: '#34d399',
                    transform: 'translateX(-3px)',
                  },
                }}
                secondaryAction={
                  <Tooltip title="Remove from watchlist">
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveItem(item.imdbID)
                      }}
                      sx={{
                        color: '#6ee7b7',
                        '&:hover': { color: '#f87171', bgcolor: 'rgba(239, 68, 68, 0.15)' },
                      }}
                    >
                      <BookmarkRemoveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={item.Poster}
                    alt={item.Title}
                    sx={{
                      width: 46,
                      height: 64,
                      borderRadius: '10px',
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    <MovieIcon />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: '#f0fdf4',
                        lineHeight: 1.3,
                        pr: 2,
                      }}
                      className="line-clamp-1"
                    >
                      {item.Title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <span className="text-xs text-emerald-400 font-semibold">{item.Year}</span>
                      <span className="text-xs uppercase px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                        {item.Type}
                      </span>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Footer Clear All */}
      {watchlist.length > 0 && (
        <Box sx={{ pt: 2, mt: 'auto' }}>
          <Divider sx={{ borderColor: 'rgba(52, 211, 153, 0.2)', mb: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onClearAll}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '14px',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
              },
            }}
          >
            Clear All Watchlist
          </Button>
        </Box>
      )}
    </Drawer>
  )
}
