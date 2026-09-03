import React, { useState } from 'react'
import { MovieSummary } from '../types/movie'

interface MovieCardProps {
  movie: MovieSummary
  isBookmarked: boolean
  onToggleBookmark: (e: React.MouseEvent, movie: MovieSummary) => void
  onSelectMovie: (movie: MovieSummary) => void
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isBookmarked,
  onToggleBookmark,
  onSelectMovie,
}) => {
  const [imgError, setImgError] = useState(false)
  const isSeries = movie.Type?.toLowerCase() === 'series'

  return (
    <article className="card-item card-blog-post group cursor-pointer">
      {/* Media / Poster */}
      <div className="card-media" onClick={() => onSelectMovie(movie)}>
        {movie.Poster && movie.Poster !== 'N/A' && !imgError ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-100 text-slate-400">
            <i className={`fas ${isSeries ? 'fa-tv' : 'fa-film'} text-4xl mb-2 text-[#58BCB3]`}></i>
            <span className="text-xs font-semibold text-slate-600 line-clamp-2">
              {movie.Title}
            </span>
          </div>
        )}

        {/* Format Badge */}
        <span className="media-badge">
          {isSeries ? 'TV Series' : 'Movie'}
        </span>

        {/* Bookmark Button */}
        <button
          type="button"
          className={`media-bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => onToggleBookmark(e, movie)}
          title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <i className={`fas fa-bookmark text-xs ${isBookmarked ? 'text-white' : ''}`}></i>
        </button>
      </div>

      {/* Entry Header & Meta */}
      <header className="entry-header" onClick={() => onSelectMovie(movie)}>
        <div className="entry-meta">
          <span className="posted-on">
            <i className="far fa-calendar-alt text-[#58BCB3] text-xs"></i>
            <span>{movie.Year || 'N/A'}</span>
          </span>
          <span className="posted-on">
            <i className="fas fa-tag text-[#58BCB3] text-xs"></i>
            <span className="capitalize">{movie.Type || 'Feature'}</span>
          </span>
        </div>

        <h3 className="entry-title">
          <a
            href={`#${movie.imdbID}`}
            onClick={(e) => {
              e.preventDefault()
              onSelectMovie(movie)
            }}
          >
            {movie.Title}
          </a>
        </h3>
      </header>

      {/* Entry Content & Button */}
      <div className="entry-content">
        {/* <p>
          Explore cast, IMDb rating, streaming resolutions, and PSA releases for {movie.Title}.
        </p> */}

        <button
          type="button"
          className="btn read-btn text-uppercase"
          onClick={() => onSelectMovie(movie)}
        >
          <span>View Details</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </button>
      </div>
    </article>
  )
}
