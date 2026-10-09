import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../../src/types/Config.ts";
import { closePrompt } from "../../src/presentation/input.ts";
import { CITIES_FILE } from "../../src/utils/constants.ts";
import { captureConsole } from "../helpers/console.ts";
import { mockInputModule } from "../helpers/mockInput.ts";
import { MADRID, SUCRE } from "../helpers/openmeteo.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

const input = mockInputModule();
const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");

let dir = "";

beforeEach(() => {
  dir = makeTempDir();
  input.reset();
});

afterEach(() => {
  removeTempDir(dir);
});

afterAll(() => {
  closePrompt();
  mock.restore();
});

describe("setDefaultCity", () => {
  test("sin ciudades avisa y no pregunta", async () => {
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const cap = captureConsole();
    try {
      await setDefaultCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("No hay ciudades registradas");
  });

  test("número inválido avisa", async () => {
    input.answers.push("9");
    const config: Config = {
      cities: [MADRID, SUCRE],
      defaultCity: null,
      unit: "celsius",
    };

    const cap = captureConsole();
    try {
      await setDefaultCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.defaultCity).toBeNull();
    expect(cap.text()).toContain("Número inválido.");
  });

  test("establece la ciudad default y persiste", async () => {
    input.answers.push("2");
    const config: Config = {
      cities: [MADRID, SUCRE],
      defaultCity: null,
      unit: "celsius",
    };

    const cap = captureConsole();
    try {
      await setDefaultCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.defaultCity).toEqual(SUCRE);
    expect(cap.text()).toContain("Ciudad default: Sucre.");
    const saved = JSON.parse(readFileSync(join(dir, CITIES_FILE), "utf-8"));
    expect(saved.defaultCity).toEqual(SUCRE);
  });
});
