# AGENTS.md

## Project

Weather CLI in TypeScript, run on **Bun** (not Node). Single entrypoint: `index.ts`, currently just the `bun init` scaffold (`console.log("Hello via Bun!")`).

The spec lives in `README.md` and is written in Spanish: interactive console menu (default city, list of saved cities, add/remove city, set default, °C settings, exit), final goal is shipping an executable binary. UI strings and README are in Spanish — keep new user-facing text consistent with that.

## Commands

```bash
bun run index.ts   # run the app (bun index.ts also works)
bun install        # deps (bun.lock is the lockfile; do not regenerate with npm)
bunx tsc           # typecheck — tsconfig has noEmit: true
bun build index.ts --compile   # produce a standalone binary (the project's end goal)
```

There is **no** test runner, linter, formatter, or CI configured. Don't invent `bun test`/`bun lint` steps; typecheck via `bunx tsc` is the only automated verification available.

## API usage (from README)

OpenMeteo requires two steps — geocode first to get lat/lon, then forecast:

```
https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m
```

No API key needed.

## TypeScript config quirks

`tsconfig.json` is strict plus `noUncheckedIndexedAccess` (array/record lookups may be `undefined` — handle it) and `verbatimModuleSyntax` (use `import type` for type-only imports). `moduleResolution: bundler` + `allowImportingTsExtensions`: relative imports may include the `.ts` extension.

No other config files exist (no `opencode.json`, `.cursor/`, or CI workflows).
