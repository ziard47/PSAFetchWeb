import { MovieDetails, MovieSummary, SearchFilters, SeasonData } from '../types/movie'

const OMDB_KEYS = ['thewdb', '564727fa', '6c3a2d45', '4a3b711b']
let currentKeyIndex = 0

function getNextKey(): string {
  const key = OMDB_KEYS[currentKeyIndex % OMDB_KEYS.length]
  currentKeyIndex++
  return key
}

const memoryCache = new Map<string, any>()

export interface SearchResult {
  movies: MovieSummary[]
  totalResults: number
  error?: string
}

export async function searchMovies(query: string, filters?: Partial<SearchFilters>): Promise<SearchResult> {
  const trimmed = query.trim()
  if (!trimmed) return { movies: [], totalResults: 0 }

  const type = filters?.type || ''
  const page = filters?.page || 1

  const cacheKey = `search:${trimmed}:${type}:${page}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // Attempt OMDb with key rotation
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      let url = `https://www.omdbapi.com/?s=${encodeURIComponent(trimmed)}&page=${page}&apikey=${key}`
      if (type) url += `&type=${encodeURIComponent(type)}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.Response === 'True' && Array.isArray(data.Search)) {
        const result: SearchResult = {
          movies: data.Search.map((m: any) => ({
            imdbID: m.imdbID,
            Title: m.Title,
            Year: m.Year,
            Type: m.Type,
            Poster: m.Poster && m.Poster !== 'N/A' ? m.Poster : `https://images.metahub.space/poster/medium/${m.imdbID}/img`,
          })),
          totalResults: parseInt(data.totalResults, 10) || data.Search.length,
        }
        memoryCache.set(cacheKey, result)
        return result
      } else if (data.Error && data.Error.toLowerCase().includes('not found')) {
        return { movies: [], totalResults: 0, error: 'No movies found matching your search.' }
      }
    } catch {
      // Continue to next key or TVMaze fallback
    }
  }

  // Fallback to TVMaze API if OMDb is unavailable
  try {
    const tvmazeRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`)
    const tvmazeData = await tvmazeRes.json()

    if (Array.isArray(tvmazeData) && tvmazeData.length > 0) {
      const movies: MovieSummary[] = tvmazeData.map((item: any) => ({
        imdbID: item.show.externals?.imdb || `tvmaze-${item.show.id}`,
        Title: item.show.name,
        Year: item.show.premiered ? item.show.premiered.slice(0, 4) : 'N/A',
        Type: item.show.type === 'Scripted' ? 'series' : 'movie',
        Poster: item.show.image?.medium || item.show.image?.original || '',
      }))

      const result: SearchResult = {
        movies,
        totalResults: movies.length,
      }
      memoryCache.set(cacheKey, result)
      return result
    }
  } catch {
    // Both failed
  }

  return { movies: [], totalResults: 0, error: 'Network error. Please try again.' }
}

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  if (!id) return null

  const cacheKey = `details:${id}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // If it's a TVMaze fallback ID
  if (id.startsWith('tvmaze-')) {
    const showId = id.replace('tvmaze-', '')
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}`)
      if (res.ok) {
        const data = await res.json()
        const details: MovieDetails = {
          imdbID: id,
          Title: data.name,
          Year: data.premiered ? data.premiered.slice(0, 4) : 'N/A',
          Rated: 'TV-MA',
          Released: data.premiered || 'N/A',
          Runtime: `${data.runtime || 60} min`,
          Genre: Array.isArray(data.genres) ? data.genres.join(', ') : 'Drama',
          Director: 'N/A',
          Writer: 'N/A',
          Actors: 'Cast details available soon',
          Plot: data.summary ? data.summary.replace(/<[^>]*>?/gm, '') : 'No summary available.',
          Language: data.language || 'English',
          Country: data.network?.country?.name || 'USA',
          Awards: 'N/A',
          Poster: data.image?.original || data.image?.medium || '',
          Ratings: data.rating?.average ? [{ Source: 'TVMaze', Value: `${data.rating.average}/10` }] : [],
          Metascore: 'N/A',
          imdbRating: data.rating?.average ? data.rating.average.toString() : 'N/A',
          imdbVotes: 'N/A',
          Type: 'series',
          Response: 'True',
        }
        memoryCache.set(cacheKey, details)
        return details
      }
    } catch {
      // Fall through to OMDb
    }
  }

  // Fetch from OMDb
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(id)}&plot=full&apikey=${key}`)
      const data = await res.json()

      if (data.Response === 'True') {
        const details: MovieDetails = {
          ...data,
          Poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : `https://images.metahub.space/poster/medium/${id}/img`,
        }
        memoryCache.set(cacheKey, details)
        return details
      }
    } catch {
      // Try next key
    }
  }

  return null
}

export async function getSeasonEpisodes(seriesId: string, seasonNumber: number): Promise<SeasonData | null> {
  const cacheKey = `season:${seriesId}:${seasonNumber}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // Attempt OMDb
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?i=${encodeURIComponent(seriesId)}&Season=${seasonNumber}&apikey=${key}`
      )
      const data = await res.json()

      if (data.Response === 'True') {
        memoryCache.set(cacheKey, data)
        return data
      }
    } catch {
      // Try next key
    }
  }

  // Fallback to TVMaze if possible
  try {
    const lookupRes = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${seriesId}`)
    if (lookupRes.ok) {
      const showData = await lookupRes.json()
      const epRes = await fetch(`https://api.tvmaze.com/shows/${showData.id}/episodes`)
      const allEpisodes = await epRes.json()

      if (Array.isArray(allEpisodes)) {
        const filtered = allEpisodes.filter((ep: any) => ep.season === seasonNumber)
        const totalSeasons = Math.max(...allEpisodes.map((ep: any) => ep.season || 1), 1).toString()

        const seasonData: SeasonData = {
          Title: showData.name,
          Season: seasonNumber.toString(),
          totalSeasons,
          Episodes: filtered.map((ep: any) => ({
            imdbID: `tvmaze-ep-${ep.id}`,
            Title: ep.name,
            Released: ep.airdate || 'N/A',
            Episode: ep.number?.toString() || '1',
            imdbRating: ep.rating?.average ? ep.rating.average.toString() : 'N/A',
          })),
          Response: 'True',
        }
        memoryCache.set(cacheKey, seasonData)
        return seasonData
      }
    }
  } catch {
    // Fallback failed
  }

  return null
}

let cachedLatestReleases: MovieSummary[] | null = null

/**
 * Dynamically fetches current year's highest IMDb rated movies and series from live catalog API
 */
export async function fetchLatestReleases(): Promise<MovieSummary[]> {
  if (cachedLatestReleases && cachedLatestReleases.length > 0) {
    return cachedLatestReleases
  }

  const currentYear = new Date().getFullYear()
  const catalogUrls = [
    'https://v3-cinemeta.strem.io/catalog/movie/top.json',
    'https://v3-cinemeta.strem.io/catalog/series/top.json',
    'https://v3-cinemeta.strem.io/catalog/movie/top/genre=Action.json',
    'https://v3-cinemeta.strem.io/catalog/movie/top/genre=Drama.json',
    'https://v3-cinemeta.strem.io/catalog/movie/top/genre=Science%20Fiction.json',
    'https://v3-cinemeta.strem.io/catalog/series/top/genre=Drama.json',
    'https://v3-cinemeta.strem.io/catalog/series/top/genre=Action.json',
    'https://v3-cinemeta.strem.io/catalog/series/top/genre=Comedy.json',
  ]

  const rawMetas: any[] = []
  const seenIds = new Set<string>()

  await Promise.all(
    catalogUrls.map(async (url) => {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.metas)) {
            for (const m of data.metas) {
              if (m.imdb_id && !seenIds.has(m.imdb_id) && m.name) {
                seenIds.add(m.imdb_id)
                rawMetas.push(m)
              }
            }
          }
        }
      } catch {
        // Continue to other endpoints
      }
    })
  )

  // Filter for releases in current year or recent 2 years
  const minYear = currentYear - 2
  const filtered = rawMetas.filter((m) => {
    const rawYear = (m.year || m.releaseInfo || '').toString()
    const yearMatch = rawYear.match(/\b(19|20)\d{2}\b/)
    const parsedYear = yearMatch ? parseInt(yearMatch[0], 10) : 0
    return parsedYear >= minYear
  })

  // Sort by highest IMDb rating descending, then popularity
  filtered.sort((a, b) => {
    const rA = parseFloat(a.imdbRating) || 0
    const rB = parseFloat(b.imdbRating) || 0
    if (rB !== rA) return rB - rA
    return (b.popularity || 0) - (a.popularity || 0)
  })

  const results: MovieSummary[] = filtered.map((m) => {
    const rawYear = (m.year || m.releaseInfo || `${currentYear}`).toString()
    const yearMatch = rawYear.match(/\b(19|20)\d{2}\b/)
    const year = yearMatch ? yearMatch[0] : (m.releaseInfo || `${currentYear}`)
    const poster = m.poster || `https://images.metahub.space/poster/medium/${m.imdb_id}/img`

    return {
      imdbID: m.imdb_id,
      Title: m.name,
      Year: year,
      Type: m.type === 'series' ? 'series' : 'movie',
      Poster: poster,
    }
  })

  if (results.length > 0) {
    cachedLatestReleases = results
    return results
  }

  return []
}
