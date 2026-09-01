import React from 'react'
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import MovieIcon from '@mui/icons-material/Movie'
import TvIcon from '@mui/icons-material/Tv'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { SearchFilters } from '../types/movie'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  filters: SearchFilters
  onFiltersChange: (f: SearchFilters) => void
  isLoading: boolean
  onQuickSearch: (term: string) => void
}

const QUICK_TAGS = ['Inception', 'Dune', 'Oppenheimer', 'Interstellar', 'Batman', 'Spider-Man', 'Matrix', 'Avatar']

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  isLoading,
  onQuickSearch,
}) => {
  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    onFiltersChange({
      ...filters,
      type: (newType ?? '') as SearchFilters['type'],
      page: 1,
    })
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '900px', mx: 'auto', mb: 4 }}>
      {/* Main Glass Search Input */}
      <Paper
        elevation={0}
        sx={{
          p: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '24px',
          background: 'rgba(8, 30, 24, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1.5px solid rgba(52, 211, 153, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45), 0 0 25px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus-within': {
            borderColor: '#34d399',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.45)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', color: '#34d399' }}>
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: '#34d399' }} />
          ) : (
            <SearchIcon sx={{ fontSize: 28 }} />
          )}
        </Box>

        <InputBase
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search movies, TV shows, franchises, directors..."
          sx={{
            ml: 1,
            flex: 1,
            color: '#f0fdf4',
            fontSize: { xs: '1rem', md: '1.18rem' },
            fontWeight: 500,
            '& input::placeholder': {
              color: 'rgba(167, 243, 208, 0.6)',
              opacity: 1,
            },
          }}
        />

        {query && (
          <Tooltip title="Clear search">
            <IconButton
              onClick={() => onQueryChange('')}
              size="small"
              sx={{
                color: '#6ee7b7',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(16, 185, 129, 0.2)' },
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Filter Options: Type Selectors */}
      <Box
        sx={{
          mt: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Type Toggle Buttons */}
        <ToggleButtonGroup
          value={filters.type}
          exclusive
          onChange={handleTypeChange}
          size="small"
          sx={{
            background: 'rgba(8, 25, 20, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: '16px',
            p: '3px',
            '& .MuiToggleButton-root': {
              color: '#a7f3d0',
              border: 'none',
              borderRadius: '12px !important',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.7 },
              fontSize: { xs: '0.8rem', sm: '0.88rem' },
              fontWeight: 600,
              textTransform: 'none',
              gap: { xs: 0.5, sm: 0.8 },
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                bgcolor: 'rgba(16, 185, 129, 0.3)',
                color: '#ffffff',
                border: '1px solid rgba(52, 211, 153, 0.5)',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.35)',
              },
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#ffffff',
              },
            },
          }}
        >
          <ToggleButton value="">
            <AutoAwesomeIcon sx={{ fontSize: { xs: 15, sm: 17 } }} />
            All
          </ToggleButton>
          <ToggleButton value="movie">
            <MovieIcon sx={{ fontSize: { xs: 15, sm: 17 } }} />
            Movies
          </ToggleButton>
          <ToggleButton value="series">
            <TvIcon sx={{ fontSize: { xs: 15, sm: 17 } }} />
            Series
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Quick Search Suggestions */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '0.75rem',
            color: '#6ee7b7',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mr: 0.5,
          }}
        >
          Trending:
        </Box>
        {QUICK_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onClick={() => onQuickSearch(tag)}
            clickable
            sx={{
              background: 'rgba(6, 25, 20, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              color: '#d1fae5',
              fontSize: '0.78rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(16, 185, 129, 0.25)',
                borderColor: '#34d399',
                color: '#ffffff',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
