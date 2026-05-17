#!/bin/bash

# Smart ERP Next First-Time Setup Wizard
# Guides new users through initial configuration

set -e

echo ""
echo "🚀 Welcome to Smart ERP Next Setup Wizard"
echo "=========================================="
echo "This wizard will guide you through initial setup."
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Ask for deployment type
echo ""
echo "📋 Select deployment type:"
echo "1) Development (Local testing)"
echo "2) Production (For real business use)"
echo "3) Demo (Quick demo with sample data)"
read -p "Enter choice [1-3]: " DEPLOYMENT_TYPE

case $DEPLOYMENT_TYPE in
    1)
        ENV_FILE=".env.development"
        COMPOSE_FILE="docker-compose.yml"
        echo "🔧 Setting up Development environment..."
        ;;
    2)
        ENV_FILE=".env.production"
        COMPOSE_FILE="docker-compose.production.yml"
        echo "🏢 Setting up Production environment..."
        ;;
    3)
        ENV_FILE=".env.demo"
        COMPOSE_FILE="docker-compose.yml"
        echo "🎭 Setting up Demo environment..."
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Create environment file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo "📝 Creating $ENV_FILE configuration..."

    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | cut -c1-16)
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=')

    # Ask for configuration
    echo ""
    read -p "Enter your domain or IP address [localhost]: " DOMAIN
    DOMAIN=${DOMAIN:-localhost}

    if [ "$DOMAIN" = "localhost" ]; then
        API_URL="http://localhost:3000"
        WEB_URL="http://localhost:3001"
    else
        API_URL="https://api.$DOMAIN"
        WEB_URL="https://$DOMAIN"
    fi

    read -p "Enter database username [smart_erp]: " DB_USER
    DB_USER=${DB_USER:-smart_erp}

    read -p "Enter API port [3000]: " API_PORT
    API_PORT=${API_PORT:-3000}

    read -p "Enter Web port [3001]: " WEB_PORT
    WEB_PORT=${WEB_PORT:-3001}

    # Create environment file
    cat > "$ENV_FILE" << EOF
# Smart ERP Next Configuration
# Generated: $(date)

# Database
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_PORT=5432

# JWT Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# API Configuration
PORT=$API_PORT
NODE_ENV=production
LOG_LEVEL=info

# CORS Security
CORS_ORIGINS=$WEB_URL

# Web App Configuration
NEXT_PUBLIC_API_URL=$API_URL
WEB_PORT=$WEB_PORT

# AI Forecast Service
AI_FORECAST_PORT=8000
AI_FORECAST_URL=http://ai-forecast:8000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

    echo "✅ Created $ENV_FILE"

    # Save credentials to secure file
    cat > ".credentials.txt" << EOF
⚠️ IMPORTANT: Save these credentials securely ⚠️
===============================================
Generated: $(date)

Database:
- Username: $DB_USER
- Password: $DB_PASSWORD

JWT Secret: $JWT_SECRET

Access URLs:
- Web Dashboard: $WEB_URL
- API: $API_URL
- API Documentation: $API_URL/api

Ports:
- API: $API_PORT
- Web: $WEB_PORT
EOF

    echo "🔐 Credentials saved to .credentials.txt"
    echo "   ⚠️ Keep this file secure and don't commit it to version control!"
fi

# Load environment variables
echo ""
echo "📋 Loading environment variables..."
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Start services
echo ""
echo "🚀 Starting Smart ERP Next services..."
docker-compose -f "$COMPOSE_FILE" up -d --build

echo ""
echo "⏳ Waiting for services to start (this may take a few minutes)..."
sleep 10

# Check if services are healthy
MAX_WAIT=180
ELAPSED=0
SERVICES_HEALTHY=false

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s -f "http://localhost:$API_PORT/health" > /dev/null && \
       curl -s -f "http://localhost:$WEB_PORT" > /dev/null; then
        SERVICES_HEALTHY=true
        break
    fi

    echo "⏳ Waiting for services... ($((ELAPSED/60))m $((ELAPSED%60))s)"
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

if [ "$SERVICES_HEALTHY" = false ]; then
    echo "❌ Services failed to start within $((MAX_WAIT/60)) minutes"
    echo "Checking logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    exit 1
fi

# Run initial setup based on deployment type
echo ""
echo "🔄 Running initial setup..."

case $DEPLOYMENT_TYPE in
    1)  # Development
        echo "📊 Seeding development data..."
        docker-compose -f "$COMPOSE_FILE" exec -T api node apps/api/dist/common/seeds/dev.seed.js
        ;;
    2)  # Production
        echo "🏢 Creating production admin account..."
        read -p "Enter admin email [admin@company.com]: " ADMIN_EMAIL
        ADMIN_EMAIL=${ADMIN_EMAIL:-admin@company.com}

        read -p "Enter admin password [Admin@123456]: " ADMIN_PASSWORD
        ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@123456}

        # Create admin user
        docker-compose -f "$COMPOSE_FILE" exec -T api node apps/api/dist/common/seeds/create-admin.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

        echo "✅ Admin account created:"
        echo "   Email: $ADMIN_EMAIL"
        echo "   Password: $ADMIN_PASSWORD"
        ;;
    3)  # Demo
        echo "🎭 Seeding demo data..."
        docker-compose -f "$COMPOSE_FILE" exec -T api node apps/api/dist/common/seeds/demo.seed.js
        ;;
esac

# Create startup script
cat > "start-erp.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
docker-compose -f docker-compose.production.yml up -d
echo "Smart ERP Next started!"
echo "Web Dashboard: http://localhost:3001"
echo "API Docs: http://localhost:3000/api"
EOF

chmod +x start-erp.sh

cat > "stop-erp.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
docker-compose -f docker-compose.production.yml down
echo "Smart ERP Next stopped"
EOF

chmod +x stop-erp.sh

# Display success message
echo ""
echo "🎉 Smart ERP Next Setup Complete!"
echo "================================="
echo ""
echo "✅ Services are running"
echo "✅ Configuration saved"
echo "✅ Initial data seeded"
echo ""
echo "📊 Access Information:"
echo "   Web Dashboard: http://localhost:$WEB_PORT"
echo "   API Documentation: http://localhost:$API_PORT/api"
echo "   AI Forecast: http://localhost:8000/docs"
echo ""
echo "🔧 Management Commands:"
echo "   Start: ./start-erp.sh"
echo "   Stop: ./stop-erp.sh"
echo "   View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Restart: docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:$WEB_PORT in your browser"
echo "   2. Login with the credentials provided above"
echo "   3. Configure your company settings"
echo "   4. Add your first products, customers, and suppliers"
echo ""
echo "❓ Need help? Check docs/production-setup-guide.md"
echo ""
echo "🌟 Thank you for choosing Smart ERP Next!"