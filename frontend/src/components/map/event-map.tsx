'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { EventItem } from '@/types';

// Fix Leaflet marker icon issue
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface EventMapProps {
  events: EventItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const defaultCenter: [number, number] = [-0.180653, -78.467838]; // Quito
const defaultZoom = 13;

export function EventMap({
  events,
  center = defaultCenter,
  zoom = defaultZoom,
  height = '400px',
}: EventMapProps) {
  return (
    <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) =>
          event.latitud != null && event.longitud != null ? (
            <Marker
              key={event.id}
              position={[event.latitud, event.longitud]}
              icon={icon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{event.titulo}</strong>
                  <br />
                  <span className="text-slate-500">{event.categoriaNombre}</span>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>
    </div>
  );
}
