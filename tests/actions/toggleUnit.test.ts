import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../../src/types/Config.ts";
import { toggleUnit } from "../../src/actions/toggleUnit.ts";
import { SETTINGS_FILE } from "../../src/utils/constants.ts";
import { captureConsole } from "../helpers/console.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

let dir = "";

beforeEach(() => {
  dir = makeTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

describe("toggleUnit", () => {
  test("alterna celsius → fahrenheit, persiste y avisa", () => {
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const cap = captureConsole();
    try {
      toggleUnit(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.unit).toBe("fahrenheit");
    expect(JSON.parse(readFileSync(join(dir, SETTINGS_FILE), "utf-8"))).toEqual({
      unit: "fahrenheit",
    });
    expect(cap.text()).toContain("Unidad: °F");
  });

  test("alterna fahrenheit → celsius", () => {
    const config: Config = { cities: [], defaultCity: null, unit: "fahrenheit" };

    const cap = captureConsole();
    try {
      toggleUnit(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.unit).toBe("celsius");
    expect(cap.text()).toContain("Unidad: °C");
  });
});
