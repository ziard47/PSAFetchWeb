import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'
import ExtensionIcon from '@mui/icons-material/Extension'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface ExtensionModalProps {
  open: boolean
  onClose: () => void
}

export const EDGE_STORE_URL = 'https://microsoftedge.microsoft.com/addons/detail/psa-fetch/dbadhpofhkkhlckegioamnamkhbcgpcj'
export const GITHUB_RELEASE_URL = 'https://github.com/ziard47/PSA-Grabber/releases/tag/release-v2.1.3'

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'edge' | 'chrome'>('edge')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
      maxWidth="sm"
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
        {/* Header with vibrant teal gradient */}
        <div className="relative bg-gradient-to-r from-[#147a70] via-[#58BCB3] to-[#439d95] text-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
                <ExtensionIcon sx={{ fontSize: 28, color: '#ffffff' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="text-lg sm:text-xl font-bold m-0 tracking-wide text-white leading-tight"
                    style={{ fontFamily: 'var(--heading-font)' }}
                  >
                    PSA GRABBER EXTENSION
                  </h3>
                  <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs whitespace-nowrap">
                    v2.1.3
                  </span>
                </div>
                <p className="text-xs text-teal-100 m-0 mt-0.5">
                  Instant Magnet & Torrent Extractor for PSA Rips
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
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Download Options Cards */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Choose Your Browser
            </span>

            {/* Option 1: Microsoft Edge (Official Store) */}
            <div className="border-2 border-[#58BCB3] bg-teal-50/30 rounded-2xl p-4 sm:p-4.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 shadow-xs hover:shadow-md transition">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <i className="fab fa-edge text-sky-600 text-2xl"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 m-0">Microsoft Edge</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      Official Store
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 m-0 leading-relaxed">
                    1-Click direct install from Microsoft Edge Add-ons
                  </p>
                </div>
              </div>

              <a
                href={EDGE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#58BCB3] hover:bg-[#439d95] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition shrink-0 whitespace-nowrap active:scale-95"
                style={{ fontFamily: 'var(--heading-font)' }}
              >
                <span>GET FOR EDGE</span>
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </a>
            </div>

            {/* Option 2: Chrome, Brave & Chromium (GitHub Releases) */}
            <div className="border border-slate-200 hover:border-slate-300 bg-slate-50/60 rounded-2xl p-4 sm:p-4.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 shadow-xs hover:shadow-md transition">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <i className="fab fa-chrome text-amber-600 text-2xl"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 m-0">Chrome, Brave & Chromium</h4>
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      GitHub Release
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 m-0 leading-relaxed">
                    Download .zip / release package for Chromium browsers
                  </p>
                </div>
              </div>

              <a
                href={GITHUB_RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition shrink-0 whitespace-nowrap active:scale-95"
                style={{ fontFamily: 'var(--heading-font)' }}
              >
                <i className="fab fa-github text-sm"></i>
                <span>GET V2.1.3 RELEASE</span>
                <FileDownloadIcon sx={{ fontSize: 16 }} />
              </a>
            </div>
          </div>

          {/* Quick Installation Instructions Tabs */}
          <div className="pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-book-open text-[#58BCB3] text-xs"></i>
                <span>How to Install</span>
              </span>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('edge')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    activeTab === 'edge' ? 'bg-white text-[#439d95] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Microsoft Edge
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chrome')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    activeTab === 'chrome' ? 'bg-white text-[#439d95] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Chrome / Brave / Opera
                </button>
              </div>
            </div>

            {activeTab === 'edge' ? (
              <ol className="text-xs text-slate-600 space-y-1.5 pl-4 list-decimal marker:text-[#58BCB3] marker:font-bold">
                <li>Click the <strong>"GET FOR EDGE"</strong> button above to open the official Microsoft Edge Add-ons store.</li>
                <li>Click <strong>"Get"</strong> and confirm with <strong>"Add extension"</strong>.</li>
                <li>Browse PSA Rips — the extension will automatically extract and display clean magnet links directly on the page!</li>
              </ol>
            ) : (
              <ol className="text-xs text-slate-600 space-y-1.5 pl-4 list-decimal marker:text-[#58BCB3] marker:font-bold">
                <li>Download the latest release zip file from the <strong>GitHub Release page</strong>.</li>
                <li>Extract the downloaded zip folder onto your computer.</li>
                <li>In your Chromium browser, go to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-800 font-mono text-[11px]">chrome://extensions</code> (or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-800 font-mono text-[11px]">brave://extensions</code>).</li>
                <li>Enable <strong>"Developer mode"</strong> in the top-right corner.</li>
                <li>Click <strong>"Load unpacked"</strong> and select the extracted extension folder.</li>
              </ol>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
