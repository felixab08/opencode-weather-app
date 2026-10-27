export interface ForecastResult {
  temperature: number
}

export async function getForecast(
  latitude: number,
  longitude: number
): Promise<ForecastResult | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as { current?: { temperature_2m: number } } | null
    const current = data?.current
    if (!current) return null
    return { temperature: current.temperature_2m }
  } catch {
    return null
  }
}
