'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';

const mockCategorias = [
  { id: '1', nombre: 'Música en Vivo', descripcion: 'Conciertos, bandas independientes y acústicos', color: '#E63946', tipo: 'evento' },
  { id: '2', nombre: 'Bar & Discoteca', descripcion: 'Bares, pub crawls y fiesta nocturna', color: '#F4A261', tipo: 'establecimiento' },
  { id: '3', nombre: 'Arte & Cultura', descripcion: 'Exposiciones, teatro y cultura urbana', color: '#2A9D8F', tipo: 'evento' },
  { id: '4', nombre: 'Gastronomía & Cafés', descripcion: 'Cafeterías culturales y ferias gastronómicas', color: '#E76F51', tipo: 'establecimiento' },
  { id: '5', nombre: 'Deportes & Aventura', descripcion: 'Eventos deportivos y actividades al aire libre', color: '#264653', tipo: 'evento' },
  { id: '6', nombre: 'Tecnología & Gaming', descripcion: 'Hackathons, torneos gaming y charlas tech', color: '#457B9D', tipo: 'evento' },
];

export default function AdminCategoriasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra las categorías de eventos y establecimientos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> Nueva categoría
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCategorias.map((cat) => (
          <Card key={cat.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <CardTitle className="text-base">{cat.nombre}</CardTitle>
                  <Badge variant="default">{cat.tipo}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-3">{cat.descripcion}</p>
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4 mr-1" /> Editar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
