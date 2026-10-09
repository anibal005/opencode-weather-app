import { mock } from "bun:test";
import { resolve } from "node:path";
import * as realInput from "../../src/presentation/input.ts";

export interface InputMock {
  readonly answers: string[];
  reset(): void;
}

/**
 * Reemplaza `src/presentation/input.ts` por un stub de `ask` controlable.
 *
 * Todo lo demás (`parseIndex`, `closePrompt`, `InputClosedError`, ...) se
 * re-exporta desde el módulo real. Así, aunque el mock quede registrado en el
 * caché de módulos y otros archivos importen `input.ts`, siguen obteniendo las
 * funciones reales y el suite pasa también con `bun test` sin `--isolate`.
 *
 * Debe llamarse ANTES de importar dinámicamente las acciones que usan el input.
 */
export function mockInputModule(): InputMock {
  const answers: string[] = [];

  const inputPath = resolve(import.meta.dir, "../../src/presentation/input.ts");
  mock.module(inputPath, () => ({
    ...realInput,
    ask: async (_prompt: string): Promise<string> => {
      const next = answers.shift();
      if (next === undefined) {
        throw new Error("mockInput: no hay respuestas programadas");
      }
      return next;
    },
  }));

  return {
    answers,
    reset() {
      answers.length = 0;
    },
  };
}
