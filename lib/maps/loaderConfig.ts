export const MAPS_LOADER_ID = "google-maps-script";

// Narrow literal union matching the internal Google Maps loader
export type GMapsLibrary =
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization";

export const MAPS_LIBRARIES: GMapsLibrary[] = ["places"];

export const MAPS_LOADER_BASE = {
  id: MAPS_LOADER_ID,
  libraries: MAPS_LIBRARIES, // now correctly narrow
  language: "en",
  region: "US",
  version: "weekly",
} as const;

export function getClientMapsApiKey(): string | null {
  const k = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return k && k.trim() ? k.trim() : null;
}