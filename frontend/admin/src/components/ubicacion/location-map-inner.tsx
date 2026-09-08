'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

const markerIcon = L.divIcon({
  className: 'location-picker-marker',
  html: `<div style="width:32px;height:32px;background:#000;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const QUITO_CENTER: [number, number] = [-0.180653, -78.467838];

interface LocationMapInnerProps {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16));
    }
  }, [map, lat, lng]);
  return null;
}

export default function LocationMapInner({ lat, lng, onPick }: LocationMapInnerProps) {
  const initialCenter: [number, number] = lat != null && lng != null ? [lat, lng] : QUITO_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={lat != null && lng != null ? 16 : 12}
      scrollWheelZoom
      style={{ height: '280px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <RecenterOnChange lat={lat} lng={lng} />
      {lat != null && lng != null && (
        <Marker position={[lat, lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
