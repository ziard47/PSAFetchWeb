import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { MovieCard } from "./MovieCard";
import { MovieSummary } from "../types/movie";
import { fetchLatestReleases } from "../services/movieApi";

interface LatestReleasesGridProps {
  filterType: "" | "movie" | "series";
  onSelectMovie: (summary: MovieSummary) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (e: React.MouseEvent, movie: MovieSummary) => void;
}

export const LatestReleasesGrid: React.FC<LatestReleasesGridProps> = ({
  filterType,
  onSelectMovie,
  isBookmarked,
  onToggleBookmark,
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
      ? `Top Rated Movies`
      : filterType === "series"
        ? `Top Rated TV Series`
        : `Latest & Highest Rated Releases`;

  const sectionSubtitle =
    filterType === "movie"
      ? `Current year's highest IMDb rated movies fetched live`
      : filterType === "series"
        ? `Current year's highest IMDb rated television series fetched live`
        : `Real-time top IMDb rated movies & series released this year`;

  return (
    <Box sx={{ mt: 3 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: "12px",
              bgcolor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              color: "#34d399",
              display: "flex",
            }}
          >
            <WhatshotIcon />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#ecfdf5",
                letterSpacing: "-0.02em",
              }}
            >
              {sectionTitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#6ee7b7", opacity: 0.85 }}
            >
              {sectionSubtitle}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}
        >
          <CircularProgress size={36} sx={{ color: "#34d399" }} />
          <Typography variant="body2" sx={{ color: "#a7f3d0", opacity: 0.8 }}>
            Fetching current year highest IMDb rated releases...
          </Typography>
        </Box>
      ) : (
        /* Latest Dynamic Releases Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredReleases.slice(0, 20).map((movie) => (
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
    </Box>
  );
};
