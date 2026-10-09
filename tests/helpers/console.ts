export interface ConsoleCapture {
  readonly lines: string[];
  text(): string;
  restore(): void;
}

/** Reemplaza `console.log` para capturar lo que imprime la aplicación. */
export function captureConsole(): ConsoleCapture {
  const lines: string[] = [];
  const original = console.log;

  console.log = (...args: unknown[]): void => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  };

  return {
    lines,
    text: () => lines.join("\n"),
    restore: () => {
      console.log = original;
    },
  };
}
