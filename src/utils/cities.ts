import type { City } from "../types/City.ts";

export function isSameCity(a: City, b: City): boolean {
  return (
    a.name === b.name &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}
