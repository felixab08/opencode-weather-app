import type { DailyForecast, ForecastResult } from "../types/Weather.ts"

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
    if (!current || typeof current.temperature_2m !== "number") return null
    return { temperature: current.temperature_2m }
  } catch {
    return null
  }
}

export async function getDailyForecast(
  latitude: number,
  longitude: number,
  days = 7
): Promise<DailyForecast[] | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=${days}&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as {
      daily?: {
        time?: unknown
        temperature_2m_max?: unknown
        temperature_2m_min?: unknown
        weather_code?: unknown
      }
    } | null
    const daily = data?.daily
    const dates = daily?.time
    const max = daily?.temperature_2m_max
    const min = daily?.temperature_2m_min
    const codes = daily?.weather_code
    if (
      !Array.isArray(dates) ||
      !Array.isArray(max) ||
      !Array.isArray(min) ||
      !Array.isArray(codes)
    ) {
      return null
    }
    const result: DailyForecast[] = []
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      const maxT = max[i]
      const minT = min[i]
      const code = codes[i]
      if (
        typeof date !== "string" ||
        typeof maxT !== "number" ||
        typeof minT !== "number" ||
        typeof code !== "number"
      ) {
        return null
      }
      result.push({ date, max: maxT, min: minT, code })
    }
    return result
  } catch {
    return null
  }
}
