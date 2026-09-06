'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventoForm } from '@/components/eventos/evento-form';
import type { Categoria, ScrapedEvento } from '@/types';
import { ArrowLeft, Link2, FileText } from 'lucide-react';

function Loader({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      {mensaje && <p className="text-sm text-white/60">{mensaje}</p>}
    </div>
  );
}

function NuevoContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modo = searchParams.get('modo');
  const url = searchParams.get('url');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [scrapeResultado, setScrapeResultado] = useState<ScrapedEvento | null>(
    null,
  );
  const [scrapeError, setScrapeError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    api
      .get<Categoria[]>('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (modo !== 'url' || !url || scrapeResultado) return;
    let active = true;
    api
      .post<ScrapedEvento>('/eventos/from-url', { url })
      .then((data) => {
        if (active) setScrapeResultado(data);
      })
      .catch((err) => {
        if (active) setScrapeError((err as Error).message);
      });
    return () => {
      active = false;
    };
  }, [modo, url, scrapeResultado]);

  const scrapeando = modo === 'url' && url && !scrapeResultado && !scrapeError;

  function handleImportar() {
    if (!urlInput.trim()) {
      setUrlError('Ingresa una URL');
      return;
    }
    try {
      new URL(urlInput);
      setUrlError('');
      router.replace(
        `/eventos/nuevo?modo=url&url=${encodeURIComponent(urlInput.trim())}`,
      );
    } catch {
      setUrlError('Ingresa una URL válida');
    }
  }

  if (scrapeando) return <Loader mensaje="Importando datos del enlace..." />;

  if (scrapeError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60"
            onClick={() => router.replace('/eventos/nuevo')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="rounded-md border border-red-800 bg-red-950/60 p-4 text-sm text-red-300">
            No se pudieron importar los datos: {scrapeError}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.replace('/eventos/nuevo')}>
              Reintentar
            </Button>
            <Button
              variant="outline"
              onClick={() => router.replace('/eventos/nuevo?modo=formulario')}
            >
              Crear manualmente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (modo === 'url' && url && scrapeResultado) {
    return (
      <EventoForm
        mode="crear"
        categorias={categorias}
        scraped={scrapeResultado}
        urlImportada={url}
      />
    );
  }

  if (modo === 'formulario') {
    return <EventoForm mode="crear" categorias={categorias} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-white">Crear evento</h1>
      <p className="mt-2 text-center text-white/60">
        Elige cómo quieres empezar
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-white/10 bg-black/40 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <Link2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Publicar desde URL
              </h2>
              <p className="text-sm text-white/50">
                Importa datos desde Instagram, Facebook, TikTok u otro enlace
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              id="url-event"
              placeholder="https://instagram.com/p/..."
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError('');
              }}
              error={urlError}
              className="flex-1"
            />
            <Button onClick={handleImportar}>Importar</Button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Crear con formulario
              </h2>
              <p className="text-sm text-white/50">
                Completa todos los detalles del evento manualmente
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => router.push('/eventos/nuevo?modo=formulario')}
          >
            Crear evento
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NuevoEventoPage() {
  return (
    <Suspense fallback={<Loader />}>
      <NuevoContenido />
    </Suspense>
  );
}