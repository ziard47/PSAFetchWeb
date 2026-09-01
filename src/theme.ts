import { createTheme } from '@mui/material/styles'

export const liquidGlassTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b981', // Emerald 500
      light: '#6ee7b7', // Emerald 300
      dark: '#047857', // Emerald 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14b8a6', // Teal 500
      light: '#5eead4',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#040d0a',
      paper: 'rgba(10, 30, 24, 0.8)',
    },
    text: {
      primary: '#f0fdf4',
      secondary: '#a7f3d0',
    },
    divider: 'rgba(52, 211, 153, 0.15)',
  },
  typography: {
    fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 33, 27, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s ease-in-out',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: '#ecfdf5',
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(8, 26, 21, 0.92)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.2)',
          borderRadius: 24,
        },
      },
    },
  },
})
