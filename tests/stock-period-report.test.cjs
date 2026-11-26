/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, file) => {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  });
  module._compile(outputText, file);
};

const { DEFAULT_STOCK_ITEMS_ALL: items, DEFAULT_STOCK_MOVEMENTS: movements } = require('../lib/stock.ts');
const report = () => require('../lib/stock-period-report.ts');

 test('WEEK_OUT uses cooking dates and includes the Monday issue received on Sunday', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const range = getStockPeriodRange('WEEK_OUT', '2026-11-16');
  assert.deepEqual(range, { start: '2026-11-16', end: '2026-11-22' });
  const days = buildDailyStockReports(items, movements, range);
  assert.deepEqual(days.map(({ date, rows, portions }) => [date, rows.length, portions]), [
    ['2026-11-16', 16, 1553], ['2026-11-17', 18, 1541], ['2026-11-18', 21, 1541],
    ['2026-11-19', 18, 1541], ['2026-11-20', 18, 1541],
  ]);
  assert.ok(days[1].context.some(note => note.includes('1.541 Porsi MBG')));
  assert.ok(days[1].context.every(note => !note.includes('1.553 Porsi MBG')));
  const last = days.at(-1);
  assert.match(last.number, /\/2026\/20261120$/);
  assert.ok(last.rows.some(row => /Maizena/i.test(row.name) && row.qty === 5 && row.uom === 'KG'));
  assert.equal(last.totals.find(total => total.uom === 'L').qty, 64);
  assert.equal(last.totals.find(total => total.uom === 'PAPAN').qty, 80);
  assert.ok(last.context.some(note => note.includes('INFERENSI')));
});

 test('MONTH_OUT covers the whole selected month and no empty dates', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const range = getStockPeriodRange('MONTH_OUT', '2026-11-20');
  assert.deepEqual(range, { start: '2026-11-01', end: '2026-11-30' });
  const days = buildDailyStockReports(items, movements, range);
  assert.equal(days.length, 20);
  assert.equal(days.reduce((count, day) => count + day.rows.length, 0), 380);
  const { getProductionPortionCount } = require('../lib/data.ts');
  assert.equal(getProductionPortionCount('2026-11-16'), 1553);
  assert.equal(getProductionPortionCount('2026-11-17'), 1541);
  assert.equal(getProductionPortionCount('2026-11-20'), 1541);
  assert.equal(days[0].date, '2026-11-02');
  assert.equal(days.at(-1).date, '2026-11-27');
  assert.deepEqual(buildDailyStockReports(items, movements, getStockPeriodRange('MONTH_OUT', '2028-02-18')), []);
  assert.deepEqual(getStockPeriodRange('MONTH_OUT', '2028-02-18'), { start: '2028-02-01', end: '2028-02-29' });
  assert.deepEqual(getStockPeriodRange('WEEK_OUT', '2026-12-28'), { start: '2026-12-28', end: '2027-01-03' });
  for (const invalid of ['', '2026-02-29', '2026-13-01']) {
    assert.equal(getStockPeriodRange('MONTH_OUT', invalid), null);
  }
});

 test('an ingredient used on different dates keeps its individual OUT amounts', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const item = { ...items[0], usedStock: 11, initialStock: 99, lastUsageDate: '2026-12-02' };
  const fallback = { ...items[1], usedStock: 2.5, initialStock: 40, lastUsageDate: '2026-12-01' };
  const event = { ...movements[0], itemId: item.id, itemName: item.name };
  const days = buildDailyStockReports([item, fallback], [
    { ...event, id: 'a', date: '2026-11-30', qty: 4 },
    { ...event, id: 'b', date: '2026-12-02', qty: 7 },
    { ...event, id: 'c', date: '2026-12-01', qty: 99, type: 'IN' },
    { ...event, id: 'd', date: '2026-12-01', qty: 99, type: 'ADJUST' },
  ], getStockPeriodRange('WEEK_OUT', '2026-11-30'));
  assert.deepEqual(days.map(day => [day.date, day.rows.map(row => row.qty)]), [
    ['2026-11-30', [4]], ['2026-12-01', [2.5]], ['2026-12-02', [7]],
  ]);
});

 test('legacy OUT movement notes from Nov 17 onward migrate to the 1,541 actual production count', () => {
  const { DEFAULT_STOCK_MOVEMENTS, loadMovementsFromStorage, ARSIP_STOCK_MOVEMENTS_KEY, LEGACY_ARSIP_STOCK_MOVEMENTS_KEY } = require('../lib/stock.ts');
  const legacy = { ...DEFAULT_STOCK_MOVEMENTS.find(m => m.reference === 'BOM-MSK-20261117'), notes: 'Batch 12: Pemakaian masak 1.553 Porsi MBG tgl 17 Nov 2026' };
  const before = global.localStorage;
  const beforeWindow = global.window;
  let saved = '';
  global.window = {};
  global.localStorage = {
    getItem: key => key === LEGACY_ARSIP_STOCK_MOVEMENTS_KEY ? JSON.stringify([legacy]) : null,
    setItem: (key, value) => { if (key === ARSIP_STOCK_MOVEMENTS_KEY) saved = value; },
  };
  try {
    const movements = loadMovementsFromStorage();
    assert.ok(movements.find(m => m.id === legacy.id).notes.startsWith('Batch 12: Pemakaian masak 1.541 Porsi MBG tgl 17 Nov 2026'));
    assert.ok(JSON.parse(saved).some(m => m.id === legacy.id && m.notes.includes('1.541 Porsi')));
  } finally {
    if (before === undefined) delete global.localStorage;
    else global.localStorage = before;
    if (beforeWindow === undefined) delete global.window;
    else global.window = beforeWindow;
  }
});

test('the ZIP contains distinct one-page A4 PDFs with daily detail and all signers', async () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const { createStockPeriodZip } = require('../lib/stock-period-pdf.ts');
  const { unzipSync } = require('fflate');
  const logo = readFileSync('public/logo.png');
  const days = buildDailyStockReports(items, movements, getStockPeriodRange('MONTH_OUT', '2026-11-01'));
  const entries = unzipSync(await createStockPeriodZip(days, logo));
  assert.deepEqual(Object.keys(entries).map(name => name.endsWith('/') ? name.slice(0, -1) : name), days.map(day => `BA-BOM-${day.date}.pdf`));
  for (const day of days) {
    const pdf = Buffer.from(entries[Object.keys(entries).find(name => name.replace(/\/$/, '') === `BA-BOM-${day.date}.pdf`)]).toString('latin1');
    assert.match(pdf, /^%PDF-/);
    assert.equal((pdf.match(/\/Type \/Page\b/g) || []).length, 1);
    assert.match(pdf, /\/MediaBox \[0 0 595\.\d+ 841\.\d+\]/);
    assert.match(pdf, /\/Count 1/);
    assert.match(pdf, /stream\n[^]*?endstream/);
    const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
    const { join } = require('node:path');
    const { tmpdir } = require('node:os');
    const temp = mkdtempSync(join(tmpdir(), 'daily-report-pdf-'));
    try {
      const file = join(temp, `${day.date}.pdf`);
      writeFileSync(file, entries[Object.keys(entries).find(name => name.replace(/\/$/, '') === `BA-BOM-${day.date}.pdf`)]);
      const { execFileSync } = require('node:child_process');
      const extracted = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
      assert.ok(extracted.includes(day.number));
      for (const signer of ['Security Andrie', 'Petugas Timbangan / Security', 'Security SPPG', 'Sintia Mariam, A.Md.Gz', 'Salsabiila Zainima, S.Ak', 'Dicky Yusuf Mulyadi, S.M.']) assert.ok(extracted.includes(signer));
      if (day.date === '2026-11-16') assert.match(extracted, /1[.,]553 porsi/i);
      if (day.date >= '2026-11-17') assert.match(extracted, /1[.,]541 porsi/i);
      if (day.date === '2026-11-20') { assert.match(extracted, /Maizena/i); assert.match(extracted, /INFERENSI/); }
    } finally { rmSync(temp, { recursive: true, force: true }); }
  }
});

test('WEEK_IN uses receiving dates and mirrors the OUT week shape', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const range = getStockPeriodRange('WEEK_IN', '2026-11-16');
  assert.deepEqual(range, { start: '2026-11-16', end: '2026-11-22' });
  const days = buildDailyStockReports(items, movements, range, 'IN');
  assert.deepEqual(days.map(({ date, rows, portions }) => [date, rows.length, portions]), [
    ['2026-11-16', 18, 1553], ['2026-11-17', 21, 1541], ['2026-11-18', 18, 1541],
    ['2026-11-19', 18, 1541], ['2026-11-22', 20, 1541],
  ]);
  assert.equal(days.reduce((count, day) => count + day.rows.length, 0), 95);
  assert.match(days[0].number, /^BA-BM\/SPPG-SMG3\/BGN\/2026\/20261116$/);
  assert.ok(days[1].context.some(note => note.includes('Penerimaan bahan baku masuk')));
  assert.ok(days[1].context.some(note => note.includes('GRN-20261117-01')));
});

test('MONTH_IN covers the whole selected month with receiving dates only', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const range = getStockPeriodRange('MONTH_IN', '2026-11-20');
  assert.deepEqual(range, { start: '2026-11-01', end: '2026-11-30' });
  const days = buildDailyStockReports(items, movements, range, 'IN');
  assert.equal(days.length, 20);
  assert.equal(days.reduce((count, day) => count + day.rows.length, 0), 380);
  assert.equal(days[0].date, '2026-11-01');
  assert.equal(days.at(-1).date, '2026-11-26');
  const batch20 = days.at(-1);
  assert.equal(batch20.rows.length, 17);
  assert.ok(batch20.rows.some(row => row.name === 'BERAS' && row.qty === 85 && row.uom === 'KG'));
  assert.ok(batch20.rows.some(row => row.name === 'DAUN SALAM' && row.qty === 30 && row.uom === 'LEMBAR'));
  assert.equal(batch20.totals.find(total => total.uom === 'LEMBAR').qty, 30);
  assert.deepEqual(getStockPeriodRange('MONTH_IN', '2028-02-18'), { start: '2028-02-01', end: '2028-02-29' });
  assert.deepEqual(getStockPeriodRange('WEEK_IN', '2026-12-28'), { start: '2026-12-28', end: '2027-01-03' });
});

test('an ingredient received on different dates keeps its individual IN amounts and OUT events stay out', () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const item = { ...items[0], usedStock: 11, initialStock: 99, lastUsageDate: '2026-12-02', lastRestockDate: '2026-12-02' };
  const fallback = { ...items[1], usedStock: 2.5, initialStock: 40, lastUsageDate: '2026-12-01', lastRestockDate: '2026-12-01' };
  const event = { ...movements[0], itemId: item.id, itemName: item.name };
  const days = buildDailyStockReports([item, fallback], [
    { ...event, id: 'a', date: '2026-11-30', qty: 4, type: 'IN' },
    { ...event, id: 'b', date: '2026-12-02', qty: 7, type: 'IN' },
    { ...event, id: 'c', date: '2026-12-01', qty: 99, type: 'OUT' },
    { ...event, id: 'd', date: '2026-12-01', qty: 99, type: 'ADJUST' },
  ], getStockPeriodRange('WEEK_IN', '2026-11-30'), 'IN');
  assert.deepEqual(days.map(day => [day.date, day.rows.map(row => row.qty)]), [
    ['2026-11-30', [4]], ['2026-12-01', [40]], ['2026-12-02', [7]],
  ]);
});

test('the IN ZIP contains distinct one-page A4 PDFs with receiving detail and all signers', async () => {
  const { getStockPeriodRange, buildDailyStockReports } = report();
  const { createStockPeriodZip } = require('../lib/stock-period-pdf.ts');
  const { unzipSync } = require('fflate');
  const logo = readFileSync('public/logo.png');
  const days = buildDailyStockReports(items, movements, getStockPeriodRange('MONTH_IN', '2026-11-01'), 'IN');
  const entries = unzipSync(await createStockPeriodZip(days, logo, 'IN'));
  assert.deepEqual(Object.keys(entries).map(name => name.endsWith('/') ? name.slice(0, -1) : name), days.map(day => `BA-BM-${day.date}.pdf`));
  for (const day of days) {
    const pdf = Buffer.from(entries[Object.keys(entries).find(name => name.replace(/\/$/, '') === `BA-BM-${day.date}.pdf`)]).toString('latin1');
    assert.match(pdf, /^%PDF-/);
    assert.equal((pdf.match(/\/Type \/Page\b/g) || []).length, 1);
    assert.match(pdf, /\/MediaBox \[0 0 595\.\d+ 841\.\d+\]/);
    assert.match(pdf, /\/Count 1/);
    assert.match(pdf, /stream\n[^]*?endstream/);
    const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
    const { join } = require('node:path');
    const { tmpdir } = require('node:os');
    const temp = mkdtempSync(join(tmpdir(), 'daily-report-pdf-'));
    try {
      const file = join(temp, `${day.date}.pdf`);
      writeFileSync(file, entries[Object.keys(entries).find(name => name.replace(/\/$/, '') === `BA-BM-${day.date}.pdf`)]);
      const { execFileSync } = require('node:child_process');
      const extracted = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
      assert.ok(extracted.includes(day.number));
      assert.match(extracted, /PENERIMAAN/i);
      assert.match(extracted, /JUMLAH MASUK/i);
      for (const signer of ['Security Andrie', 'Petugas Timbangan / Security', 'Security SPPG', 'Sintia Mariam, A.Md.Gz', 'Salsabiila Zainima, S.Ak', 'Dicky Yusuf Mulyadi, S.M.']) assert.ok(extracted.includes(signer));
      if (day.date === '2026-11-16') assert.match(extracted, /1[.,]553/i);
      if (day.date >= '2026-11-17') assert.match(extracted, /1[.,]541/i);
      if (day.date === '2026-11-26') { assert.match(extracted, /DAUN SALAM/i); assert.match(extracted, /30/); }
    } finally { rmSync(temp, { recursive: true, force: true }); }
  }
});
