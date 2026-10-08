import type { City, Unit } from "./types.ts";

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

/** Paso 1: busca la ciudad y devuelve sus coordenadas. */
export async function geocode(query: string): Promise<City | null> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=es&format=json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding API respondió ${res.status}`);
  }

  const data = (await res.json()) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result) return null;

  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country ?? result.admin1 ?? undefined,
  };
}

/** Paso 2: obtiene la temperatura actual para unas coordenadas. */
export async function getTemperature(city: City, unit: Unit): Promise<number> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m",
    temperature_unit: unit,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) {
    throw new Error(`OpenMeteo API respondió ${res.status}`);
  }

  const data = (await res.json()) as ForecastResponse;
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") {
    throw new Error("OpenMeteo devolvió una respuesta inesperada");
  }

  return temperature;
}
