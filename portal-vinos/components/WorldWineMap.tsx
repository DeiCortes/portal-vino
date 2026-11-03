'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Wine } from '@/types/wine';
import { Globe, X, Sparkles, Plus, Minus, RotateCcw } from 'lucide-react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Coordenadas calibradas con leve compensación visual para evitar colisiones
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  'México': [-102.55, 23.63],
  'Estados Unidos': [-98.57, 39.82],
  'España': [-4.2, 40.0],
  'Francia': [2.2, 46.8],
  'Italia': [12.8, 42.5],
  'Argentina': [-64.0, -35.0],
  'Chile': [-71.5, -34.0],
  'Grecia': [22.8, 39.0],
  'Nueva Zelanda': [174.8, -41.0],
};

const ISO_NUMERIC_MAP: Record<string, string> = {
  '484': 'México',
  '840': 'Estados Unidos',
  '724': 'España',
  '250': 'Francia',
  '380': 'Italia',
  '032': 'Argentina',
  '32': 'Argentina',
  '152': 'Chile',
  '300': 'Grecia',
  '554': 'Nueva Zelanda',
};

const COUNTRY_FLAGS: Record<string, string> = {
  'México': '🇲🇽',
  'Estados Unidos': '🇺🇸',
  'España': '🇪🇸',
  'Francia': '🇫🇷',
  'Italia': '🇮🇹',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Grecia': '🇬🇷',
  'Nueva Zelanda': '🇳🇿',
};

interface Props {
  wines: Wine[];
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}

export default function WorldWineMap({ wines, selectedCountry, onSelectCountry }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [10, 15],
    zoom: 1,
  });

  const wineCountByCountry = wines.reduce<Record<string, number>>((acc, wine) => {
    acc[wine.country] = (acc[wine.country] || 0) + 1;
    return acc;
  }, {});

  const activeCountries = Object.keys(wineCountByCountry).sort(
    (a, b) => wineCountByCountry[b] - wineCountByCountry[a]
  );

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((prev) => ({ ...prev, zoom: prev.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((prev) => ({ ...prev, zoom: prev.zoom / 1.5 }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [10, 15], zoom: 1 });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#15171e] p-6 shadow-2xl">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-amber-400" />
          <h2 className="font-serif text-lg font-bold text-white tracking-wide">Mapa de Terroirs & Origen</h2>
        </div>

        {selectedCountry ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/60 bg-amber-500/20 px-4 py-1 text-xs font-bold text-amber-300 shadow-md">
            <span>{COUNTRY_FLAGS[selectedCountry] || '📍'} {selectedCountry} ({wineCountByCountry[selectedCountry] || 0} vinos)</span>
            <button
              onClick={() => onSelectCountry(null)}
              className="hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
              title="Quitar filtro"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Usa el zoom o toca un país iluminado para filtrar
          </span>
        )}
      </div>

      {/* Indicador de cursor */}
      <div className="h-6 text-xs font-mono text-amber-300 font-semibold mb-2">
        {hoveredCountry ? (
          <span>✦ {hoveredCountry}</span>
        ) : (
          <span className="text-zinc-400">Pasa el cursor sobre los continentes o marcadores</span>
        )}
      </div>

      {/* Contenedor del Mapa con alto contraste */}
      <div className="relative w-full flex items-center justify-center bg-[#0a0f1d] rounded-2xl border border-white/15 p-2 overflow-hidden shadow-inner">
        
        {/* Controles flotantes de Zoom */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-[#15171e]/90 p-1.5 rounded-xl border border-white/15 backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Acercar mapa"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Alejar mapa"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border-t border-white/10"
            title="Restablecer vista"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <ComposableMap
          projectionConfig={{ scale: 145 }}
          className="w-full h-auto max-h-[440px]"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(pos) => {
              if (pos) {
                setPosition((prev) => ({
                  coordinates: pos.coordinates || prev.coordinates,
                  zoom: typeof pos.zoom === 'number' ? pos.zoom : prev.zoom,
                }));
              }
            }}
          >
            {/* Geografías con contraste claro y definido */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoId = String(geo.id);
                  const dbCountry = ISO_NUMERIC_MAP[geoId] || geo.properties?.name;
                  const isSelected = selectedCountry === dbCountry;
                  const hasWine = !!wineCountByCountry[dbCountry];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (hasWine) {
                          onSelectCountry(isSelected ? null : dbCountry);
                        }
                      }}
                      style={
                        {
                          default: {
                            fill: isSelected
                              ? '#f59e0b'
                              : hasWine
                              ? '#b45309'
                              : '#3b4252',
                            stroke: isSelected ? '#ffffff' : hasWine ? '#fbbf24' : '#4c566a',
                            strokeWidth: hasWine ? 1.2 : 0.6,
                            outline: 'none',
                            cursor: hasWine ? 'pointer' : 'default',
                            transition: 'all 200ms ease',
                          },
                          hover: {
                            fill: hasWine ? '#d97706' : '#434c5e',
                            stroke: '#ffffff',
                            strokeWidth: 1.4,
                            outline: 'none',
                          },
                          pressed: {
                            fill: '#92400e',
                            outline: 'none',
                          },
                        } as any
                      }
                    />
                  );
                })
              }
            </Geographies>

            {/* Marcadores Luminosos */}
            {activeCountries.map((countryName) => {
              const coords = COUNTRY_COORDINATES[countryName];
              if (!coords) return null;

              const count = wineCountByCountry[countryName] || 0;
              const isSelected = selectedCountry === countryName;

              return (
                <Marker
                  key={countryName}
                  coordinates={coords}
                  onClick={() => onSelectCountry(isSelected ? null : countryName)}
                  onMouseEnter={() => setHoveredCountry(`${countryName}: ${count} etiquetas en cava`)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className="cursor-pointer"
                >
                  <circle
                    r={isSelected ? 18 : 12}
                    fill={isSelected ? '#f59e0b' : '#fbbf24'}
                    opacity={isSelected ? 0.6 : 0.35}
                    className="pointer-events-none"
                  />
                  <circle
                    r={isSelected ? 8 : 6.5}
                    fill={isSelected ? '#fbbf24' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="transition-colors duration-150 hover:fill-amber-300"
                  />
                  <text
                    textAnchor="middle"
                    y={isSelected ? -13 : -10}
                    className="pointer-events-none select-none"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: isSelected ? '12px' : '10px',
                      fontWeight: '800',
                      fill: '#ffffff',
                      filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,1))',
                    }}
                  >
                    {count}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Botones inferiores con banderas */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
        <button
          onClick={() => onSelectCountry(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedCountry === null
              ? 'bg-amber-500 text-black shadow-md font-bold'
              : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          Todos ({wines.length})
        </button>

        {activeCountries.map((c) => {
          const isSelected = selectedCountry === c;
          const count = wineCountByCountry[c];
          return (
            <button
              key={c}
              onClick={() => onSelectCountry(isSelected ? null : c)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg'
                  : 'bg-white/5 border-amber-500/20 text-zinc-200 hover:border-amber-500/50 hover:bg-white/10'
              }`}
            >
              <span>{COUNTRY_FLAGS[c] || '🍷'}</span>
              <span>{c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-amber-300 font-mono'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}