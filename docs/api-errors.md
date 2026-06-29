# API Error Catalog

All API errors should keep the global response envelope produced by `GlobalExceptionFilter`:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "requestId": "..."
}
```

## Standard error codes

| HTTP | Code | Meaning | Client action |
|------|------|---------|---------------|
| 400 | `VALIDATION_ERROR` | Request body/query/params failed validation. | Highlight invalid fields and let user retry. |
| 401 | `UNAUTHORIZED` | Missing, expired, or invalid token. | Refresh token or redirect to login. |
| 403 | `FORBIDDEN` | Authenticated user lacks permission. | Hide action or request role change. |
| 404 | `NOT_FOUND` | Resource does not exist in the tenant scope. | Show not-found state. |
| 409 | `CONFLICT` | Optimistic/offline sync conflict. | Open conflict resolution UI. |
| 429 | `RATE_LIMITED` | Too many requests. | Back off and retry after the limit window. |
| 500 | `INTERNAL_ERROR` | Unexpected server error. | Show retry/support message and include request ID. |

## Versioning impact

Error envelope shape is part of the v1 contract. Any incompatible envelope change must use a new `X-API-Version` value and keep v1 behavior available through the deprecation window.
