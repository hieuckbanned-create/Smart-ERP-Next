export const SUPPORTED_LOCALES = ["vi", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizationProfile = {
  locale: SupportedLocale;
  label: string;
  defaultCurrency: "VND" | "USD";
  timezone: string;
  dateFormat: string;
  numberLocale: string;
  taxCodeLabel: string;
  invoiceStandard: string;
  paymentMethods: readonly string[];
};

export const DEFAULT_LOCALE: SupportedLocale = "vi";

export const LOCALIZATION_PROFILES: Record<
  SupportedLocale,
  LocalizationProfile
> = {
  vi: {
    locale: "vi",
    label: "Tiếng Việt",
    defaultCurrency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/MM/yyyy",
    numberLocale: "vi-VN",
    taxCodeLabel: "Mã số thuế",
    invoiceStandard: "Hóa đơn điện tử Việt Nam",
    paymentMethods: [
      "cash",
      "bank_transfer",
      "momo",
      "vnpay",
      "zalopay",
      "credit",
    ],
  },
  en: {
    locale: "en",
    label: "English",
    defaultCurrency: "USD",
    timezone: "UTC",
    dateFormat: "MM/dd/yyyy",
    numberLocale: "en-US",
    taxCodeLabel: "Tax code",
    invoiceStandard: "Electronic invoice",
    paymentMethods: ["cash", "bank_transfer", "card", "credit"],
  },
} as const;

export const getLocalizationProfile = (
  locale: SupportedLocale = DEFAULT_LOCALE,
) => LOCALIZATION_PROFILES[locale];
