import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { City } from "../../src/types/City.ts";
import { loadCities } from "../../src/storage/citiesStorage.ts";
import { loadSettings } from "../../src/storage/settingsStorage.ts";
import { migrateLegacyConfig } from "../../src/storage/migrateLegacy.ts";
import {
  CITIES_FILE,
  LEGACY_CONFIG_FILE,
  SETTINGS_FILE,
} from "../../src/utils/constants.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

const madrid: City = {
  name: "Madrid",
  latitude: 40.4165,
  longitude: -3.70256,
  country: "España",
};

let dir = "";

beforeEach(() => {
  dir = makeTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

describe("migrateLegacyConfig", () => {
  test("migra el legacy a cities.json + settings.json", () => {
    writeFileSync(
      join(dir, LEGACY_CONFIG_FILE),
      JSON.stringify({ cities: [madrid], defaultCity: madrid, unit: "fahrenheit" }),
      "utf-8",
    );

    migrateLegacyConfig(dir);

    expect(loadCities(dir)).toEqual({ cities: [madrid], defaultCity: madrid });
    expect(loadSettings(dir)).toEqual({ unit: "fahrenheit" });
    expect(existsSync(join(dir, CITIES_FILE))).toBe(true);
    expect(existsSync(join(dir, SETTINGS_FILE))).toBe(true);
  });

  test("no pisa un cities.json existente", () => {
    const sucre: City = { name: "Sucre", latitude: -19, longitude: -65 };
    writeFileSync(
      join(dir, CITIES_FILE),
      JSON.stringify({ cities: [sucre], defaultCity: null }),
      "utf-8",
    );
    writeFileSync(
      join(dir, LEGACY_CONFIG_FILE),
      JSON.stringify({ cities: [madrid], defaultCity: madrid, unit: "fahrenheit" }),
      "utf-8",
    );

    migrateLegacyConfig(dir);

    expect(loadCities(dir)).toEqual({ cities: [sucre], defaultCity: null });
    expect(existsSync(join(dir, SETTINGS_FILE))).toBe(false);
  });

  test("ignora un legacy corrupto sin lanzar", () => {
    writeFileSync(join(dir, LEGACY_CONFIG_FILE), "{no-json", "utf-8");
    expect(() => migrateLegacyConfig(dir)).not.toThrow();
    expect(existsSync(join(dir, CITIES_FILE))).toBe(false);
  });

  test("un legacy sin campos migra con los valores por defecto", () => {
    writeFileSync(join(dir, LEGACY_CONFIG_FILE), JSON.stringify({}), "utf-8");

    migrateLegacyConfig(dir);

    expect(loadCities(dir)).toEqual({ cities: [], defaultCity: null });
    expect(loadSettings(dir)).toEqual({ unit: "celsius" });
  });

  test("sin legacy no hace nada", () => {
    migrateLegacyConfig(dir);
    expect(existsSync(join(dir, CITIES_FILE))).toBe(false);
  });
});
