import type { City } from "../types/City.ts";
import type { Unit } from "../types/Unit.ts";
import { getForecast } from "../api/weather.ts";
import { printError, printForecast } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";

/** Opción 7: muestra el pronóstico de 7 días de todas las ciudades guardadas. */
export async function listForecasts(cities: City[], unit: Unit): Promise<void> {
  if (cities.length === 0) {
    console.log(`  ${red("No hay ciudades registradas. Usa la opción 3 para agregar una.")}`);
    return;
  }
  for (const city of cities) {
    try {
      const forecast = await getForecast(city, unit);
      printForecast(city, forecast, unit);
    } catch (error) {
      printError(error);
    }
  }
}
