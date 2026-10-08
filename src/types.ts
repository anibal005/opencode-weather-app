export type Unit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface Config {
  cities: City[];
  defaultCity: City | null;
  unit: Unit;
}
