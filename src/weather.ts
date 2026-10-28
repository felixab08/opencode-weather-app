import { describeWeatherCode, getDailyForecast, getForecast } from "./forecast.ts"
import type { DailyForecast } from "./forecast.ts"
import { getUnit } from "./store.ts"
import { bold, red, yellow } from "./colors.ts"
import type { City } from "./store.ts"

export function formatTemperature(
  temp: number,
  unit: Unit
): string {
  if (unit === "fahrenheit") {
    const f = (temp * 9) / 5 + 32
    return `${f.toFixed(1)} °F`
  }
  return `${temp.toFixed(1)} °C`
}

type Unit = "celsius" | "fahrenheit"

export async function getWeatherForCity(city: City): Promise<string> {
  const unit = await getUnit()
  const forecast = await getForecast(city.latitude, city.longitude)
  if (!forecast) {
    return red(`No se pudo obtener el clima para ${city.name}.`)
  }
  return `${city.name}: ${yellow(formatTemperature(forecast.temperature, unit))}`
}

export async function getWeatherForAllCities(cities: City[]): Promise<string> {
  const unit = await getUnit()
  const lines: string[] = []
  for (const city of cities) {
    const forecast = await getForecast(city.latitude, city.longitude)
    if (forecast) {
      lines.push(`${city.name}: ${yellow(formatTemperature(forecast.temperature, unit))}`)
    } else {
      lines.push(red(`${city.name}: No se pudo obtener el clima.`))
    }
  }
  return lines.join("\n") || red("No hay ciudades registradas.")
}

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
})

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return DATE_FORMAT.format(parsed)
}

function formatWeeklyBlock(
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

export async function getWeeklyForecastForCity(city: City): Promise<string> {
  const unit = await getUnit()
  const days = await getDailyForecast(city.latitude, city.longitude)
  if (!days || days.length === 0) {
    return red(`No se pudo obtener el pronóstico para ${city.name}.`)
  }
  return formatWeeklyBlock(city.name, days, unit)
}

export async function getWeeklyForecastForAllCities(cities: City[]): Promise<string> {
  const unit = await getUnit()
  const blocks: string[] = []
  for (const city of cities) {
    const days = await getDailyForecast(city.latitude, city.longitude)
    if (!days || days.length === 0) {
      blocks.push(red(`${city.name}: No se pudo obtener el pronóstico.`))
      continue
    }
    blocks.push(formatWeeklyBlock(city.name, days, unit))
  }
  return blocks.join("\n\n") || red("No hay ciudades registradas.")
}
