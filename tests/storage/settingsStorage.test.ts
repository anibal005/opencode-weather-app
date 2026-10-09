import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
} from "../../src/storage/settingsStorage.ts";
import { SETTINGS_FILE } from "../../src/utils/constants.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

let dir = "";

beforeEach(() => {
  dir = makeTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

describe("defaultSettings", () => {
  test("usa celsius por defecto", () => {
    expect(defaultSettings()).toEqual({ unit: "celsius" });
  });
});

describe("loadSettings", () => {
  test("sin archivo usa el default", () => {
    expect(loadSettings(dir)).toEqual({ unit: "celsius" });
  });

  test("una unidad inválida cae a celsius", () => {
    writeFileSync(join(dir, SETTINGS_FILE), JSON.stringify({ unit: "kelvin" }), "utf-8");
    expect(loadSettings(dir)).toEqual({ unit: "celsius" });
  });

  test("con JSON corrupto usa el default", () => {
    writeFileSync(join(dir, SETTINGS_FILE), "no-json", "utf-8");
    expect(loadSettings(dir)).toEqual({ unit: "celsius" });
  });
});

describe("saveSettings", () => {
  test("hace roundtrip de fahrenheit y termina en salto de línea", () => {
    saveSettings(dir, "fahrenheit");
    expect(loadSettings(dir)).toEqual({ unit: "fahrenheit" });
    expect(readFileSync(join(dir, SETTINGS_FILE), "utf-8").endsWith("\n")).toBe(true);
  });
});
