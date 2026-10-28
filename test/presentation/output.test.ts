import { afterEach, beforeEach, describe, expect, test, mock } from "bun:test"
import {
  printCityList,
  printError,
  printInfo,
  printSuccess,
  printWeatherList,
  printWeatherNow,
  printWeeklyForecast,
  printWeeklyForecastAll,
} from "../../src/presentation/output.ts"
import { stripAnsi } from "../helpers.ts"
import type { City } from "../../src/types/City.ts"
import type { CityWeeklyForecast, WeatherNow } from "../../src/types/Weather.ts"

let logs: string[]
let logSpy: ReturnType<typeof mock>

beforeEach(() => {
  logs = []
  logSpy = mock((message?: unknown) => {
    logs.push(String(message ?? ""))
  })
  console.log = logSpy as unknown as typeof console.log
})

afterEach(() => {
  logSpy.mockRestore()
})

const madrid: City = { name: "Madrid", latitude: 40.4168, longitude: -3.7038 }
const lima: City = { name: "Lima", latitude: -12.0464, longitude: -77.0428 }

const weather = (city: City, temperature: number | null): WeatherNow => ({
  city,
  temperature,
})

function joined(): string {
  return stripAnsi(logs.join("\n"))
}

describe("mensajes simples", () => {
  test("printError imprime el mensaje", () => {
    printError("Algo salió mal")
    expect(joined()).toBe("Algo salió mal")
  })

  test("printSuccess imprime el mensaje", () => {
    printSuccess("Ciudad agregada")
    expect(joined()).toBe("Ciudad agregada")
  })

  test("printInfo imprime el mensaje", () => {
    printInfo("Cargando…")
    expect(joined()).toBe("Cargando…")
  })
})

describe("printCityList", () => {
  test("imprime título y ciudades numeradas desde 1", () => {
    printCityList("Tus ciudades:", [madrid, lima])
    const output = joined()
    expect(output).toContain("Tus ciudades:")
    expect(output).toContain("1. Madrid")
    expect(output).toContain("2. Lima")
  })

  test("imprime solo el título si no hay ciudades", () => {
    printCityList("Tus ciudades:", [])
    expect(joined()).toBe("Tus ciudades:")
  })
})

describe("printWeatherNow", () => {
  test("imprime ciudad y temperatura en la unidad indicada", () => {
    printWeatherNow(weather(madrid, 21.5), "celsius")
    expect(joined()).toContain("Madrid: 21.5 °C")
  })

  test("convierte a fahrenheit", () => {
    printWeatherNow(weather(madrid, 25), "fahrenheit")
    expect(joined()).toContain("Madrid: 77.0 °F")
  })

  test("imprime error cuando la temperatura es null", () => {
    printWeatherNow(weather(madrid, null), "celsius")
    expect(joined()).toContain("No se pudo obtener el clima para Madrid.")
  })
})

describe("printWeatherList", () => {
  test("imprime una línea por ciudad", () => {
    printWeatherList([weather(madrid, 20), weather(lima, 15.3)], "celsius")
    const output = joined()
    expect(output).toContain("Madrid: 20.0 °C")
    expect(output).toContain("Lima: 15.3 °C")
  })

  test("marca las ciudades sin datos", () => {
    printWeatherList([weather(madrid, null)], "celsius")
    expect(joined()).toContain("Madrid: No se pudo obtener el clima.")
  })

  test("avisa si no hay ciudades registradas", () => {
    printWeatherList([], "celsius")
    expect(joined()).toContain("No hay ciudades registradas.")
  })
})

describe("printWeeklyForecast", () => {
  const days = [{ date: "2026-10-28", max: 25, min: 10, code: 0 }]

  test("imprime el bloque de 7 días", () => {
    printWeeklyForecast("Madrid", days, "celsius")
    const output = joined()
    expect(output).toContain("Madrid — pronóstico 7 días:")
    expect(output).toContain("Despejado")
    expect(output).toContain("min 10.0 °C / max 25.0 °C")
  })

  test("imprime error si days es null", () => {
    printWeeklyForecast("Madrid", null, "celsius")
    expect(joined()).toContain("No se pudo obtener el pronóstico para Madrid.")
  })

  test("imprime error si days está vacío", () => {
    printWeeklyForecast("Madrid", [], "celsius")
    expect(joined()).toContain("No se pudo obtener el pronóstico para Madrid.")
  })
})

describe("printWeeklyForecastAll", () => {
  const days = [{ date: "2026-10-28", max: 25, min: 10, code: 0 }]

  test("imprime un bloque por ciudad", () => {
    const results: CityWeeklyForecast[] = [
      { city: madrid, days },
      { city: lima, days },
    ]
    printWeeklyForecastAll(results, "celsius")
    const text = stripAnsi(logs.join("\n"))
    expect(text).toContain("Madrid — pronóstico 7 días:")
    expect(text).toContain("Lima — pronóstico 7 días:")
  })

  test("marca las ciudades sin pronóstico", () => {
    const results: CityWeeklyForecast[] = [{ city: lima, days: null }]
    printWeeklyForecastAll(results, "celsius")
    expect(joined()).toContain("Lima: No se pudo obtener el pronóstico.")
  })

  test("avisa si no hay ciudades registradas", () => {
    printWeeklyForecastAll([], "celsius")
    expect(joined()).toContain("No hay ciudades registradas.")
  })
})
