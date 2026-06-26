# Smart ERP Next — Gaps & Roadmap (Updated 2026-06-26)

Completed: 18 | Remaining: 10

## Completed

| Gap | Priority | Fix |
|-----|----------|-----|
| dev.bat 2 windows | High | single terminal with start /b |
| Swagger production gate | Medium | gated after NODE_ENV check |
| Rate limiting login | High | 100/60s via env var |
| Login rate limit test | Medium | TDD test: 5 ok, 6th 429 |
| Swagger gate test | Medium | TDD test: disabled in production |
| CONTRIBUTING.md | Medium | created |
| Architecture diagram | Medium | Mermaid added to DEVELOPMENT.md |
| Docker image size | High | removed source, pnpm, ts files |
| Dead code cleanup | Medium | deleted 10 orphaned files |
| POS E2E test skip | High | replaced with page-load test |
| docker-compose.local.yml | Medium | hot-reload dev compose |
| Credentials documentation | Medium | comment explaining purpose |
| Dockerfile mojibake | Low | clean ASCII comments |
| .githooks removed | Low | deleted unused hook |

## Remaining

| Gap | Priority | Notes |
|-----|----------|-------|
| Gop packages nho | Medium | Deferred |
| Single point of failure | Medium | Tach container khi scale |
| 48 modules nesting | Medium | Domain refactor |
| API versioning | Medium | Needs design |
| Build time optimization | High | GitHub Actions cache |
| Monitoring/logging | Medium | ELK stack setup |
| CSRF protection | Medium | JWT stateless — not needed |
| Barcode scanner POS | Medium | Hardware integration |
| Print templates | Medium | Invoice/PO printing |
| Data export UI | Medium | PDF/XLSX export |
