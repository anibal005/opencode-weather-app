import type { Unit } from "../types/Unit.ts";

/** Línea decorativa que enmarca el menú. */
export const LINE = "═".repeat(40);

/** Base de la API de geocodificación de OpenMeteo. */
export const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

/** Base de la API de pronóstico de OpenMeteo. */
export const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";

/** Cantidad de días del pronóstico. */
export const FORECAST_DAYS = "7";

/** Unidad por defecto de la app. */
export const DEFAULT_UNIT: Unit = "celsius";

/** Archivo donde se guardan las ciudades. */
export const CITIES_FILE = "cities.json";

/** Archivo donde se guardan las preferencias. */
export const SETTINGS_FILE = "settings.json";

/** Archivo de configuración de versiones anteriores (solo migración). */
export const LEGACY_CONFIG_FILE = "weather.config.json";
