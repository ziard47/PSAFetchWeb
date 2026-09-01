import { PsaDownloadItem } from '../types/movie'

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function cleanSearchQuery(title: string): string {
  return title
    .replace(/['']s\b/gi, '') // Remove possessives like 's so "Zack Snyder's" -> "Zack Snyder"
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']s\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchesMovieTitle(torrentTitle: string, targetTitle: string, targetYear?: string): boolean {
  const decodedTorrent = decodeHtmlEntities(torrentTitle)

  // Exclude TV episodes and series packs from movie downloads
  if (/\b(s\d+e\d+|season\s*\d+|complete\s*series)\b/i.test(decodedTorrent)) {
    return false
  }

  const normTarget = normalizeTitle(targetTitle)

  // If 4-digit year is provided, ensure the torrent year matches
  if (targetYear && /^\d{4}$/.test(targetYear.trim())) {
    const yNum = parseInt(targetYear.trim(), 10)
    const validYears = [yNum - 1, yNum, yNum + 1].map(String)

    // Check all 4-digit years found in the torrent title
    const foundYears = decodedTorrent.match(/\b(19|20)\d{2}\b/g)
    if (foundYears && foundYears.length > 0) {
      if (!foundYears.some((y) => validYears.includes(y))) {
        return false
      }
    }
  }

  // Extract movie title prefix before 4-digit year or format specs
  const yearMatch = decodedTorrent.match(/\b(19|20)\d{2}\b/)
  let prefix = decodedTorrent
  if (yearMatch && yearMatch.index !== undefined && yearMatch.index > 0) {
    prefix = decodedTorrent.slice(0, yearMatch.index)
  } else {
    const resMatch = decodedTorrent.match(/\b(2160p|1080p|720p|480p|bluray|web-?dl)\b/i)
    if (resMatch && resMatch.index !== undefined && resMatch.index > 0) {
      prefix = decodedTorrent.slice(0, resMatch.index)
    }
  }

  // Clean prefix from uploader headers
  prefix = prefix.replace(/^www\.[^\s]+\s*-\s*/i, '')
  const normPrefix = normalizeTitle(prefix)

  if (normPrefix === normTarget) return true
  if (normPrefix.replace(/\s+/g, '') === normTarget.replace(/\s+/g, '')) return true

  return false
}

function matchesShowTitle(torrentTitle: string, targetShow: string, epCode: string): boolean {
  const decodedTorrent = decodeHtmlEntities(torrentTitle)
  const normTarget = normalizeTitle(targetShow)

  // Must match the episode code in the torrent title (e.g. S01E01)
  const epRegex = new RegExp('\\b' + epCode + '\\b', 'i')
  if (!epRegex.test(decodedTorrent.replace(/[^a-zA-Z0-9]/g, ' '))) {
    return false
  }

  // Extract show title prefix before the episode code
  const codeIdx = decodedTorrent.search(new RegExp(epCode, 'i'))
  let prefix = codeIdx > 0 ? decodedTorrent.slice(0, codeIdx) : decodedTorrent

  // Remove release year (e.g. 2019, 2020) and non-alphanumeric chars
  prefix = prefix.replace(/\b(19|20)\d{2}\b/g, '')
  const normPrefix = normalizeTitle(prefix)

  if (normPrefix === normTarget) return true

  // Strip all spaces to compare compressed tokens (e.g. 'theboys' === 'theboys')
  return normPrefix.replace(/\s+/g, '') === normTarget.replace(/\s+/g, '')
}

function parseRssXml(xmlText: string): PsaDownloadItem[] {
  const items: PsaDownloadItem[] = []
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const itemBlock of itemMatches) {
    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i)
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i)
    const descMatch = itemBlock.match(/<description>([\s\S]*?)<\/description>/i)
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)

    const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : ''
    const rawLink = linkMatch ? decodeHtmlEntities(linkMatch[1].trim()) : ''
    const rawDesc = descMatch ? descMatch[1].replace(/<\/?!\[CDATA\[|\]\]>/g, '').trim() : ''
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : undefined

    // Exclude if description contains "Application" keyword or title is an .exe file
    if (/application/i.test(rawDesc) || /\.exe$/i.test(rawTitle) || /downloader\.exe/i.test(rawTitle) || /\.dmg$/i.test(rawTitle)) {
      continue
    }

    // Only include items with HEVC-PSA in title and valid magnet link
    if (/hevc-psa/i.test(rawTitle) && rawLink.startsWith('magnet:')) {
      const sizeMatch = rawDesc.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|KB|GiB|MiB))/i)
      const resMatch = rawTitle.match(/(2160p|1080p|720p|480p|4K|UHD)/i)

      let resolution = 'HD'
      if (resMatch) {
        resolution = resMatch[1].toUpperCase() === '4K' || resMatch[1].toUpperCase() === 'UHD' ? '2160p' : resMatch[1]
      }

      // Extract codec / audio badges (e.g. 10bit, BluRay, HDR10+, DV, 8CH, 6CH)
      const codecTags: string[] = []
      if (/2160p|4k/i.test(rawTitle)) codecTags.push('4K UHD')
      if (/1080p/i.test(rawTitle)) codecTags.push('1080p')
      if (/720p/i.test(rawTitle)) codecTags.push('720p')
      if (/hdr10plus|hdr10\+/i.test(rawTitle)) codecTags.push('HDR10+')
      if (/\bdv\b|dolby.?vision/i.test(rawTitle)) codecTags.push('Dolby Vision')
      if (/10bit/i.test(rawTitle)) codecTags.push('10bit')
      if (/bluray|blu-ray/i.test(rawTitle)) codecTags.push('BluRay')
      if (/web-dl|webrip/i.test(rawTitle)) codecTags.push('WEBRip')
      if (/8ch|ddp5\.1|5\.1|7\.1/i.test(rawTitle)) {
        const audioMatch = rawTitle.match(/(8CH|6CH|DDP5\.1|5\.1|7\.1)/i)
        if (audioMatch) codecTags.push(audioMatch[1].toUpperCase())
      }

      items.push({
        title: rawTitle,
        magnet: rawLink,
        size: sizeMatch ? sizeMatch[1] : 'N/A',
        resolution,
        codecInfo: codecTags.join(' • '),
        pubDate,
      })
    }
  }

  // Sort: 2160p first, then 1080p, then 720p, etc.
  const rankOrder: Record<string, number> = { '2160p': 1, '1080p': 2, '720p': 3, '480p': 4 }
  items.sort((a, b) => {
    const rankA = rankOrder[a.resolution.toLowerCase()] || 99
    const rankB = rankOrder[b.resolution.toLowerCase()] || 99
    return rankA - rankB
  })

  return items
}

const downloadsCache = new Map<string, PsaDownloadItem[]>()

async function executeRssQuery(searchQuery: string): Promise<PsaDownloadItem[]> {
  const cacheKey = `downloads:${searchQuery.toLowerCase()}`

  if (downloadsCache.has(cacheKey)) {
    return downloadsCache.get(cacheKey)!
  }

  const encoded = encodeURIComponent(searchQuery)
  const targetUrl = `https://bt4gprx.com/search?q=${encoded}&page=rss`

  // 1. Primary: Vite dev server proxy
  try {
    const localProxyUrl = `/api/bt4g/search?q=${encoded}&page=rss`
    const res = await fetch(localProxyUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })

    if (res.ok) {
      const text = await res.text()
      if (text && text.includes('<rss')) {
        const parsed = parseRssXml(text)
        downloadsCache.set(cacheKey, parsed)
        return parsed
      }
    }
  } catch {
    // If local proxy network fails, attempt direct/fallback
  }

  // 2. Secondary: If not running in dev proxy or standalone static, try raw CORS proxy
  const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  try {
    const res = await fetch(fallbackUrl)
    if (res.ok) {
      const text = await res.text()
      if (text && text.includes('<rss')) {
        const parsed = parseRssXml(text)
        downloadsCache.set(cacheKey, parsed)
        return parsed
      }
    }
  } catch {
    // Fallback failed
  }

  downloadsCache.set(cacheKey, [])
  return []
}

export async function fetchPsaDownloads(movieTitle: string, movieYear?: string): Promise<PsaDownloadItem[]> {
  const cleanTitle = cleanSearchQuery(movieTitle)
  if (!cleanTitle) return []

  const cleanYear = movieYear && /^\d{4}$/.test(movieYear.trim()) ? movieYear.trim() : ''

  // 1. First attempt with clean title & exact Year: e.g. "Zack Snyder Justice League 2021 psa"
  if (cleanYear) {
    const queryWithYear = `${cleanTitle} ${cleanYear} psa`
    const results = await executeRssQuery(queryWithYear)
    const filtered = results.filter((item) => matchesMovieTitle(item.title, movieTitle, cleanYear))
    if (filtered.length > 0) {
      return filtered
    }
  }

  // 2. Second attempt with clean title without Year: e.g. "Zack Snyder Justice League psa"
  const queryWithoutYear = `${cleanTitle} psa`
  const results = await executeRssQuery(queryWithoutYear)
  const filtered = results.filter((item) => matchesMovieTitle(item.title, movieTitle, cleanYear))
  if (filtered.length > 0) {
    return filtered
  }

  // 3. Third attempt with literal alphanumeric title if needed: e.g. "Zack Snyders Justice League 2021 psa"
  const literalTitle = movieTitle.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (literalTitle !== cleanTitle) {
    const literalQuery = cleanYear ? `${literalTitle} ${cleanYear} psa` : `${literalTitle} psa`
    const litResults = await executeRssQuery(literalQuery)
    return litResults.filter((item) => matchesMovieTitle(item.title, movieTitle, cleanYear))
  }

  return []
}

export async function fetchPsaEpisodeDownloads(
  showTitle: string,
  season: number | string,
  episode: number | string,
  year?: string
): Promise<PsaDownloadItem[]> {
  const cleanTitle = cleanSearchQuery(showTitle)
  if (!cleanTitle) return []

  const sNum = parseInt(season.toString(), 10) || 1
  const eNum = parseInt(episode.toString(), 10) || 1
  const padS = sNum.toString().padStart(2, '0')
  const padE = eNum.toString().padStart(2, '0')
  const epCode = `S${padS}E${padE}`

  // Clean 4-digit release year if present
  const cleanYear = year && /^\d{4}$/.test(year.trim()) ? year.trim() : ''

  // 1. First attempt with Year if provided: e.g. "The Boys 2019 S01E01 PSA"
  if (cleanYear) {
    const queryWithYear = `${cleanTitle} ${cleanYear} ${epCode} PSA`
    const results = await executeRssQuery(queryWithYear)
    const filtered = results.filter((item) => matchesShowTitle(item.title, showTitle, epCode))
    if (filtered.length > 0) {
      return filtered
    }
  }

  // 2. Second attempt without Year: e.g. "The Boys S01E01 PSA"
  const queryWithoutYear = `${cleanTitle} ${epCode} PSA`
  const results = await executeRssQuery(queryWithoutYear)
  return results.filter((item) => matchesShowTitle(item.title, showTitle, epCode))
}
