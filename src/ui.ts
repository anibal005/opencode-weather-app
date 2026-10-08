import { createInterface } from "node:readline/promises";
import type { Interface } from "node:readline/promises";
import type { City, Config, Unit } from "./types.ts";

const rl: Interface = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export class InputClosedError extends Error {
  constructor() {
    super("La entrada está cerrada");
  }
}

// Buffer de líneas: evita perder input que llega antes de que se pida
// (típico cuando stdin es un pipeline o el usuario escribe rápido).
const bufferedLines: string[] = [];
const pendingQuestions: Array<{ resolve: (v: string) => void; reject: (e: Error) => void }> = [];
let inputClosed = false;

rl.on("line", (line) => {
  const waiter = pendingQuestions.shift();
  if (waiter) {
    waiter.resolve(line.trim());
  } else {
    bufferedLines.push(line.trim());
  }
});

rl.on("close", () => {
  inputClosed = true;
  while (pendingQuestions.length > 0) {
    pendingQuestions.shift()?.reject(new InputClosedError());
  }
});

export async function ask(prompt: string): Promise<string> {
  const buffered = bufferedLines.shift();
  if (buffered !== undefined) return buffered;
  if (inputClosed) throw new InputClosedError();

  process.stdout.write(prompt);
  return new Promise((resolve, reject) => {
    pendingQuestions.push({ resolve, reject });
  });
}

export function closePrompt(): void {
  rl.close();
}

const LINE = "═".repeat(40);

export function printMenu(config: Config): void {
  const unitLabel = config.unit === "celsius" ? "°C" : "°F";
  console.log(LINE);
  console.log("         WEATHER CLI");
  console.log(LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitLabel})`);
  console.log("  9. Salir");
  console.log(LINE);
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

function formatTemperature(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function printTemperature(city: City, temperature: number, unit: Unit): void {
  console.log(`  ${cityLabel(city)}: ${formatTemperature(temperature)}${unitSymbol(unit)}`);
}

export function printCityList(cities: City[]): void {
  if (cities.length === 0) {
    console.log("  No hay ciudades registradas.");
    return;
  }
  cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${cityLabel(city)}`);
  });
}

export function printError(message: unknown): void {
  const text = message instanceof Error ? message.message : String(message);
  console.log(`  Error: ${text}`);
}
