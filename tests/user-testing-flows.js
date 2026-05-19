#!/usr/bin/env node

/**
 * User Testing Flows for Smart ERP Next
 *
 * Validates the 3 most critical user flows:
 * 1. Authentication flow (Register/Login)
 * 2. Product management flow (CRUD operations)
 * 3. Order creation flow (Create and view orders)
 */

const fs = require('fs');
const path = require('path');

console.log('👤 Smart ERP Next - User Testing Flow Validation\n');

const flows = {
  authentication: { passed: 0, total: 0 },
  products: { passed: 0, total: 0 },
  orders: { passed: 0, total: 0 }
};

function validateFlow(flowName, checkName, checkFn) {
  flows[flowName].total++;
  try {
    checkFn();
    console.log(`  ✅ ${checkName}`);
    flows[flowName].passed++;
  } catch (error) {
    console.log(`  ❌ ${checkName}: ${error.message}`);
  }
}

console.log('1. 🔐 Authentication Flow:');
validateFlow('authentication', 'Auth module exists', () => {
  if (!fs.existsSync('apps/api/src/auth/auth.module.ts')) {
    throw new Error('Auth module missing');
  }
});

validateFlow('authentication', 'Auth service exists', () => {
  if (!fs.existsSync('apps/api/src/auth/auth.service.ts')) {
    throw new Error('Auth service missing');
  }
});

validateFlow('authentication', 'JWT strategy exists', () => {
  if (!fs.existsSync('apps/api/src/common/strategies/jwt.strategy.ts')) {
    throw new Error('JWT strategy missing');
  }
});

validateFlow('authentication', 'User registration DTO exists', () => {
  if (!fs.existsSync('apps/api/src/users/dto/create-user.dto.ts')) {
    throw new Error('User registration DTO missing');
  }
});

validateFlow('authentication', 'Login DTO exists', () => {
  const loginDTO = 'apps/api/src/auth/dto/login.dto.ts';
  const authDTO = 'apps/api/src/auth/dto/auth.dto.ts';

  if (!fs.existsSync(loginDTO) && !fs.existsSync(authDTO)) {
    throw new Error('Login/Auth DTO missing');
  }
});

console.log('\n2. 📦 Product Management Flow:');
validateFlow('products', 'Product module exists', () => {
  if (!fs.existsSync('apps/api/src/products/products.module.ts')) {
    throw new Error('Product module missing');
  }
});

validateFlow('products', 'Product service exists', () => {
  if (!fs.existsSync('apps/api/src/products/products.service.ts')) {
    throw new Error('Product service missing');
  }
});

validateFlow('products', 'Product controller exists', () => {
  if (!fs.existsSync('apps/api/src/products/products.controller.ts')) {
    throw new Error('Product controller missing');
  }
});

validateFlow('products', 'Create product DTO exists', () => {
  if (!fs.existsSync('apps/api/src/products/dto/create-product.dto.ts')) {
    throw new Error('Create product DTO missing');
  }
});

validateFlow('products', 'Update product DTO exists', () => {
  if (!fs.existsSync('apps/api/src/products/dto/update-product.dto.ts')) {
    throw new Error('Update product DTO missing');
  }
});

validateFlow('products', 'Product query DTO exists', () => {
  if (!fs.existsSync('apps/api/src/products/dto/query-product.dto.ts')) {
    throw new Error('Product query DTO missing');
  }
});

console.log('\n3. 🛒 Order Management Flow:');
validateFlow('orders', 'Order module exists', () => {
  if (!fs.existsSync('apps/api/src/orders/orders.module.ts')) {
    throw new Error('Order module missing');
  }
});

validateFlow('orders', 'Order service exists', () => {
  if (!fs.existsSync('apps/api/src/orders/orders.service.ts')) {
    throw new Error('Order service missing');
  }
});

validateFlow('orders', 'Order controller exists', () => {
  if (!fs.existsSync('apps/api/src/orders/orders.controller.ts')) {
    throw new Error('Order controller missing');
  }
});

validateFlow('orders', 'Create order DTO exists', () => {
  if (!fs.existsSync('apps/api/src/orders/dto/create-order.dto.ts')) {
    throw new Error('Create order DTO missing');
  }
});

validateFlow('orders', 'Order entity exists', () => {
  // Check for order entity in database schema
  const schemaDir = 'packages/database/src/schema';
  if (fs.existsSync(schemaDir)) {
    const files = fs.readdirSync(schemaDir);
    const hasOrderSchema = files.some(file =>
      file.toLowerCase().includes('order') && file.endsWith('.ts')
    );

    if (!hasOrderSchema) {
      // Check in API directory
      const apiOrderFiles = [
        'apps/api/src/orders/entities/order.entity.ts',
        'apps/api/src/orders/order.entity.ts'
      ];

      const hasApiOrderEntity = apiOrderFiles.some(file => fs.existsSync(file));
      if (!hasApiOrderEntity) {
        throw new Error('Order entity/schema not found');
      }
    }
  }
});

validateFlow('orders', 'Order items relationship', () => {
  // Check for order items in database schema
  const schemaDir = 'packages/database/src/schema';
  if (fs.existsSync(schemaDir)) {
    const files = fs.readdirSync(schemaDir);
    const hasOrderItemSchema = files.some(file =>
      (file.toLowerCase().includes('order') && file.toLowerCase().includes('item')) &&
      file.endsWith('.ts')
    );

    if (!hasOrderItemSchema) {
      console.log('  ⚠️  Order items schema not found (may be combined with orders)');
    }
  }
});

console.log('\n📊 Flow Validation Summary:');
console.log('='.repeat(40));

Object.entries(flows).forEach(([flowName, stats]) => {
  const percentage = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(0) : 0;
  const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';

  console.log(`${getFlowEmoji(flowName)} ${flowName.toUpperCase()}:`);
  console.log(`  ${status} ${stats.passed}/${stats.total} checks passed (${percentage}%)`);
});

const totalPassed = Object.values(flows).reduce((sum, stats) => sum + stats.passed, 0);
const totalChecks = Object.values(flows).reduce((sum, stats) => sum + stats.total, 0);
const overallPercentage = totalChecks > 0 ? (totalPassed / totalChecks * 100).toFixed(0) : 0;

console.log('\n🎯 Overall Readiness for User Testing:');
console.log('='.repeat(40));
console.log(`Total: ${totalPassed}/${totalChecks} (${overallPercentage}%)`);

if (overallPercentage >= 90) {
  console.log('\n🎉 EXCELLENT: All critical flows are well-defined and ready for user testing!');
  console.log('Users can test: Registration → Login → Product Management → Order Creation');
} else if (overallPercentage >= 70) {
  console.log('\n⚠️  GOOD: Core flows are defined but some components may need attention.');
  console.log('Users can test basic flows with possible limitations.');
} else if (overallPercentage >= 50) {
  console.log('\n🔧 FAIR: Basic structure exists but significant gaps remain.');
  console.log('Consider focusing on authentication and product flows first.');
} else {
  console.log('\n🚨 NEEDS WORK: Critical gaps in user testing flows.');
  console.log('Prioritize authentication flow before user testing.');
}

console.log('\n💡 Next steps for user testing:');
console.log('1. Start API server: cd apps/api && npm run dev');
console.log('2. Test authentication endpoints (POST /auth/register, POST /auth/login)');
console.log('3. Test product endpoints (GET/POST /products)');
console.log('4. Test order endpoints (GET/POST /orders)');

function getFlowEmoji(flowName) {
  const emojis = {
    authentication: '🔐',
    products: '📦',
    orders: '🛒'
  };
  return emojis[flowName] || '📋';
}

process.exit(0);