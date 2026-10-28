import { addCityByName } from "../actions/addCity.ts"
import { getWeatherForAllCities, getWeatherForCity } from "../actions/getWeather.ts"
import {
  getWeeklyForecastForAllCities,
  getWeeklyForecastForCity,
} from "../actions/getWeeklyForecast.ts"
import { listCities } from "../actions/listCities.ts"
import { removeCity } from "../actions/removeCity.ts"
import { setDefaultCity } from "../actions/setDefaultCity.ts"
import { getDefaultCity } from "../storage/citiesStorage.ts"
import { getUnit, setUnit } from "../storage/settingsStorage.ts"
import { bold, cyan } from "../utils/colors.ts"
import type { City } from "../types/City.ts"
import type { MenuOption } from "../types/MenuOption.ts"
import {
  printCityList,
  printError,
  printInfo,
  printSuccess,
  printWeatherList,
  printWeatherNow,
  printWeeklyForecast,
  printWeeklyForecastAll,
} from "./output.ts"
import { ask, askCity } from "./input.ts"

function showMenu(): void {
  console.log(cyan("\n═══════════════════════════════════════════"))
  console.log(cyan(bold("         WEATHER CLI")))
  console.log(cyan("═══════════════════════════════════════════"))
  console.log(cyan("  1. Clima de ciudad default"))
  console.log(cyan("  2. Clima de todas las ciudades"))
  console.log(cyan("  3. Buscar y agregar ciudad"))
  console.log(cyan("  4. Eliminar ciudad"))
  console.log(cyan("  5. Establecer ciudad default"))
  console.log(cyan("  6. Pronóstico 7 días"))
  console.log(cyan("  7. Pronóstico 7 días (todas)"))
  console.log(cyan("  8. Ajustes (°C)"))
  console.log(cyan("  9. Salir"))
  console.log(cyan("════════════════════════════════════════════"))
}

async function weeklyForecastOfCity(city: City): Promise<void> {
  const unit = await getUnit()
  printWeeklyForecast(city.name, await getWeeklyForecastForCity(city), unit)
}

export async function runCLI(): Promise<void> {
  while (true) {
    showMenu()
    const option = (await ask("Selecciona una opción: ")).trim() as MenuOption

    switch (option) {
      case "1": {
        const city = await getDefaultCity()
        if (!city) {
          printError("No hay ciudad default establecida.")
        } else {
          const unit = await getUnit()
          printWeatherNow(await getWeatherForCity(city), unit)
        }
        break
      }
      case "2": {
        const cities = await listCities()
        if (cities.length === 0) {
          printError("No hay ciudades registradas.")
        } else {
          const results = await getWeatherForAllCities(cities)
          printWeatherList(results, await getUnit())
        }
        break
      }
      case "3": {
        const name = (await ask("Ingresa el nombre de la ciudad: ")).trim()
        if (!name) {
          printError("Nombre vacío.")
          break
        }
        const added = await addCityByName(name)
        if (!added) {
          printError(`No se encontró la ciudad "${name}".`)
        } else {
          printSuccess(
            `Ciudad "${added.city.name}" agregada (${added.city.latitude}, ${added.city.longitude}).`
          )
        }
        break
      }
      case "4": {
        const cities = await listCities()
        if (cities.length === 0) {
          printError("No hay ciudades para eliminar.")
        } else {
          printCityList("\nCiudades registradas:", cities)
          const city = await askCity("Selecciona el número de la ciudad a eliminar: ", cities)
          if (!city) {
            printError("Opción inválida.")
          } else {
            await removeCity(city.name)
            printSuccess(`Ciudad "${city.name}" eliminada.`)
          }
        }
        break
      }
      case "5": {
        const cities = await listCities()
        if (cities.length === 0) {
          printError("No hay ciudades para establecer como default.")
        } else {
          printCityList("\nCiudades registradas:", cities)
          const city = await askCity("Selecciona el número de la ciudad default: ", cities)
          if (!city) {
            printError("Opción inválida.")
          } else {
            await setDefaultCity(city.name)
            printSuccess(`Ciudad "${city.name}" establecida como default.`)
          }
        }
        break
      }
      case "6": {
        const defaultCity = await getDefaultCity()
        if (defaultCity) {
          await weeklyForecastOfCity(defaultCity)
        } else {
          const cities = await listCities()
          if (cities.length === 0) {
            printError("No hay ciudades registradas.")
            break
          }
          printCityList("\nNo hay ciudad default. Ciudades registradas:", cities)
          const city = await askCity("Selecciona el número de la ciudad: ", cities)
          if (!city) {
            printError("Opción inválida.")
          } else {
            await weeklyForecastOfCity(city)
          }
        }
        break
      }
      case "7": {
        const cities = await listCities()
        if (cities.length === 0) {
          printError("No hay ciudades registradas.")
        } else {
          const results = await getWeeklyForecastForAllCities(cities)
          printWeeklyForecastAll(results, await getUnit())
        }
        break
      }
      case "8": {
        const unit = await getUnit()
        const newUnit: "celsius" | "fahrenheit" = unit === "celsius" ? "fahrenheit" : "celsius"
        await setUnit(newUnit)
        printSuccess(`Unidad cambiada a ${newUnit === "celsius" ? "°C" : "°F"}.`)
        break
      }
      case "9": {
        printInfo("¡Hasta luego!")
        return
      }
      default: {
        printError("Opción inválida.")
      }
    }
  }
}
