import type { City } from "../../src/types/City.ts";
import { isForecast, isGeocoding, jsonResponse, stubFetch } from "./fetch.ts";
import type { FetchStub } from "./fetch.ts";

export const MADRID: City = {
  name: "Madrid",
  latitude: 40.4165,
  longitude: -3.70256,
  country: "España",
};

export const SUCRE: City = {
  name: "Sucre",
  latitude: -19.03332,
  longitude: -65.26274,
  country: "Bolivia",
};

export interface OpenMeteoStubOptions {
  geocode?: () => Response | Promise<Response>;
  temperature?: () => Response | Promise<Response>;
  forecast?: () => Response | Promise<Response>;
}

/** Stub de `fetch` que enruta geocoding vs forecast de OpenMeteo. */
export function stubOpenMeteo(options: OpenMeteoStubOptions): FetchStub {
  return stubFetch((url) => {
    if (isGeocoding(url)) {
      if (!options.geocode) throw new Error(`geocoding sin stub: ${url}`);
      return options.geocode();
    }
    if (isForecast(url)) {
      const handler = options.temperature ?? options.forecast;
      if (!handler) throw new Error(`forecast sin stub: ${url}`);
      return handler();
    }
    throw new Error(`URL inesperada: ${url}`);
  });
}

export function geocodeResponse(city: City | null): Response {
  return jsonResponse(city ? { results: [city] } : { results: [] });
}

export function temperatureResponse(value: number): Response {
  return jsonResponse({ current: { temperature_2m: value } });
}

export function forecastResponse(
  days: Array<{ date: string; max: number; min: number }>,
): Response {
  return jsonResponse({
    daily: {
      time: days.map((day) => day.date),
      temperature_2m_max: days.map((day) => day.max),
      temperature_2m_min: days.map((day) => day.min),
    },
  });
}
