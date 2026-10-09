import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "../..");
const srcDir = join(projectRoot, "src");
const packageFile = join(projectRoot, "package.json");

let dir = "";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "weather-e2e-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Copia un proyecto mínimo a la carpeta temporal y lanza el CLI real.
 * Copiando `src/` + `package.json`, `resolveDataDir()` resuelve el temp como
 * carpeta de datos y los tests no tocan los archivos reales del proyecto.
 */
async function runCli(input: string): Promise<CliResult> {
  cpSync(srcDir, join(dir, "src"), { recursive: true });
  cpSync(packageFile, join(dir, "package.json"));

  const proc = Bun.spawn(["bun", "run", "src/index.ts"], {
    cwd: dir,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  proc.stdin!.write(input);
  proc.stdin!.end();

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { stdout, stderr, exitCode };
}

describe("CLI (E2E)", () => {
  test("flujo básico sin red: opción inválida, listas vacías, toggle y salir", async () => {
    const { stdout, stderr, exitCode } = await runCli("x\n2\n4\n5\n8\n9\n");

    expect(exitCode).toBe(0);
    expect(stderr).not.toContain("Uncaught");
    expect(stdout).toContain("WEATHER CLI");
    expect(stdout).toContain("Opción no válida.");
    expect(stdout).toContain("No hay ciudades registradas.");
    expect(stdout).toContain("Unidad: °F");
    expect(stdout).toContain("¡Hasta luego!");

    const settings = JSON.parse(readFileSync(join(dir, "settings.json"), "utf-8"));
    expect(settings).toEqual({ unit: "fahrenheit" });
    expect(existsSync(join(dir, "src", "index.ts"))).toBe(true);
  }, 20000);
});
