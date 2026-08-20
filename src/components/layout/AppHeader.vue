<script setup lang="ts">
import { Crown } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { useRestaurantSettings } from "@/composables/useRestaurantSettings"
import { useLocaleStore } from "@/stores/locale"

const { settings } = useRestaurantSettings()
const localeStore = useLocaleStore()
const { t } = useI18n()

function toggleLocale() {
  localeStore.switchTo(localeStore.locale === "tr" ? "en" : "tr")
}
</script>

<template>
  <header class="border-b-2 border-gold bg-gradient-to-b from-cream-dark to-cream">
    <div
      class="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-start gap-3 px-4 py-6 sm:px-6"
    >
      <div />

      <div class="flex flex-col items-center gap-1 justify-self-center">
        <img
          v-if="settings?.logo_url"
          :src="settings.logo_url"
          :alt="settings?.name ?? 'Logo'"
          class="h-16 w-auto object-contain sm:h-20"
        />
        <Crown v-else :size="36" class="text-gold" />
        <h1
          class="font-display text-2xl font-bold uppercase tracking-wide text-gold sm:text-4xl"
        >
          {{ settings?.name ?? "" }}
        </h1>
        <div v-if="settings?.subtitle" class="flex items-center gap-2 text-gold">
          <span class="h-px w-6 bg-gold" />
          <span class="text-xs font-medium tracking-[0.3em]">{{
            settings.subtitle
          }}</span>
          <span class="h-px w-6 bg-gold" />
        </div>
      </div>

      <nav
        class="flex items-center justify-end gap-3 justify-self-end pt-2 text-[10px] font-semibold uppercase tracking-widest text-gold sm:gap-6 sm:text-sm"
      >
        <RouterLink :to="{ name: 'allergens' }" class="hover:text-ink">
          {{ t("nav.allergensLink") }}
        </RouterLink>
        <button type="button" class="cursor-pointer hover:text-ink" @click="toggleLocale">
          {{ localeStore.locale === "tr" ? "ENGLISH" : "TÜRKÇE" }}
        </button>
      </nav>
    </div>
  </header>
</template>
