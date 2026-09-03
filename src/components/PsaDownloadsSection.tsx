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
      className={
        isEpisode
          ? 'bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs'
          : 'mt-8 bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm'
      }
    >
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: { xs: 0.8, sm: 1 },
              borderRadius: '12px',
              bgcolor: 'rgba(88, 188, 179, 0.15)',
              border: '1px solid rgba(88, 188, 179, 0.4)',
              color: '#58BCB3',
              display: 'flex',
            }}
          >
            <DownloadIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'var(--heading-font)',
                  fontWeight: 400,
                  color: '#1a202c',
                  fontSize: { xs: '1.2rem', sm: '1.45rem' },
                  letterSpacing: '0.02em',
                }}
              >
                {isEpisode ? 'EPISODE DOWNLOADS' : 'VERIFIED PSA DOWNLOADS'}
              </Typography>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-teal-50 border border-teal-200 text-teal-800 shadow-xs flex items-center gap-1">
                <FlashOnIcon sx={{ fontSize: 11, color: '#58BCB3' }} /> HEVC x265
              </span>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.82rem' }, display: 'block' }}>
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
                  bgcolor: selectedResolution === res ? '#58BCB3' : '#f1f5f9',
                  border: selectedResolution === res ? '1px solid #58BCB3' : '1px solid #e2e8f0',
                  color: selectedResolution === res ? '#ffffff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--heading-font)',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: selectedResolution === res ? '#439d95' : '#e2e8f0',
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
          <CircularProgress size={32} sx={{ color: '#58BCB3', mb: 2 }} />
          <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
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
                className={`group p-3.5 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border hover:border-[#58BCB3] transition-all ${
                  isEpisode
                    ? 'bg-white hover:bg-teal-50/40 border-slate-200'
                    : 'bg-slate-50 hover:bg-teal-50/40 border-slate-200'
                }`}
              >
                {/* Left: Release Title & Spec Badges */}
                <Box sx={{ flex: 1, pr: { md: 2 } }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.8 }}>
                    {/* Quality Resolution Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide border shadow-2xs ${
                        is4k
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : is1080p
                          ? 'bg-teal-100 border-teal-300 text-teal-900'
                          : 'bg-slate-200 border-slate-300 text-slate-800'
                      }`}
                      style={{ fontFamily: 'var(--heading-font)' }}
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
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <StorageIcon sx={{ fontSize: 13, color: '#58BCB3' }} />
                      <span>{item.size}</span>
                    </Box>

                    {/* Codec / Audio specs */}
                    {item.codecInfo && (
                      <span className="text-xs text-slate-500 font-medium">
                        {item.codecInfo}
                      </span>
                    )}
                  </Box>

                  {/* Filename / Title */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#1a202c',
                      fontSize: { xs: '0.88rem', sm: '0.95rem' },
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                    className="group-hover:text-[#439d95] transition-colors"
                  >
                    {item.title}
                  </Typography>

                  {item.pubDate && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.3, display: 'block', fontSize: '0.72rem' }}>
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
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      borderRadius: '24px',
                      whiteSpace: 'nowrap',
                      bgcolor: '#58BCB3',
                      '&:hover': { bgcolor: '#439d95' },
                    }}
                  >
                    Download Magnet
                  </Button>

                  <Tooltip title="Copy Magnet Link">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMagnet(item.magnet, item.title)}
                      sx={{
                        color: '#64748b',
                        bgcolor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        p: 0.9,
                        borderRadius: '50%',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: 'rgba(88, 188, 179, 0.15)',
                          color: '#58BCB3',
                          borderColor: '#58BCB3',
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
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'rgba(88, 188, 179, 0.12)',
              border: '1px solid rgba(88, 188, 179, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#58BCB3',
              mb: 1.5,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, color: '#1a202c', mb: 0.5, fontFamily: 'var(--heading-font)', fontSize: '1.2rem' }}>
            DOWNLOADS COMING SOON
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 360, fontSize: '0.85rem' }}>
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
            bgcolor: '#1a202c',
            color: '#ffffff',
            border: '1px solid #58BCB3',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
