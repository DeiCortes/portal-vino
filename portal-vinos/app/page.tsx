'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Wine } from '@/types/wine';
import WineCard from '@/components/WineCard';
import WorldWineMap from '@/components/WorldWineMap';
import { Search, MapPin, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function CatalogPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyStock, setOnlyStock] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [search, setSearch] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(true);

  const fetchWines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error cargando vinos:', error.message);
    } else if (data) {
      const mappedWines: Wine[] = data.map((item) => ({
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
      }));
      setWines(mappedWines);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWines();
  }, []);

  const handleToggleStock = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setWines((prev) =>
      prev.map((w) => (w.id === id ? { ...w, inStock: newStatus } : w))
    );

    const { error } = await supabase
      .from('wines')
      .update({ in_stock: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar stock:', error.message);
      fetchWines();
    }
  };

  // Regiones vinícolas disponibles (filtradas por país si hay uno seleccionado)
  const regions = useMemo(() => {
    const filteredByCountry = selectedCountry 
      ? wines.filter(w => w.country === selectedCountry)
      : wines;

    const list = Array.from(new Set(filteredByCountry.map((w) => w.region)));
    return ['todas', ...list];
  }, [wines, selectedCountry]);

  // Filtrado general
  const filtered = useMemo(() => {
    return wines.filter((w) => {
      if (onlyStock && !w.inStock) return false;
      if (selectedCountry && w.country !== selectedCountry) return false;
      if (selectedRegion !== 'todas' && w.region !== selectedRegion) return false;
      
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.winery.toLowerCase().includes(q) ||
        w.region.toLowerCase().includes(q)
      );
    });
  }, [wines, onlyStock, selectedCountry, selectedRegion, search]);

  return (
    <main className="min-h-screen bg-[#0b090a] text-zinc-100 p-6 sm:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-white">WineAdvisor · Catálogo & Terroirs</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Explora vinos por geografía mundial, calificaciones y disponibilidad en sala.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </button>

            <button
              onClick={fetchWines}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-all"
              title="Refrescar catálogo"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Switch de Stock */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4">
              <span className="text-xs font-semibold text-zinc-300">Solo en Stock</span>
              <button
                onClick={() => setOnlyStock(!onlyStock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  onlyStock ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    onlyStock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mapa Mundial Interactivo */}
        {showMap && (
          <WorldWineMap
            wines={wines}
            selectedCountry={selectedCountry}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              setSelectedRegion('todas'); // Reiniciar filtro de región al cambiar país
            }}
          />
        )}

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por vino, bodega o valle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-72">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#16161a] pl-10 pr-8 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="todas">
                {selectedCountry ? `Todas las regiones de ${selectedCountry}` : 'Todas las Regiones'}
              </option>
              {regions.filter((r) => r !== 'todas').map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Vinos */}
        {loading ? (
          <div className="py-24 text-center text-zinc-400 flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
            <p className="text-sm">Cargando etiquetas desde la cava...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
            {filtered.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                showAdminStockToggle={true}
                onToggleStock={handleToggleStock}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-500 text-sm">
            No se encontraron etiquetas para {selectedCountry || 'el filtro seleccionado'}.
          </div>
        )}
      </div>
    </main>
  );
}