import type { City } from "../types/City.ts"
import type { Unit } from "../types/Weather.ts"

const DEFAULT_STORE_FILE = "cities.json"

// Ruta del almacén, overridable para aislar los tests del cities.json real.
function storeFile(): string {
  return process.env.CITIES_FILE ?? DEFAULT_STORE_FILE
}

export interface Store {
  cities: City[]
  defaultCity: string | null
  unit: Unit
}

function defaultStore(): Store {
  return { cities: [], defaultCity: null, unit: "celsius" }
}

export async function loadStore(): Promise<Store> {
  try {
    const text = await Bun.file(storeFile()).text()
    const data = JSON.parse(text) as Partial<Store>
    return {
      cities: Array.isArray(data.cities) ? data.cities : [],
      defaultCity: typeof data.defaultCity === "string" ? data.defaultCity : null,
      unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    }
  } catch {
    return defaultStore()
  }
}

export async function saveStore(store: Store): Promise<void> {
  await Bun.write(storeFile(), JSON.stringify(store, null, 2))
}

export async function addCity(city: City): Promise<void> {
  const store = await loadStore()
  const exists = store.cities.some(
    (c) => c.name.toLowerCase() === city.name.toLowerCase()
  )
  if (!exists) {
    store.cities.push(city)
    await saveStore(store)
  }
}

export async function removeCity(name: string): Promise<void> {
  const store = await loadStore()
  store.cities = store.cities.filter(
    (c) => c.name.toLowerCase() !== name.toLowerCase()
  )
  if (store.defaultCity?.toLowerCase() === name.toLowerCase()) {
    store.defaultCity = null
  }
  await saveStore(store)
}

export async function setDefaultCity(name: string): Promise<void> {
  const store = await loadStore()
  const exists = store.cities.some(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  )
  if (exists) {
    store.defaultCity = name
    await saveStore(store)
  }
}

export async function listCities(): Promise<City[]> {
  const store = await loadStore()
  return store.cities
}

export async function getDefaultCity(): Promise<City | null> {
  const store = await loadStore()
  if (!store.defaultCity) return null
  return (
    store.cities.find((c) => c.name.toLowerCase() === store.defaultCity!.toLowerCase()) ??
    null
  )
}
