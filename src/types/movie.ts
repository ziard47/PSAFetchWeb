export interface MovieSummary {
  imdbID: string
  Title: string
  Year: string
  Type: 'movie' | 'series' | 'episode' | string
  Poster: string
}

export interface MovieRating {
  Source: string
  Value: string
}

export interface EpisodeSummary {
  imdbID: string
  Title: string
  Released: string
  Episode: string
  imdbRating: string
}

export interface SeasonData {
  Title: string
  Season: string
  totalSeasons: string
  Episodes: EpisodeSummary[]
  Response: string
  Error?: string
}

export interface PsaDownloadItem {
  title: string
  magnet: string
  size: string
  resolution: string
  codecInfo: string
  pubDate?: string
}

export interface MovieDetails {
  imdbID: string
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: MovieRating[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  Type: 'movie' | 'series' | 'episode' | string
  BoxOffice?: string
  Production?: string
  totalSeasons?: string
  Season?: string
  Episode?: string
  seriesID?: string
  Response: string
  Error?: string
}

export interface SearchFilters {
  type: '' | 'movie' | 'series'
  page: number
}

export interface WatchlistItem {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
  imdbRating?: string
  Genre?: string
  addedAt: number
}
