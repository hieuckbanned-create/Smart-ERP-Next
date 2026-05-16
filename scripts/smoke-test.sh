#!/bin/bash
# Smart ERP Next - User Journey Test Script

echo "Starting Smart ERP Next smoke tests..."

# Check if server is running
echo "1. Checking web server..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
  echo "   ✓ Web server is running (HTTP $HTTP_CODE)"
else
  echo "   ✗ Web server not responding (HTTP $HTTP_CODE)"
  echo "   Start server with: cd apps/web && pnpm dev"
fi

# Check database connection
echo "2. Checking database..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "   ✓ API server is running"
else
  echo "   ✗ API server not responding"
fi

# Run Playwright if available
echo "3. Running Playwright smoke test..."
if command -v npx &> /dev/null; then
  cd tests
  if [ -f "user-journey.spec.js" ]; then
    npx playwright test --reporter=line 2>&1 | tail -5
  else
    echo "   Test file not found, creating..."
    cat > user-journey.spec.js << 'EOF'
const { test, expect } = require('@playwright/test');
test('login page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
});
EOF
    npx playwright test --reporter=line 2>&1 | tail -5
  fi
fi

echo ""
echo "Smoke tests completed!"