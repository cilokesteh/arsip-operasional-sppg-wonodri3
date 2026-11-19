# Changelog

## Unreleased — daily period cooking documents
- `WEEK_OUT` and `MONTH_OUT` now show detailed BA-BOM outgoing cooking reports grouped by recorded usage date, one A4 page for each date.
- Download each date as a separate PDF or batch-download all dated PDFs in a ZIP; printing all preview pages inserts page breaks. The period range counts actual cooking dates, excludes dates with no outgoing usage, and reports an empty period without exporting files.
- From 17 Nov onward the daily-production portion count is 1,541 (not the 1,553 master-service count); prior dates retain their historical production count. Period BA headers, narratives, menu/BOM text, batch OUT notes, and migrated saved movement notes reflect the correction; the stock roster itself remains 1,553.
- Daily PDFs retain the BGN header/logo, Security Andrie (Petugas Timbangan / Security), three other signatories, physical-only quantities, and per-unit totals.
- `pnpm test:stock-period` verifies cutoff dates, migrated notes, generated PDFs/ZIPs, and signatories.
