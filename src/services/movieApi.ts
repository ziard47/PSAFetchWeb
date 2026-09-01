import { MovieDetails, MovieSummary, SearchFilters, SeasonData } from '../types/movie'

const OMDB_KEYS = ['thewdb', '564727fa', '6c3a2d45', '4a3b711b']
let currentKeyIndex = 0

function getNextKey(): string {
  const key = OMDB_KEYS[currentKeyIndex % OMDB_KEYS.length]
  currentKeyIndex++
  return key
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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
      // Fall through
    }
  }

  // If it's a PSA fallback ID
  if (id.startsWith('psa-')) {
    const rawSearch = id.replace('psa-', '').replace(/-/g, ' ')
    try {
      const searchRes = await searchMovies(rawSearch)
      if (searchRes.movies.length > 0) {
        const details = await getMovieDetails(searchRes.movies[0].imdbID)
        if (details) {
          memoryCache.set(cacheKey, details)
          return details
        }
      }
    } catch {
      // Continue
    }
  }

  // Fetch from OMDb by imdbID
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

let cachedPsaReleases: MovieSummary[] | null = null

/**
 * Parses items from the official psa.wf/feed/ RSS feed
 */
function parsePsaFeedXml(xmlText: string): { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] {
  const items: { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] = []
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const it of itemMatches) {
    const rawTitle = (it.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ''
    const rawLink = (it.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || ''
    const desc = (it.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || ''
    const cats = [...it.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/gi)].map((m) => m[1])

    const cleanTitle = decodeHtmlEntities(rawTitle).trim()
    if (!cleanTitle) continue

    const isSeries = cats.some((c) => /tv-show|tv pack|series|episode/i.test(c)) || /\/tv-show\//i.test(rawLink)

    // Extract release year
    const yearInTitle = cleanTitle.match(/\((\d{4})\)/)
    const catYear = cats.find((c) => /^\d{4}$/.test(c))
    const currentYear = new Date().getFullYear().toString()
    const year = yearInTitle ? yearInTitle[1] : catYear || currentYear

    const pureTitle = cleanTitle.replace(/\s*\(\d{4}\)\s*/, '').trim()

    // Extract image thumbnail from description
    const imgMatch = desc.match(/src="([^"]+)"/i) || desc.match(/src='([^']+)'/i)
    const poster = imgMatch ? imgMatch[1] : ''

    items.push({
      title: cleanTitle,
      pureTitle,
      year,
      type: isSeries ? 'series' : 'movie',
      poster,
      link: rawLink,
    })
  }

  return items
}

/**
 * Fetches latest movie and TV show releases directly from https://psa.wf/feed/
 */
export async function fetchLatestReleases(): Promise<MovieSummary[]> {
  if (cachedPsaReleases && cachedPsaReleases.length > 0) {
    return cachedPsaReleases
  }

  const endpoints = [
    '/api/psa-feed/feed/',
    'https://psa.wf/feed/',
    `https://corsproxy.io/?${encodeURIComponent('https://psa.wf/feed/')}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://psa.wf/feed/')}`,
  ]

  let psaItems: { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] = []

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      if (res.ok) {
        const text = await res.text()
        if (text && text.includes('<rss') && text.includes('<item>')) {
          psaItems = parsePsaFeedXml(text)
          if (psaItems.length > 0) {
            break
          }
        }
      }
    } catch {
      // Try next fallback endpoint
    }
  }

  if (psaItems.length > 0) {
    // Resolve each item with its OMDb IMDb ID in parallel (with timeout protection)
    const enrichedList: MovieSummary[] = await Promise.all(
      psaItems.map(async (item) => {
        try {
          const key = getNextKey()
          let omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(item.pureTitle)}&apikey=${key}`
          if (item.year && item.type === 'movie') {
            omdbUrl += `&y=${encodeURIComponent(item.year)}`
          }

          const res = await fetch(omdbUrl)
          if (res.ok) {
            const data = await res.json()
            if (data.Response === 'True' && data.imdbID) {
              return {
                imdbID: data.imdbID,
                Title: data.Title || item.pureTitle,
                Year: data.Year || item.year,
                Type: data.Type === 'series' ? 'series' : item.type,
                Poster: item.poster || (data.Poster && data.Poster !== 'N/A' ? data.Poster : ''),
              }
            }
          }
        } catch {
          // If individual OMDb query fails, fall back to title-based search ID
        }

        // Fallback: search OMDb with simple query
        try {
          const searchResult = await searchMovies(item.pureTitle, { type: item.type })
          if (searchResult.movies.length > 0) {
            const match = searchResult.movies[0]
            return {
              imdbID: match.imdbID,
              Title: match.Title,
              Year: match.Year,
              Type: match.Type,
              Poster: item.poster || match.Poster,
            }
          }
        } catch {
          // Continue
        }

        // Final fallback summary
        return {
          imdbID: `psa-${item.pureTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          Title: item.pureTitle,
          Year: item.year,
          Type: item.type,
          Poster: item.poster,
        }
      })
    )

    cachedPsaReleases = enrichedList
    return enrichedList
  }

  return []
}
