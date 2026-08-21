<script setup lang="ts">
import { computed, ref } from "vue"
import { ChevronDown } from "@lucide/vue"
import { useLocaleStore } from "@/stores/locale"
import type { Locale } from "@/types/menu"

const props = defineProps<{ variant?: "header" | "bar" }>()

const localeStore = useLocaleStore()
const isOpen = ref(false)

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
]

const current = computed(
  () => LANGUAGES.find((lang) => lang.code === localeStore.locale) ?? LANGUAGES[0],
)

function select(code: Locale) {
  localeStore.switchTo(code)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-widest sm:text-sm"
      :class="props.variant === 'bar' ? 'text-gold hover:text-cream' : 'text-gold hover:text-ink'"
      @click="isOpen = !isOpen"
    >
      <span class="text-base leading-none">{{ current.flag }}</span>
      <span>{{ current.label }}</span>
      <ChevronDown :size="14" :class="isOpen ? 'rotate-180' : ''" class="transition-transform" />
    </button>

    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />

    <div
      v-if="isOpen"
      class="absolute end-0 top-full z-50 mt-2 flex w-40 flex-col overflow-hidden rounded-md border border-gold/40 bg-cream shadow-lg"
    >
      <button
        v-for="lang in LANGUAGES"
        :key="lang.code"
        type="button"
        class="flex items-center gap-2 px-3 py-2 text-left text-sm font-medium"
        :class="
          lang.code === localeStore.locale
            ? 'bg-navy text-cream'
            : 'text-ink hover:bg-cream-dark'
        "
        @click="select(lang.code)"
      >
        <span class="text-base leading-none">{{ lang.flag }}</span>
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>
