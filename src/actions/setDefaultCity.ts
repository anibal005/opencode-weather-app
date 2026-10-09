import type { Config } from "../types/Config.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { printCityList } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { cyan, green, red } from "../utils/colors.ts";

/** Opción 5: establece cuál es la ciudad por defecto. */
export async function setDefaultCity(config: Config, dataDir: string): Promise<void> {
  if (config.cities.length === 0) {
    console.log(`  ${red("No hay ciudades registradas. Usa la opción 3 para agregar una.")}`);
    return;
  }

  printCityList(config.cities);
  const answer = await ask(`  ${cyan("Número de la ciudad default: ")}`);
  const index = parseIndex(answer, config.cities.length);
  if (index === null) {
    console.log(`  ${red("Número inválido.")}`);
    return;
  }

  const city = config.cities[index];
  if (!city) return;

  config.defaultCity = city;
  saveCities(dataDir, config.cities, config.defaultCity);
  console.log(`  ${green(`Ciudad default: ${city.name}.`)}`);
}
