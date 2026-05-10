export type Competitor =
  | "ERPNext"
  | "Odoo"
  | "VietERP"
  | "KiotViet"
  | "Nhanhvn"
  | "MISA";

export type DifferentiationPillar = {
  id: string;
  statement: string;
  beats: readonly Competitor[];
  engineeringImplication: string;
};

export const DIFFERENTIATION_PILLARS: readonly DifferentiationPillar[] = [
  {
    id: "native-everywhere",
    statement:
      "Native web, iOS, Android, desktop, and API surfaces from one product core.",
    beats: ["ERPNext", "Odoo", "VietERP", "KiotViet", "Nhanhvn", "MISA"],
    engineeringImplication:
      "Apps stay thin; reusable rules, types, i18n, validation, and sync live in packages.",
  },
  {
    id: "offline-first",
    statement:
      "Sales and inventory keep working when connectivity is unreliable.",
    beats: ["KiotViet", "Nhanhvn", "MISA", "VietERP"],
    engineeringImplication:
      "POS, orders, products, inventory, customers, purchasing, and payments must queue writes through sync.",
  },
  {
    id: "vietnam-first-localization",
    statement:
      "Vietnamese defaults for currency, tax code, invoices, payments, timezone, and terminology.",
    beats: ["ERPNext", "Odoo"],
    engineeringImplication:
      "Vietnamese is fallback locale; every user-facing string ships in vi and en before merge.",
  },
  {
    id: "tenant-safe-realtime",
    statement: "Realtime collaboration with strict tenant isolation.",
    beats: ["ERPNext", "Odoo", "VietERP"],
    engineeringImplication:
      "Every API query and socket room is scoped by tenantId and never exposes password hashes.",
  },
] as const;
