import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Config, Unit } from "./types.ts";

export function defaultConfig(): Config {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
  };
}

export function loadConfig(path: string): Config {
  try {
    if (!existsSync(path)) return defaultConfig();

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Config>;

    const unit: Unit = parsed.unit === "fahrenheit" ? "fahrenheit" : "celsius";

    return {
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      defaultCity: parsed.defaultCity ?? null,
      unit,
    };
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(path: string, config: Config): void {
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf-8");
}
