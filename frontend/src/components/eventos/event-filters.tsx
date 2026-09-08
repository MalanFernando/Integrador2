'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';

export interface EventFiltersState {
  distancia: number;
  precioMin: number;
  precioMax: number;
  gratis: boolean;
  fechaOpcion: string;
  fechaCustom: string;
}

export const defaultEventFilters: EventFiltersState = {
  distancia: 0,
  precioMin: 0,
  precioMax: 100,
  gratis: false,
  fechaOpcion: 'todos',
  fechaCustom: '',
};

const dateOptions = [
  { value: 'todos', label: 'Cualquier fecha' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'fecha', label: 'Fecha específica' },
];

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
  categorias: string[];
  categoriaActiva: string;
  onCategoriaChange: (categoria: string) => void;
  hasLocation?: boolean;
  mostrarLimpiar?: boolean;
  onLimpiar?: () => void;
}

export function EventFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  categorias,
  categoriaActiva,
  onCategoriaChange,
  hasLocation,
  mostrarLimpiar = false,
  onLimpiar,
}: EventFiltersProps) {
  const [showDistancia, setShowDistancia] = useState(false);
  const [showPrecio, setShowPrecio] = useState(false);
  const [showFecha, setShowFecha] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const distanciaRef = useRef<HTMLDivElement>(null);
  const precioRef = useRef<HTMLDivElement>(null);
  const fechaRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileFiltersRef.current && !mobileFiltersRef.current.contains(e.target as Node)) {
        setShowMobileFilters(false);
      }
      if (distanciaRef.current && !distanciaRef.current.contains(e.target as Node)) setShowDistancia(false);
      if (precioRef.current && !precioRef.current.contains(e.target as Node)) setShowPrecio(false);
      if (fechaRef.current && !fechaRef.current.contains(e.target as Node)) setShowFecha(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function renderDistanciaControl() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Radio de búsqueda</span>
          <span className="text-sm text-[#F59E0B] font-medium">{filters.distancia} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={filters.distancia}
          onChange={(e) => onFiltersChange({ ...filters, distancia: Number(e.target.value) })}
          className="w-full accent-[#F59E0B]"
        />
        <div className="flex justify-between text-xs text-white/50">
          <span>1 km</span>
          <span>50 km</span>
        </div>
        {hasLocation && (
          <p className="text-xs text-white/40">Usando tu ubicación actual</p>
        )}
      </div>
    );
  }

  function renderPrecioControl() {
    return (
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.gratis}
            onChange={(e) => onFiltersChange({ ...filters, gratis: e.target.checked, precioMin: 0, precioMax: 100 })}
            className="accent-[#F59E0B]"
          />
          <span className="text-sm text-white">Solo eventos gratuitos</span>
        </label>
        {!filters.gratis && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Rango de precio</span>
              <span className="text-sm text-[#F59E0B] font-medium">${filters.precioMin} - ${filters.precioMax}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.precioMin}
              onChange={(e) => onFiltersChange({ ...filters, precioMin: Number(e.target.value) })}
              className="w-full accent-[#F59E0B]"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.precioMax}
              onChange={(e) => onFiltersChange({ ...filters, precioMax: Number(e.target.value) })}
              className="w-full accent-[#F59E0B]"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>$0</span>
              <span>$100+</span>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderFechaControl() {
    return (
      <div className="space-y-2">
        {dateOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFiltersChange({ ...filters, fechaOpcion: opt.value })}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              filters.fechaOpcion === opt.value ? 'bg-[#F59E0B] text-black' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {filters.fechaOpcion === 'fecha' && (
          <input
            type="date"
            value={filters.fechaCustom}
            onChange={(e) => onFiltersChange({ ...filters, fechaCustom: e.target.value })}
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-md text-sm text-white"
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            className="w-full h-10 bg-[#222] border border-[#333] rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
            placeholder="Buscar por nombre, artista o lugar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative" ref={distanciaRef}>
            <button
              onClick={() => { setShowDistancia(!showDistancia); setShowPrecio(false); setShowFecha(false); }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white/10 flex items-center gap-2 ${filters.distancia > 0 ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-[#444] text-white'}`}
            >
              Distancia {filters.distancia > 0 ? `(${filters.distancia}km)` : ''}
              <ChevronsUpDown className="h-3.5 w-3.5 text-white/40" />
            </button>
            {showDistancia && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 z-50">
                {renderDistanciaControl()}
              </div>
            )}
          </div>

          <div className="relative" ref={precioRef}>
            <button
              onClick={() => { setShowPrecio(!showPrecio); setShowDistancia(false); setShowFecha(false); }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white/10 flex items-center gap-2 ${filters.gratis || filters.precioMin > 0 || filters.precioMax < 100 ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-[#444] text-white'}`}
            >
              Precio {filters.gratis ? '(Gratis)' : filters.precioMin > 0 || filters.precioMax < 100 ? `($${filters.precioMin} - $${filters.precioMax})` : ''}
              <ChevronsUpDown className="h-3.5 w-3.5 text-white/40" />
            </button>
            {showPrecio && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 z-50">
                {renderPrecioControl()}
              </div>
            )}
          </div>

          <div className="relative" ref={fechaRef}>
            <button
              onClick={() => { setShowFecha(!showFecha); setShowDistancia(false); setShowPrecio(false); }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white/10 flex items-center gap-2 ${filters.fechaOpcion !== 'todos' ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-[#444] text-white'}`}
            >
              {dateOptions.find((o) => o.value === filters.fechaOpcion)?.label || 'Fecha'}
              <ChevronsUpDown className="h-3.5 w-3.5 text-white/40" />
            </button>
            {showFecha && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 z-50">
                {renderFechaControl()}
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={mobileFiltersRef}>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden px-4 py-2 rounded-lg border border-[#444] text-white text-sm font-medium hover:bg-white/10 flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
          {showMobileFilters && (
            <div className="absolute right-0 top-full mt-2 w-[min(92vw,380px)] bg-[#1a1a1a] border border-white/10 rounded-lg p-4 space-y-4 z-50">
              <div>
                <p className="text-xs text-white/50 mb-2 font-medium">Distancia</p>
                {renderDistanciaControl()}
              </div>
              <div>
                <p className="text-xs text-white/50 mb-2 font-medium">Precio</p>
                {renderPrecioControl()}
              </div>
              <div>
                <p className="text-xs text-white/50 mb-2 font-medium">Fecha</p>
                {renderFechaControl()}
              </div>
              {mostrarLimpiar && onLimpiar && (
                <button
                  onClick={() => { onLimpiar(); setShowMobileFilters(false); }}
                  className="w-full text-center text-sm text-white/60 underline underline-offset-4 hover:text-white"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoriaChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                cat === categoriaActiva
                  ? 'bg-[#F5F5F5] text-black'
                  : 'bg-[#222] text-white hover:bg-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {mostrarLimpiar && onLimpiar && !showMobileFilters && (
          <div className="flex justify-end mt-2">
            <button
              onClick={onLimpiar}
              className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function getDateRange(option: string, customDate?: string): { fechaDesde?: string; fechaHasta?: string } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  switch (option) {
    case 'hoy':
      return { fechaDesde: startOfDay.toISOString(), fechaHasta: endOfDay.toISOString() };
    case 'semana':
      return { fechaDesde: startOfDay.toISOString(), fechaHasta: endOfWeek.toISOString() };
    case 'fecha':
      if (customDate) {
        const d = new Date(customDate);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
        return { fechaDesde: start.toISOString(), fechaHasta: end.toISOString() };
      }
      return {};
    default:
      return {};
  }
}
