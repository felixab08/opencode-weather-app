import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { addCityByName } from "../src/actions/addCity.ts"
import { removeCity } from "../src/actions/removeCity.ts"
import { setDefaultCity } from "../src/actions/setDefaultCity.ts"
import { listCities } from "../src/actions/listCities.ts"
import { getWeatherForAllCities, getWeatherForCity } from "../src/actions/getWeather.ts"
import {
  getWeeklyForecastForAllCities,
  getWeeklyForecastForCity,
} from "../src/actions/getWeeklyForecast.ts"
import { getDefaultCity } from "../src/storage/citiesStorage.ts"
import {
  cleanupStore,
  installFetch,
  jsonResponse,
  restoreFetch,
  useTempStore,
} from "./helpers.ts"
import type { City } from "../src/types/City.ts"

let storeFile: string

const madrid: City = { name: "Madrid", latitude: 40.4168, longitude: -3.7038 }
const lima: City = { name: "Lima", latitude: -12.0464, longitude: -77.0428 }

beforeEach(() => {
  storeFile = useTempStore()
})

afterEach(() => {
  restoreFetch()
  void cleanupStore(storeFile)
})

describe("addCityByName", () => {
  test("geocodifica, agrega la ciudad y la devuelve", async () => {
    installFetch(() =>
      jsonResponse({
        results: [{ name: "Madrid", latitude: 40.4168, longitude: -3.7038 }],
      })
    )

    const result = await addCityByName("Madrid")
    expect(result).toEqual({ city: madrid })
    expect(await listCities()).toEqual([madrid])
  })

  test("devuelve null y no agrega nada si la geocodificación falla", async () => {
    installFetch(() => jsonResponse({}))
    expect(await addCityByName("Ahorahereda")).toBeNull()
    expect(await listCities()).toEqual([])
  })
})

describe("getWeatherForCity / getWeatherForAllCities", () => {
  test("devuelve la temperatura actual de la ciudad", async () => {
    installFetch(() => jsonResponse({ current: { temperature_2m: 18.2 } }))
    const now = await getWeatherForCity(madrid)
    expect(now).toEqual({ city: madrid, temperature: 18.2 })
  })

  test("temperature es null si la API no responde con datos", async () => {
    installFetch(() => jsonResponse({}, 500))
    const now = await getWeatherForCity(madrid)
    expect(now).toEqual({ city: madrid, temperature: null })
  })

  test("consulta todas las ciudades", async () => {
    installFetch(() => jsonResponse({ current: { temperature_2m: 22 } }))
    const results = await getWeatherForAllCities([madrid, lima])
    expect(results).toEqual([
      { city: madrid, temperature: 22 },
      { city: lima, temperature: 22 },
    ])
  })
})

describe("getWeeklyForecastForCity / getWeeklyForecastForAllCities", () => {
  const daily = {
    daily: {
      time: ["2026-10-28"],
      temperature_2m_max: [25],
      temperature_2m_min: [10],
      weather_code: [0],
    },
  }

  test("devuelve los días del pronóstico", async () => {
    installFetch(() => jsonResponse(daily))
    const days = await getWeeklyForecastForCity(madrid)
    expect(days).toEqual([{ date: "2026-10-28", max: 25, min: 10, code: 0 }])
  })

  test("devuelve null si no hay pronóstico", async () => {
    installFetch(() => jsonResponse({}, 500))
    expect(await getWeeklyForecastForCity(madrid)).toBeNull()
  })

  test("consulta todas las ciudades conservando null por ciudad", async () => {
    let call = 0
    installFetch(() => {
      call++
      return call === 1 ? jsonResponse(daily) : jsonResponse({}, 500)
    })

    const results = await getWeeklyForecastForAllCities([madrid, lima])
    expect(results[0]).toEqual({
      city: madrid,
      days: [{ date: "2026-10-28", max: 25, min: 10, code: 0 }],
    })
    expect(results[1]).toEqual({ city: lima, days: null })
  })
})

describe("flujo completo de acciones", () => {
  test("agregar → default → eliminar limpia el default", async () => {
    installFetch((url) => {
      const payload = url.includes("name=Lima")
        ? { results: [{ name: "Lima", latitude: -12.0464, longitude: -77.0428 }] }
        : { results: [{ name: "Madrid", latitude: 40.4168, longitude: -3.7038 }] }
      return jsonResponse(payload)
    })

    await addCityByName("Lima")
    await addCityByName("Madrid")
    expect(await listCities()).toHaveLength(2)

    await setDefaultCity("Lima")
    expect((await getDefaultCity())?.name).toBe("Lima")

    await removeCity("Lima")
    expect(await listCities()).toHaveLength(1)
    expect(await getDefaultCity()).toBeNull()
  })
})
