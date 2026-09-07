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
            background: '#ffffff',
            borderLeft: '2px solid #58BCB3',
            color: '#1a202c',
            p: { xs: 2.2, sm: 3 },
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: '10px',
              bgcolor: 'rgba(88, 188, 179, 0.15)',
              color: '#58BCB3',
              display: 'flex',
            }}
          >
            <MovieIcon fontSize="small" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 400,
              fontSize: '1.35rem',
              color: '#1a202c',
              letterSpacing: '0.02em',
            }}
          >
            SAVED TITLES ({watchlist.length})
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748b',
            '&:hover': { bgcolor: '#f1f5f9', color: '#1a202c' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0', mb: 2 }} />

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
              width: 70,
              height: 70,
              borderRadius: '50%',
              bgcolor: 'rgba(88, 188, 179, 0.1)',
              border: '1px solid rgba(88, 188, 179, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: '#58BCB3',
            }}
          >
            <BookmarkBorderIcon sx={{ fontSize: 34 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a202c', mb: 0.5, fontFamily: 'var(--heading-font)' }}>
            YOUR WATCHLIST IS EMPTY
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 260 }}>
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
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#effaf8',
                    borderColor: '#58BCB3',
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
                        color: '#94a3b8',
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
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
                      borderRadius: '8px',
                      bgcolor: '#e2e8f0',
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
                        color: '#1a202c',
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
                      <span className="text-xs text-[#58BCB3] font-bold">{item.Year}</span>
                      <span className="text-xs uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
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
          <Divider sx={{ borderColor: '#e2e8f0', mb: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onClearAll}
            sx={{
              borderRadius: '12px',
            }}
          >
            Clear All Watchlist
          </Button>
        </Box>
      )}
    </Drawer>
  )
}
