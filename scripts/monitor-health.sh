#!/bin/bash

# Smart ERP Next Health Monitoring Script
# Usage: ./scripts/monitor-health.sh [--alert]

set -e

ALERT_MODE=false
if [ "$1" = "--alert" ]; then
    ALERT_MODE=true
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="./logs/health-monitor-$(date +%Y%m%d).log"
mkdir -p ./logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_service() {
    local service=$1
    local port=$2
    local endpoint=$3
    local name=$4

    if curl -s -f "http://localhost:${port}${endpoint}" > /dev/null; then
        log_message "${GREEN}✅ ${name} is healthy${NC}"
        return 0
    else
        log_message "${RED}❌ ${name} is unhealthy${NC}"

        if [ "$ALERT_MODE" = true ]; then
            send_alert "${name} service is down on port ${port}"
        fi

        return 1
    fi
}

check_docker_service() {
    local service=$1
    local name=$2

    if docker-compose -f docker-compose.production.yml ps "$service" | grep -q "Up"; then
        log_message "${GREEN}✅ ${name} container is running${NC}"

        # Check container health status
        local health_status=$(docker-compose -f docker-compose.production.yml ps "$service" | awk 'NR>2 {print $4}')
        if [[ "$health_status" == *"unhealthy"* ]]; then
            log_message "${YELLOW}⚠️ ${name} container is unhealthy${NC}"
            return 1
        fi

        return 0
    else
        log_message "${RED}❌ ${name} container is not running${NC}"

        if [ "$ALERT_MODE" = true ]; then
            send_alert "${name} container is not running"
        fi

        return 1
    fi
}

check_disk_space() {
    local threshold=80  # 80% usage threshold
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$usage" -gt "$threshold" ]; then
        log_message "${YELLOW}⚠️ Disk usage is high: ${usage}%${NC}"

        if [ "$ALERT_MODE" = true ]; then
            send_alert "Disk usage is high: ${usage}%"
        fi

        return 1
    else
        log_message "${GREEN}✅ Disk usage: ${usage}%${NC}"
        return 0
    fi
}

check_memory_usage() {
    local threshold=90  # 90% usage threshold
    local usage=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')

    if [ "$usage" -gt "$threshold" ]; then
        log_message "${YELLOW}⚠️ Memory usage is high: ${usage}%${NC}"

        if [ "$ALERT_MODE" = true ]; then
            send_alert "Memory usage is high: ${usage}%"
        fi

        return 1
    else
        log_message "${GREEN}✅ Memory usage: ${usage}%${NC}"
        return 0
    fi
}

check_database_connections() {
    local max_connections=100
    local current_connections=$(docker-compose -f docker-compose.production.yml exec -T postgres psql -U "${DB_USER:-smart_erp_prod}" -d smart_erp -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "0")

    if [ "$current_connections" -gt $((max_connections * 80 / 100)) ]; then
        log_message "${YELLOW}⚠️ High database connections: ${current_connections}/${max_connections}${NC}"
        return 1
    else
        log_message "${GREEN}✅ Database connections: ${current_connections}/${max_connections}${NC}"
        return 0
    fi
}

check_response_time() {
    local service=$1
    local port=$2
    local endpoint=$3
    local name=$4
    local threshold=2  # 2 seconds threshold

    local start_time=$(date +%s%N)
    if curl -s -f "http://localhost:${port}${endpoint}" > /dev/null; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

        if [ "$response_time" -gt $((threshold * 1000)) ]; then
            log_message "${YELLOW}⚠️ ${name} response time slow: ${response_time}ms${NC}"
            return 1
        else
            log_message "${GREEN}✅ ${name} response time: ${response_time}ms${NC}"
            return 0
        fi
    else
        return 1
    fi
}

send_alert() {
    local message=$1
    log_message "${RED}🚨 ALERT: ${message}${NC}"

    # Here you can implement actual alerting:
    # - Send email
    # - Send Slack notification
    # - Send SMS
    # - Call webhook

    # Example: Send to log file for now
    echo "[ALERT $(date '+%Y-%m-%d %H:%M:%S')] ${message}" >> "./logs/alerts.log"
}

generate_report() {
    local total_checks=$1
    local failed_checks=$2

    echo ""
    echo "📊 Health Check Report"
    echo "======================"
    echo "Timestamp: ${TIMESTAMP}"
    echo "Total checks: ${total_checks}"
    echo "Failed checks: ${failed_checks}"
    echo "Success rate: $(( (total_checks - failed_checks) * 100 / total_checks ))%"

    if [ "$failed_checks" -eq 0 ]; then
        echo "Status: ${GREEN}HEALTHY${NC}"
    elif [ "$failed_checks" -lt 3 ]; then
        echo "Status: ${YELLOW}WARNING${NC}"
    else
        echo "Status: ${RED}CRITICAL${NC}"
    fi

    # Show recent logs
    echo ""
    echo "📝 Recent logs:"
    tail -10 "$LOG_FILE" | sed 's/\x1b\[[0-9;]*m//g'  # Remove color codes
}

# Main monitoring function
main() {
    log_message "🔍 Starting Smart ERP Next health check..."

    # Load environment variables
    if [ -f ".env.production" ]; then
        source .env.production
    fi

    local total_checks=0
    local failed_checks=0

    # Check Docker services
    log_message "🐳 Checking Docker services..."

    check_docker_service "postgres" "PostgreSQL" || ((failed_checks++))
    ((total_checks++))

    check_docker_service "api" "API Server" || ((failed_checks++))
    ((total_checks++))

    check_docker_service "web" "Web Dashboard" || ((failed_checks++))
    ((total_checks++))

    check_docker_service "ai-forecast" "AI Forecast" || ((failed_checks++))
    ((total_checks++))

    # Check service health endpoints
    log_message "🏥 Checking service health endpoints..."

    check_service "api" "${API_PORT:-3000}" "/health" "API Server" || ((failed_checks++))
    ((total_checks++))

    check_response_time "api" "${API_PORT:-3000}" "/health" "API Server" || ((failed_checks++))
    ((total_checks++))

    check_service "web" "${WEB_PORT:-3001}" "" "Web Dashboard" || ((failed_checks++))
    ((total_checks++))

    check_service "ai-forecast" "${AI_FORECAST_PORT:-8000}" "/health" "AI Forecast" || ((failed_checks++))
    ((total_checks++))

    # Check system resources
    log_message "💻 Checking system resources..."

    check_disk_space || ((failed_checks++))
    ((total_checks++))

    check_memory_usage || ((failed_checks++))
    ((total_checks++))

    # Check database
    log_message "🗄️ Checking database..."

    check_database_connections || ((failed_checks++))
    ((total_checks++))

    # Generate report
    generate_report "$total_checks" "$failed_checks"

    if [ "$failed_checks" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main