# AGENTS.md

Bun weather CLI (single package, private). Entry point: `index.ts` (`"type": "module"`).
Bun 1.4.4 runtime. Implements a console weather app using OpenMeteo (no API key) with a Spanish
menu and local persistence in `cities.json`.

## Modules

- `src/index.ts` — entry point (inside `src/`), starts `runCLI()`
- `src/presentation/` — CLI layer: `menu.ts` (menu render + option dispatch), `input.ts` (`ask`, `askCity`), `output.ts` (print helpers: messages, city lists, weather/forecast blocks)
- `src/actions/` — user-facing use cases: `getWeather.ts`, `getWeeklyForecast.ts`, `addCity.ts` (`addCityByName`), `removeCity.ts`, `setDefaultCity.ts`, `listCities.ts` (thin re-exports of storage)
- `src/storage/` — persistence in `cities.json`: `citiesStorage.ts` (file I/O primitives + cities + default city), `settingsStorage.ts` (temperature unit)
- `src/api/` — OpenMeteo HTTP integration: `geocoding.ts` (city → lat/lon), `weather.ts` (current temperature + daily forecast)
- `src/types/` — shared TypeScript contracts: `City.ts`, `Weather.ts` (`Unit`, `WeatherNow`, `DailyForecast`, …), `MenuOption.ts`
- `src/utils/` — `format.ts` (temperature/date/forecast-block formatting, `describeWeatherCode`), `constants.ts` (`WEATHER_CODES`), `colors.ts` (ANSI helpers)

## Commands

- `bun install` — install deps (`bun.lock` committed)
- `bun src/index.ts` (or `bun run start`) — run the app
- `bun run dev` — run with `--watch`
- `bun run typecheck` — runs `bun check` (script in `package.json`)
- `bun build --compile src/index.ts --outfile weather` (or `bun run build`) — produce the executable binary (per README goal)

## TypeScript config (`tsconfig.json`)

Strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `moduleDetection: "force"`,
`types: ["bun"]`, `noEmit`. TypeScript 7 peer dep; `@types/bun` provides Bun globals.
Type-only imports use `import type`. No test runner, linter, or CI — do not invent scripts.

## OpenMeteo flow (from README)

Two-step HTTP, no API key required:
1. `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`

7-day forecast (options 6/7): same forecast API with
`daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`
(weather codes mapped in `src/utils/format.ts` via `describeWeatherCode`, table in `src/utils/constants.ts`).

## Menu (español)

1. Clima de ciudad default · 2. Clima de todas las ciudades · 3. Buscar y agregar ciudad
4. Eliminar ciudad · 5. Establecer ciudad default · 6. Pronóstico 7 días ·
7. Pronóstico 7 días (todas) · 8. Ajustes (°C/°F) · 9. Salir

## Conventions / gotchas

- ESM: `.ts` files run directly via Bun; no `tsc` build step for dev.
- `noUncheckedIndexedAccess`: array index access may be `undefined` — check before use.
- `res.json()` returns `unknown` — cast before accessing properties.
- `cities.json` is created at runtime in the cwd; not gitignored by default.
- `node_modules`, `dist`, `out`, `coverage`, `.env*` are gitignored.
