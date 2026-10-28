# AGENTS.md

Bun weather CLI (single package, private). Entry point: `index.ts` (`"type": "module"`).
Bun 1.4.4 runtime. Implements a console weather app using OpenMeteo (no API key) with a Spanish
menu and local persistence in `cities.json`.

## Modules

- `index.ts` — entry point (root), starts `runCLI()`
- `src/cli.ts` — menu UI, input loop, option dispatch
- `src/colors.ts` — ANSI helpers (cyan menu, yellow temp, green ok, red error); honors `NO_COLOR` / `FORCE_COLOR`
- `src/weather.ts` — business logic: format temperature, fetch weather for one or all cities
- `src/geo.ts` — OpenMeteo geocoding (city name → lat/lon)
- `src/forecast.ts` — OpenMeteo forecast (lat/lon → temperature)
- `src/store.ts` — persistence: `cities.json` (cities, default city, temperature unit)

## Commands

- `bun install` — install deps (`bun.lock` committed)
- `bun index.ts` — run the app
- `bun run typecheck` — runs `bun check` (only script in `package.json`)
- `bun build index.ts --compile` — produce the executable binary (per README goal)

## TypeScript config (`tsconfig.json`)

Strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `moduleDetection: "force"`,
`types: ["bun"]`, `noEmit`. TypeScript 7 peer dep; `@types/bun` provides Bun globals.
Type-only imports use `import type`. No test runner, linter, or CI — do not invent scripts.

## OpenMeteo flow (from README)

Two-step HTTP, no API key required:
1. `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`

## Menu (español)

1. Clima de ciudad default · 2. Clima de todas las ciudades · 3. Buscar y agregar ciudad
4. Eliminar ciudad · 5. Establecer ciudad default · 8. Ajustes (°C/°F) · 9. Salir

## Conventions / gotchas

- ESM: `.ts` files run directly via Bun; no `tsc` build step for dev.
- `noUncheckedIndexedAccess`: array index access may be `undefined` — check before use.
- `res.json()` returns `unknown` — cast before accessing properties.
- `cities.json` is created at runtime in the cwd; not gitignored by default.
- `node_modules`, `dist`, `out`, `coverage`, `.env*` are gitignored.
