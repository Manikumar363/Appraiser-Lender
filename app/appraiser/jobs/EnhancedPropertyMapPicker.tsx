"use client";
import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { googleMapsConfig } from "../../../lib/api/googleMapsConfig";  // Adjust path if needed

interface EnhancedPropertyMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
}

export function EnhancedPropertyMapPicker({
  onLocationSelect,
  initialLocation,
}: EnhancedPropertyMapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader(googleMapsConfig);

  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLng | null>(
    initialLocation
      ? new google.maps.LatLng(initialLocation.latitude, initialLocation.longitude)
      : null
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setSelectedPosition(e.latLng);
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onLocationSelect]
  );

  const onPlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newPosition = place.geometry.location;
        setSelectedPosition(newPosition);
        onLocationSelect(newPosition.lat(), newPosition.lng());
        if (map) {
          map.panTo(newPosition);
          map.setZoom(15);
        }
      }
    }
  };

  if (loadError) return <div className="error-message">Error loading map</div>;

  return isLoaded ? (
    <div className="w-full">
      {/* Address Search */}
      <div className="mb-3">
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={onPlaceChanged}
          options={{ types: ["address"], componentRestrictions: { country: "us" } }}
        >
          <input
            type="text"
            placeholder="Search property address..."
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm"
          />
        </Autocomplete>
      </div>
      {/* Map */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "11rem", borderRadius: "8px" }}
        center={
          initialLocation
            ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
            : { lat: 41.8781, lng: -87.6298 }
        }
        zoom={initialLocation ? 15 : 5}
        onLoad={setMap}
        onClick={onMapClick}
        options={{
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {selectedPosition && (
          <Marker position={selectedPosition} title="Property Location" />
        )}
      </GoogleMap>
      {/* Selected Position Display */}
      {selectedPosition && (
        <div className="mt-2 text-sm text-green-700">
          <strong>Selected:</strong> {selectedPosition.lat().toFixed(6)},{" "}
          {selectedPosition.lng().toFixed(6)}
        </div>
      )}
    </div>
  ) : (
    <div className="loading-message">Loading map...</div>
  );
}
