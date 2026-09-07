import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import ShareIcon from '@mui/icons-material/Share'
import StarIcon from '@mui/icons-material/Star'
import { MovieDetails, MovieSummary } from '../types/movie'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface ShareModalProps {
  open: boolean
  onClose: () => void
  movie: MovieDetails | MovieSummary | null
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, movie }) => {
  const [copied, setCopied] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)

  if (!movie) return null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/movie/${movie.imdbID}`
    : `https://psafetch.com/movie/${movie.imdbID}`

  const movieYear = movie.Year || ''
  const movieType = (movie.Type || 'movie').toUpperCase()
  const imdbRating = 'imdbRating' in movie && movie.imdbRating && movie.imdbRating !== 'N/A'
    ? movie.imdbRating
    : null

  const shareText = `🎬 Watch & Discover "${movie.Title}" (${movieYear}) on PSA Fetch!\nVerified media details and encodes.`

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // Fallback
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movie.Title} (${movieYear}) - PSA Fetch`,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // Ignored if user dismissed
      }
    }
  }

  const socialLinks = [
    {
      name: 'WhatsApp',
      iconClass: 'fab fa-whatsapp',
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      iconClass: 'fab fa-telegram-plane',
      color: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'X (Twitter)',
      iconClass: 'fab fa-x-twitter',
      color: 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Reddit',
      iconClass: 'fab fa-reddit-alien',
      color: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`${movie.Title} (${movieYear}) on PSA Fetch`)}`,
    },
    {
      name: 'Facebook',
      iconClass: 'fab fa-facebook-f',
      color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      iconClass: 'fas fa-envelope',
      color: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
      url: `mailto:?subject=${encodeURIComponent(`Check out "${movie.Title}" on PSA Fetch`)}&body=${encodeURIComponent(`${shareText}\n\nLink: ${shareUrl}`)}`,
    },
  ]

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&margin=10&color=0f172a&bgcolor=ffffff`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            p: 0,
            m: { xs: 1.5, sm: 2 },
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-teal-600 to-[#58BCB3] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShareIcon sx={{ fontSize: 18, color: '#ffffff' }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold m-0 tracking-wide text-white leading-tight" style={{ fontFamily: 'var(--heading-font)' }}>
                SHARE TITLE
              </h3>
              <p className="text-[11px] text-teal-100 m-0 uppercase tracking-wider font-semibold">
                PSA Fetch Discovery
              </p>
            </div>
          </div>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Movie Mini Card Preview */}
          <div className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs items-center">
            <div className="w-14 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-xs">
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <i className="fas fa-film"></i>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-[#439d95] text-[10px] font-bold tracking-wider">
                  {movieType}
                </span>
                {imdbRating && (
                  <span className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-200/60">
                    <StarIcon sx={{ fontSize: 12, color: '#f59e0b' }} /> {imdbRating}
                  </span>
                )}
                {movieYear && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {movieYear}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate m-0 mb-0.5" title={movie.Title}>
                {movie.Title}
              </h4>
              <p className="text-[11px] text-slate-500 m-0 truncate">
                Direct release links & IMDb specifications
              </p>
            </div>
          </div>

          {/* Native Share Option (for mobile browsers supporting Web Share API) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-[#58BCB3] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
            >
              <i className="fas fa-share-nodes"></i>
              <span>Share with Apps on this Device</span>
            </button>
          )}

          {/* Social Share Grid */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Share to Platform
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 ${social.color}`}
                  title={`Share on ${social.name}`}
                >
                  <i className={`${social.iconClass} text-lg mb-1`}></i>
                  <span className="text-[10px] font-medium leading-tight">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Copy Page Link
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl focus-within:border-[#58BCB3] focus-within:bg-white transition">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 font-mono px-2.5 truncate"
              />
              <Tooltip title={copied ? 'Copied!' : 'Copy Link'}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#58BCB3] hover:bg-[#439d95] text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon sx={{ fontSize: 15 }} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* QR Code Quick Scan Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <QrCode2Icon sx={{ fontSize: 18, color: '#58BCB3' }} />
                <span>Quick Scan QR Code</span>
              </div>
              <i className={`fas fa-chevron-${showQrCode ? 'up' : 'down'} text-[10px] text-slate-400`}></i>
            </button>

            {showQrCode && (
              <div className="mt-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center animate-fadeIn">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 mb-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <p className="text-xs text-slate-600 font-medium m-0">
                  Scan with your phone camera to view this release instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
