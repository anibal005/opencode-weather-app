import type { Config } from "./types/Config.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { migrateLegacyConfig } from "./storage/migrateLegacy.ts";
import { resolveDataDir } from "./storage/paths.ts";
import { ask, closePrompt, InputClosedError } from "./presentation/input.ts";
import { printMenu, runMenuOption } from "./presentation/menu.ts";
import { printError } from "./presentation/output.ts";
import { cyan } from "./utils/colors.ts";

function loadConfig(dataDir: string): Config {
  const citiesData = loadCities(dataDir);
  const settings = loadSettings(dataDir);
  return {
    cities: citiesData.cities,
    defaultCity: citiesData.defaultCity,
    unit: settings.unit,
  };
}

async function main(): Promise<void> {
  const dataDir = resolveDataDir();
  migrateLegacyConfig(dataDir);
  const config = loadConfig(dataDir);

  while (true) {
    printMenu(config);

    let option: string;
    try {
      option = await ask(`  ${cyan("Selecciona una opción: ")}`);
    } catch (error) {
      if (error instanceof InputClosedError) return;
      throw error;
    }

    try {
      const keepGoing = await runMenuOption(option, config, dataDir);
      if (!keepGoing) return;
    } catch (error) {
      if (error instanceof InputClosedError) return;
      printError(error);
    }
  }
}

main()
  .catch(printError)
  .finally(closePrompt);
