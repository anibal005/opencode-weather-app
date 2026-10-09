import type { City } from "../types/City.ts";
import { GEOCODING_BASE_URL } from "../utils/constants.ts";

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

/** Paso 1: busca la ciudad y devuelve sus coordenadas. */
export async function geocode(query: string): Promise<City | null> {
  const url =
    `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}&count=1&language=es&format=json`;

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
