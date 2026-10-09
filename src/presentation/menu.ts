import type { Config } from "../types/Config.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { cyan, green, red } from "../utils/colors.ts";
import { LINE } from "../utils/constants.ts";
import { unitSymbol } from "../utils/format.ts";
import { addCity } from "../actions/addCity.ts";
import { getForecast } from "../actions/getForecast.ts";
import { getWeather } from "../actions/getWeather.ts";
import { listCities } from "../actions/listCities.ts";
import { listForecasts } from "../actions/listForecasts.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { toggleUnit } from "../actions/toggleUnit.ts";

export function buildMenuOptions(config: Config): MenuOption[] {
  return [
    { key: "1", label: "Clima de ciudad default" },
    { key: "2", label: `Clima de todas las ciudades (${config.cities.length})` },
    { key: "3", label: "Buscar y agregar ciudad" },
    { key: "4", label: "Eliminar ciudad" },
    { key: "5", label: "Establecer ciudad default" },
    { key: "6", label: "Pronóstico 7 días (ciudad default)" },
    { key: "7", label: "Pronóstico 7 días (todas las ciudades)" },
    { key: "8", label: `Ajustes (${unitSymbol(config.unit)})` },
    { key: "9", label: "Salir" },
  ];
}

export function printMenu(config: Config): void {
  console.log(LINE);
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(LINE));
  for (const option of buildMenuOptions(config)) {
    console.log(`  ${cyan(`${option.key}.`)} ${option.label}`);
  }
  console.log(cyan(LINE));
}

/** Ejecuta la acción asociada a una opción del menú. Devuelve false para salir. */
export async function runMenuOption(
  option: string,
  config: Config,
  dataDir: string,
): Promise<boolean> {
  switch (option) {
    case "1":
      await getWeather(config.defaultCity, config.unit);
      return true;
    case "2":
      await listCities(config.cities, config.unit);
      return true;
    case "3":
      await addCity(config, dataDir);
      return true;
    case "4":
      await removeCity(config, dataDir);
      return true;
    case "5":
      await setDefaultCity(config, dataDir);
      return true;
    case "6":
      await getForecast(config.defaultCity, config.unit);
      return true;
    case "7":
      await listForecasts(config.cities, config.unit);
      return true;
    case "8":
      toggleUnit(config, dataDir);
      return true;
    case "9":
      console.log(`  ${green("¡Hasta luego!")}`);
      return false;
    default:
      console.log(`  ${red("Opción no válida.")}`);
      return true;
  }
}
