export interface ForecastResult {
  temperature: number
}

export interface DailyForecast {
  date: string
  max: number
  min: number
  code: number
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

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Despejado", icon: "☀️" },
  1: { description: "Mayormente despejado", icon: "🌤️" },
  2: { description: "Parcialmente nublado", icon: "⛅" },
  3: { description: "Nublado", icon: "☁️" },
  45: { description: "Niebla", icon: "🌫️" },
  48: { description: "Niebla con escarcha", icon: "🌫️" },
  51: { description: "Llovizna ligera", icon: "🌦️" },
  53: { description: "Llovizna moderada", icon: "🌦️" },
  55: { description: "Llovizna intensa", icon: "🌧️" },
  56: { description: "Llovizna helada ligera", icon: "🌧️" },
  57: { description: "Llovizna helada intensa", icon: "🌧️" },
  61: { description: "Lluvia ligera", icon: "🌦️" },
  63: { description: "Lluvia moderada", icon: "🌧️" },
  65: { description: "Lluvia intensa", icon: "🌧️" },
  66: { description: "Lluvia helada ligera", icon: "🌧️" },
  67: { description: "Lluvia helada intensa", icon: "🌧️" },
  71: { description: "Nieve ligera", icon: "🌨️" },
  73: { description: "Nieve moderada", icon: "🌨️" },
  75: { description: "Nieve intensa", icon: "❄️" },
  77: { description: "Granos de nieve", icon: "🌨️" },
  80: { description: "Chubascos ligeros", icon: "🌦️" },
  81: { description: "Chubascos moderados", icon: "🌧️" },
  82: { description: "Chubascos violentos", icon: "⛈️" },
  85: { description: "Chubascos de nieve ligeros", icon: "🌨️" },
  86: { description: "Chubascos de nieve intensos", icon: "❄️" },
  95: { description: "Tormenta", icon: "⛈️" },
  96: { description: "Tormenta con granizo ligero", icon: "⛈️" },
  99: { description: "Tormenta con granizo intenso", icon: "⛈️" },
}

const UNKNOWN_WEATHER: { description: string; icon: string } = {
  description: "No disponible",
  icon: "—",
}

export function describeWeatherCode(code: number): {
  description: string
  icon: string
} {
  return WEATHER_CODES[code] ?? UNKNOWN_WEATHER
}
