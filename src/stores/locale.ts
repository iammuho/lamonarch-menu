import { defineStore } from "pinia"
import { ref } from "vue"
import { getLocale, setLocale } from "@/i18n"
import type { Locale } from "@/types/menu"

export const useLocaleStore = defineStore("locale", () => {
  const locale = ref<Locale>(getLocale())

  function switchTo(next: Locale) {
    locale.value = next
    setLocale(next)
  }

  return { locale, switchTo }
})
