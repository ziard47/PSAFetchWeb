import React from 'react'
import Tooltip from '@mui/material/Tooltip'

interface FloatingExtensionButtonProps {
  onOpen: () => void
}

export const FloatingExtensionButton: React.FC<FloatingExtensionButtonProps> = ({ onOpen }) => {
  return (
    <Tooltip title="Get PSA Grabber Browser Extension (Edge & Chrome)" placement="left" arrow>
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-teal-700 via-[#58BCB3] to-[#439d95] hover:from-teal-800 hover:to-[#388e86] text-white rounded-full shadow-lg shadow-teal-950/20 hover:shadow-xl hover:shadow-teal-950/30 border border-white/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
        style={{ fontFamily: 'var(--heading-font)' }}
        aria-label="Download PSA Grabber Extension"
      >
        <div className="relative flex items-center justify-center">
          <i className="fas fa-puzzle-piece text-base sm:text-lg group-hover:rotate-12 transition-transform duration-300"></i>
          {/* Animated pulsing status indicator */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        </div>

        <div className="flex flex-col text-left leading-none pr-0.5">
          <span className="text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center gap-1">
            <span>Extension</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">v2.1</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-teal-100 font-medium tracking-normal mt-0.5">
            Edge • Chrome
          </span>
        </div>
      </button>
    </Tooltip>
  )
}
