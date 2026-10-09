import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import { closePrompt } from "../../src/presentation/input.ts";
import { runMenuOption } from "../../src/presentation/menu.ts";
import { captureConsole } from "../helpers/console.ts";
import { makeTempDir, removeTempDir } from "../helpers/tmp.ts";

afterAll(() => {
  closePrompt();
});

let dir = "";

beforeEach(() => {
  dir = makeTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

function emptyConfig(): Config {
  return { cities: [], defaultCity: null, unit: "celsius" };
}

describe("runMenuOption", () => {
  test("la opción 9 sale y se despide", async () => {
    const cap = captureConsole();
    let keepGoing = true;
    try {
      keepGoing = await runMenuOption("9", emptyConfig(), dir);
    } finally {
      cap.restore();
    }

    expect(keepGoing).toBe(false);
    expect(cap.text()).toContain("¡Hasta luego!");
  });

  test("una opción inválida avisa y continúa", async () => {
    const cap = captureConsole();
    let keepGoing = false;
    try {
      keepGoing = await runMenuOption("x", emptyConfig(), dir);
    } finally {
      cap.restore();
    }

    expect(keepGoing).toBe(true);
    expect(cap.text()).toContain("Opción no válida.");
  });

  test("la opción 1 sin default avisa", async () => {
    const cap = captureConsole();
    try {
      await runMenuOption("1", emptyConfig(), dir);
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudad default");
  });

  test("la opción 6 sin default avisa", async () => {
    const cap = captureConsole();
    try {
      await runMenuOption("6", emptyConfig(), dir);
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudad default");
  });

  test("la opción 2 sin ciudades avisa", async () => {
    const cap = captureConsole();
    try {
      await runMenuOption("2", emptyConfig(), dir);
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudades registradas");
  });

  test("la opción 7 sin ciudades avisa", async () => {
    const cap = captureConsole();
    try {
      await runMenuOption("7", emptyConfig(), dir);
    } finally {
      cap.restore();
    }
    expect(cap.text()).toContain("No hay ciudades registradas");
  });

  test("la opción 8 alterna la unidad", async () => {
    const config = emptyConfig();
    const cap = captureConsole();
    let keepGoing = false;
    try {
      keepGoing = await runMenuOption("8", config, dir);
    } finally {
      cap.restore();
    }

    expect(keepGoing).toBe(true);
    expect(config.unit).toBe("fahrenheit");
    expect(cap.text()).toContain("Unidad: °F");
  });
});
