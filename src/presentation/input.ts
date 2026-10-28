import { cyan } from "../utils/colors.ts"
import type { City } from "../types/City.ts"

export function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(cyan(question) + " ")
    const handler = (chunk: Buffer | string) => {
      process.stdin.removeListener("data", handler)
      resolve(typeof chunk === "string" ? chunk : chunk.toString())
    }
    process.stdin.on("data", handler)
  })
}

export async function askCity(question: string, cities: City[]): Promise<City | null> {
  const idx = (await ask(question)).trim()
  const n = parseInt(idx, 10)
  if (Number.isNaN(n) || n < 1 || n > cities.length) return null
  return cities[n - 1] ?? null
}
