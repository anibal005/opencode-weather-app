import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { City } from "../types/City.ts";
import type { Unit } from "../types/Unit.ts";
import { CITIES_FILE, LEGACY_CONFIG_FILE } from "../utils/constants.ts";
import { saveCities } from "./citiesStorage.ts";
import { saveSettings } from "./settingsStorage.ts";

interface LegacyConfig {
  cities?: unknown;
  defaultCity?: unknown;
  unit?: unknown;
}

/**
 * Migra el antiguo `weather.config.json` a `cities.json` + `settings.json`.
 * Solo se ejecuta si todavía no existe `cities.json`. No borra el archivo legacy.
 */
export function migrateLegacyConfig(dataDir: string): void {
  const citiesPath = join(dataDir, CITIES_FILE);
  if (existsSync(citiesPath)) return;

  const legacyPath = join(dataDir, LEGACY_CONFIG_FILE);
  if (!existsSync(legacyPath)) return;

  try {
    const parsed = JSON.parse(readFileSync(legacyPath, "utf-8")) as LegacyConfig;

    const cities: City[] = Array.isArray(parsed.cities) ? (parsed.cities as City[]) : [];
    const defaultCity = (parsed.defaultCity as City | null) ?? null;
    const unit: Unit = parsed.unit === "fahrenheit" ? "fahrenheit" : "celsius";

    saveCities(dataDir, cities, defaultCity);
    saveSettings(dataDir, unit);
  } catch {
    // Si el archivo legacy está corrupto, se ignora y la app arranca con valores por defecto.
  }
}
