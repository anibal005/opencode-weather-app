import type { Config } from "../types/Config.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { green } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";

/** Opción 8: alterna la unidad entre °C y °F. */
export function toggleUnit(config: Config, dataDir: string): void {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  saveSettings(dataDir, config.unit);
  console.log(`  ${green(`Unidad: ${unitSymbol(config.unit)}.`)}`);
}
