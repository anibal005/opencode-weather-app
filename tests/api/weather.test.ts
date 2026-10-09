import { afterEach, describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import { getForecast, getTemperature } from "../../src/api/weather.ts";
import { jsonResponse, stubFetch } from "../helpers/fetch.ts";
import type { FetchStub } from "../helpers/fetch.ts";

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

describe("getTemperature", () => {
  test("devuelve la temperatura actual", async () => {
    stub = stubFetch(() => jsonResponse({ current: { temperature_2m: 21.5 } }));
    expect(await getTemperature(madrid, "celsius")).toBe(21.5);
  });

  test("lanza si la respuesta no es ok", async () => {
    stub = stubFetch(() => new Response("", { status: 502 }));
    await expect(getTemperature(madrid, "celsius")).rejects.toThrow("OpenMeteo API");
  });

  test("lanza si el payload es inesperado", async () => {
    stub = stubFetch(() => jsonResponse({}));
    await expect(getTemperature(madrid, "celsius")).rejects.toThrow("inesperada");
  });

  test("incluye la unidad en la query", async () => {
    stub = stubFetch(() => jsonResponse({ current: { temperature_2m: 70 } }));
    await getTemperature(madrid, "fahrenheit");
    expect(stub.calls[0] ?? "").toContain("temperature_unit=fahrenheit");
  });
});

describe("getForecast", () => {
  test("devuelve los días del pronóstico", async () => {
    stub = stubFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-08", "2026-10-09"],
          temperature_2m_max: [25, 24],
          temperature_2m_min: [15, 14],
        },
      }),
    );

    const forecast = await getForecast(madrid, "celsius");

    expect(forecast).toEqual([
      { date: "2026-10-08", tempMax: 25, tempMin: 15 },
      { date: "2026-10-09", tempMax: 24, tempMin: 14 },
    ]);
  });

  test("filtra los días con datos incompletos", async () => {
    stub = stubFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-08", "2026-10-09"],
          temperature_2m_max: [25, null],
          temperature_2m_min: [15, 14],
        },
      }),
    );

    const forecast = await getForecast(madrid, "celsius");

    expect(forecast).toHaveLength(1);
    expect(forecast[0]?.date).toBe("2026-10-08");
  });

  test("lanza si no hay días válidos", async () => {
    stub = stubFetch(() => jsonResponse({ daily: {} }));
    await expect(getForecast(madrid, "celsius")).rejects.toThrow("inesperada");
  });

  test("lanza si la respuesta no es ok", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));
    await expect(getForecast(madrid, "celsius")).rejects.toThrow("OpenMeteo API");
  });

  test("pide 7 días y zona horaria automática", async () => {
    stub = stubFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-08"],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
        },
      }),
    );

    await getForecast(madrid, "celsius");

    expect(stub.calls[0] ?? "").toContain("forecast_days=7");
    expect(stub.calls[0] ?? "").toContain("timezone=auto");
  });
});
