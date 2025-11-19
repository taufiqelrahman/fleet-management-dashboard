import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "id", "ar"] as const;
export type Locale = (typeof locales)[number];

// RTL languages
export const rtlLocales = ["ar"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
