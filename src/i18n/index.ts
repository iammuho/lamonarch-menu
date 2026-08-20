import { createI18n } from "vue-i18n"
import en from "./en.json"
import tr from "./tr.json"
import type { Locale } from "@/types/menu"

const STORAGE_KEY = "menu-locale"

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "tr") return stored
  return "en"
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en",
  messages: { en, tr },
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale
}
