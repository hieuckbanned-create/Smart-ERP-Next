export type PlatformId = "api" | "web" | "mobile" | "desktop" | "docs";

export type PlatformDefinition = {
  id: PlatformId;
  packageName: string;
  runtime: string;
  nativeSurface: string;
  responsibility: string;
};

export const NATIVE_PLATFORMS: readonly PlatformDefinition[] = [
  {
    id: "api",
    packageName: "@smart-erp/api",
    runtime: "NestJS on Node.js",
    nativeSurface: "HTTP, WebSocket, background jobs",
    responsibility:
      "Tenant-scoped business rules, auth, reporting, and integrations.",
  },
  {
    id: "web",
    packageName: "@smart-erp/web",
    runtime: "Next.js App Router",
    nativeSurface: "Browser PWA",
    responsibility: "Full office ERP, admin workflows, reports, and POS.",
  },
  {
    id: "mobile",
    packageName: "@smart-erp/mobile",
    runtime: "Expo React Native",
    nativeSurface: "iOS and Android",
    responsibility:
      "Field sales, warehouse checks, customer work, offline operations.",
  },
  {
    id: "desktop",
    packageName: "@smart-erp/desktop",
    runtime: "Tauri 2",
    nativeSurface: "Windows, macOS, Linux",
    responsibility:
      "Local-first POS, back-office kiosk, and hardware-adjacent workflows.",
  },
  {
    id: "docs",
    packageName: "@smart-erp/docs",
    runtime: "Docusaurus",
    nativeSurface: "Documentation site",
    responsibility: "Architecture, API, operator, and developer documentation.",
  },
] as const;

export const getPlatform = (id: PlatformId) =>
  NATIVE_PLATFORMS.find((platform) => platform.id === id);
