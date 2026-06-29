# Observability Stack

This closes the repository-owned part of the monitoring gap by providing a local/staging observability stack with Prometheus, Grafana, Loki, alert rules, and dashboards.

## Start the stack

```bash
docker compose -f docker-compose.observability.yml up -d
```

Default endpoints:

| Service | URL | Purpose |
|---------|-----|---------|
| Prometheus | http://localhost:9090 | Scrapes Smart ERP API status and evaluates alert rules. |
| Grafana | http://localhost:3002 | Dashboards for API status and scrape latency. |
| Loki | http://localhost:3100 | Log aggregation backend for future structured log shipping. |

## Scrape target

Prometheus scrapes the API status endpoint at `host.docker.internal:3456/status/metrics`. Run the API on port `3456` locally or update `monitoring/prometheus/prometheus.yml` for the target environment.

## Alerts

`monitoring/prometheus/alerts.yml` contains the first production-facing rules:

- `SmartErpApiStatusDown`: `/status/metrics` cannot be scraped for 2 minutes.
- `SmartErpApiDatabaseUnhealthy`: database health metric reports unhealthy for 5 minutes.

## Dashboard provisioning

Grafana automatically provisions:

- Prometheus and Loki datasources.
- `Smart ERP Overview` dashboard from `monitoring/grafana/dashboards/smart-erp-overview.json`.

## Next hardening

- Export native Prometheus metrics from the API instead of relying only on scrape health.
- Ship structured application logs to Loki via Promtail or an OpenTelemetry collector.
- Add SLO burn-rate alerts after production traffic baselines exist.
