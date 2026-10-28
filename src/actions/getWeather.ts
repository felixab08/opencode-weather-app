import { getForecast } from "../api/weather.ts"
import type { City } from "../types/City.ts"
import type { WeatherNow } from "../types/Weather.ts"

export async function getWeatherForCity(city: City): Promise<WeatherNow> {
  const forecast = await getForecast(city.latitude, city.longitude)
  return { city, temperature: forecast ? forecast.temperature : null }
}

export async function getWeatherForAllCities(cities: City[]): Promise<WeatherNow[]> {
  const results: WeatherNow[] = []
  for (const city of cities) {
    const forecast = await getForecast(city.latitude, city.longitude)
    results.push({ city, temperature: forecast ? forecast.temperature : null })
  }
  return results
}
