import React from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface AgeWarningModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const AgeWarningModal: React.FC<AgeWarningModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden',
            p: 0,
            m: { xs: 2, sm: 3 },
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header with vibrant warm warning gradient */}
        <div className="relative bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 text-white p-5 sm:p-6 text-center">
          {/* Close button */}
          <IconButton
            onClick={onCancel}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              bgcolor: 'rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: 'var(--heading-font)' }}>
              18+
            </span>
          </div>

          <h2
            className="text-xl sm:text-2xl font-bold tracking-wide m-0 text-white"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            Age Verification Required
          </h2>
          <p className="text-xs text-rose-100/90 mt-1 mb-0 font-medium">
            Mature &amp; Adult Content Notice
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <WarningAmberIcon className="text-amber-600 shrink-0 mt-0.5" fontSize="small" />
            <p className="text-xs text-amber-900 leading-relaxed m-0 font-medium">
              You are about to access the <strong>Adult (18+)</strong> catalog. This section contains explicit media intended strictly for mature adult audiences.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} className="text-rose-600" />
              <span>Please confirm your age to proceed:</span>
            </div>
            <p className="m-0 pl-6 text-slate-500">
              By clicking <strong>&ldquo;I am 18 or Older&rdquo;</strong>, you certify that you are at least 18 years of age (or the legal age of majority in your jurisdiction) and consent to viewing adult materials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              <LockOutlinedIcon sx={{ fontSize: 16 }} />
              <span>I am 18 or Older</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold tracking-wider uppercase transition active:scale-98 cursor-pointer"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              Exit / Go Back
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
