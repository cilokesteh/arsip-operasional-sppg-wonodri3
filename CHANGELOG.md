# Changelog

## Unreleased — daily period cooking documents
- `WEEK_OUT` and `MONTH_OUT` now show detailed BA-BOM outgoing cooking reports grouped by recorded usage date, one A4 page for each date.
- Download each date as a separate PDF or batch-download all dated PDFs in a ZIP; printing all preview pages inserts page breaks. The period range counts actual cooking dates, excludes dates with no outgoing usage, and reports an empty period without exporting files.
- Daily documents preserve the BGN header/logo, original four signatories and physical-only quantities, with totals grouped by unit.
- Add deterministic stock-period report and generated-PDF/ZIP regression coverage (`pnpm test:stock-period`).
