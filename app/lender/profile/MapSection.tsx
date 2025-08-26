"use client";

import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LocationIcon } from "@/components/icons";
import {
  MAPS_LOADER_BASE,
  getClientMapsApiKey,
  MAPS_LIBRARIES,
} from "@/lib/maps/loaderConfig";

interface Props {
  isEditing: boolean;
  address: string;
  onAddressChange(addr: string): void;
  marker: { lat: number; lng: number };
  onMarkerChange(lat: number, lng: number): void;
}

const mapContainerStyle = { width: "100%", height: "136px" };

// Global debug (dev only)
const sigRef: { current?: string } =
  typeof window !== "undefined"
    ? ((window as any).__GM_LOADER_SIG__ ??
        ((window as any).__GM_LOADER_SIG__ = {}))
    : {};

export default function MapSection(props: Props) {
  const apiKey = getClientMapsApiKey();
  if (!apiKey) {
    return (
      <>
        <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
          <LocationIcon />
          <input
            type="text"
            value={props.address}
            onChange={(e) =>
              props.isEditing && props.onAddressChange(e.target.value)
            }
            placeholder="Enter Location Address"
            readOnly={!props.isEditing}
            className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
              !props.isEditing ? "cursor-not-allowed" : ""
            }`}
          />
        </div>
        <div className="w-full h-[136px] mt-2 flex items-center justify-center text-xs text-gray-500 border border-gray-600 rounded-lg">
          Google Maps API key missing
        </div>
      </>
    );
  }
  return <LoadedMap apiKey={apiKey} {...props} />;
}

function LoadedMap({
  apiKey,
  isEditing,
  address,
  onAddressChange,
  marker,
  onMarkerChange,
}: Props & { apiKey: string }) {
  // Build stable options (do NOT clone libraries)
  const loaderOptions = {
    id: MAPS_LOADER_BASE.id,
    googleMapsApiKey: apiKey,
    libraries: MAPS_LIBRARIES as any, // or as Library[]
    language: MAPS_LOADER_BASE.language,
    region: MAPS_LOADER_BASE.region,
    version: MAPS_LOADER_BASE.version,
  };

  if (process.env.NODE_ENV !== "production") {
    const sig = JSON.stringify(loaderOptions);
    if (sigRef.current && sigRef.current !== sig) {
      // eslint-disable-next-line no-console
      console.error(
        "[Maps] Loader mismatch. Prev:",
        sigRef.current,
        "New:",
        sig
      );
    } else if (!sigRef.current) {
      // eslint-disable-next-line no-console
      console.log("[Maps] Loader signature:", sig);
    }
    sigRef.current = sig;
  }

  const { isLoaded, loadError } = useJsApiLoader(loaderOptions);

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    const loc = place.geometry?.location;
    if (loc) onMarkerChange(loc.lat(), loc.lng());
    if (place.formatted_address) onAddressChange(place.formatted_address);
  };

  // Optional: recenter if marker changes after load
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(marker);
    }
  }, [marker]);

  return (
    <>
      <div className="flex items-center rounded-full px-4 py-3 border border-gray-600">
        <LocationIcon />
        {loadError && (
          <input
            type="text"
            value={address}
            readOnly
            className="flex-1 bg-transparent text-sm text-red-600 outline-none"
            placeholder="Map load error"
          />
        )}
        {!loadError && isLoaded && (
          <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
            <input
              type="text"
              value={address}
              onChange={(e) => isEditing && onAddressChange(e.target.value)}
              placeholder="Enter Location Address"
              readOnly={!isEditing}
              className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none ${
                !isEditing ? "cursor-not-allowed" : ""
              }`}
            />
          </Autocomplete>
        )}
        {!loadError && !isLoaded && (
          <input
            type="text"
            value={address}
            readOnly
            placeholder="Loading Google Maps..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none cursor-wait"
          />
        )}
      </div>

      <div className="w-full h-[136px] rounded-lg overflow-hidden border border-gray-600 mt-2">
        {loadError && (
          <div className="flex items-center justify-center h-full text-xs text-red-600">
            Failed to load map
          </div>
        )}
        {!loadError && isLoaded && (
          <GoogleMap
            onLoad={(m) => {
              mapRef.current = m;
            }}
            mapContainerStyle={mapContainerStyle}
            center={marker}
            zoom={15}
            onClick={
              isEditing
                ? (e) => {
                    const lat = e.latLng?.lat();
                    const lng = e.latLng?.lng();
                    if (lat != null && lng != null) onMarkerChange(lat, lng);
                  }
                : undefined
            }
            options={{
              disableDefaultUI: true,
              clickableIcons: false,
              // mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID
            }}
          >
            <Marker position={marker} />
          </GoogleMap>
        )}
        {!loadError && !isLoaded && (
          <div className="flex items-center justify-center h-full text-xs text-gray-500">
            Loading map...
          </div>
        )}
      </div>
    </>
  );
}