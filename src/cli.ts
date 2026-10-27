import {
  addCity,
  getDefaultCity,
  getUnit,
  listCities,
  removeCity,
  setDefaultCity,
  setUnit,
} from "./store.ts"
import { geocodeCity } from "./geo.ts"
import { getWeatherForCity, getWeatherForAllCities } from "./weather.ts"
import type { City } from "./store.ts"

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question + " ")
    const handler = (chunk: Buffer | string) => {
      process.stdin.removeListener("data", handler)
      resolve(typeof chunk === "string" ? chunk : chunk.toString())
    }
    process.stdin.on("data", handler)
  })
}

export function showMenu(): void {
  console.log("\n═══════════════════════════════════════════")
  console.log("         WEATHER CLI")
  console.log("═══════════════════════════════════════════")
  console.log("  1. Clima de ciudad default")
  console.log("  2. Clima de todas las ciudades")
  console.log("  3. Buscar y agregar ciudad")
  console.log("  4. Eliminar ciudad")
  console.log("  5. Establecer ciudad default")
  console.log("  8. Ajustes (°C)")
  console.log("  9. Salir")
  console.log("════════════════════════════════════════════")
}

export async function runCLI(): Promise<void> {
  while (true) {
    showMenu()
    const option = (await ask("Selecciona una opción: ")).trim()

    switch (option) {
      case "1": {
        const city = await getDefaultCity()
        if (!city) {
          console.log("No hay ciudad default establecida.")
        } else {
          const result = await getWeatherForCity(city)
          console.log("\n" + result)
        }
        break
      }
      case "2": {
        const cities = await listCities()
        if (cities.length === 0) {
          console.log("No hay ciudades registradas.")
        } else {
          const result = await getWeatherForAllCities(cities)
          console.log("\n" + result)
        }
        break
      }
      case "3": {
        const name = (await ask("Ingresa el nombre de la ciudad: ")).trim()
        if (!name) {
          console.log("Nombre vacío.")
          break
        }
        const geo = await geocodeCity(name)
        if (!geo) {
          console.log(`No se encontró la ciudad "${name}".`)
        } else {
          const city: City = { name: geo.name, latitude: geo.latitude, longitude: geo.longitude }
          await addCity(city)
          console.log(`Ciudad "${geo.name}" agregada (${geo.latitude}, ${geo.longitude}).`)
        }
        break
      }
      case "4": {
        const cities = await listCities()
        if (cities.length === 0) {
          console.log("No hay ciudades para eliminar.")
        } else {
          console.log("\nCiudades registradas:")
          cities.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`))
          const idx = (await ask("Selecciona el número de la ciudad a eliminar: ")).trim()
          const n = parseInt(idx, 10)
          if (!isNaN(n) && n >= 1 && n <= cities.length) {
            const city = cities[n - 1]
            if (!city) break
            await removeCity(city.name)
            console.log(`Ciudad "${city.name}" eliminada.`)
          } else {
            console.log("Opción inválida.")
          }
        }
        break
      }
      case "5": {
        const cities = await listCities()
        if (cities.length === 0) {
          console.log("No hay ciudades para establecer como default.")
        } else {
          console.log("\nCiudades registradas:")
          cities.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}`))
          const idx = (await ask("Selecciona el número de la ciudad default: ")).trim()
          const n = parseInt(idx, 10)
          if (!isNaN(n) && n >= 1 && n <= cities.length) {
            const city = cities[n - 1]
            if (!city) break
            await setDefaultCity(city.name)
            console.log(`Ciudad "${city.name}" establecida como default.`)
          } else {
            console.log("Opción inválida.")
          }
        }
        break
      }
      case "8": {
        const unit = await getUnit()
        const newUnit: "celsius" | "fahrenheit" = unit === "celsius" ? "fahrenheit" : "celsius"
        await setUnit(newUnit)
        console.log(`Unidad cambiada a ${newUnit === "celsius" ? "°C" : "°F"}.`)
        break
      }
      case "9": {
        console.log("¡Hasta luego!")
        return
      }
      default: {
        console.log("Opción inválida.")
      }
    }
  }
}
