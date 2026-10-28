import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { getUnit, setUnit } from "../../src/storage/settingsStorage.ts"
import { addCity, loadStore } from "../../src/storage/citiesStorage.ts"
import { cleanupStore, useTempStore } from "../helpers.ts"
import type { City } from "../../src/types/City.ts"

let storeFile: string

const madrid: City = { name: "Madrid", latitude: 40.4168, longitude: -3.7038 }

beforeEach(() => {
  storeFile = useTempStore()
})

afterEach(() => {
  void cleanupStore(storeFile)
})

describe("settingsStorage", () => {
  test("el unit por defecto es celsius", async () => {
    expect(await getUnit()).toBe("celsius")
  })

  test("setUnit cambia la unidad y persiste", async () => {
    await setUnit("fahrenheit")
    expect(await getUnit()).toBe("fahrenheit")
  })

  test("setUnit conserva las ciudades del store", async () => {
    await addCity(madrid)
    await setUnit("fahrenheit")

    const store = await loadStore()
    expect(store.unit).toBe("fahrenheit")
    expect(store.cities).toEqual([madrid])
  })

  test("vuelve a celsius después de fahrenheit", async () => {
    await setUnit("fahrenheit")
    await setUnit("celsius")
    expect(await getUnit()).toBe("celsius")
  })
})
