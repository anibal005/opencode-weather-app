import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { resolveDataDir } from "../../src/storage/paths.ts";

describe("resolveDataDir", () => {
  test("en desarrollo apunta a la raíz que contiene package.json", () => {
    const dir = resolveDataDir();
    expect(typeof dir).toBe("string");
    expect(statSync(dir).isDirectory()).toBe(true);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });
});
