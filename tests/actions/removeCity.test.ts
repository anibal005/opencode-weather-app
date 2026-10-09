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
const { removeCity } = await import("../../src/actions/removeCity.ts");

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

function configWith(cities: typeof MADRID[], defaultCity = null as null | typeof MADRID): Config {
  return { cities: [...cities], defaultCity, unit: "celsius" };
}

describe("removeCity", () => {
  test("sin ciudades avisa y no pregunta", async () => {
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const cap = captureConsole();
    try {
      await removeCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("No hay ciudades registradas.");
  });

  test("número inválido avisa y no borra nada", async () => {
    input.answers.push("9");
    const config = configWith([MADRID, SUCRE]);

    const cap = captureConsole();
    try {
      await removeCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toHaveLength(2);
    expect(cap.text()).toContain("Número inválido.");
  });

  test("elimina la ciudad indicada y persiste", async () => {
    input.answers.push("1");
    const config = configWith([MADRID, SUCRE]);

    const cap = captureConsole();
    try {
      await removeCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toEqual([SUCRE]);
    expect(cap.text()).toContain("Ciudad eliminada. Total: 1.");
    const saved = JSON.parse(readFileSync(join(dir, CITIES_FILE), "utf-8"));
    expect(saved.cities).toEqual([SUCRE]);
  });

  test("si elimina la ciudad default, la deja sin default", async () => {
    input.answers.push("1");
    const config = configWith([MADRID, SUCRE], MADRID);

    const cap = captureConsole();
    try {
      await removeCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.defaultCity).toBeNull();
    expect(cap.text()).toContain("Se eliminó también la ciudad default.");
  });

  test("si elimina otra ciudad, conserva la default", async () => {
    input.answers.push("2");
    const config = configWith([MADRID, SUCRE], MADRID);

    const cap = captureConsole();
    try {
      await removeCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toEqual([MADRID]);
    expect(config.defaultCity).toEqual(MADRID);
    expect(cap.text()).not.toContain("Se eliminó también la ciudad default.");
  });
});
