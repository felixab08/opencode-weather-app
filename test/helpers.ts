import { rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

const originalFetch = globalThis.fetch

/** Ruta única en el directorio temporal del sistema para el almacén de un test. */
export function tempStoreFile(): string {
  const unique = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return path.join(tmpdir(), `02-weather-test-${unique}.json`)
}

/** Apunta CITIES_FILE a un archivo temporal (citiesStorage lee la env var en cada acceso). */
export function useTempStore(): string {
  const file = tempStoreFile()
  process.env.CITIES_FILE = file
  return file
}

/** Borra el archivo temporal y restaura la env var. */
export async function cleanupStore(file: string): Promise<void> {
  delete process.env.CITIES_FILE
  await rm(file, { force: true })
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

type FetchHandler = (url: string) => Response

/** Reemplaza globalThis.fetch por un mock que recibe la URL llamada. Llamar restoreFetch() en afterEach. */
export function installFetch(handler: FetchHandler): void {
  globalThis.fetch = (async (input: string | URL | Request) =>
    handler(String(input))) as typeof fetch
}

/** Restaura el fetch original. */
export function restoreFetch(): void {
  globalThis.fetch = originalFetch
}

/** Elimina los códigos ANSI de color para asertar sobre texto plano. */
export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, "")
}
