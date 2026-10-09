import { afterEach, describe, expect, test } from "bun:test";
import { geocode } from "../../src/api/geocoding.ts";
import { jsonResponse, stubFetch } from "../helpers/fetch.ts";
import type { FetchStub } from "../helpers/fetch.ts";

let stub: FetchStub | null = null;

afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("geocode", () => {
  test("devuelve la ciudad con su país", async () => {
    stub = stubFetch(() =>
      jsonResponse({
        results: [
          { name: "Madrid", latitude: 40.4, longitude: -3.7, country: "España" },
        ],
      }),
    );

    const city = await geocode("Madrid");

    expect(city).toEqual({
      name: "Madrid",
      latitude: 40.4,
      longitude: -3.7,
      country: "España",
    });
  });

  test("usa admin1 como país cuando no hay country", async () => {
    stub = stubFetch(() =>
      jsonResponse({
        results: [
          { name: "Sucre", latitude: -19, longitude: -65, admin1: "Chuquisaca" },
        ],
      }),
    );

    const city = await geocode("Sucre");

    expect(city?.country).toBe("Chuquisaca");
  });

  test("sin resultados devuelve null", async () => {
    stub = stubFetch(() => jsonResponse({}));
    expect(await geocode("Nowhere")).toBeNull();
  });

  test("lanza si la respuesta no es ok", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));
    await expect(geocode("Madrid")).rejects.toThrow("Geocoding API");
  });

  test("codifica el nombre y fija el idioma", async () => {
    stub = stubFetch(() => jsonResponse({ results: [] }));

    await geocode("San José");

    expect(stub.calls[0] ?? "").toContain("name=San%20Jos%C3%A9");
    expect(stub.calls[0] ?? "").toContain("language=es");
  });
});
