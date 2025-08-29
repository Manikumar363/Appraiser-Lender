// lib/googleMapsConfig.ts
import { LoadScriptProps } from "@react-google-maps/api";  // Add this import

export const googleMapsConfig: Pick<LoadScriptProps, "id" | "googleMapsApiKey" | "libraries"> = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  libraries: ["places"],  // TypeScript now infers this correctly via Pick<LoadScriptProps, ...>
};
