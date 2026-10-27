export interface GeoResult {
  name: string
  latitude: number
  longitude: number
}

export async function geocodeCity(name: string): Promise<GeoResult | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as {
      results?: Array<{ name: string; latitude: number; longitude: number }>
    } | null
    const results = data?.results
    if (!results || results.length === 0) return null
    const first = results[0]
    if (!first) return null
    return {
      name: first.name,
      latitude: first.latitude,
      longitude: first.longitude,
    }
  } catch {
    return null
  }
}
