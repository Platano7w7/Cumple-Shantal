// ── Integración con YouTube (Regalo 1) ──────────────────────────────────────

// Video recordado del buscador del Regalo 1 (se guarda en la persistencia).
export interface YoutubeVideo {
  videoId: string
  title: string
  channel: string
  thumb: string
}

export interface YoutubeSearchResult extends YoutubeVideo {}

// Busca canciones con la YouTube Data API v3 (la clave vive solo en el entorno).
export async function searchYouTube(query: string): Promise<YoutubeSearchResult[]> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_KEY_MISSING')
  const url =
    'https://www.googleapis.com/youtube/v3/search' +
    `?part=snippet&type=video&videoEmbeddable=true&maxResults=6&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('YOUTUBE_FETCH_FAILED')
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string }
      snippet?: { title?: string; channelTitle?: string; thumbnails?: { medium?: { url?: string } } }
    }>
  }
  return (data.items ?? [])
    .filter(it => it.id?.videoId && it.snippet?.title)
    .map(it => ({
      videoId: it.id!.videoId!,
      title: it.snippet!.title!,
      channel: it.snippet!.channelTitle ?? '',
      thumb: it.snippet!.thumbnails?.medium?.url ?? '',
    }))
}