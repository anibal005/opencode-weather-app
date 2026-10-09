import { afterEach, describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import { getForecast } from "../../src/actions/getForecast.ts";
import { captureConsole } from "../helpers/console.ts";
import { forecastResponse, stubOpenMeteo } from "../helpers/openmeteo.ts";
import type { FetchStub } from "../helpers/fetch.ts";
import { stubFetch } from "../helpers/fetch.ts";

const madrid: City = {
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
};

let stub: FetchStub | null = null;

afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("getForecast", () => {
  test("sin ciudad default avisa y no llama a la API", async () => {
    const cap = captureConsole();
    try {
      await getForecast(null, "celsius");
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudad default");
  });

  test("muestra el pronóstico de 7 días", async () => {
    stub = stubOpenMeteo({
      forecast: () =>
        forecastResponse([{ date: "2026-10-08", max: 25, min: 15 }]),
    });

    const cap = captureConsole();
    try {
      await getForecast(madrid, "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Madrid, España");
    expect(cap.text()).toContain("próximos 7 días");
    expect(cap.text()).toContain("▲ 25°C");
    expect(cap.text()).toContain("▼ 15°C");
  });

  test("muestra el error si la API falla", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));

    const cap = captureConsole();
    try {
      await getForecast(madrid, "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Error:");
  });
});
