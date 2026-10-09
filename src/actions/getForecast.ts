import type { City } from "../types/City.ts";
import type { Unit } from "../types/Unit.ts";
import { getForecast as fetchForecast } from "../api/weather.ts";
import { printError, printForecast } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";

/** Opción 6: muestra el pronóstico de 7 días de una ciudad (o avisa si no hay default). */
export async function getForecast(city: City | null, unit: Unit): Promise<void> {
  if (!city) {
    console.log(`  ${red("No hay ciudad default. Usa la opción 5 para establecer una.")}`);
    return;
  }
  try {
    const forecast = await fetchForecast(city, unit);
    printForecast(city, forecast, unit);
  } catch (error) {
    printError(error);
  }
}
