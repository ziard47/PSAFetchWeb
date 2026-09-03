import React, { useState, useEffect } from "react";
import { MovieCard } from "./MovieCard";
import { MovieSummary } from "../types/movie";
import { fetchLatestReleases } from "../services/movieApi";

interface LatestReleasesGridProps {
  filterType: "" | "movie" | "series";
  onSelectMovie: (summary: MovieSummary) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (e: React.MouseEvent, movie: MovieSummary) => void;
  onFeaturedMovieLoaded?: (movie: MovieSummary) => void;
}

export const LatestReleasesGrid: React.FC<LatestReleasesGridProps> = ({
  filterType,
  onSelectMovie,
  isBookmarked,
  onToggleBookmark,
  onFeaturedMovieLoaded,
}) => {
  const [releases, setReleases] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadReleases = async () => {
      setLoading(true);
      const data = await fetchLatestReleases();
      if (isMounted) {
        setReleases(data);
        if (data.length > 0 && onFeaturedMovieLoaded) {
          onFeaturedMovieLoaded(data[0]);
        }
        setLoading(false);
      }
    };

    loadReleases();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReleases = filterType
    ? releases.filter(
        (item) => item.Type.toLowerCase() === filterType.toLowerCase(),
      )
    : releases;

  const sectionTitle =
    filterType === "movie"
      ? "Featured Movie Releases"
      : filterType === "series"
        ? "Featured Television Releases"
        : "Latest PSA Media Releases";

  const sectionSubtitle =
    filterType === "movie"
      ? "Curated movie encodes fetched live from official PSA feed (psa.wf)"
      : filterType === "series"
        ? "Curated television and series encodes fetched live from official PSA feed (psa.wf)"
        : "Real-time high-efficiency releases indexed live from official PSA feed (psa.wf)";

  return (
    <div className="mt-2 sm:mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#58BCB3] flex items-center justify-center shadow-xs shrink-0">
            <i className="fas fa-fire-alt text-sm sm:text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-normal tracking-wide text-slate-800 m-0 leading-tight" style={{ fontFamily: 'var(--heading-font)' }}>
              {sectionTitle}
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-500 m-0" style={{ fontFamily: 'var(--body-font)' }}>
              {sectionSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <i className="fas fa-circle-notch fa-spin text-3xl text-[#58BCB3]"></i>
          <p className="text-sm text-slate-500">
            Fetching latest releases from official PSA feed (psa.wf)...
          </p>
        </div>
      ) : (
        /* Latest Releases Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredReleases.slice(0, 18).map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              onSelectMovie={() => onSelectMovie(movie)}
              isBookmarked={isBookmarked(movie.imdbID)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
