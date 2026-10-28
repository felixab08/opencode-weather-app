import { describe, expect, test } from "bun:test"
import {
  formatDate,
  formatTemperature,
  formatWeeklyBlock,
  describeWeatherCode,
} from "../../src/utils/format.ts"
import { UNKNOWN_WEATHER } from "../../src/utils/constants.ts"
import { stripAnsi } from "../helpers.ts"

describe("formatTemperature", () => {
  test("formatea en celsius con un decimal", () => {
    expect(formatTemperature(25.5, "celsius")).toBe("25.5 °C")
    expect(formatTemperature(0, "celsius")).toBe("0.0 °C")
    expect(formatTemperature(-10.25, "celsius")).toBe("-10.3 °C")
  })

  test("convierte a fahrenheit con un decimal", () => {
    expect(formatTemperature(25, "fahrenheit")).toBe("77.0 °F")
    expect(formatTemperature(100, "fahrenheit")).toBe("212.0 °F")
    expect(formatTemperature(0, "fahrenheit")).toBe("32.0 °F")
    expect(formatTemperature(-40, "fahrenheit")).toBe("-40.0 °F")
  })
})

describe("formatDate", () => {
  test("formatea fecha ISO a formato corto en español", () => {
    const formatted = formatDate("2026-10-28")
    expect(formatted).toContain("28")
    expect(formatted).toContain("oct")
  })

  test("devuelve la entrada tal cual si no es una fecha válida", () => {
    expect(formatDate("no-es-fecha")).toBe("no-es-fecha")
  })
})

describe("describeWeatherCode", () => {
  test("devuelve la descripción e icono del código", () => {
    expect(describeWeatherCode(0)).toEqual({
      description: "Despejado",
      icon: "☀️",
    })
    expect(describeWeatherCode(95).description).toBe("Tormenta")
  })

  test("devuelve el fallback para códigos desconocidos", () => {
    expect(describeWeatherCode(1234)).toEqual(UNKNOWN_WEATHER)
    expect(describeWeatherCode(1234).description).toBe("No disponible")
  })
})

describe("formatWeeklyBlock", () => {
  const days = [
    { date: "2026-10-28", max: 25, min: 10, code: 0 },
    { date: "2026-10-29", max: 18.5, min: 7.25, code: 61 },
  ]

  test("incluye el nombre de la ciudad y el título", () => {
    const block = stripAnsi(formatWeeklyBlock("Madrid", days, "celsius"))
    expect(block.startsWith("Madrid")).toBe(true)
    expect(block).toContain("pronóstico 7 días")
  })

  test("incluye descripción y temperaturas por día", () => {
    const block = stripAnsi(formatWeeklyBlock("Madrid", days, "celsius"))
    expect(block).toContain("Despejado")
    expect(block).toContain("Lluvia ligera")
    expect(block).toContain("min 10.0 °C / max 25.0 °C")
    expect(block).toContain("min 7.3 °C / max 18.5 °C")
  })

  test("convierte las temperaturas si la unidad es fahrenheit", () => {
    const block = stripAnsi(formatWeeklyBlock("Madrid", days, "fahrenheit"))
    expect(block).toContain("min 50.0 °F / max 77.0 °F")
    expect(block).not.toContain("°C")
  })
})
