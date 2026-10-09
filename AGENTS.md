# AGENTS.md

## Project

Weather CLI in TypeScript, run on **Bun** (not Node). Single entrypoint: `src/index.ts` (the CLI menu loop). Source is organized under `src/`: `actions/` (user operations), `presentation/` (menu, input, output), `storage/` (persistence), `types/` (shared contracts), `api/` (OpenMeteo), `utils/` (format, colors, constants).

The spec lives in `README.md` and is written in Spanish: interactive console menu (default city, list of saved cities, add/remove city, set default, °C settings, exit), final goal is shipping an executable binary. UI strings and README are in Spanish — keep new user-facing text consistent with that.

## Commands

```bash
bun run src/index.ts       # run the app
bun install                # deps (bun.lock is the lockfile; do not regenerate with npm)
bunx tsc                   # typecheck — tsconfig has noEmit: true
bun test --isolate         # automated tests (bun:test), all under tests/
bun test --isolate --coverage   # same + coverage
bun run build              # typecheck && test && bun build --compile ... (project's end goal)
```

`bun run build` is the gate: it runs `bunx tsc`, then the test suite, and only compiles the standalone binary (`src/index.ts` → `weather`) if both pass. Do not build the binary when tests fail.

There is **no** linter, formatter, or CI configured. Automated verification is typecheck (`bunx tsc`) plus the test suite (`bun test`). Tests live in `tests/` mirroring `src/` (`utils/`, `presentation/`, `storage/`, `api/`, `actions/`, `integration/`) with shared helpers in `tests/helpers/`. Actions that read stdin are tested by mocking `src/presentation/input.ts` with Bun's `mock.module`; APIs are tested by stubbing `globalThis.fetch`; storage is tested against temp dirs. The E2E test copies `src/` + `package.json` to a temp dir so `resolveDataDir()` keeps real project data untouched.

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
