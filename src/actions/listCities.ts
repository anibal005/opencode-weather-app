import type { City } from "../types/City.ts";
import type { Unit } from "../types/Unit.ts";
import { getTemperature } from "../api/weather.ts";
import { printError, printTemperature } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";

/** Opción 2: muestra el clima actual de todas las ciudades guardadas. */
export async function listCities(cities: City[], unit: Unit): Promise<void> {
  if (cities.length === 0) {
    console.log(`  ${red("No hay ciudades registradas. Usa la opción 3 para agregar una.")}`);
    return;
  }
  for (const city of cities) {
    try {
      const temperature = await getTemperature(city, unit);
      printTemperature(city, temperature, unit);
    } catch (error) {
      printError(error);
    }
  }
}
