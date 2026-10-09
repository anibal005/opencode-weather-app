import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Devuelve la carpeta donde viven los datos de la app.
 * En desarrollo es la raíz del proyecto (se detecta subiendo desde el módulo
 * hasta encontrar `package.json`). En el binario compilado no existe esa raíz,
 * así que se usa la carpeta del ejecutable.
 */
export function resolveDataDir(): string {
  let dir = import.meta.dir;
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, "package.json"))) return dir;

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return dirname(process.execPath);
}
