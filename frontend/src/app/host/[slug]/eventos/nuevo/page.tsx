'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventoForm } from '@/components/eventos/evento-form';
import type { Category, ScrapedEvento } from '@/types';
import { CalendarClock, ChevronLeft, FileText, Link2, Loader2, ArrowLeft } from 'lucide-react';

function Loader({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      {mensaje && <p className="text-sm text-white/60">{mensaje}</p>}
    </div>
  );
}

function NuevoContenido() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();

  const modo = searchParams.get('modo');
  const url = searchParams.get('url');

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [scrapeResultado, setScrapeResultado] = useState<ScrapedEvento | null>(
    null,
  );
  const [scrapeError, setScrapeError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    api
      .get<Category[]>('/categorias')
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

  const scrapeando =
    modo === 'url' && url && !scrapeResultado && !scrapeError;

  const isOwner = user?.rol === 'organizador' && user?.slug === slug;

  function handleImportar() {
    if (!urlInput.trim()) {
      setUrlError('Ingresa una URL');
      return;
    }
    try {
      new URL(urlInput);
      setUrlError('');
      router.replace(
        `/host/${slug}/eventos/nuevo?modo=url&url=${encodeURIComponent(
          urlInput.trim(),
        )}`,
      );
    } catch {
      setUrlError('Ingresa una URL válida');
    }
  }

  if (authLoading) return <Loader />;

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-white/70">
          Solo el organizador puede crear eventos.
        </p>
      </div>
    );
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
            onClick={() => router.replace(`/host/${slug}/eventos/nuevo`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="rounded-md bg-red-950/60 border border-red-800 p-4 text-sm text-red-300">
            No se pudieron importar los datos: {scrapeError}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.replace(`/host/${slug}/eventos/nuevo`)}>
              Reintentar
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.replace(`/host/${slug}/eventos/nuevo?modo=formulario`)
              }
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
      <div className="w-full">
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <button
            onClick={() => router.push(`/host/${slug}`)}
            className="mb-6 flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Eventos</span>
            <span className="text-white/30">/</span>
            <span className="text-white">Crear evento</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222]">
              <CalendarClock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#F5F5F5]">Crear evento</h1>
              <p className="text-sm text-white/50">
                Campos obligatorios <span className="text-[#D94242]">*</span>
              </p>
            </div>
          </div>
        </div>
        <EventoForm
          slug={slug}
          mode="crear"
          categorias={categorias}
          scraped={scrapeResultado}
          urlImportada={url}
        />
      </div>
    );
  }

  if (modo === 'formulario') {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <button
            onClick={() => router.push(`/host/${slug}`)}
            className="mb-6 flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Eventos</span>
            <span className="text-white/30">/</span>
            <span className="text-white">Crear evento</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222]">
              <CalendarClock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#F5F5F5]">Crear evento</h1>
              <p className="text-sm text-white/50">
                Campos obligatorios <span className="text-[#D94242]">*</span>
              </p>
            </div>
          </div>
        </div>
        <EventoForm slug={slug} mode="crear" categorias={categorias} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-white">
        Crear evento
      </h1>
      <p className="mt-2 text-center text-white/60">
        Elige cómo quieres empezar
      </p>

      <div className="mt-8 space-y-6">
        {/* Opción A: Publicar desde URL */}
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

        {/* Opción B: Crear con formulario */}
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
            onClick={() =>
              router.push(`/host/${slug}/eventos/nuevo?modo=formulario`)
            }
          >
            Crear evento
          </Button>
        </div>

        {categorias.length === 0 && (
          <p className="flex items-center justify-center gap-2 text-sm text-white/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando categorías...
          </p>
        )}
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