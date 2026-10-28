import { geocodeCity } from "../api/geocoding.ts"
import { addCity } from "../storage/citiesStorage.ts"
import type { City } from "../types/City.ts"

export interface AddCityResult {
  city: City
}

export async function addCityByName(name: string): Promise<AddCityResult | null> {
  const geo = await geocodeCity(name)
  if (!geo) return null
  const city: City = { name: geo.name, latitude: geo.latitude, longitude: geo.longitude }
  await addCity(city)
  return { city }
}
