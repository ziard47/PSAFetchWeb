// Cloudflare Pages Function to proxy PSA RSS feed directly at Cloudflare edge
export async function onRequest(context: { request: Request; params: { path?: string[] } }): Promise<Response> {
  const url = new URL(context.request.url)
  const targetPath = url.pathname.replace(/^\/api\/psa-feed/, '')
  const targetUrl = `https://psa.wf${targetPath}${url.search}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })

    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  } catch {
    return new Response('Proxy Error', { status: 502 })
  }
}
