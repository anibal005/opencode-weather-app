import { afterEach, describe, expect, test } from "bun:test";
import { listForecasts } from "../../src/actions/listForecasts.ts";
import { captureConsole } from "../helpers/console.ts";
import { forecastResponse, MADRID, SUCRE, stubOpenMeteo } from "../helpers/openmeteo.ts";
import type { FetchStub } from "../helpers/fetch.ts";
import { stubFetch } from "../helpers/fetch.ts";

let stub: FetchStub | null = null;

afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("listForecasts", () => {
  test("sin ciudades avisa", async () => {
    const cap = captureConsole();
    try {
      await listForecasts([], "celsius");
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudades registradas");
  });

  test("muestra el pronóstico de cada ciudad", async () => {
    stub = stubOpenMeteo({
      forecast: () =>
        forecastResponse([{ date: "2026-10-08", max: 25, min: 15 }]),
    });

    const cap = captureConsole();
    try {
      await listForecasts([MADRID, SUCRE], "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Madrid, España");
    expect(cap.text()).toContain("Sucre, Bolivia");
    expect(
      cap.lines.filter((line) => line.includes("próximos 7 días")),
    ).toHaveLength(2);
  });

  test("continúa con el resto si una ciudad falla", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));

    const cap = captureConsole();
    try {
      await listForecasts([MADRID, SUCRE], "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.lines.filter((line) => line.includes("Error:"))).toHaveLength(2);
  });
});
