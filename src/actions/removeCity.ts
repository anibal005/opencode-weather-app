import type { Config } from "../types/Config.ts";
import { ask, parseIndex } from "../presentation/input.ts";
import { printCityList } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { isSameCity } from "../utils/cities.ts";
import { cyan, green, red } from "../utils/colors.ts";

/** Opción 4: elimina una ciudad de la lista. */
export async function removeCity(config: Config, dataDir: string): Promise<void> {
  if (config.cities.length === 0) {
    console.log(`  ${red("No hay ciudades registradas.")}`);
    return;
  }

  printCityList(config.cities);
  const answer = await ask(`  ${cyan("Número de la ciudad a eliminar: ")}`);
  const index = parseIndex(answer, config.cities.length);
  if (index === null) {
    console.log(`  ${red("Número inválido.")}`);
    return;
  }

  const [removed] = config.cities.splice(index, 1);
  if (removed && config.defaultCity && isSameCity(removed, config.defaultCity)) {
    config.defaultCity = null;
    console.log(`  ${red("Se eliminó también la ciudad default.")}`);
  }

  saveCities(dataDir, config.cities, config.defaultCity);
  console.log(`  ${green(`Ciudad eliminada. Total: ${config.cities.length}.`)}`);
}
