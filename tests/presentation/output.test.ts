import { describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { DailyForecast } from "../../src/types/Weather.ts";
import {
  printCityList,
  printError,
  printForecast,
  printTemperature,
} from "../../src/presentation/output.ts";
import { captureConsole } from "../helpers/console.ts";

const madrid: City = {
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
};

describe("printTemperature", () => {
  test("muestra la ciudad y la temperatura con unidad", () => {
    const cap = captureConsole();
    try {
      printTemperature(madrid, 21.5, "celsius");
      expect(cap.text()).toContain("Madrid, España");
      expect(cap.text()).toContain("21.5°C");
    } finally {
      cap.restore();
    }
  });
});

describe("printForecast", () => {
  test("imprime cada día del pronóstico", () => {
    const forecast: DailyForecast[] = [
      { date: "2026-10-08", tempMax: 25, tempMin: 15 },
    ];
    const cap = captureConsole();
    try {
      printForecast(madrid, forecast, "celsius");
      expect(cap.text()).toContain("próximos 7 días");
      expect(cap.text()).toContain("▲ 25°C");
      expect(cap.text()).toContain("▼ 15°C");
    } finally {
      cap.restore();
    }
  });
});

describe("printCityList", () => {
  test("avisa cuando no hay ciudades", () => {
    const cap = captureConsole();
    try {
      printCityList([]);
      expect(cap.text()).toContain("No hay ciudades registradas.");
    } finally {
      cap.restore();
    }
  });

  test("numera las ciudades desde 1", () => {
    const cap = captureConsole();
    try {
      printCityList([madrid]);
      const plain = cap.text().replace(/\x1b\[[0-9;]*m/g, "");
      expect(plain).toContain("1. Madrid, España");
    } finally {
      cap.restore();
    }
  });
});

describe("printError", () => {
  test("muestra el mensaje de un Error", () => {
    const cap = captureConsole();
    try {
      printError(new Error("boom"));
      expect(cap.text()).toContain("Error: boom");
    } finally {
      cap.restore();
    }
  });

  test("convierte valores no-Error a string", () => {
    const cap = captureConsole();
    try {
      printError("falló");
      expect(cap.text()).toContain("Error: falló");
    } finally {
      cap.restore();
    }
  });
});
