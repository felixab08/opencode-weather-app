import { getForecast } from "./forecast.ts"
import { getUnit } from "./store.ts"
import { red, yellow } from "./colors.ts"
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
