import { createTheme } from '@mui/material/styles'

export const artBlogMuiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#58BCB3', // Theme Teal
      light: '#7ecdc6',
      dark: '#439d95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a202c',
      light: '#2d3748',
      dark: '#0f172a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7faf9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#64748b',
    },
    divider: 'rgba(88, 188, 179, 0.2)',
  },
  typography: {
    fontFamily: '"PT Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    h2: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    h3: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    h4: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    h5: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    h6: { fontFamily: '"Fjalla One", sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' },
    button: { fontFamily: '"Fjalla One", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 22px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(88, 188, 179, 0.35)',
          },
        },
      },
    },
  },
})

export const liquidGlassTheme = artBlogMuiTheme
