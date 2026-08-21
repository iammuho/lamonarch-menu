import { createI18n } from "vue-i18n"
import en from "./en.json"
import tr from "./tr.json"
import ar from "./ar.json"
import type { Locale } from "@/types/menu"

const STORAGE_KEY = "menu-locale"
const RTL_LOCALES: Locale[] = ["ar"]

function detectBrowserLocale(): Locale {
  const languages = navigator.languages ?? [navigator.language]
  if (languages.some((lang) => lang.toLowerCase().startsWith("ar"))) return "ar"
  if (languages.some((lang) => lang.toLowerCase().startsWith("tr"))) return "tr"
  return "en"
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "tr" || stored === "ar") return stored
  return detectBrowserLocale()
}

export function applyDirection(locale: Locale) {
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr"
  document.documentElement.lang = locale
}

const initialLocale = getInitialLocale()

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "en",
  messages: { en, tr, ar },
})

if (typeof document !== "undefined") applyDirection(initialLocale)

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  applyDirection(locale)
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}
