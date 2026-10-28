import { afterEach, describe, expect, test } from "bun:test"
import { getDailyForecast, getForecast } from "../src/api/weather.ts"
import { installFetch, jsonResponse, restoreFetch } from "./helpers.ts"

afterEach(() => {
  restoreFetch()
})

describe("getForecast", () => {
  test("devuelve la temperatura actual", async () => {
    installFetch(() =>
      jsonResponse({ current: { temperature_2m: 21.4 } })
    )
    expect(await getForecast(40.4168, -3.7038)).toEqual({ temperature: 21.4 })
  })

  test("devuelve null si falta current", async () => {
    installFetch(() => jsonResponse({}))
    expect(await getForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si falta temperature_2m", async () => {
    installFetch(() => jsonResponse({ current: {} }))
    expect(await getForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si la respuesta no es ok", async () => {
    installFetch(() => jsonResponse({}, 500))
    expect(await getForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si el fetch falla", async () => {
    installFetch(() => {
      throw new Error("network down")
    })
    expect(await getForecast(40.4168, -3.7038)).toBeNull()
  })
})

describe("getDailyForecast", () => {
  const daily = {
    daily: {
      time: ["2026-10-28", "2026-10-29"],
      temperature_2m_max: [25, 18.5],
      temperature_2m_min: [10, 7.25],
      weather_code: [0, 61],
    },
  }

  test("devuelve el pronóstico de 7 días por defecto", async () => {
    let calledUrl = ""
    installFetch((url) => {
      calledUrl = url
      return jsonResponse(daily)
    })

    const result = await getDailyForecast(40.4168, -3.7038)
    expect(result).toEqual([
      { date: "2026-10-28", max: 25, min: 10, code: 0 },
      { date: "2026-10-29", max: 18.5, min: 7.25, code: 61 },
    ])
    expect(calledUrl).toContain("forecast_days=7")
    expect(calledUrl).toContain("timezone=auto")
    expect(calledUrl).toContain("daily=temperature_2m_max,temperature_2m_min,weather_code")
  })

  test("respeta el parámetro days", async () => {
    let calledUrl = ""
    installFetch((url) => {
      calledUrl = url
      return jsonResponse({
        daily: {
          time: ["2026-10-28"],
          temperature_2m_max: [25],
          temperature_2m_min: [10],
          weather_code: [0],
        },
      })
    })

    await getDailyForecast(40.4168, -3.7038, 3)
    expect(calledUrl).toContain("forecast_days=3")
  })

  test("devuelve null si falta daily", async () => {
    installFetch(() => jsonResponse({}))
    expect(await getDailyForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si algún array falta", async () => {
    installFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-28"],
          temperature_2m_max: [25],
          weather_code: [0],
        },
      })
    )
    expect(await getDailyForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si los tipos no son los esperados (payload malformado)", async () => {
    installFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-28", "2026-10-29"],
          temperature_2m_max: [25, "caliente"],
          temperature_2m_min: [10, 7],
          weather_code: [0, 61],
        },
      })
    )
    expect(await getDailyForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si la respuesta no es ok", async () => {
    installFetch(() => jsonResponse({}, 503))
    expect(await getDailyForecast(40.4168, -3.7038)).toBeNull()
  })

  test("devuelve null si el fetch falla", async () => {
    installFetch(() => {
      throw new Error("network down")
    })
    expect(await getDailyForecast(40.4168, -3.7038)).toBeNull()
  })
})
