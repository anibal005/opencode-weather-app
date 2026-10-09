export type Unit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface DailyForecast {
  /** Fecha local de la ciudad en formato "YYYY-MM-DD". */
  date: string;
  tempMax: number;
  tempMin: number;
}

export interface Config {
  cities: City[];
  defaultCity: City | null;
  unit: Unit;
}
