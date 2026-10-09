import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../../src/types/Config.ts";
import { closePrompt } from "../../src/presentation/input.ts";
import { CITIES_FILE } from "../../src/utils/constants.ts";
import { captureConsole } from "../helpers/console.ts";
import { jsonResponse, stubFetch } from "../helpers/fetch.ts";
import type { FetchStub } from "../helpers/fetch.ts";
import { mockInputModule } from "../helpers/mockInput.ts";
import { MADRID, temperatureResponse } from "../helpers/openmeteo.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

const input = mockInputModule();
const { addCity } = await import("../../src/actions/addCity.ts");

let dir = "";
let stub: FetchStub | null = null;

beforeEach(() => {
  dir = makeTempDir();
  input.reset();
});

afterEach(() => {
  stub?.restore();
  stub = null;
  removeTempDir(dir);
});

afterAll(() => {
  closePrompt();
  mock.restore();
});

function emptyConfig(): Config {
  return { cities: [], defaultCity: null, unit: "celsius" };
}

describe("addCity", () => {
  test("nombre vacío no llama a la API", async () => {
    input.answers.push("");

    let called = false;
    stub = stubFetch(() => {
      called = true;
      return jsonResponse({});
    });

    const config = emptyConfig();
    const cap = captureConsole();
    try {
      await addCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(called).toBe(false);
    expect(config.cities).toHaveLength(0);
    expect(cap.text()).toContain("Debes ingresar un nombre.");
  });

  test("avisa cuando la ciudad no existe", async () => {
    input.answers.push("Nowhere");
    stub = stubFetch((url) => {
      if (url.includes("geocoding-api")) return jsonResponse({ results: [] });
      return temperatureResponse(0);
    });

    const config = emptyConfig();
    const cap = captureConsole();
    try {
      await addCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toHaveLength(0);
    expect(cap.text()).toContain('No se encontró la ciudad "Nowhere"');
  });

  test("agrega la ciudad y la persiste", async () => {
    input.answers.push("Madrid");
    stub = stubFetch((url) => {
      if (url.includes("geocoding-api")) {
        return jsonResponse({ results: [MADRID] });
      }
      return temperatureResponse(21);
    });

    const config = emptyConfig();
    const cap = captureConsole();
    try {
      await addCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toEqual([MADRID]);
    expect(cap.text()).toContain("Ciudad agregada. Total: 1.");
    const saved = JSON.parse(readFileSync(join(dir, CITIES_FILE), "utf-8"));
    expect(saved.cities).toEqual([MADRID]);
  });

  test("no duplica una ciudad ya registrada", async () => {
    input.answers.push("Madrid");
    stub = stubFetch((url) => {
      if (url.includes("geocoding-api")) {
        return jsonResponse({ results: [MADRID] });
      }
      return temperatureResponse(21);
    });

    const config: Config = { cities: [MADRID], defaultCity: null, unit: "celsius" };
    const cap = captureConsole();
    try {
      await addCity(config, dir);
    } finally {
      cap.restore();
    }

    expect(config.cities).toHaveLength(1);
    expect(cap.text()).toContain("La ciudad ya estaba registrada.");
  });
});
