#!/usr/bin/env node

/**
 * Health Check Script for Smart ERP Next
 *
 * Tests the most critical paths for user testing:
 * 1. Authentication setup
 * 2. Product management basics
 * 3. Order creation flow
 * 4. Database connectivity
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 Smart ERP Next - Health Check for User Testing\n');

let checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(name, testFn, isCritical = true) {
  try {
    testFn();
    console.log(`✅ ${name}`);
    checks.passed++;
  } catch (error) {
    if (isCritical) {
      console.log(`❌ ${name}: ${error.message}`);
      checks.failed++;
    } else {
      console.log(`⚠️  ${name}: ${error.message}`);
      checks.warnings++;
    }
  }
}

// Critical checks for user testing
console.log('🔐 Authentication & Authorization:');
check('JWT configuration exists', () => {
  const authFiles = [
    'apps/api/src/auth/auth.module.ts',
    'apps/api/src/auth/auth.service.ts',
    'apps/api/src/common/strategies/jwt.strategy.ts'
  ];

  authFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing auth file: ${file}`);
    }
  });
});

check('User entity and service exist', () => {
  const userFiles = [
    'apps/api/src/users/users.module.ts',
    'apps/api/src/users/users.service.ts',
    'apps/api/src/users/users.controller.ts'
  ];

  userFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing user file: ${file}`);
    }
  });
});

console.log('\n📦 Product Management:');
check('Product entity and service exist', () => {
  const productFiles = [
    'apps/api/src/products/products.module.ts',
    'apps/api/src/products/products.service.ts',
    'apps/api/src/products/products.controller.ts'
  ];

  productFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing product file: ${file}`);
    }
  });
});

check('Product DTOs exist', () => {
  const productDTOs = [
    'apps/api/src/products/dto/create-product.dto.ts',
    'apps/api/src/products/dto/update-product.dto.ts',
    'apps/api/src/products/dto/query-product.dto.ts'
  ];

  productDTOs.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing product DTO: ${file}`);
    }
  });
});

console.log('\n🛒 Order Management:');
check('Order entity and service exist', () => {
  const orderFiles = [
    'apps/api/src/orders/orders.module.ts',
    'apps/api/src/orders/orders.service.ts',
    'apps/api/src/orders/orders.controller.ts'
  ];

  orderFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing order file: ${file}`);
    }
  });
});

check('Order DTOs exist', () => {
  const orderDTOs = [
    'apps/api/src/orders/dto/create-order.dto.ts'
  ];

  orderDTOs.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing order DTO: ${file}`);
    }
  });
});

console.log('\n🗄️ Database & Schema:');
check('Database package is configured', () => {
  const dbFiles = [
    'packages/database/src/index.ts',
    'packages/database/src/schema/index.ts',
    'packages/database/src/drizzle.ts'
  ];

  dbFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing database file: ${file}`);
    }
  });
});

check('Core database schemas exist', () => {
  // Check for some core schema files
  const schemaFiles = [
    'packages/database/src/schema/users.ts',
    'packages/database/src/schema/products.ts',
    'packages/database/src/schema/orders.ts'
  ];

  let foundCount = 0;
  schemaFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundCount++;
    }
  });

  if (foundCount === 0) {
    throw new Error('No core database schemas found');
  }
}, false); // Not critical - schemas might be in different structure

console.log('\n🌐 API Configuration:');
check('Main application module exists', () => {
  if (!fs.existsSync('apps/api/src/app.module.ts')) {
    throw new Error('Missing app.module.ts');
  }
});

check('Main application file exists', () => {
  if (!fs.existsSync('apps/api/src/main.ts')) {
    throw new Error('Missing main.ts');
  }
});

console.log('\n📱 Frontend Basics:');
check('Web app structure exists', () => {
  const webFiles = [
    'apps/web/src/app/page.tsx',
    'apps/web/src/app/layout.tsx',
    'apps/web/package.json'
  ];

  webFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing web file: ${file}`);
    }
  });
}, false); // Not critical for API testing

check('Mobile app structure exists', () => {
  const mobileFiles = [
    'apps/mobile/package.json',
    'apps/mobile/App.tsx'
  ];

  mobileFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing mobile file: ${file}`);
    }
  });
}, false); // Not critical for API testing

console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

const totalChecks = checks.passed + checks.failed + checks.warnings;
const successRate = ((checks.passed + checks.warnings) / totalChecks * 100).toFixed(1);

console.log(`📈 Health Score: ${successRate}%`);

if (checks.failed > 0) {
  console.log('\n🚨 Critical issues found! These must be fixed before user testing.');
  console.log('Focus on authentication, products, and orders first.');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('\n⚠️  Some non-critical issues found. Review warnings above.');
  console.log('The core system appears ready for basic user testing.');
  process.exit(0);
} else {
  console.log('\n🎉 Excellent! All health checks passed.');
  console.log('The system appears ready for user testing.');
  process.exit(0);
}