'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, Check, X, Eye } from 'lucide-react';

const mockEstablecimientos = [
  { id: '1', nombreComercial: 'La Ronda Cultural', organizacion: 'Cultura Viva', tipo: 'Bar & Discoteca', capacidad: 150, estado: 'aprobado' },
  { id: '2', nombreComercial: 'Café del Arte', organizacion: 'Producciones Épicas', tipo: 'Gastronomía & Cafés', capacidad: 60, estado: 'aprobado' },
  { id: '3', nombreComercial: 'Teatro Independiente', organizacion: 'Arte Urbano EC', tipo: 'Arte & Cultura', capacidad: 200, estado: 'pendiente' },
  { id: '4', nombreComercial: 'Studio Jazz Club', organizacion: 'Sonidos del Mundo', tipo: 'Música en Vivo', capacidad: 100, estado: 'pendiente' },
  { id: '5', nombreComercial: 'El Mirador Lounge', organizacion: 'Noche Quiteña', tipo: 'Bar & Discoteca', capacidad: 80, estado: 'rechazado' },
  { id: '6', nombreComercial: 'Galería Zero', organizacion: 'Arte Urbano EC', tipo: 'Arte & Cultura', capacidad: 120, estado: 'aprobado' },
];

const estadoVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

export default function AdminEstablecimientosPage() {
  const [search, setSearch] = useState('');

  const filtered = mockEstablecimientos.filter((e) =>
    e.nombreComercial.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Establecimientos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Revisa y administra los establecimientos registrados
        </p>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar establecimientos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} establecimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Organización</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Capacidad</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-900">{e.nombreComercial}</td>
                    <td className="py-3 px-4 text-slate-500">{e.organizacion}</td>
                    <td className="py-3 px-4 text-slate-500">{e.tipo}</td>
                    <td className="py-3 px-4 text-slate-500">{e.capacidad} pers.</td>
                    <td className="py-3 px-4">
                      <Badge variant={estadoVariant[e.estado]}>{e.estado}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                        {e.estado === 'pendiente' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600"><Check className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-600"><X className="h-4 w-4" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
