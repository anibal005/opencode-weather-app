import { afterEach, describe, expect, test } from "bun:test";
import { listCities } from "../../src/actions/listCities.ts";
import { captureConsole } from "../helpers/console.ts";
import { jsonResponse, stubFetch } from "../helpers/fetch.ts";
import { MADRID, SUCRE } from "../helpers/openmeteo.ts";
import type { FetchStub } from "../helpers/fetch.ts";

let stub: FetchStub | null = null;

afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("listCities", () => {
  test("sin ciudades avisa", async () => {
    const cap = captureConsole();
    try {
      await listCities([], "celsius");
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudades registradas");
  });

  test("muestra la temperatura de cada ciudad", async () => {
    stub = stubFetch(() => jsonResponse({ current: { temperature_2m: 21 } }));

    const cap = captureConsole();
    try {
      await listCities([MADRID, SUCRE], "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Madrid, España");
    expect(cap.text()).toContain("Sucre, Bolivia");
    expect(cap.lines.filter((line) => line.includes("21°C"))).toHaveLength(2);
  });

  test("continúa con el resto si una ciudad falla", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));

    const cap = captureConsole();
    try {
      await listCities([MADRID, SUCRE], "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.lines.filter((line) => line.includes("Error:"))).toHaveLength(2);
  });
});
