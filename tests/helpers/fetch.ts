export interface FetchStub {
  readonly calls: string[];
  restore(): void;
}

/** Reemplaza `globalThis.fetch` por un handler y registra las URLs pedidas. */
export function stubFetch(
  handler: (url: string) => Response | Promise<Response>,
): FetchStub {
  const original = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = (async (
    input: string | URL | Request,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    calls.push(url);
    return handler(url);
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function isGeocoding(url: string): boolean {
  return url.includes("geocoding-api.open-meteo.com");
}

export function isForecast(url: string): boolean {
  return url.includes("api.open-meteo.com");
}
