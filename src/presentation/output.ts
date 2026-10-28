import { cyan, green, red, yellow } from "../utils/colors.ts"
import { formatTemperature, formatWeeklyBlock } from "../utils/format.ts"
import type { City } from "../types/City.ts"
import type {
  CityWeeklyForecast,
  DailyForecast,
  Unit,
  WeatherNow,
} from "../types/Weather.ts"

export function printError(message: string): void {
  console.log(red(message))
}

export function printSuccess(message: string): void {
  console.log(green(message))
}

export function printInfo(message: string): void {
  console.log(cyan(message))
}

export function printCityList(title: string, cities: City[]): void {
  console.log(cyan(title))
  cities.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`))
}

export function printWeatherNow(weather: WeatherNow, unit: Unit): void {
  if (weather.temperature === null) {
    console.log(
      "\n" + red(`No se pudo obtener el clima para ${weather.city.name}.`)
    )
  } else {
    console.log(
      `\n${weather.city.name}: ${yellow(formatTemperature(weather.temperature, unit))}`
    )
  }
}

export function printWeatherList(weekly: WeatherNow[], unit: Unit): void {
  const lines: string[] = []
  for (const weather of weekly) {
    if (weather.temperature === null) {
      lines.push(red(`${weather.city.name}: No se pudo obtener el clima.`))
    } else {
      lines.push(
        `${weather.city.name}: ${yellow(formatTemperature(weather.temperature, unit))}`
      )
    }
  }
  console.log("\n" + (lines.join("\n") || red("No hay ciudades registradas.")))
}

export function printWeeklyForecast(
  name: string,
  days: DailyForecast[] | null,
  unit: Unit
): void {
  const block = days && days.length > 0
    ? formatWeeklyBlock(name, days, unit)
    : red(`No se pudo obtener el pronóstico para ${name}.`)
  console.log("\n" + block)
}

export function printWeeklyForecastAll(
  results: CityWeeklyForecast[],
  unit: Unit
): void {
  const blocks: string[] = []
  for (const result of results) {
    if (!result.days || result.days.length === 0) {
      blocks.push(red(`${result.city.name}: No se pudo obtener el pronóstico.`))
      continue
    }
    blocks.push(formatWeeklyBlock(result.city.name, result.days, unit))
  }
  console.log("\n" + (blocks.join("\n\n") || red("No hay ciudades registradas.")))
}
