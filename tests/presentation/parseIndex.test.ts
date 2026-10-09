import { afterAll, describe, expect, test } from "bun:test";
import { closePrompt, parseIndex } from "../../src/presentation/input.ts";

afterAll(() => {
  closePrompt();
});

describe("parseIndex", () => {
  test("convierte 1..max a índice base 0", () => {
    expect(parseIndex("1", 3)).toBe(0);
    expect(parseIndex("2", 3)).toBe(1);
    expect(parseIndex("3", 3)).toBe(2);
  });

  test("rechaza valores fuera de rango", () => {
    expect(parseIndex("0", 3)).toBeNull();
    expect(parseIndex("4", 3)).toBeNull();
    expect(parseIndex("-1", 3)).toBeNull();
  });

  test("rechaza valores que no son enteros", () => {
    expect(parseIndex("1.5", 3)).toBeNull();
    expect(parseIndex("abc", 3)).toBeNull();
    expect(parseIndex("", 3)).toBeNull();
  });
});
