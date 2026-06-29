# i18n Locale Parity

Smart ERP Next now gates Vietnamese/English locale parity for the web app so translated pages cannot silently lose keys in one language.

## Gate

```bash
pnpm audit:i18n-parity
```

The audit checks:

- `apps/web/src/lib/locales/vi/common.json` and `apps/web/src/lib/locales/en/common.json` expose the same flattened key set.
- Vietnamese strings do not contain suspicious replacement-question-mark mojibake in the middle of text.

The command runs in CI and in `pnpm qa:commit` next to the runtime i18n key audit.

## Fixes included

- Repaired corrupted Vietnamese labels in dashboard, actions, navigation, common UI, inventory transfer, purchasing, customers, sync status, CRM, accounting, ecommerce, warehouses, and contracts strings.
- Backfilled missing Vietnamese and English keys so the two web locale bundles have full key parity.
- Added a Jest test around the parity audit to keep the script behavior stable.

## Remaining localization hardening

- Replace any English fallback text that was backfilled into Vietnamese with final human-reviewed Vietnamese copy.
- Add screenshot review for high-traffic pages in both languages.
- Extend the parity audit to API/mobile locale bundles once those bundles are normalized to the same namespace layout.
