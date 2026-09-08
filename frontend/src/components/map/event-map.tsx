'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';

export interface MapaEvento {
  id: string;
  titulo: string;
  latitud: number | null;
  longitud: number | null;
  categoriaNombre?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const selectedIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:36px;height:36px;background:#000;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">!</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function categoryIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: 'category-marker',
    html: `<div style="width:28px;height:28px;background:#000;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${escapeHtml(label.slice(0, 2).toUpperCase())}</div>`,
    iconAnchor: [14, 14],
  });
}

function clusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div style="width:36px;height:36px;background:#000;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:bold;">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface RutasGeometria {
  id: string;
  coordenadas: [number, number][];
}

interface EventMapProps {
  events: MapaEvento[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onEventClick?: (event: MapaEvento) => void;
  selectedEventId?: string;
  rutasGeometrias?: RutasGeometria[];
  rutaActivaId?: string;
}

const defaultCenter: [number, number] = [-0.180653, -78.467838];
const defaultZoom = 13;
const CLUSTER_RADIUS_PX = 44;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.whenReady(() => {
      map.setView(center, map.getZoom());
    });
  }, [center, map]);
  return null;
}

interface ClusterGroup {
  key: string;
  lat: number;
  lng: number;
  events: MapaEvento[];
}

function computeClusters(map: L.Map, events: MapaEvento[]): ClusterGroup[] {
  const points = events
    .map((e) => ({ event: e, lat: Number(e.latitud), lng: Number(e.longitud) }))
    .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng))
    .map((e) => ({
      event: e.event,
      lat: e.lat,
      lng: e.lng,
      pt: map.latLngToContainerPoint([e.lat, e.lng]),
    }));

  const used = new Array(points.length).fill(false);
  const clusters: ClusterGroup[] = [];

  for (let i = 0; i < points.length; i++) {
    if (used[i]) continue;
    const group = [points[i]];
    used[i] = true;
    for (let j = i + 1; j < points.length; j++) {
      if (used[j]) continue;
      const dx = points[i].pt.x - points[j].pt.x;
      const dy = points[i].pt.y - points[j].pt.y;
      if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS_PX) {
        group.push(points[j]);
        used[j] = true;
      }
    }
    const avgLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    const avgLng = group.reduce((s, p) => s + p.lng, 0) / group.length;
    clusters.push({
      key: group.map((p) => p.event.id).join('-'),
      lat: avgLat,
      lng: avgLng,
      events: group.map((p) => p.event),
    });
  }
  return clusters;
}

function ClusteredMarkers({
  events,
  onEventClick,
  selectedEventId,
}: {
  events: MapaEvento[];
  onEventClick?: (event: MapaEvento) => void;
  selectedEventId?: string;
}) {
  const map = useMap();
  const [clusters, setClusters] = useState<ClusterGroup[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const clusterPopupRef = useRef<L.Popup | null>(null);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!map) return;
    function recompute() {
      if (!map || !mapReady) return;
      setClusters(computeClusters(map, events));
      if (clusterPopupRef.current) {
        clusterPopupRef.current.remove();
        clusterPopupRef.current = null;
      }
    }
    map.whenReady(() => {
      setMapReady(true);
    });
  }, [map]);

  useEffect(() => {
    if (!map || !mapReady) return;
    function recompute() {
      setClusters(computeClusters(map, eventsRef.current));
      if (clusterPopupRef.current) {
        clusterPopupRef.current.remove();
        clusterPopupRef.current = null;
      }
    }
    function onZoomOrMoveEnd() {
      recompute();
    }
    function onZoomStart() {
      recompute();
    }
    recompute();
    map.on('zoomstart', onZoomStart);
    map.on('zoomend', onZoomOrMoveEnd);
    map.on('moveend', onZoomOrMoveEnd);
    return () => {
      map.off('zoomstart', onZoomStart);
      map.off('zoomend', onZoomOrMoveEnd);
      map.off('moveend', onZoomOrMoveEnd);
    };
  }, [map, mapReady]);

  function handleClusterClick(cluster: ClusterGroup, e: L.LeafletMouseEvent) {
    L.DomEvent.stopPropagation(e.originalEvent);

    if (clusterPopupRef.current) {
      clusterPopupRef.current.remove();
      clusterPopupRef.current = null;
      return;
    }

    const popupContent = document.createElement('div');
    popupContent.style.cssText = 'min-width: 200px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; font-size: 14px; color: #333; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;';
    title.textContent = `${cluster.events.length} eventos`;
    popupContent.appendChild(title);

    cluster.events.forEach((event) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 0; background: none; border: none; border-bottom: 1px solid #f0f0f0; cursor: pointer; text-align: left;';
      btn.innerHTML = `
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #1a1a1a, #0a0a0a); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; font-weight: 600; flex-shrink: 0;">
          ${(event.titulo || 'EV').slice(0, 2).toUpperCase()}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event.titulo || ''}</div>
          ${event.categoriaNombre ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${event.categoriaNombre}</div>` : ''}
        </div>
      `;
      btn.addEventListener('click', () => {
        if (clusterPopupRef.current) {
          clusterPopupRef.current.remove();
          clusterPopupRef.current = null;
        }
        onEventClick?.(event);
      });
      popupContent.appendChild(btn);
    });

    const popup = L.popup({ closeButton: true, maxWidth: 250 })
      .setLatLng([cluster.lat, cluster.lng])
      .setContent(popupContent)
      .openOn(map);

    clusterPopupRef.current = popup;

    popup.on('remove', () => {
      clusterPopupRef.current = null;
    });
  }

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.events.length > 1) {
          return (
            <Marker
              key={cluster.key}
              position={[cluster.lat, cluster.lng]}
              icon={clusterIcon(cluster.events.length)}
              eventHandlers={{
                click: (e) => handleClusterClick(cluster, e),
              }}
            />
          );
        }
        const event = cluster.events[0];
        const isSelected = selectedEventId === event.id;
        return (
          <Marker
            key={event.id}
            position={[cluster.lat, cluster.lng]}
            icon={isSelected ? selectedIcon : categoryIcon(event.categoriaNombre || event.titulo)}
            eventHandlers={{
              click: () => onEventClick?.(event),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{event.titulo}</strong>
                {event.categoriaNombre && (
                  <>
                    <br />
                    <span className="text-slate-500">{event.categoriaNombre}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function RoutePolylines({
  rutas,
  activaId,
}: {
  rutas: RutasGeometria[];
  activaId?: string;
}) {
  return (
    <>
      {rutas.map((ruta) => {
        const isActiva = ruta.id === activaId;
        return (
          <Polyline
            key={ruta.id}
            positions={ruta.coordenadas}
            pathOptions={{
              color: isActiva ? '#7DD3FC' : '#ffffff',
              weight: isActiva ? 4 : 2,
              opacity: isActiva ? 0.9 : 0.25,
            }}
          />
        );
      })}
    </>
  );
}

export function EventMap({
  events,
  center = defaultCenter,
  zoom = defaultZoom,
  height = '400px',
  onEventClick,
  selectedEventId,
  rutasGeometrias,
  rutaActivaId,
}: EventMapProps) {
  return (
    <div style={{ height, width: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        keyboard={true}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
          maxNativeZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
          maxNativeZoom={16}
        />
        <MapUpdater center={center} />
        <ClusteredMarkers events={events} onEventClick={onEventClick} selectedEventId={selectedEventId} />
        {rutasGeometrias && (
          <RoutePolylines rutas={rutasGeometrias} activaId={rutaActivaId} />
        )}
      </MapContainer>
    </div>
  );
}
