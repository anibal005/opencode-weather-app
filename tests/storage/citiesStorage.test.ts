import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { City } from "../../src/types/City.ts";
import {
  defaultCitiesData,
  loadCities,
  saveCities,
} from "../../src/storage/citiesStorage.ts";
import { CITIES_FILE } from "../../src/utils/constants.ts";
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

describe("defaultCitiesData", () => {
  test("devuelve listas vacías", () => {
    expect(defaultCitiesData()).toEqual({ cities: [], defaultCity: null });
  });
});

describe("loadCities", () => {
  test("sin archivo devuelve los valores por defecto", () => {
    expect(loadCities(dir)).toEqual({ cities: [], defaultCity: null });
  });

  test("con JSON corrupto devuelve los valores por defecto", () => {
    writeFileSync(join(dir, CITIES_FILE), "{no-json", "utf-8");
    expect(loadCities(dir)).toEqual({ cities: [], defaultCity: null });
  });

  test("normaliza campos con tipo incorrecto", () => {
    writeFileSync(
      join(dir, CITIES_FILE),
      JSON.stringify({ cities: "no-es-array" }),
      "utf-8",
    );
    expect(loadCities(dir)).toEqual({ cities: [], defaultCity: null });
  });
});

describe("saveCities", () => {
  test("hace roundtrip de ciudades y default", () => {
    saveCities(dir, [madrid], madrid);
    expect(loadCities(dir)).toEqual({ cities: [madrid], defaultCity: madrid });
  });

  test("escribe JSON con salto de línea final", () => {
    saveCities(dir, [], null);
    const raw = readFileSync(join(dir, CITIES_FILE), "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(JSON.parse(raw)).toEqual({ cities: [], defaultCity: null });
  });
});
