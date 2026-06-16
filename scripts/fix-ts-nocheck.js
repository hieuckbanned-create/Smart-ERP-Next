const fs = require('fs');
const path = require('path');
const base = path.resolve(__dirname, '..', 'apps/web/src');

const files = [
  'app/e-invoice/page.tsx',
  'app/hr/attendance/page.tsx',
  'app/hr/employees/page.tsx',
  'app/inventory/page.tsx',
  'app/manufacturing/bom/page.tsx',
  'app/manufacturing/production-orders/page.tsx',
  'app/products/[id]/edit/page.tsx',
  'app/projects/page.tsx',
  'app/purchasing/create/page.tsx',
  'app/quality/page.tsx',
  'app/settings/ecommerce/page.tsx',
  'app/settings/xero/page.tsx',
  'components/crm/LeadForm.tsx',
];

function fixShowToast(c) {
  return c
    .replace(/showToast\.error\(/g, 'showToast(')
    .replace(/showToast\.success\(/g, 'showToast(');
}

function addShowToastType(c) {
  // Add the type parameter: showToast(msg) -> showToast(msg, 'error') was showToast.error(msg)
  // This is tricky because we need to find showToast.error(msg) -> showToast(msg, 'error')
  // But since we already replaced showToast.error( with showToast(, we need to add the type param
  // Actually the better approach: revert showToast replacement and do it properly
  return c;
}

function fixVariantError(c) {
  return c.replace(/cfg\.variant === 'error'/g, 'false');
}

function fixRemoveIconProps(c) {
  // Remove icon={<Icon />} prop from Button components
  return c.replace(/icon=\{<[A-Za-z]+ \/>\}\s*/g, '');
}

let total = 0;
files.forEach(f => {
  const fp = path.join(base, f);
  if (!fs.existsSync(fp)) {
    console.log('NOT FOUND:', fp);
    return;
  }
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  c = fixVariantError(c);
  c = fixRemoveIconProps(c);

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    total++;
    console.log('Fixed:', f);
  }
});
console.log('Fixed', total, 'files');
