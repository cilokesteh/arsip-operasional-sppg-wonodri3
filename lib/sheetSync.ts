import { formatGoogleDriveImageUrl } from './drive';
import { DailyMenuRecord, NutritionItem, STANDARD_AKG_REFERENCE } from './data';

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r\n|\n/);
  return lines.map((line) => {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row.map((val) => val.replace(/^"|"$/g, '').trim());
  });
}

export async function fetchGoogleSheetData(sheetUrl: string): Promise<{
  success: boolean;
  menus: DailyMenuRecord[];
  error?: string;
}> {
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) {
    return { success: false, menus: [], error: 'Format link Google Spreadsheet tidak valid.' };
  }
  const sheetId = match[1];

  try {
    // 1. Tarik Tab 1: Menu Harian
    const menuCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Menu%20Harian`;
    const resMenu = await fetch(menuCsvUrl);
    if (!resMenu.ok) {
      throw new Error('Gagal mengakses Tab 1 (Menu Harian). Pastikan akses spreadsheet sudah disetel ke "Anyone with the link (Viewer)".');
    }
    const textMenu = await resMenu.text();
    const rowsMenu = parseCSV(textMenu);

    if (rowsMenu.length < 2) {
      return { success: false, menus: [], error: 'Tab Menu Harian belum memiliki data baris.' };
    }

    const headersMenu = rowsMenu[0].map((h) => h.toLowerCase());
    const getIndex = (possibleNames: string[]) => {
      return headersMenu.findIndex((h) => possibleNames.some((p) => h.includes(p)));
    };

    const idxTanggal = getIndex(['tanggal']);
    const idxNama = getIndex(['nama menu', 'nama_menu', 'judul']);
    const idxKarbo = getIndex(['karbohidrat', 'karbo']);
    const idxHewani = getIndex(['lauk hewani', 'hewani']);
    const idxNabati = getIndex(['lauk nabati', 'nabati']);
    const idxSayur = getIndex(['sayur']);
    const idxBuah = getIndex(['buah']);
    const idxFotoPrep = getIndex(['persiapan']);
    const idxFotoCook = getIndex(['pengolahan', 'masak']);
    const idxFotoPack = getIndex(['pengemasan', 'packing']);

    // 2. Tarik Tab 2: AKG
    const akgMapByDate: Record<string, NutritionItem[]> = {};
    try {
      const akgCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=AKG`;
      const resAkg = await fetch(akgCsvUrl);
      if (resAkg.ok) {
        const textAkg = await resAkg.text();
        const rowsAkg = parseCSV(textAkg);
        if (rowsAkg.length > 1) {
          const hAkg = rowsAkg[0].map((h) => h.toLowerCase());
          const getAkgIdx = (names: string[]) => hAkg.findIndex((h) => names.some((n) => h.includes(n)));

          const iTgl = getAkgIdx(['tanggal']);
          const iKel = getAkgIdx(['kelompok']);
          const iTar = getAkgIdx(['target']);
          const iKal = getAkgIdx(['energi', 'kkal']);
          const iPro = getAkgIdx(['protein']);
          const iFat = getAkgIdx(['lemak']);
          const iCarb = getAkgIdx(['karbo']);
          const iFib = getAkgIdx(['serat']);

          for (let r = 1; r < rowsAkg.length; r++) {
            const row = rowsAkg[r];
            const tgl = row[iTgl] || '';
            const kel = row[iKel] || '';
            if (!tgl || !kel) continue;

            const existingRef = STANDARD_AKG_REFERENCE.find((ref) => ref.groupName.toLowerCase() === kel.toLowerCase());

            const item: NutritionItem = {
              groupName: kel,
              targetCategory: row[iTar] || existingRef?.targetCategory || kel,
              portionBadge: existingRef?.portionBadge || 'Porsi Terstandar',
              energyKcal: parseFloat(row[iKal]) || existingRef?.energyKcal || 500,
              proteinG: parseFloat(row[iPro]) || existingRef?.proteinG || 15,
              fatG: parseFloat(row[iFat]) || existingRef?.fatG || 14,
              carbsG: parseFloat(row[iCarb]) || existingRef?.carbsG || 80,
              fiberG: parseFloat(row[iFib]) || existingRef?.fiberG || 2.4,
              color: existingRef?.color || '#2563eb',
              bgLight: existingRef?.bgLight || '#eff6ff',
              borderAccent: existingRef?.borderAccent || '#3b82f6',
              recommendedPct: existingRef?.recommendedPct || { protein: 25, fat: 23, carbs: 65, fiber: 20 },
            };

            if (!akgMapByDate[tgl]) {
              akgMapByDate[tgl] = [];
            }
            akgMapByDate[tgl].push(item);
          }
        }
      }
    } catch {
      // Fallback
    }

    // 3. Gabungkan Data Menu
    const menus: DailyMenuRecord[] = [];
    for (let r = 1; r < rowsMenu.length; r++) {
      const row = rowsMenu[r];
      const tanggal = row[idxTanggal];
      const nama = row[idxNama];
      if (!tanggal || !nama) continue;

      const rawPrep = idxFotoPrep !== -1 ? row[idxFotoPrep] : '';
      const rawCook = idxFotoCook !== -1 ? row[idxFotoCook] : '';
      const rawPack = idxFotoPack !== -1 ? row[idxFotoPack] : '';

      const photos = [
        {
          step: 'Persiapan',
          title: 'Sortasi Bahan Baku Higienis',
          description: 'Pembersihan sayuran dan penyiapan bahan baku dengan higienitas teruji.',
          imageUrl: formatGoogleDriveImageUrl(rawPrep) || '/about-kitchen.jpg',
          timeEstimate: '04:00 - 05:30 WIB',
        },
        {
          step: 'Pengolahan',
          title: 'Pemasakan Suhu Terukur (>85°C)',
          description: 'Pengolahan lauk dan sayur menggunakan kuali stainless steel berstandar BGN.',
          imageUrl: formatGoogleDriveImageUrl(rawCook) || '/hero-kitchen.jpg',
          timeEstimate: '05:30 - 07:15 WIB',
        },
        {
          step: 'Pengemasan',
          title: 'Food Plating & Segel Thermal Box',
          description: 'Pengecekan porsi gramasi dan segel kotak makanan hangat siap kirim.',
          imageUrl: formatGoogleDriveImageUrl(rawPack) || '/gallery-1.jpg',
          timeEstimate: '07:15 - 08:30 WIB',
        },
      ];

      menus.push({
        date: tanggal,
        menuNumber: r,
        title: nama,
        status: 'published',
        publishedAt: `${tanggal} • 08:30 WIB`,
        components: {
          karbohidrat: row[idxKarbo] || 'Nasi Putih Pulen',
          laukHewani: row[idxHewani] || 'Lauk Hewani Segar',
          laukNabati: row[idxNabati] || 'Lauk Nabati Tradisional',
          sayur: row[idxSayur] || 'Sayur Segar Kaya Serat',
          buah: row[idxBuah] || 'Buah Pilihan Segar',
        },
        nutritionCards: akgMapByDate[tanggal] && akgMapByDate[tanggal].length > 0 ? akgMapByDate[tanggal] : STANDARD_AKG_REFERENCE,
        photos,
        overrides: [],
      });
    }

    return {
      success: true,
      menus,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menarik data dari Google Sheets.';
    return {
      success: false,
      menus: [],
      error: errorMsg,
    };
  }
}
