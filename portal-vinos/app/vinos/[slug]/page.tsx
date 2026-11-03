'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Wine } from '@/types/wine';
import { ArrowLeft, Star, MapPin, CheckCircle2, AlertCircle, Utensils, Award, RefreshCw } from 'lucide-react';

export default function WineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function loadWine() {
      setLoading(true);
      const { data: item, error } = await supabase
        .from('wines')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !item) {
        setNotFoundState(true);
      } else {
        setWine({
          id: item.id,
          slug: item.slug,
          name: item.name,
          winery: item.winery,
          vintage: item.vintage,
          type: item.type,
          country: item.country,
          region: item.region,
          subregion: item.subregion,
          image: item.image,
          rating: Number(item.rating),
          ratingsCount: item.ratings_count,
          communityBadge: item.community_badge,
          flavorProfile: {
            body: item.flavor_body,
            tannins: item.flavor_tannins,
            acidity: item.flavor_acidity,
            sweetness: item.flavor_sweetness,
          },
          inStock: item.in_stock,
          stockBottles: item.stock_bottles,
          priceMenu: Number(item.price_menu),
          tastingNotes: item.tasting_notes || [],
          pairings: item.pairings || [],
        });
      }
      setLoading(false);
    }

    loadWine();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b090a] text-zinc-100 flex items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-amber-400" />
      </div>
    );
  }

  if (notFoundState || !wine) {
    return (
      <div className="min-h-screen bg-[#0b090a] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-sm">Vino no encontrado en la cava.</p>
        <Link href="/" className="text-xs uppercase tracking-wider text-amber-400 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b090a] text-zinc-100 py-10 px-6 sm:px-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la Cava
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 rounded-3xl border border-white/10 bg-[#16161a] p-6 sm:p-10 shadow-2xl">
          {/* Columna Izquierda: Imagen y Estado */}
          <div className="md:col-span-5 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
            <div className="relative h-72 sm:h-96 w-full flex items-center justify-center p-4">
              <img
                src={wine.image}
                alt={wine.name}
                className="max-h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
              />
            </div>

            <div className="w-full mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
                <span className="text-xs text-zinc-400">Disponibilidad en sala</span>
                {wine.inStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> En Cava
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
                    <AlertCircle className="h-3.5 w-3.5" /> Agotado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
                <span className="text-xs text-zinc-400">Precio en Carta</span>
                <span className="text-sm font-bold text-amber-300 font-mono">${wine.priceMenu} MXN</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Ficha Sommelier y Calificaciones WineAdvisor */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">{wine.winery}</span>
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-amber-300">{wine.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-zinc-400">({wine.ratingsCount} ops)</span>
                </div>
              </div>
              <h1 className="font-serif text-3xl font-extrabold text-white mt-1">{wine.name}</h1>
              <p className="flex items-center gap-1 text-sm text-zinc-400 mt-1">
                <MapPin className="h-4 w-4 text-zinc-500" />
                {wine.region}, {wine.country} · Añada {wine.vintage}
              </p>
              {wine.communityBadge && (
                <p className="mt-2 text-xs italic text-amber-200/90 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  {wine.communityBadge}
                </p>
              )}
            </div>

            {/* Perfil de Sabor Estilo WineAdvisor */}
            <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Estructura en Boca</h4>
              
              <div>
                <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Ligero</span>
                  <span className="text-zinc-200 font-semibold">Cuerpo</span>
                  <span>Robusto</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.body}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Suave</span>
                  <span className="text-zinc-200 font-semibold">Taninos</span>
                  <span>Tánico</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.tannins}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Blando</span>
                  <span className="text-zinc-200 font-semibold">Acidez</span>
                  <span>Ácido</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.acidity}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                  <span>Seco</span>
                  <span className="text-zinc-200 font-semibold">Dulzor</span>
                  <span>Dulce</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.sweetness}%` }} />
                </div>
              </div>
            </div>

            {/* Descriptores de Sabor */}
            {wine.tastingNotes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Descriptores Más Mencionados</h4>
                <div className="flex flex-wrap gap-1.5">
                  {wine.tastingNotes.map((note, i) => (
                    <span key={i} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Maridajes Sugeridos */}
            {wine.pairings.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                  <Utensils className="h-3.5 w-3.5" />
                  Maridajes Ideales
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {wine.pairings.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2 border border-white/5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}