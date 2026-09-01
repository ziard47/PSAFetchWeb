import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import StorageIcon from '@mui/icons-material/Storage'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { PsaDownloadItem } from '../types/movie'
import { fetchPsaDownloads, fetchPsaEpisodeDownloads } from '../services/psaDownloads'

interface PsaDownloadsSectionProps {
  movieTitle?: string
  isEpisode?: boolean
  showTitle?: string
  season?: number | string
  episode?: number | string
  year?: string
}

export const PsaDownloadsSection: React.FC<PsaDownloadsSectionProps> = ({
  movieTitle,
  isEpisode = false,
  showTitle,
  season,
  episode,
  year,
}) => {
  const [downloads, setDownloads] = useState<PsaDownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResolution, setSelectedResolution] = useState<string>('all')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    let isSubscribed = true
    const loadDownloads = async () => {
      setLoading(true)
      let results: PsaDownloadItem[] = []

      if (isEpisode && showTitle && season !== undefined && episode !== undefined) {
        results = await fetchPsaEpisodeDownloads(showTitle, season, episode, year)
      } else if (movieTitle) {
        results = await fetchPsaDownloads(movieTitle, year)
      }

      if (isSubscribed) {
        setDownloads(results)
        setLoading(false)
      }
    }

    loadDownloads()
    return () => {
      isSubscribed = false
    }
  }, [movieTitle, isEpisode, showTitle, season, episode, year])

  const handleCopyMagnet = (magnet: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(magnet)
      setSnackbarMessage(`Copied magnet link for ${title.slice(0, 30)}...`)
      setSnackbarOpen(true)
    }
  }

  // Available resolutions in the results
  const resolutions = ['all', ...Array.from(new Set(downloads.map((d) => d.resolution)))]

  const filteredDownloads = selectedResolution === 'all'
    ? downloads
    : downloads.filter((d) => d.resolution.toLowerCase() === selectedResolution.toLowerCase())

  return (
    <Box
      className="liquid-glass rounded-3xl p-4 sm:p-6 md:p-7 mt-6"
      sx={{
        border: '1.5px solid rgba(52, 211, 153, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.2)',
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: { xs: 0.8, sm: 1 },
              borderRadius: '12px',
              bgcolor: 'rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              display: 'flex',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <DownloadIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ecfdf5', fontSize: { xs: '1rem', sm: '1.25rem' }, letterSpacing: '-0.02em' }}>
                {isEpisode ? 'Episode Downloads' : 'PSA Downloads'}
              </Typography>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-950 border border-emerald-400/50 text-emerald-300 shadow-sm flex items-center gap-1">
                <FlashOnIcon sx={{ fontSize: 11, color: '#34d399' }} /> HEVC x265
              </span>
            </Box>
            <Typography variant="caption" sx={{ color: '#a7f3d0', opacity: 0.85, fontSize: { xs: '0.72rem', sm: '0.78rem' }, display: 'block' }}>
              {isEpisode
                ? 'High-efficiency x265 episode encodes (720p / 1080p / 2160p)'
                : 'High-efficiency x265 movie releases with multi-channel audio & HDR'}
            </Typography>
          </Box>
        </Box>

        {/* Resolution Filter Pills */}
        {!loading && downloads.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {resolutions.map((res) => (
              <Chip
                key={res}
                size="small"
                label={res === 'all' ? 'All Formats' : res.toUpperCase()}
                onClick={() => setSelectedResolution(res)}
                clickable
                sx={{
                  bgcolor: selectedResolution === res ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 25, 20, 0.65)',
                  border: selectedResolution === res ? '1.5px solid #34d399' : '1px solid rgba(52, 211, 153, 0.25)',
                  color: selectedResolution === res ? '#ffffff' : '#a7f3d0',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  boxShadow: selectedResolution === res ? '0 0 14px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.25)',
                    color: '#ffffff',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Content State */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ color: '#34d399', mb: 2 }} />
          <Typography sx={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.9rem' }}>
            Searching PSA HEVC releases in background...
          </Typography>
        </Box>
      ) : filteredDownloads.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredDownloads.map((item, idx) => {
            const is4k = /2160p|4k/i.test(item.resolution)
            const is1080p = /1080p/i.test(item.resolution)

            return (
              <Box
                key={idx}
                className="liquid-glass-card group p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                sx={{
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  background: 'linear-gradient(135deg, rgba(8, 32, 26, 0.8) 0%, rgba(4, 20, 16, 0.95) 100%)',
                }}
              >
                {/* Left: Release Title & Spec Badges */}
                <Box sx={{ flex: 1, pr: { md: 2 } }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.8 }}>
                    {/* Quality Resolution Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-wide border shadow-sm ${
                        is4k
                          ? 'bg-amber-950/80 border-amber-400/60 text-amber-300'
                          : is1080p
                          ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300'
                          : 'bg-teal-950/80 border-teal-400/60 text-teal-300'
                      }`}
                    >
                      {item.resolution.toUpperCase()}
                    </span>

                    {/* File Size Badge */}
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.2,
                        py: 0.2,
                        borderRadius: '6px',
                        bgcolor: 'rgba(6, 30, 24, 0.8)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        color: '#6ee7b7',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      <StorageIcon sx={{ fontSize: 13, color: '#34d399' }} />
                      <span>{item.size}</span>
                    </Box>

                    {/* Codec / Audio specs */}
                    {item.codecInfo && (
                      <span className="text-[11px] text-emerald-300/80 font-medium">
                        {item.codecInfo}
                      </span>
                    )}
                  </Box>

                  {/* Filename / Title */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#f0fdf4',
                      fontSize: { xs: '0.85rem', sm: '0.92rem' },
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                    className="group-hover:text-emerald-300 transition-colors"
                  >
                    {item.title}
                  </Typography>

                  {item.pubDate && (
                    <Typography variant="caption" sx={{ color: '#6ee7b7', opacity: 0.7, mt: 0.3, display: 'block', fontSize: '0.7rem' }}>
                      Added: {item.pubDate}
                    </Typography>
                  )}
                </Box>

                {/* Right: Actions (Download Magnet & Copy Magnet) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    flexShrink: 0,
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  <Button
                    component="a"
                    href={item.magnet}
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      px: 2.5,
                      py: 0.9,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Download Magnet
                  </Button>

                  <Tooltip title="Copy Magnet Link">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMagnet(item.magnet, item.title)}
                      sx={{
                        color: '#34d399',
                        bgcolor: 'rgba(6, 25, 20, 0.7)',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        p: 0.9,
                        borderRadius: '10px',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.25)',
                          color: '#ffffff',
                        },
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )
          })}
        </Box>
      ) : (
        /* Empty / No Magnet Links Found State */
        <Box
          sx={{
            py: 6,
            px: 3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6, 25, 20, 0.5)',
            border: '1px dashed rgba(52, 211, 153, 0.25)',
            borderRadius: '18px',
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              mb: 1.5,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f0fdf4', mb: 0.5 }}>
            Downloads coming soon.
          </Typography>
          <Typography variant="body2" sx={{ color: '#a7f3d0', opacity: 0.8, maxWidth: 360, fontSize: '0.82rem' }}>
            No PSA HEVC encodes were found for this title yet. Releases will appear here as soon as they become available.
          </Typography>
        </Box>
      )}

      {/* Snackbar Copy Feedback */}
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
