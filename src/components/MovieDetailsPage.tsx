import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ShareIcon from '@mui/icons-material/Share'
import CloseIcon from '@mui/icons-material/Close'
import { MovieDetails, MovieSummary, SeasonData, EpisodeSummary } from '../types/movie'
import { getSeasonEpisodes, getMovieDetails } from '../services/movieApi'
import { PsaDownloadsSection } from './PsaDownloadsSection'
import { ShareModal } from './ShareModal'

interface MovieDetailsPageProps {
  movie: MovieDetails | null
  loading: boolean
  onBack: () => void
  isBookmarked: boolean
  onToggleBookmark: (movie: MovieSummary) => void
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({
  movie,
  loading,
  onBack,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [posterError, setPosterError] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Reset poster error when movie changes
  useEffect(() => {
    setPosterError(false)
  }, [movie?.imdbID])

  // TV Seasons & Episodes State
  const isSeries = movie?.Type?.toLowerCase() === 'series' || (movie?.totalSeasons && parseInt(movie.totalSeasons, 10) > 0)
  const totalSeasonsCount = parseInt(movie?.totalSeasons || '1', 10) || 1
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null)
  const [isSeasonLoading, setIsSeasonLoading] = useState(false)

  // Episode Details Modal state
  const [selectedEpisode, setSelectedEpisode] = useState<MovieDetails | null>(null)
  const [isEpisodeLoading, setIsEpisodeLoading] = useState(false)
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false)

  // Fetch season episodes when selected season changes
  useEffect(() => {
    if (!isSeries || !movie?.imdbID) return

    let isSubscribed = true
    const fetchSeason = async () => {
      setIsSeasonLoading(true)
      const data = await getSeasonEpisodes(movie.imdbID, selectedSeason)
      if (isSubscribed) {
        setSeasonData(data)
        setIsSeasonLoading(false)
      }
    }

    fetchSeason()
    return () => {
      isSubscribed = false
    }
  }, [movie?.imdbID, isSeries, selectedSeason])

  // Open individual episode details
  const handleOpenEpisodeDetails = async (ep: EpisodeSummary) => {
    setIsEpisodeModalOpen(true)
    setIsEpisodeLoading(true)
    setSelectedEpisode(null)

    const details = await getMovieDetails(ep.imdbID)
    if (details) {
      setSelectedEpisode(details)
    } else {
      setSelectedEpisode({
        imdbID: ep.imdbID,
        Title: ep.Title,
        Year: ep.Released || 'N/A',
        Rated: 'N/A',
        Released: ep.Released || 'N/A',
        Runtime: 'N/A',
        Genre: 'Episode',
        Director: 'N/A',
        Writer: 'N/A',
        Actors: 'Cast details in main listing',
        Plot: 'No synopsis available.',
        Language: 'English',
        Country: 'USA',
        Awards: 'N/A',
        Poster: 'N/A',
        Ratings: [],
        Metascore: 'N/A',
        imdbRating: ep.imdbRating || 'N/A',
        imdbVotes: 'N/A',
        Type: 'episode',
        Season: String(selectedSeason),
        Episode: ep.Episode,
        Response: 'False',
      })
    }
    setIsEpisodeLoading(false)
  }

  const handleShare = () => {
    if (!movie) return
    setIsShareModalOpen(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', py: 12 }}>
        <CircularProgress size={48} sx={{ color: '#58BCB3', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#1a202c', fontWeight: 600, fontFamily: 'var(--heading-font)' }}>
          FETCHING TITLE & MEDIA DETAILS...
        </Typography>
      </Box>
    )
  }

  if (!movie) {
    return (
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#ef4444', mb: 3, fontFamily: 'var(--heading-font)' }}>
          COULD NOT LOAD DETAILS FOR THIS TITLE.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ bgcolor: '#58BCB3', '&:hover': { bgcolor: '#439d95' } }}
        >
          Back to Search
        </Button>
      </Box>
    )
  }

  // Parse Ratings
  const rottenTomatoes = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value
  const metacritic =
    movie.Ratings?.find((r) => r.Source === 'Metacritic')?.Value ||
    (movie.Metascore && movie.Metascore !== 'N/A' ? `${movie.Metascore}/100` : null)

  const genres = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(',').map((g) => g.trim()) : []
  const actors = movie.Actors && movie.Actors !== 'N/A' ? movie.Actors.split(',').map((a) => a.trim()) : []

  return (
    <div className="pb-12">
      {/* Art Blog Breadcrumbs (art_blog_breadcrumbs) */}
      <div className="artblog-breadcrumbs mb-4 flex items-center gap-2 text-sm text-slate-500">
        <button type="button" onClick={onBack} className="text-[#58BCB3] hover:underline flex items-center gap-1 font-semibold">
          <i className="fas fa-home text-xs"></i> Home
        </button>
        <span>/</span>
        <span className="text-slate-600 font-medium capitalize">{movie.Type || 'Movie'}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{movie.Title}</span>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6 gap-2">
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: '#1a202c',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            px: { xs: 1.8, sm: 3 },
            py: { xs: 0.6, sm: 0.8 },
            fontWeight: 600,
            fontSize: { xs: '0.82rem', sm: '0.9rem' },
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#effaf8',
              borderColor: '#58BCB3',
              color: '#439d95',
              transform: 'translateX(-3px)',
            },
          }}
        >
          <span>Back to Feed</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="contained"
            startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={() => onToggleBookmark(movie)}
            sx={{
              bgcolor: isBookmarked ? '#439d95' : '#58BCB3',
              borderRadius: '24px',
              px: { xs: 1.8, sm: 3 },
              py: { xs: 0.6, sm: 0.8 },
              fontSize: { xs: '0.82rem', sm: '0.88rem' },
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(88, 188, 179, 0.3)',
              '&:hover': {
                bgcolor: '#3a8b84',
              },
            }}
          >
            <span>{isBookmarked ? 'Saved' : 'Add to Watchlist'}</span>
          </Button>

          <Button
            variant="outlined"
            onClick={handleShare}
            title="Share or Copy Link"
            sx={{
              minWidth: { xs: '36px', sm: '42px' },
              width: { xs: '36px', sm: '42px' },
              height: { xs: '36px', sm: '42px' },
              p: 0,
              borderColor: '#cbd5e1',
              color: '#475569',
              borderRadius: '50%',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                borderColor: '#58BCB3',
                color: '#58BCB3',
                bgcolor: '#effaf8',
              },
            }}
          >
            <ShareIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </Button>
        </div>
      </div>

      {/* Main Single Post Article Card (content.php & single.php) */}
      <article className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-slate-200 shadow-sm mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Poster Media */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center">
            <div className="relative group max-w-[260px] md:max-w-none w-full">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-slate-100 aspect-2/3 w-full">
                {movie.Poster && movie.Poster !== 'N/A' && !posterError ? (
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setPosterError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <i className={`fas ${isSeries ? 'fa-tv' : 'fa-film'} text-5xl mb-2 text-[#58BCB3]`}></i>
                    <span className="text-sm font-semibold text-slate-600">
                      No Poster Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Header & Summary */}
          <div className="md:col-span-8 lg:col-span-9">
            {/* Title */}
            <h1
              className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-wide text-slate-900 m-0 mb-3 uppercase leading-tight"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              {movie.Title}
            </h1>

            {/* Badges Bar (entry-meta) */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-slate-600">
              {movie.Rated && movie.Rated !== 'N/A' && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800">
                  {movie.Rated}
                </span>
              )}

              {movie.Year && (
                <span className="flex items-center gap-1.5 font-medium">
                  <i className="far fa-calendar-alt text-[#58BCB3]"></i>
                  <span>{movie.Released !== 'N/A' ? movie.Released : movie.Year}</span>
                </span>
              )}

              {movie.Runtime && movie.Runtime !== 'N/A' && (
                <span className="flex items-center gap-1.5 font-medium">
                  <i className="far fa-clock text-[#58BCB3]"></i>
                  <span>{movie.Runtime}</span>
                </span>
              )}

              {movie.Type && (
                <span className="px-2.5 py-0.5 rounded-md text-xs uppercase tracking-wider font-bold bg-teal-50 border border-teal-200 text-teal-800">
                  {movie.Type}
                </span>
              )}

              {isSeries && movie.totalSeasons && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800">
                  {movie.totalSeasons} {parseInt(movie.totalSeasons, 10) === 1 ? 'Season' : 'Seasons'}
                </span>
              )}
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {/* IMDb Rating */}
              {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-lg mb-0.5">
                    <i className="fas fa-star text-amber-500 text-sm"></i>
                    <span>{movie.imdbRating}</span>
                    <span className="text-xs text-amber-700/70">/10</span>
                  </div>
                  <span className="text-xs text-amber-800 font-semibold block">
                    IMDb ({movie.imdbVotes !== 'N/A' ? movie.imdbVotes : 'Votes'})
                  </span>
                </div>
              )}

              {/* Rotten Tomatoes */}
              {rottenTomatoes && (
                <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-center">
                  <div className="font-bold text-red-600 text-lg mb-0.5">
                    🍅 {rottenTomatoes}
                  </div>
                  <span className="text-xs text-red-700 font-semibold block">
                    Rotten Tomatoes
                  </span>
                </div>
              )}

              {/* Metacritic */}
              {metacritic && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                  <div className="font-bold text-blue-600 text-lg mb-0.5">
                    {metacritic}
                  </div>
                  <span className="text-xs text-blue-700 font-semibold block">
                    Metascore
                  </span>
                </div>
              )}
            </div>

            {/* Genres Tag Cloud */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Plot Synopsis (entry-content) */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h3
                className="text-sm font-bold text-[#439d95] uppercase tracking-wider mb-2"
                style={{ fontFamily: 'var(--heading-font)' }}
              >
                STORYLINE & SYNOPSIS
              </h3>
              <p className="text-slate-700 leading-relaxed text-base m-0">
                {movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No detailed plot summary available for this title.'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <hr className="my-8 border-slate-200" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Director */}
          {movie.Director && movie.Director !== 'N/A' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-[#439d95] uppercase block mb-1">
                Director
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {movie.Director}
              </span>
            </div>
          )}

          {/* Writers */}
          {movie.Writer && movie.Writer !== 'N/A' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-[#439d95] uppercase block mb-1">
                Writers
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {movie.Writer}
              </span>
            </div>
          )}

          {/* Awards */}
          {movie.Awards && movie.Awards !== 'N/A' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-[#439d95] uppercase flex items-center gap-1 mb-1">
                <i className="fas fa-trophy text-amber-500"></i> Awards
              </span>
              <span className="text-sm text-slate-700">
                {movie.Awards}
              </span>
            </div>
          )}

          {/* Box Office */}
          {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-[#439d95] uppercase flex items-center gap-1 mb-1">
                <i className="fas fa-coins text-emerald-600"></i> Box Office
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {movie.BoxOffice}
              </span>
            </div>
          )}

          {/* Language & Origin */}
          {(movie.Language || movie.Country) && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-[#439d95] uppercase flex items-center gap-1 mb-1">
                <i className="fas fa-globe text-sky-600"></i> Language & Origin
              </span>
              <span className="text-sm text-slate-700">
                {movie.Language !== 'N/A' ? movie.Language : ''} {movie.Country !== 'N/A' ? `(${movie.Country})` : ''}
              </span>
            </div>
          )}

          {/* Cast Chips */}
          {actors.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2 md:col-span-3">
              <span className="text-xs font-bold text-[#439d95] uppercase block mb-2">
                Starring Cast
              </span>
              <div className="flex flex-wrap gap-2">
                {actors.map((actor) => (
                  <span
                    key={actor}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  >
                    <i className="fas fa-user-circle text-[#58BCB3]"></i>
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Movie PSA Downloads Section (Only for Feature Films) */}
      {!isSeries && <PsaDownloadsSection movieTitle={movie.Title} year={movie.Year} />}

      {/* TV Series Seasons & Episodes Section */}
      {isSeries && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mt-8">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#58BCB3] flex items-center justify-center">
              <i className="fas fa-tv text-lg"></i>
            </div>
            <div>
              <h2
                className="text-xl sm:text-2xl font-normal tracking-wide text-slate-800 m-0 uppercase"
                style={{ fontFamily: 'var(--heading-font)' }}
              >
                Seasons & Episode Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 m-0">
                Select a season to view and explore individual episode downloads and synopsis
              </p>
            </div>
          </div>

          {/* Season Tabs */}
          <div className="border-b border-slate-200 mb-6">
            <Tabs
              value={selectedSeason}
              onChange={(_, val) => setSelectedSeason(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  bgcolor: '#58BCB3',
                  height: 3,
                  borderRadius: '3px',
                },
                '& .MuiTab-root': {
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--heading-font)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#439d95',
                  },
                },
              }}
            >
              {Array.from({ length: totalSeasonsCount }, (_, i) => i + 1).map((seasonNum) => (
                <Tab key={seasonNum} label={`Season ${seasonNum}`} value={seasonNum} />
              ))}
            </Tabs>
          </div>

          {/* Episode List */}
          {isSeasonLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <i className="fas fa-circle-notch fa-spin text-3xl text-[#58BCB3]"></i>
              <p className="text-sm text-slate-500">Loading Season {selectedSeason} episodes...</p>
            </div>
          ) : seasonData && seasonData.Episodes && seasonData.Episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonData.Episodes.map((ep) => (
                <div
                  key={ep.imdbID || ep.Episode}
                  onClick={() => handleOpenEpisodeDetails(ep)}
                  className="group cursor-pointer p-4 rounded-xl flex flex-col justify-between bg-slate-50 hover:bg-teal-50/40 border border-slate-200 hover:border-[#58BCB3] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#58BCB3] text-white"
                        style={{ fontFamily: 'var(--heading-font)' }}
                      >
                        EP {ep.Episode}
                      </span>

                      {ep.imdbRating && ep.imdbRating !== 'N/A' && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <i className="fas fa-star text-amber-500"></i>
                          <span>{ep.imdbRating}</span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 group-hover:text-[#439d95] transition-colors line-clamp-2 m-0 mb-1 text-base">
                      {ep.Title}
                    </h4>

                    {ep.Released && ep.Released !== 'N/A' && (
                      <span className="text-xs text-slate-500 block">
                        Aired: {ep.Released}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200">
                    <span className="text-xs font-semibold text-[#58BCB3] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <i className="fas fa-play text-[10px]"></i>
                      <span>Episode Details &rarr;</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              No episode listings found for Season {selectedSeason}.
            </div>
          )}
        </section>
      )}

      {/* Individual Episode Details Modal */}
      <Dialog
        open={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          },
          paper: {
            sx: {
              bgcolor: '#ffffff',
              borderRadius: { xs: '20px', sm: '28px' },
              border: '1px solid rgba(88, 188, 179, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(88, 188, 179, 0.1)',
              color: '#1a202c',
              overflow: 'hidden',
              maxHeight: { xs: '92vh', sm: '88vh' },
              m: { xs: 1.5, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Modal Sticky Header */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-100/90 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs"
                style={{ fontFamily: 'var(--heading-font)' }}
              >
                <i className="fas fa-tv text-[10px] text-[#58BCB3]"></i>
                Season {selectedEpisode?.Season || selectedSeason} • Episode {selectedEpisode?.Episode}
              </span>
              {selectedEpisode?.imdbRating && selectedEpisode.imdbRating !== 'N/A' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                  <i className="fas fa-star text-amber-500 text-[11px]"></i>
                  <span>{selectedEpisode.imdbRating}/10</span>
                </div>
              )}
              <span className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {movie.Title}
              </span>
            </div>

            <h2
              className="text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-slate-900 m-0 uppercase leading-tight"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              {selectedEpisode ? selectedEpisode.Title : 'Episode Details'}
            </h2>

            {selectedEpisode && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-slate-500">
                {selectedEpisode.Released && selectedEpisode.Released !== 'N/A' && (
                  <span className="inline-flex items-center gap-1.5">
                    <i className="far fa-calendar-alt text-[#58BCB3]"></i>
                    <span>Aired: {selectedEpisode.Released}</span>
                  </span>
                )}
                {selectedEpisode.Runtime && selectedEpisode.Runtime !== 'N/A' && (
                  <span className="inline-flex items-center gap-1.5">
                    <i className="far fa-clock text-[#58BCB3]"></i>
                    <span>{selectedEpisode.Runtime}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsEpisodeModalOpen(false)}
            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-400 hover:text-[#439d95] flex items-center justify-center border border-slate-200 hover:border-[#58BCB3]/40 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close episode modal"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <DialogContent
          className="custom-scrollbar-light"
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            pt: { xs: 2.5, sm: 3 },
            overflowY: 'auto',
          }}
        >
          {isEpisodeLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shadow-xs">
                <i className="fas fa-circle-notch fa-spin text-2xl text-[#58BCB3]"></i>
              </div>
              <p className="text-sm font-semibold text-slate-600">Fetching Episode Details...</p>
              <p className="text-xs text-slate-400">Loading synopsis, ratings, and download sources</p>
            </div>
          ) : selectedEpisode ? (
            <div className="space-y-5">
              {/* Episode Banner Poster */}
              {selectedEpisode.Poster && selectedEpisode.Poster !== 'N/A' && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-md aspect-video sm:aspect-21/9 max-h-72 w-full bg-slate-900 group">
                  <img
                    src={selectedEpisode.Poster}
                    alt={selectedEpisode.Title}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs px-2 pointer-events-none">
                    <span className="font-semibold drop-shadow-sm flex items-center gap-1.5">
                      <i className="fas fa-film text-[#58BCB3]"></i>
                      Season {selectedEpisode.Season || selectedSeason} • Ep {selectedEpisode.Episode}
                    </span>
                    {selectedEpisode.Runtime && selectedEpisode.Runtime !== 'N/A' && (
                      <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium border border-white/10">
                        {selectedEpisode.Runtime}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Episode Synopsis */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 mb-2 text-[#439d95]">
                  <i className="fas fa-align-left text-xs"></i>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Episode Overview
                  </span>
                </div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed m-0">
                  {selectedEpisode.Plot && selectedEpisode.Plot !== 'N/A'
                    ? selectedEpisode.Plot
                    : 'No detailed synopsis available for this episode.'}
                </p>
              </div>

              {/* Episode PSA Downloads Section */}
              <div className="pt-1">
                <PsaDownloadsSection
                  isEpisode
                  showTitle={movie.Title}
                  season={selectedEpisode.Season || selectedSeason}
                  episode={selectedEpisode.Episode}
                  year={movie.Year}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Share Modal Dialog */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        movie={movie}
      />
    </div>
  )
}
