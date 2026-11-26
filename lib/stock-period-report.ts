import type { StockItem, StockMovement } from './stock';
import { PRODUCTION_PORTION_ADJUSTMENT_FROM, getProductionPortionCount } from './data';

export type StockPeriodType = 'WEEK_OUT' | 'MONTH_OUT' | 'WEEK_IN' | 'MONTH_IN';
export type StockPeriodDirection = 'IN' | 'OUT';
export interface StockPeriodRange { start: string; end: string }
export interface DailyStockRow {
  category: string;
  name: string;
  qty: number;
  uom: string;
  location: string;
  batch: string;
}
export interface DailyStockTotal { uom: string; qty: number }
export interface DailyStockReport {
  date: string;
  portions: number;
  number: string;
  rows: DailyStockRow[];
  totals: DailyStockTotal[];
  context: string[];
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() + 1 === Number(month) && date.getUTCDate() === Number(day)
    ? date
    : null;
}
function toIso(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function getStockPeriodRange(type: StockPeriodType, selectedDate: string): StockPeriodRange | null {
  const selected = parseIsoDate(selectedDate);
  if (!selected) return null;
  if (type === 'MONTH_OUT' || type === 'MONTH_IN') {
    const start = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1));
    const end = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 1, 0));
    return { start: toIso(start), end: toIso(end) };
  }
  return {
    start: toIso(selected),
    end: toIso(new Date(selected.getTime() + 6 * 24 * 60 * 60 * 1000)),
  };
}

function portionAwareNote(note: string, date: string): string {
  return date >= PRODUCTION_PORTION_ADJUSTMENT_FROM
    ? note.replace(/1\.553\s+Porsi/g, '1.541 Porsi')
    : note;
}

export function buildDailyStockReports(
  items: readonly StockItem[],
  movements: readonly StockMovement[],
  range: StockPeriodRange,
  direction: StockPeriodDirection = 'OUT',
): DailyStockReport[] {
  const stockById = new Map(items.map((item) => [item.id, item]));
  const byDate = new Map<string, { rows: Map<string, DailyStockRow>; context: Set<string> }>();
  const representedItems = new Set<string>();
  for (const movement of movements) {
    if (movement.type !== direction || movement.date < range.start || movement.date > range.end || movement.qty <= 0) continue;
    const stockItem = stockById.get(movement.itemId);
    if (!stockItem) continue;
    representedItems.add(movement.itemId);
    const day = byDate.get(movement.date) ?? { rows: new Map<string, DailyStockRow>(), context: new Set<string>() };
    const old = day.rows.get(movement.itemId);
    day.rows.set(movement.itemId, {
      category: stockItem.category,
      name: stockItem.name,
      qty: Number(((old?.qty ?? 0) + movement.qty).toFixed(2)),
      uom: movement.uom || stockItem.uom,
      location: stockItem.storageLocation,
      batch: stockItem.batch,
    });
    if (movement.notes?.trim()) day.context.add(portionAwareNote(movement.notes.trim(), movement.date));
    if (movement.reference?.trim()) day.context.add(`Referensi: ${movement.reference.trim()}`);
    byDate.set(movement.date, day);
  }
  for (const item of items) {
    if (direction === 'OUT') {
      if (representedItems.has(item.id) || item.usedStock <= 0 || item.lastUsageDate < range.start || item.lastUsageDate > range.end) continue;
      const day = byDate.get(item.lastUsageDate) ?? { rows: new Map<string, DailyStockRow>(), context: new Set<string>() };
      day.rows.set(item.id, {
        category: item.category,
        name: item.name,
        qty: Number(item.usedStock.toFixed(2)),
        uom: item.uom,
        location: item.storageLocation,
        batch: item.batch,
      });
      if (item.notes?.trim()) day.context.add(portionAwareNote(item.notes.trim(), item.lastUsageDate));
      byDate.set(item.lastUsageDate, day);
    } else {
      if (representedItems.has(item.id) || item.initialStock <= 0 || item.lastRestockDate < range.start || item.lastRestockDate > range.end) continue;
      const day = byDate.get(item.lastRestockDate) ?? { rows: new Map<string, DailyStockRow>(), context: new Set<string>() };
      day.rows.set(item.id, {
        category: item.category,
        name: item.name,
        qty: Number(item.initialStock.toFixed(2)),
        uom: item.uom,
        location: item.storageLocation,
        batch: item.batch,
      });
      if (item.notes?.trim()) day.context.add(portionAwareNote(item.notes.trim(), item.lastRestockDate));
      byDate.set(item.lastRestockDate, day);
    }
  }
  return [...byDate.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([date, day]) => {
    const rows = [...day.rows.values()].sort((a, b) => a.category.localeCompare(b.category, 'id') || a.name.localeCompare(b.name, 'id'));
    const totalsByUnit = new Map<string, number>();
    for (const row of rows) totalsByUnit.set(row.uom, Number(((totalsByUnit.get(row.uom) ?? 0) + row.qty).toFixed(2)));
    return {
      date,
      portions: getProductionPortionCount(date),
      number: `${direction === 'IN' ? 'BA-BM' : 'BA-BOM'}/SPPG-SMG3/BGN/${date.slice(0, 4)}/${date.replaceAll('-', '')}`,
      rows,
      totals: [...totalsByUnit.entries()].sort(([left], [right]) => left.localeCompare(right, 'id')).map(([uom, qty]) => ({ uom, qty })),
      context: [...day.context],
    };
  });
}
