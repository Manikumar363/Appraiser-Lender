"use client";
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface PropertyMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// Default center for USA (Chicago - central location)
const defaultCenter = {
  lat: 41.8781,
  lng: -87.6298
};

export function PropertyMapPicker({ onLocationSelect, initialLocation }: PropertyMapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });

  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLng | null>(
    initialLocation ? 
    new google.maps.LatLng(initialLocation.latitude, initialLocation.longitude) : 
    null
  );

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedPosition(e.latLng);
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    }
  }, [onLocationSelect]);

  if (loadError) {
    return (
      <div className="w-full h-[300px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <p className="text-red-600">Error loading map. Please check your API key.</p>
      </div>
    );
  }

  return isLoaded ? (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialLocation ? 
          { lat: initialLocation.latitude, lng: initialLocation.longitude } : 
          defaultCenter
        }
        zoom={initialLocation ? 15 : 5}
        onClick={onMapClick}
        options={{
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {selectedPosition && (
          <Marker 
            position={selectedPosition}
            title="Selected Property Location"
          />
        )}
      </GoogleMap>
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          📍 Click anywhere on the map to select property location
        </p>
        {selectedPosition && (
          <div className="mt-2 text-sm text-green-700">
            <strong>Selected:</strong> {selectedPosition.lat().toFixed(6)}, {selectedPosition.lng().toFixed(6)}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  );
}
