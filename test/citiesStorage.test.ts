import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
  addCity,
  getDefaultCity,
  listCities,
  loadStore,
  removeCity,
  saveStore,
  setDefaultCity,
  type Store,
} from "../src/storage/citiesStorage.ts"
import { cleanupStore, useTempStore } from "./helpers.ts"
import type { City } from "../src/types/City.ts"

let storeFile: string

const madrid: City = { name: "Madrid", latitude: 40.4168, longitude: -3.7038 }
const lima: City = { name: "Lima", latitude: -12.0464, longitude: -77.0428 }

beforeEach(() => {
  storeFile = useTempStore()
})

afterEach(() => {
  void cleanupStore(storeFile)
})

describe("loadStore", () => {
  test("devuelve el store por defecto si el archivo no existe", async () => {
    const store = await loadStore()
    expect(store).toEqual({ cities: [], defaultCity: null, unit: "celsius" })
  })

  test("hace roundtrip de cities, defaultCity y unit", async () => {
    const original: Store = {
      cities: [madrid, lima],
      defaultCity: "Madrid",
      unit: "fahrenheit",
    }
    await saveStore(original)

    const store = await loadStore()
    expect(store.cities).toEqual([madrid, lima])
    expect(store.defaultCity).toBe("Madrid")
    expect(store.unit).toBe("fahrenheit")
  })

  test("normaliza un archivo corrupto o con tipos inválidos", async () => {
    await Bun.write(storeFile, "{ esto no es json")
    expect(await loadStore()).toEqual({
      cities: [],
      defaultCity: null,
      unit: "celsius",
    })

    await Bun.write(storeFile, JSON.stringify({ cities: "no", unit: "kelvin" }))
    expect(await loadStore()).toEqual({
      cities: [],
      defaultCity: null,
      unit: "celsius",
    })
  })
})

describe("addCity", () => {
  test("agrega una ciudad nueva", async () => {
    await addCity(madrid)
    expect(await listCities()).toEqual([madrid])
  })

  test("no agrega duplicados aunque cambie la capitalización", async () => {
    await addCity(madrid)
    await addCity({ name: "MADRID", latitude: 1, longitude: 2 })
    expect(await listCities()).toEqual([madrid])
  })
})

describe("removeCity", () => {
  test("elimina la ciudad sin distinguir mayúsculas", async () => {
    await addCity(madrid)
    await addCity(lima)
    await removeCity("madrid")
    expect(await listCities()).toEqual([lima])
  })

  test("limpia defaultCity si era la ciudad eliminada", async () => {
    await addCity(madrid)
    await setDefaultCity("Madrid")
    await removeCity("MADRID")

    const store = await loadStore()
    expect(store.defaultCity).toBeNull()
    expect(await getDefaultCity()).toBeNull()
  })

  test("conserva defaultCity si se elimina otra ciudad", async () => {
    await addCity(madrid)
    await addCity(lima)
    await setDefaultCity("Madrid")
    await removeCity("Lima")

    const store = await loadStore()
    expect(store.defaultCity).toBe("Madrid")
  })
})

describe("setDefaultCity", () => {
  test("fija el default si la ciudad existe", async () => {
    await addCity(madrid)
    await setDefaultCity("madrid")

    const store = await loadStore()
    expect(store.defaultCity).toBe("madrid")
    expect(await getDefaultCity()).toEqual(madrid)
  })

  test("no cambia nada si la ciudad no existe", async () => {
    await addCity(madrid)
    await setDefaultCity("París")

    const store = await loadStore()
    expect(store.defaultCity).toBeNull()
    expect(await getDefaultCity()).toBeNull()
  })
})

describe("getDefaultCity", () => {
  test("devuelve null si no hay default", async () => {
    await addCity(madrid)
    expect(await getDefaultCity()).toBeNull()
  })

  test("encuentra el default sin distinguir mayúsculas", async () => {
    await addCity(madrid)
    await saveStore({
      cities: [madrid],
      defaultCity: "MADRID",
      unit: "celsius",
    })
    expect(await getDefaultCity()).toEqual(madrid)
  })
})
