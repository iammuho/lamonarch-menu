<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { ChevronLeft, ChevronRight } from "@lucide/vue"
import AppHeader from "@/components/layout/AppHeader.vue"
import { useAllergensList } from "@/composables/useAllergensList"
import { resolveIcon } from "@/lib/icons"
import { useLocaleStore } from "@/stores/locale"
import { isRtl } from "@/i18n"

const { allergens, isLoading, error } = useAllergensList()
const { t } = useI18n()
const localeStore = useLocaleStore()
const backIcon = computed(() => (isRtl(localeStore.locale) ? ChevronRight : ChevronLeft))
</script>

<template>
  <div class="min-h-screen bg-cream">
    <AppHeader />

    <main class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <RouterLink :to="{ name: 'home' }" class="mb-6 flex items-center gap-1 text-sm text-ink/60">
        <component :is="backIcon" :size="16" />
        {{ t("home.backToMenu") }}
      </RouterLink>

      <h1 class="mb-6 font-display text-2xl font-semibold">{{ t("allergensPage.title") }}</h1>

      <p v-if="isLoading" class="text-ink/50">Loading…</p>
      <p v-else-if="error" class="text-red-600">{{ error }}</p>
      <p v-else-if="allergens.length === 0" class="text-ink/50">{{ t("allergensPage.empty") }}</p>

      <ul v-else class="flex flex-col divide-y divide-ink/10">
        <li v-for="allergen in allergens" :key="allergen.id" class="flex items-center gap-4 py-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-gold"
          >
            <img
              v-if="allergen.image_url"
              :src="allergen.image_url"
              :alt="allergen.label"
              class="h-full w-full object-cover"
            />
            <component :is="resolveIcon(allergen.icon_key)" v-else :size="18" />
          </span>
          <span class="text-base font-medium">{{ allergen.label }}</span>
        </li>
      </ul>
    </main>
  </div>
</template>
