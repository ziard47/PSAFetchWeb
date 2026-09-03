import React from 'react'
import { MovieSummary } from '../types/movie'

interface ThemeHeroSliderProps {
  featuredMovie?: MovieSummary | null
  onSelectMovie?: (movie: MovieSummary) => void
  onExploreClick?: () => void
}

export const ThemeHeroSlider: React.FC<ThemeHeroSliderProps> = ({
  featuredMovie,
  onSelectMovie,
  onExploreClick,
}) => {
  const hasMovie = Boolean(featuredMovie)
  const title = featuredMovie ? featuredMovie.Title : 'EXPLORE WORLD CINEMA & EXCLUSIVE RELEASES'
  const year = featuredMovie?.Year || '2025'
  const type = featuredMovie?.Type || 'FEATURE FILM'
  const bgImage = (featuredMovie?.Poster && featuredMovie.Poster !== 'N/A')
    ? featuredMovie.Poster
    : '/assets/theme/slider1.png'

  const handleAction = () => {
    if (featuredMovie && onSelectMovie) {
      onSelectMovie(featuredMovie)
    } else if (onExploreClick) {
      onExploreClick()
    }
  }

  return (
    <section id="main-slider-wrap">
      <div
        className="main-slider-inner-box relative"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="main-slider-content-box">
          <div className="slider-badge-tag">
            <i className="fas fa-film mr-1 text-xs"></i>
            {type.toUpperCase()} • {year}
          </div>

          <h1>{title}</h1>

          <p className="slider-content">
            {featuredMovie
              ? `Watch and explore detailed cast profiles, high-definition download streams, and comprehensive episode guides for ${title}.`
              : 'Discover millions of movies and series with instant search, IMDb ratings, curated categories, and verified release links on PSA Fetch.'}
          </p>

          <div className="main-slider-button">
            <button
              type="button"
              className="slide-btn-1"
              onClick={handleAction}
            >
              {hasMovie ? 'View Details' : 'Discover Titles'}
              <span className="btn-icon">
                <i className="fas fa-chevron-right"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
