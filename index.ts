import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { geocode, getTemperature } from "./src/api.ts";
import { loadConfig, saveConfig } from "./src/storage.ts";
import {
  ask,
  closePrompt,
  InputClosedError,
  printCityList,
  printError,
  printMenu,
  printTemperature,
} from "./src/ui.ts";
import type { City, Config } from "./src/types.ts";

// En desarrollo import.meta.dir es la raíz del proyecto. En el binario
// compilado apunta al bundle interno de Bun, así que usamos la carpeta
// del ejecutable.
function resolveConfigPath(): string {
  const devDir = import.meta.dir;
  if (existsSync(join(devDir, "package.json"))) {
    return join(devDir, "weather.config.json");
  }
  return join(dirname(process.execPath), "weather.config.json");
}

const CONFIG_PATH = resolveConfigPath();

function isSameCity(a: City, b: City): boolean {
  return (
    a.name === b.name &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}

function parseIndex(input: string, max: number): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1 || value > max) return null;
  return value - 1;
}

async function showDefaultCity(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log("  No hay ciudad default. Usa la opción 5 para establecer una.");
    return;
  }
  try {
    const temperature = await getTemperature(config.defaultCity, config.unit);
    printTemperature(config.defaultCity, temperature, config.unit);
  } catch (error) {
    printError(error);
  }
}

async function showAllCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const city of config.cities) {
    try {
      const temperature = await getTemperature(city, config.unit);
      printTemperature(city, temperature, config.unit);
    } catch (error) {
      printError(error);
    }
  }
}

async function searchAndAddCity(config: Config): Promise<void> {
  const query = await ask("  Nombre de la ciudad: ");
  if (!query) {
    console.log("  Debes ingresar un nombre.");
    return;
  }

  const city = await geocode(query);
  if (!city) {
    console.log(`  No se encontró la ciudad "${query}".`);
    return;
  }

  const temperature = await getTemperature(city, config.unit);
  printTemperature(city, temperature, config.unit);

  const exists = config.cities.some((c) => isSameCity(c, city));
  if (exists) {
    console.log("  La ciudad ya estaba registrada.");
    return;
  }

  config.cities.push(city);
  saveConfig(CONFIG_PATH, config);
  console.log(`  Ciudad agregada. Total: ${config.cities.length}.`);
}

async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas.");
    return;
  }

  printCityList(config.cities);
  const answer = await ask("  Número de la ciudad a eliminar: ");
  const index = parseIndex(answer, config.cities.length);
  if (index === null) {
    console.log("  Número inválido.");
    return;
  }

  const [removed] = config.cities.splice(index, 1);
  if (removed && config.defaultCity && isSameCity(removed, config.defaultCity)) {
    config.defaultCity = null;
    console.log("  Se eliminó también la ciudad default.");
  }

  saveConfig(CONFIG_PATH, config);
  console.log(`  Ciudad eliminada. Total: ${config.cities.length}.`);
}

async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades registradas. Usa la opción 3 para agregar una.");
    return;
  }

  printCityList(config.cities);
  const answer = await ask("  Número de la ciudad default: ");
  const index = parseIndex(answer, config.cities.length);
  if (index === null) {
    console.log("  Número inválido.");
    return;
  }

  const city = config.cities[index];
  if (!city) return;

  config.defaultCity = city;
  saveConfig(CONFIG_PATH, config);
  console.log(`  Ciudad default: ${city.name}.`);
}

function toggleUnit(config: Config): void {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  saveConfig(CONFIG_PATH, config);
  console.log(`  Unidad: ${config.unit === "celsius" ? "°C" : "°F"}.`);
}

async function main(): Promise<void> {
  const config = loadConfig(CONFIG_PATH);

  while (true) {
    printMenu(config);

    let option: string;
    try {
      option = await ask("  Selecciona una opción: ");
    } catch (error) {
      if (error instanceof InputClosedError) return;
      throw error;
    }

    try {
      switch (option) {
        case "1":
          await showDefaultCity(config);
          break;
        case "2":
          await showAllCities(config);
          break;
        case "3":
          await searchAndAddCity(config);
          break;
        case "4":
          await removeCity(config);
          break;
        case "5":
          await setDefaultCity(config);
          break;
        case "8":
          toggleUnit(config);
          break;
        case "9":
          console.log("  ¡Hasta luego!");
          return;
        default:
          console.log("  Opción no válida.");
      }
    } catch (error) {
      if (error instanceof InputClosedError) return;
      printError(error);
    }
  }
}

main()
  .catch(printError)
  .finally(closePrompt);
