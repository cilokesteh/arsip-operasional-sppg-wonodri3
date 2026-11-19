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
  assert.deepEqual(days.map(({ date, rows }) => [date, rows.length]), [
    ['2026-11-16', 16], ['2026-11-17', 18], ['2026-11-18', 21],
    ['2026-11-19', 18], ['2026-11-20', 18],
  ]);
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
  assert.equal(days.length, 15);
  assert.equal(days.reduce((count, day) => count + day.rows.length, 0), 272);
  assert.equal(days[0].date, '2026-11-02');
  assert.equal(days.at(-1).date, '2026-11-20');
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
      for (const signer of ['Nur Khafidin', 'Sintia Mariam, A.Md.Gz', 'Salsabiila Zainima, S.Ak', 'Dicky Yusuf Mulyadi, S.M.']) assert.ok(extracted.includes(signer));
      if (day.date === '2026-11-20') { assert.match(extracted, /Maizena/i); assert.match(extracted, /INFERENSI/); }
    } finally { rmSync(temp, { recursive: true, force: true }); }
  }
});
