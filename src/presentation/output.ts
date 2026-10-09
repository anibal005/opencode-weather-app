import type { City } from "../types/City.ts";
import type { DailyForecast } from "../types/Weather.ts";
import type { Unit } from "../types/Unit.ts";
import { bold, cyan, gray, red, yellow } from "../utils/colors.ts";
import { cityLabel, formatDay, formatTemperature, unitSymbol } from "../utils/format.ts";

export function printTemperature(city: City, temperature: number, unit: Unit): void {
  console.log(`  ${cityLabel(city)}: ${yellow(`${formatTemperature(temperature)}${unitSymbol(unit)}`)}`);
}

export function printForecast(city: City, forecast: DailyForecast[], unit: Unit): void {
  console.log(`  ${bold(cityLabel(city))} ${gray("— próximos 7 días")}`);
  for (const day of forecast) {
    const label = formatDay(day.date).padEnd(12);
    const max = `▲ ${formatTemperature(day.tempMax)}${unitSymbol(unit)}`;
    const min = `▼ ${formatTemperature(day.tempMin)}${unitSymbol(unit)}`;
    console.log(`    ${gray(label)}${yellow(max)}  ${yellow(min)}`);
  }
}

export function printCityList(cities: City[]): void {
  if (cities.length === 0) {
    console.log("  No hay ciudades registradas.");
    return;
  }
  cities.forEach((city, index) => {
    console.log(`  ${cyan(String(index + 1))}. ${cityLabel(city)}`);
  });
}

export function printError(message: unknown): void {
  const text = message instanceof Error ? message.message : String(message);
  console.log(`  ${red(`Error: ${text}`)}`);
}
