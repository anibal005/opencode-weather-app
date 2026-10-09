import { describe, expect, test } from "bun:test";
import { bold, cyan, gray, green, red, yellow } from "../../src/utils/colors.ts";

const RESET = "\x1b[0m";

describe("colores", () => {
  test("cada función envuelve el texto y lo resetea", () => {
    expect(cyan("x")).toBe(`\x1b[36mx${RESET}`);
    expect(yellow("x")).toBe(`\x1b[33mx${RESET}`);
    expect(green("x")).toBe(`\x1b[32mx${RESET}`);
    expect(red("x")).toBe(`\x1b[31mx${RESET}`);
    expect(gray("x")).toBe(`\x1b[90mx${RESET}`);
    expect(bold("x")).toBe(`\x1b[1mx${RESET}`);
  });
});
