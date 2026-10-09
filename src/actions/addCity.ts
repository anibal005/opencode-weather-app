import type { Config } from "../types/Config.ts";
import { geocode } from "../api/geocoding.ts";
import { getTemperature } from "../api/weather.ts";
import { ask } from "../presentation/input.ts";
import { printTemperature } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { isSameCity } from "../utils/cities.ts";
import { cyan, green, red } from "../utils/colors.ts";

/** Opción 3: busca una ciudad por nombre y la agrega a la lista. */
export async function addCity(config: Config, dataDir: string): Promise<void> {
  const query = await ask(`  ${cyan("Nombre de la ciudad: ")}`);
  if (!query) {
    console.log(`  ${red("Debes ingresar un nombre.")}`);
    return;
  }

  const city = await geocode(query);
  if (!city) {
    console.log(`  ${red(`No se encontró la ciudad "${query}".`)}`);
    return;
  }

  const temperature = await getTemperature(city, config.unit);
  printTemperature(city, temperature, config.unit);

  const exists = config.cities.some((c) => isSameCity(c, city));
  if (exists) {
    console.log(`  ${red("La ciudad ya estaba registrada.")}`);
    return;
  }

  config.cities.push(city);
  saveCities(dataDir, config.cities, config.defaultCity);
  console.log(`  ${green(`Ciudad agregada. Total: ${config.cities.length}.`)}`);
}
