import { bold, red, yellow } from "./colors.ts"
import { UNKNOWN_WEATHER, WEATHER_CODES } from "./constants.ts"
import type { WeatherCodeInfo } from "./constants.ts"
import type { DailyForecast, Unit } from "../types/Weather.ts"

export function formatTemperature(temp: number, unit: Unit): string {
  if (unit === "fahrenheit") {
    const f = (temp * 9) / 5 + 32
    return `${f.toFixed(1)} °F`
  }
  return `${temp.toFixed(1)} °C`
}

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
})

export function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return DATE_FORMAT.format(parsed)
}

export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? UNKNOWN_WEATHER
}

export function formatWeeklyBlock(
  name: string,
  days: DailyForecast[],
  unit: Unit
): string {
  const lines = days.map((day) => {
    const { description, icon } = describeWeatherCode(day.code)
    return (
      `  ${formatDate(day.date).padEnd(12)}${icon} ${description.padEnd(26)}` +
      `min ${yellow(formatTemperature(day.min, unit))} / max ${yellow(formatTemperature(day.max, unit))}`
    )
  })
  return `${bold(name)} — pronóstico 7 días:\n${lines.join("\n")}`
}
