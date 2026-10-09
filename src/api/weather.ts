import type { City } from "../types/City.ts";
import type { DailyForecast } from "../types/Weather.ts";
import type { Unit } from "../types/Unit.ts";
import { FORECAST_BASE_URL, FORECAST_DAYS } from "../utils/constants.ts";

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}

interface DailyForecastResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
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

  const res = await fetch(`${FORECAST_BASE_URL}?${params}`);
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

/** Paso 2 (variante): obtiene el pronóstico diario de los próximos 7 días. */
export async function getForecast(city: City, unit: Unit): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: FORECAST_DAYS,
    timezone: "auto",
    temperature_unit: unit,
  });

  const res = await fetch(`${FORECAST_BASE_URL}?${params}`);
  if (!res.ok) {
    throw new Error(`OpenMeteo API respondió ${res.status}`);
  }

  const data = (await res.json()) as DailyForecastResponse;
  const dates = data.daily?.time ?? [];
  const maxes = data.daily?.temperature_2m_max ?? [];
  const mins = data.daily?.temperature_2m_min ?? [];

  const forecast: DailyForecast[] = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const tempMax = maxes[i];
    const tempMin = mins[i];
    if (
      typeof date !== "string" ||
      typeof tempMax !== "number" ||
      typeof tempMin !== "number"
    ) {
      continue;
    }
    forecast.push({ date, tempMax, tempMin });
  }

  if (forecast.length === 0) {
    throw new Error("OpenMeteo devolvió una respuesta inesperada");
  }

  return forecast;
}
