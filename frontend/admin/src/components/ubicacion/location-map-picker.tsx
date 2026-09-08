'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const LocationMapInner = dynamic(() => import('./location-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center rounded-lg border border-white/10 bg-black/40">
      <Loader2 className="h-5 w-5 animate-spin text-white/40" />
    </div>
  ),
});

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationMapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  onAddressFound?: (direccion: string) => void;
}

const DEBOUNCE_MS = 500;

export function LocationMapPicker({
  lat,
  lng,
  onChange,
  onAddressFound,
}: LocationMapPickerProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (query.trim().length < 3) {
        setResultados([]);
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({
        format: 'json',
        q: query.trim(),
        countrycodes: 'ec',
        limit: '5',
        addressdetails: '0',
      });
      fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      })
        .then((res) => res.json())
        .then((data: NominatimResult[]) => {
          setResultados(data);
          setOpen(true);
        })
        .catch(() => setResultados([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function elegirResultado(r: NominatimResult) {
    const latNum = Number(r.lat);
    const lngNum = Number(r.lon);
    onChange({ lat: latNum, lng: lngNum });
    onAddressFound?.(r.display_name);
    setQuery(r.display_name);
    setResultados([]);
    setOpen(false);
  }

  async function reverseGeocode(latNum: number, lngNum: number) {
    onChange({ lat: latNum, lng: lngNum });
    if (!onAddressFound) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}`,
        { headers: { Accept: 'application/json' } },
      );
      const data = (await res.json()) as { display_name?: string };
      if (data.display_name) onAddressFound(data.display_name);
    } catch {
      // silencioso: el admin puede llenar la dirección manualmente
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative" ref={ref}>
        <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          placeholder="Buscar dirección (ej. Av. Amazonas y Naciones Unidas, Quito)"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => resultados.length > 0 && setOpen(true)}
          className="h-10 w-full border-b border-white bg-transparent pl-6 pr-6 text-sm text-white placeholder:text-white/50 focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
        {open && resultados.length > 0 && (
          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-white/10 bg-[#111] shadow-xl">
            {resultados.map((r, i) => (
              <button
                key={`${r.lat}-${r.lon}-${i}`}
                type="button"
                onClick={() => elegirResultado(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <span>{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <LocationMapInner lat={lat} lng={lng} onPick={reverseGeocode} />
      <p className="text-xs text-white/40">
        Busca una dirección o haz clic en el mapa para fijar la ubicación exacta.
      </p>
    </div>
  );
}
