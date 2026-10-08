const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const GRAY = "\x1b[90m";

function wrap(code: string, text: string): string {
  return `${code}${text}${RESET}`;
}

export function cyan(text: string): string {
  return wrap(CYAN, text);
}

export function yellow(text: string): string {
  return wrap(YELLOW, text);
}

export function green(text: string): string {
  return wrap(GREEN, text);
}

export function red(text: string): string {
  return wrap(RED, text);
}

export function gray(text: string): string {
  return wrap(GRAY, text);
}

export function bold(text: string): string {
  return wrap(BOLD, text);
}
