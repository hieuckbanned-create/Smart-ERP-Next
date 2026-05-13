export type ErpModuleId =
  | "dashboard"
  | "pos"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "suppliers"
  | "purchasing"
  | "payments"
  | "warehouses"
  | "reports"
  | "users"
  | "settings"
  | "accounting"
  | "crm"
  | "hrm";

export type ModuleMaturity = "core" | "growth" | "planned";

export type ErpModuleDefinition = {
  id: ErpModuleId;
  i18nKey: string;
  maturity: ModuleMaturity;
  offlineFirst: boolean;
  realtime: boolean;
  nativeTargets: readonly ("api" | "web" | "mobile" | "desktop")[];
};

export const ERP_MODULES: readonly ErpModuleDefinition[] = [
  {
    id: "dashboard",
    i18nKey: "nav.dashboard",
    maturity: "core",
    offlineFirst: false,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "pos",
    i18nKey: "nav.pos",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "orders",
    i18nKey: "nav.orders",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "products",
    i18nKey: "nav.products",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "inventory",
    i18nKey: "nav.inventory",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "customers",
    i18nKey: "nav.customers",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "suppliers",
    i18nKey: "nav.suppliers",
    maturity: "growth",
    offlineFirst: true,
    realtime: false,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "purchasing",
    i18nKey: "nav.purchasing",
    maturity: "growth",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "payments",
    i18nKey: "nav.payments",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "warehouses",
    i18nKey: "nav.warehouses",
    maturity: "core",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "reports",
    i18nKey: "nav.reports",
    maturity: "growth",
    offlineFirst: false,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "users",
    i18nKey: "nav.users",
    maturity: "core",
    offlineFirst: false,
    realtime: true,
    nativeTargets: ["api", "web", "desktop"],
  },
  {
    id: "settings",
    i18nKey: "nav.settings",
    maturity: "core",
    offlineFirst: false,
    realtime: false,
    nativeTargets: ["web", "desktop"],
  },
  {
    id: "accounting",
    i18nKey: "nav.accounting",
    maturity: "core",
    offlineFirst: false,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "crm",
    i18nKey: "nav.crm",
    maturity: "growth",
    offlineFirst: true,
    realtime: true,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
  {
    id: "hrm",
    i18nKey: "nav.hrm",
    maturity: "planned",
    offlineFirst: false,
    realtime: false,
    nativeTargets: ["api", "web", "mobile", "desktop"],
  },
] as const;

export const getCoreModules = () =>
  ERP_MODULES.filter((module) => module.maturity === "core");

export const getOfflineFirstModules = () =>
  ERP_MODULES.filter((module) => module.offlineFirst);
