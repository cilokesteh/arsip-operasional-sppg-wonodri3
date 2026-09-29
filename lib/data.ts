export interface BeneficiarySite {
  id: string;
  name: string;
  type: 'TK' | 'SD' | 'Posyandu';
  masterCount: number;
}

export interface NutritionItem {
  groupName: string;
  targetCategory: string;
  portionBadge?: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
}

export interface ProcessPhoto {
  step: 'persiapan' | 'pengolahan' | 'pengemasan';
  title: string;
  description: string;
  imageUrl: string;
  timeEstimate?: string;
}

export interface DailyMenuRecord {
  date: string; // YYYY-MM-DD
  menuNumber: number;
  title: string;
  status: 'draft' | 'review' | 'published';
  publishedAt?: string;
  components: {
    karbohidrat: string;
    laukHewani: string;
    laukNabati: string;
    sayur: string;
    buah: string;
    pelengkap?: string;
  };
  nutritionCards: NutritionItem[];
  photos: ProcessPhoto[];
  overrides?: {
    siteId: string;
    condition: 'libur' | 'penyesuaian';
    effectiveCount: number;
    reason: string;
  }[];
}

// Data Master Resmi SPPG Wonodri 3 (Total: 1.555 Penerima Manfaat)
export const INITIAL_BENEFICIARIES: BeneficiarySite[] = [
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 342 },
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 349 },
  { id: 'sdn-lamper-lor', name: 'SDN Lamper Lor', type: 'SD', masterCount: 154 },
  { id: 'sdn-pleburan-b', name: 'SDN Pleburan B', type: 'SD', masterCount: 150 },
  { id: 'sdn-pleburan-a', name: 'SDN Pleburan A', type: 'SD', masterCount: 120 },
  { id: 'tk-it-sultan-agung', name: 'TK IT Sultan Agung', type: 'TK', masterCount: 100 },
  { id: 'sdn-wonodri', name: 'SDN Wonodri', type: 'SD', masterCount: 91 },
  { id: 'posyandu-erlangga', name: 'Posyandu Erlangga', type: 'Posyandu', masterCount: 74 },
  { id: 'tk-nirwana-burhan', name: 'TK Nirwana Burhan', type: 'TK', masterCount: 61 },
  { id: 'tk-kartika-iii', name: 'TK Kartika III', type: 'TK', masterCount: 43 },
  { id: 'tk-kuntum-mekar', name: 'TK Kuntum Mekar', type: 'TK', masterCount: 31 },
  { id: 'tk-siwi-peni', name: 'TK Siwi Peni', type: 'TK', masterCount: 29 },
  { id: 'tk-hapsari', name: 'TK Hapsari', type: 'TK', masterCount: 11 },
];

// Database menu operasional awal — dikosongkan untuk persiapan input rilis perdana 01 Oktober 2026
export const INITIAL_MENU_HISTORY: DailyMenuRecord[] = [];
