import { describe, expect, test } from "bun:test";
import { isSameCity } from "../../src/utils/cities.ts";

const madrid = {
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
};
const madridSinPais = { name: "Madrid", latitude: 40.4, longitude: -3.7 };
const otraCiudad = { name: "Madrid", latitude: 40.5, longitude: -3.7 };

describe("isSameCity", () => {
  test("son la misma ciudad aunque cambie el país", () => {
    expect(isSameCity(madrid, madridSinPais)).toBe(true);
  });

  test("distingue por latitud", () => {
    expect(isSameCity(madrid, otraCiudad)).toBe(false);
  });

  test("distingue por nombre", () => {
    expect(isSameCity(madrid, { ...madrid, name: "Sucre" })).toBe(false);
  });

  test("distingue por longitud", () => {
    expect(isSameCity(madrid, { ...madrid, longitude: -3.8 })).toBe(false);
  });
});
