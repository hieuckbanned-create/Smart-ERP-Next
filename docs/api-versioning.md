# API Versioning Policy

Smart ERP Next uses header-based API versioning so existing web, mobile, and integration clients keep working while new clients can opt into explicit versions.

## Current version

| Field | Value |
|-------|-------|
| Current stable version | `1` |
| Version header | `X-API-Version` |
| Default behavior | Missing header resolves to version `1` |
| Breaking-change window | Introduce a new version first; remove old behavior only after deprecation notice and migration guide. |

## Client contract

Clients should send:

```http
X-API-Version: 1
Authorization: Bearer <access-token>
```

Existing clients without the header remain compatible because the API defaults to version `1`.

## Server rules

- Versioning config lives in `apps/api/src/common/api-versioning.ts` and is applied during bootstrap in `apps/api/src/main.ts`.
- New breaking endpoint behavior must ship behind a new API version instead of changing v1 semantics in place.
- Non-breaking additive changes, such as adding optional response fields, can remain in v1.
- Contract tests must cover the configured header, current version, supported versions, and default version.

## Deprecation checklist

1. Add the next version to `API_SUPPORTED_VERSIONS`.
2. Document changed endpoints in `docs/api.md` and release notes.
3. Add contract tests for both old and new behavior.
4. Update frontend/API clients to send the target `X-API-Version`.
5. Keep the old version until the release manager approves removal.
