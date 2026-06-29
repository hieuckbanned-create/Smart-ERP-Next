# PWA Offline Runtime

Smart ERP Next now has the production PWA runtime needed to close the deployable part of `GAP-ROLE-06`.

## Shipped assets

| Asset | Purpose |
|-------|---------|
| `apps/web/public/manifest.json` | Install metadata, app scope, standalone display, theme color, and icons. |
| `apps/web/public/sw.js` | Production service worker with cache-first static assets and network-first runtime/navigation fallback. |
| `apps/web/public/offline.html` | User-facing fallback when a navigation request cannot reach the network and is not already cached. |
| `ServiceWorkerProvider` | Client-side production-only registration for `/sw.js`. |
| `scripts/__tests__/pwa-assets.test.js` | Regression coverage for manifest metadata, registration, and offline fallback wiring. |

## Runtime strategy

- Static app shell assets use cache-first behavior to make repeat loads fast and resilient.
- Runtime pages use network-first behavior so users see fresh ERP data when online.
- Failed navigation requests fall back to `/offline.html` when no cached page is available.
- Registration is disabled outside production to avoid stale service workers during local development.

## Remaining offline hardening

- Add business-specific conflict resolution tests for POS checkout, inventory adjustment, and product updates.
- Add a user-visible queue status for pending writes that have not reached the API.
- Add release smoke steps that install the PWA and validate offline reload behavior in a real browser profile.
