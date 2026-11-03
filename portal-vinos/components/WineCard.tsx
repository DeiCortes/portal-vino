'use client';

import Link from 'next/link';
import { Wine } from '@/types/wine';
import { Star, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  wine: Wine;
  onToggleStock?: (id: string, current: boolean) => void;
  showAdminStockToggle?: boolean;
}

export default function WineCard({ wine, onToggleStock, showAdminStockToggle }: Props) {
  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
      wine.inStock 
        ? 'border-white/10 bg-[#16161a] hover:border-amber-500/40 shadow-lg' 
        : 'border-red-900/20 bg-[#121214]/60 opacity-60'
    }`}>
      <div>
        {/* Cabecera: Badge de Stock y Calificación Vivino */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {wine.inStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> En Cava
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/20">
                <AlertCircle className="h-3 w-3" /> Agotado
              </span>
            )}
            <span className="text-[11px] text-zinc-400 font-mono">${wine.priceMenu} MXN</span>
          </div>

          {/* Bloque Calificación estilo Vivino / WineAdvisor */}
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-right">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <div>
              <div className="text-sm font-black text-amber-300 leading-none">{wine.rating.toFixed(1)}</div>
              <div className="text-[9px] text-zinc-400 font-sans">{wine.ratingsCount} ops</div>
            </div>
          </div>
        </div>

        {/* Imagen de Botella */}
        <div className="relative my-4 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-white/5 to-transparent">
          <img
            src={wine.image}
            alt={wine.name}
            className="h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* Datos y Región */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">{wine.winery}</p>
          <h3 className="font-serif text-lg font-bold text-white leading-tight">{wine.name}</h3>
          <p className="flex items-center gap-1 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
            {wine.region}, {wine.country}
          </p>
          {wine.communityBadge && (
            <p className="text-[11px] text-zinc-400 italic font-sans text-amber-200/80">
              ★ {wine.communityBadge}
            </p>
          )}
        </div>

        {/* Barras de Sabor Continuas (WineAdvisor) */}
        <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[11px]">
          <div>
            <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
              <span>Ligero</span>
              <span className="text-zinc-200 font-semibold">Cuerpo</span>
              <span>Robusto</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.body}%` }} />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
              <span>Seco</span>
              <span className="text-zinc-200 font-semibold">Dulzor</span>
              <span>Dulce</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wine.flavorProfile.sweetness}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-2">
        <Link
          href={`/vinos/${wine.slug}`}
          className="flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-white/5 text-zinc-200 hover:bg-amber-500 hover:text-black transition-all"
        >
          Ficha & Reseñas
        </Link>

        {showAdminStockToggle && onToggleStock && (
          <button
            onClick={() => onToggleStock(wine.id, wine.inStock)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              wine.inStock 
                ? 'border-red-500/40 text-red-300 hover:bg-red-500/20' 
                : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {wine.inStock ? 'Agotar' : 'Reactivar'}
          </button>
        )}
      </div>
    </div>
  );
}