import { loadStore, saveStore } from "./citiesStorage.ts"
import type { Unit } from "../types/Weather.ts"

export async function getUnit(): Promise<Unit> {
  const store = await loadStore()
  return store.unit
}

export async function setUnit(unit: Unit): Promise<void> {
  const store = await loadStore()
  store.unit = unit
  await saveStore(store)
}
