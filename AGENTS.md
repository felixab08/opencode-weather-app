# AGENTS.md

Bun weather CLI scaffold (single package, private). Entry point: `index.ts` (`"type": "module"`).
Bun 1.4.4 is the runtime. README is in Spanish and describes the end goal: a console weather app
(OpenMeteo, no API key) that compiles to a binary executable.

## Commands

- `bun install` — install deps (lockfile is `bun.lock`, committed)
- `bun run index.ts` (or `bun index.ts`) — run the app
- `bun run typecheck` — runs `bun check` (the only script in `package.json`)
- `bun build index.ts --compile` — produce the executable binary (per README goal)

## TypeScript config (`tsconfig.json`)

Strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `moduleDetection: "force"`,
`types: ["bun"]`, `noEmit`. TypeScript 7 is a peer dependency; `@types/bun` provides Bun globals.
Type-only imports must use `import type` (verbatimModuleSyntax). No test runner, linter, or CI is
configured yet — do not invent `test`/`lint` scripts.

## OpenMeteo flow (from README)

Two-step HTTP, no API key required:
1. `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`

## Conventions / gotchas

- ESM: `.ts` files run directly via Bun; no `tsc` build step needed for dev.
- `node_modules`, `dist`, `out`, `coverage`, `.env*` are gitignored.
- App behavior is not implemented yet — `index.ts` only logs "Hello via Bun!".
