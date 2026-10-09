import { afterAll, describe, expect, test } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import { buildMenuOptions, printMenu } from "../../src/presentation/menu.ts";
import { closePrompt } from "../../src/presentation/input.ts";
import { captureConsole } from "../helpers/console.ts";

afterAll(() => {
  closePrompt();
});

const baseConfig: Config = { cities: [], defaultCity: null, unit: "celsius" };

describe("buildMenuOptions", () => {
  test("arma las 9 opciones en orden", () => {
    const keys = buildMenuOptions(baseConfig).map((option) => option.key);
    expect(keys).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  });

  test("refleja la cantidad de ciudades", () => {
    const config: Config = {
      cities: [{ name: "Madrid", latitude: 0, longitude: 0 }],
      defaultCity: null,
      unit: "celsius",
    };
    expect(buildMenuOptions(config)[1]?.label).toContain("(1)");
  });

  test("refleja la unidad activa", () => {
    const config: Config = { ...baseConfig, unit: "fahrenheit" };
    expect(buildMenuOptions(config)[7]?.label).toContain("°F");
  });
});

describe("printMenu", () => {
  test("imprime el título y las opciones", () => {
    const cap = captureConsole();
    try {
      printMenu(baseConfig);
      expect(cap.text()).toContain("WEATHER CLI");
      expect(cap.text()).toContain("Buscar y agregar ciudad");
      expect(cap.text()).toContain("Salir");
    } finally {
      cap.restore();
    }
  });
});
