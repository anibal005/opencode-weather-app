import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { City } from "../types/City.ts";
import { CITIES_FILE } from "../utils/constants.ts";

export interface CitiesData {
  cities: City[];
  defaultCity: City | null;
}

export function defaultCitiesData(): CitiesData {
  return {
    cities: [],
    defaultCity: null,
  };
}

export function loadCities(dataDir: string): CitiesData {
  const path = join(dataDir, CITIES_FILE);
  try {
    if (!existsSync(path)) return defaultCitiesData();

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CitiesData>;

    return {
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      defaultCity: parsed.defaultCity ?? null,
    };
  } catch {
    return defaultCitiesData();
  }
}

export function saveCities(dataDir: string, cities: City[], defaultCity: City | null): void {
  const path = join(dataDir, CITIES_FILE);
  const data: CitiesData = { cities, defaultCity };
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}
