import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Unit } from "../types/Unit.ts";
import { DEFAULT_UNIT, SETTINGS_FILE } from "../utils/constants.ts";

export interface Settings {
  unit: Unit;
}

export function defaultSettings(): Settings {
  return {
    unit: DEFAULT_UNIT,
  };
}

export function loadSettings(dataDir: string): Settings {
  const path = join(dataDir, SETTINGS_FILE);
  try {
    if (!existsSync(path)) return defaultSettings();

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Settings>;

    const unit: Unit = parsed.unit === "fahrenheit" ? "fahrenheit" : "celsius";

    return { unit };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(dataDir: string, unit: Unit): void {
  const path = join(dataDir, SETTINGS_FILE);
  const data: Settings = { unit };
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}
