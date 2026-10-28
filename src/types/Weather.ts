import type { City } from "./City.ts"

export type Unit = "celsius" | "fahrenheit"

export interface GeoResult {
  name: string
  latitude: number
  longitude: number
}

export interface ForecastResult {
  temperature: number
}

export interface DailyForecast {
  date: string
  max: number
  min: number
  code: number
}

export interface WeatherNow {
  city: City
  temperature: number | null
}

export interface CityWeeklyForecast {
  city: City
  days: DailyForecast[] | null
}
