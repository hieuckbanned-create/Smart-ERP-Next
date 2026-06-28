# Deploy Smart ERP Next

## Yêu cầu

- Docker & Docker Compose v2
- 2GB RAM, 10GB disk
- Domain trỏ đến VPS (optional)

## 1. Production (Docker Compose)

```bash
# Clone & run
git clone https://github.com/hieuck/Smart-ERP-Next.git
cd Smart-ERP-Next
cp .env.production.example .env.production
nano .env.production  # Sửa DB_PASSWORD, JWT_SECRET
docker compose -f docker-compose.prod.yml up -d
```

## 2. Single container (quick demo)

```bash
docker run -d \
  -p 3456:3456 \
  -p 3457:3457 \
  -e JWT_SECRET="your-secret-here" \
  ghcr.io/hieuck/smart-erp-next:v1.0.0
```

## 3. Environment Variables

| Var | Default | Required | Description |
|-----|---------|----------|-------------|
| `DB_PASSWORD` | — | ✅ | PostgreSQL password |
| `JWT_SECRET` | — | ✅ | JWT signing key (≥32 chars) |
| `DATABASE_URL` | auto | ❌ | Custom PostgreSQL URL |
| `CORS_ORIGINS` | localhost | ❌ | Allowed origins (comma-separated) |
| `LOGIN_RATE_LIMIT` | 100 | ❌ | Login attempts per 60s |
| `NEXT_PUBLIC_API_URL` | auto | ❌ | API URL for web app |
| `SMTP_HOST` | localhost | ❌ | Email SMTP host |
| `SMTP_PORT` | 1025 | ❌ | SMTP port |
| `SMTP_USER` | — | ❌ | SMTP username |
| `SMTP_PASS` | — | ❌ | SMTP password |
| `EMAIL_FROM` | noreply@ | ❌ | From address |
| `AI_FORECAST_URL` | localhost:8000 | ❌ | Python AI service |

## 4. GitHub Actions (auto-deploy)

Configure secrets in GitHub repo → Settings → Secrets → Actions:

| Secret | Description |
|--------|-------------|
| `STAGING_HOST` | VPS IP address |
| `STAGING_USER` | SSH user (e.g., `deploy`) |
| `STAGING_SSH_KEY` | SSH private key |
| `STAGING_PATH` | Deploy path (default: `/opt/smart-erp-next`) |

Push to `dev` → auto-builds Docker image → deploys to staging.

## 5. Monitoring

```bash
# Health check
curl http://localhost:3456/health
curl http://localhost:3456/status

# Logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Backup DB
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres smart_erp > backup.sql
```

## 6. Upgrade

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

Database migrations tự động chạy khi container khởi động.

## 7. Troubleshooting

**Container restart loop**: Kiểm tra `DATABASE_URL` và `JWT_SECRET`
**Cannot connect DB**: Kiểm tra `DB_PASSWORD` match in compose
**E2E tests fail locally**: Chạy `scripts/ci-local.ps1` để debug
