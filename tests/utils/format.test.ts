import { describe, expect, test } from "bun:test";
import {
  cityLabel,
  formatDay,
  formatTemperature,
  unitSymbol,
} from "../../src/utils/format.ts";

describe("unitSymbol", () => {
  test("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  test("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("cityLabel", () => {
  test("incluye el país cuando existe", () => {
    expect(
      cityLabel({ name: "Madrid", latitude: 0, longitude: 0, country: "España" }),
    ).toBe("Madrid, España");
  });

  test("usa solo el nombre cuando no hay país", () => {
    expect(cityLabel({ name: "Madrid", latitude: 0, longitude: 0 })).toBe("Madrid");
  });
});

describe("formatTemperature", () => {
  test("no agrega decimales a los enteros", () => {
    expect(formatTemperature(20)).toBe("20");
    expect(formatTemperature(-5)).toBe("-5");
    expect(formatTemperature(0)).toBe("0");
  });

  test("usa un decimal cuando no es entero", () => {
    expect(formatTemperature(20.46)).toBe("20.5");
    expect(formatTemperature(20.4)).toBe("20.4");
  });
});

describe("formatDay", () => {
  test("formatea una fecha válida en español", () => {
    const formatted = formatDay("2026-10-08");
    expect(formatted).toContain("08");
    expect(formatted).toContain("10");
  });

  test("devuelve el texto original si la fecha es inválida", () => {
    expect(formatDay("no-es-fecha")).toBe("no-es-fecha");
  });
});
