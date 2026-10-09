import type { City } from "../types/City.ts";
import type { Unit } from "../types/Unit.ts";
import { getTemperature } from "../api/weather.ts";
import { printError, printTemperature } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";

/** Opción 1: muestra el clima actual de una ciudad (o avisa si no hay default). */
export async function getWeather(city: City | null, unit: Unit): Promise<void> {
  if (!city) {
    console.log(`  ${red("No hay ciudad default. Usa la opción 5 para establecer una.")}`);
    return;
  }
  try {
    const temperature = await getTemperature(city, unit);
    printTemperature(city, temperature, unit);
  } catch (error) {
    printError(error);
  }
}
