import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Crea una carpeta temporal única para aislar los datos de cada test. */
export function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "weather-test-"));
}

/** Borra una carpeta temporal (ignora errores si ya no existe). */
export function removeTempDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}
