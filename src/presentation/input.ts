import { createInterface } from "node:readline/promises";
import type { Interface } from "node:readline/promises";

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

/** Convierte un input de usuario (1..max) en un índice 0-based, o null si es inválido. */
export function parseIndex(input: string, max: number): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1 || value > max) return null;
  return value - 1;
}
