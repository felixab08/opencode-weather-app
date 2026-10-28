import { afterEach, describe, expect, test } from "bun:test"
import { geocodeCity } from "../../src/api/geocoding.ts"
import { installFetch, jsonResponse, restoreFetch } from "../helpers.ts"

afterEach(() => {
  restoreFetch()
})

describe("geocodeCity", () => {
  test("devuelve el primer resultado de la API", async () => {
    let calledUrl = ""
    installFetch((url) => {
      calledUrl = url
      return jsonResponse({
        results: [
          { name: "Madrid", latitude: 40.4168, longitude: -3.7038 },
          { name: "Otra", latitude: 0, longitude: 0 },
        ],
      })
    })

    const result = await geocodeCity("Madrid")
    expect(result).toEqual({
      name: "Madrid",
      latitude: 40.4168,
      longitude: -3.7038,
    })
    expect(calledUrl).toContain("geocoding-api.open-meteo.com")
    expect(calledUrl).toContain("name=Madrid")
    expect(calledUrl).toContain("language=es")
  })

  test("codifica el nombre de la ciudad en la URL", async () => {
    let calledUrl = ""
    installFetch((url) => {
      calledUrl = url
      return jsonResponse({
        results: [{ name: "Ciudad de México", latitude: 19.43, longitude: -99.13 }],
      })
    })

    await geocodeCity("Ciudad de México")
    expect(calledUrl).toContain("name=Ciudad%20de%20M%C3%A9xico")
  })

  test("devuelve null si no hay resultados", async () => {
    installFetch(() => jsonResponse({}))
    expect(await geocodeCity("Ahorahereda")).toBeNull()
  })

  test("devuelve null con results vacío", async () => {
    installFetch(() => jsonResponse({ results: [] }))
    expect(await geocodeCity("Nada")).toBeNull()
  })

  test("devuelve null si la respuesta no es ok", async () => {
    installFetch(() => jsonResponse({ error: true }, 500))
    expect(await geocodeCity("Madrid")).toBeNull()
  })

  test("devuelve null si el fetch falla (error de red)", async () => {
    installFetch(() => {
      throw new Error("network down")
    })
    expect(await geocodeCity("Madrid")).toBeNull()
  })
})
