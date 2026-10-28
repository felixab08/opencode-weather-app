import { getDailyForecast } from "../api/weather.ts"
import type { City } from "../types/City.ts"
import type { CityWeeklyForecast, DailyForecast } from "../types/Weather.ts"

export async function getWeeklyForecastForCity(
  city: City
): Promise<DailyForecast[] | null> {
  const days = await getDailyForecast(city.latitude, city.longitude)
  if (!days || days.length === 0) return null
  return days
}

export async function getWeeklyForecastForAllCities(
  cities: City[]
): Promise<CityWeeklyForecast[]> {
  const results: CityWeeklyForecast[] = []
  for (const city of cities) {
    const days = await getDailyForecast(city.latitude, city.longitude)
    results.push({ city, days })
  }
  return results
}
