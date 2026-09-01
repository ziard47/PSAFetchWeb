import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Button,
  Box,
  Container,
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import CasinoIcon from '@mui/icons-material/Casino'
import logoImg from '../assets/logo.png'

interface NavbarProps {
  watchlistCount: number
  onOpenWatchlist: () => void
  onResetSearch: () => void
  onRandomMovie: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  watchlistCount,
  onOpenWatchlist,
  onResetSearch,
  onRandomMovie,
}) => {
  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(5, 20, 16, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)',
        zIndex: 50,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, justifyContent: 'space-between' }}>
          {/* Logo & Title */}
          <Box
            onClick={onResetSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {/* Glowing Liquid Droplet Icon Container */}
            <Box
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(5, 150, 105, 0.45) 100%)',
                border: '1px solid rgba(110, 231, 183, 0.4)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                p: 0.5,
              }}
            >
              <Box
                component="img"
                src={logoImg}
                alt="PSA Fetch Logo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))',
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', md: '1.55rem' },
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 60%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                PSA Fetch
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#6ee7b7',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  opacity: 0.85,
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                Movie Search Engine
              </Typography>
            </Box>
          </Box>

          {/* Right Action Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
            {/* Random Movie Button with Dice Icon */}
            <Button
              onClick={onRandomMovie}
              startIcon={<CasinoIcon sx={{ color: '#34d399', fontSize: { xs: 18, sm: 20 } }} />}
              sx={{
                color: '#ecfdf5',
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '14px',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.7, sm: 0.85 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.25)',
                  borderColor: '#34d399',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Random
            </Button>

            {/* Watchlist Trigger */}
            <Button
              onClick={onOpenWatchlist}
              variant="outlined"
              startIcon={
                <Badge
                  badgeContent={watchlistCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.7)',
                    },
                  }}
                >
                  <BookmarkIcon sx={{ color: '#34d399', fontSize: { xs: 18, sm: 20 } }} />
                </Badge>
              }
              sx={{
                color: '#ecfdf5',
                borderColor: 'rgba(52, 211, 153, 0.35)',
                bgcolor: 'rgba(6, 25, 20, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                px: { xs: 1.4, sm: 2 },
                py: { xs: 0.7, sm: 0.85 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#34d399',
                  bgcolor: 'rgba(16, 185, 129, 0.18)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Watchlist
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
