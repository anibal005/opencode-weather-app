import type { City } from "./City.ts";
import type { Unit } from "./Unit.ts";

export interface Config {
  cities: City[];
  defaultCity: City | null;
  unit: Unit;
}
