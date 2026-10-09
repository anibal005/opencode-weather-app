import { afterEach, describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import { getWeather } from "../../src/actions/getWeather.ts";
import { captureConsole } from "../helpers/console.ts";
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

describe("getWeather", () => {
  test("sin ciudad default avisa y no llama a la API", async () => {
    const cap = captureConsole();
    try {
      await getWeather(null, "celsius");
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudad default");
  });

  test("muestra la temperatura de la ciudad", async () => {
    stub = stubFetch(() => jsonResponse({ current: { temperature_2m: 21 } }));

    const cap = captureConsole();
    try {
      await getWeather(madrid, "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Madrid, España");
    expect(cap.text()).toContain("21°C");
  });

  test("muestra el error si la API falla", async () => {
    stub = stubFetch(() => new Response("", { status: 500 }));

    const cap = captureConsole();
    try {
      await getWeather(madrid, "celsius");
    } finally {
      cap.restore();
    }

    expect(cap.text()).toContain("Error:");
  });
});
