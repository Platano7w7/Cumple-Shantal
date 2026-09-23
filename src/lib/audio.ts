// ── Utilidades de audio local ───────────────────────────────────────────────
// Funciona con Figma Make y Vite (base del sitio).

// Resuelve rutas relativas a la base del sitio.
export function resolveAudio(file: string): string {
  if (file.startsWith('/') || /^[a-z]+:/i.test(file)) return file
  return `${import.meta.env.BASE_URL}${file}`
}

// ¿Existe el archivo de audio? Se comprueba en caliente para ocultar canciones
// que todavía no tienen su mp3.
const audioExistsCache = new Map<string, Promise<boolean>>()

export function audioFileExists(file: string): Promise<boolean> {
  const url = resolveAudio(file)
  const cached = audioExistsCache.get(url)
  if (cached) return cached
  const check = fetch(url, { method: 'HEAD' })
    .then(res => res.ok)
    .catch(() => false)
  audioExistsCache.set(url, check)
  return check
}