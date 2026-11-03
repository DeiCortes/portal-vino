export interface Wine {
  id: string;
  slug: string;
  name: string;
  winery: string;
  vintage: number;
  type: 'tinto' | 'blanco' | 'rosado' | 'espumoso' | 'postre';
  country: string;
  region: string;
  subregion?: string;
  image: string;
  
  // Calificación WineAdvisor
  rating: number;          // ej. 4.4
  ratingsCount: number;    // ej. 850
  communityBadge?: string; // ej. "Top 5% Valle de Guadalupe"
  
  // Perfil sensorial (0 - 100%)
  flavorProfile: {
    body: number;
    tannins: number;
    acidity: number;
    sweetness: number;
  };
  
  // Stock y precios
  inStock: boolean;
  stockBottles?: number;
  priceMenu: number;
  
  tastingNotes: string[];
  pairings: string[];
}