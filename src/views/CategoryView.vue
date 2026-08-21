<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue"
import { ChevronLeft, ChevronRight } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import ItemCard from "@/components/public/ItemCard.vue"
import SubCategoryCard from "@/components/public/SubCategoryCard.vue"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher.vue"
import { useCategoryPage } from "@/composables/useCategoryPage"
import { useItemsByCategoryId } from "@/composables/useItemsByCategoryId"
import { useRestaurantSettings } from "@/composables/useRestaurantSettings"
import { useLocaleStore } from "@/stores/locale"
import { isRtl } from "@/i18n"

const props = defineProps<{ slug: string }>()
const { t } = useI18n()
const localeStore = useLocaleStore()

const { category, subCategories, items, isLoading, error } = useCategoryPage(toRef(props, "slug"))
const { settings } = useRestaurantSettings()
const currency = computed(() => settings.value?.currency ?? "TRY")

// In RTL, "back" conventionally points the other way.
const backIcon = computed(() => (isRtl(localeStore.locale) ? ChevronRight : ChevronLeft))

// When the category is a "hub" (has sub-categories), the first one is shown
// by default and switching between them happens in place, as tabs — no navigation.
const activeSubCategoryId = ref<string | null>(null)
watch(
  subCategories,
  (subs) => {
    if (subs.length > 0 && !subs.some((s) => s.id === activeSubCategoryId.value)) {
      activeSubCategoryId.value = subs[0].id
    }
  },
  { immediate: true },
)

const {
  items: subCategoryItems,
  isLoading: isLoadingSubItems,
  error: subItemsError,
} = useItemsByCategoryId(activeSubCategoryId)
</script>

<template>
  <div class="min-h-screen bg-cream">
    <header class="relative flex h-28 items-center overflow-hidden border-b-2 border-gold bg-navy">
      <img
        v-if="category?.image_url"
        :src="category.image_url"
        :alt="category?.name"
        class="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-navy via-navy/60 to-transparent" />
      <div class="relative z-10 mx-auto flex w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <RouterLink :to="{ name: 'home' }" class="text-gold" :aria-label="t('home.backToMenu')">
          <component :is="backIcon" :size="24" />
        </RouterLink>
        <h1 class="flex-1 text-2xl font-bold uppercase tracking-widest text-cream">
          {{ category?.name }}
        </h1>
        <LanguageSwitcher variant="bar" />
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p v-if="isLoading" class="py-16 text-center text-ink/50">Loading…</p>
      <p v-else-if="error" class="py-16 text-center text-red-600">{{ error }}</p>

      <template v-else-if="subCategories.length > 0">
        <div class="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <SubCategoryCard
            v-for="sub in subCategories"
            :key="sub.id"
            :category="sub"
            :active="sub.id === activeSubCategoryId"
            @select="activeSubCategoryId = sub.id"
          />
        </div>

        <p v-if="isLoadingSubItems" class="py-16 text-center text-ink/50">Loading…</p>
        <p v-else-if="subItemsError" class="py-16 text-center text-red-600">{{ subItemsError }}</p>
        <p v-else-if="subCategoryItems.length === 0" class="py-16 text-center text-ink/50">
          {{ t("category.empty") }}
        </p>
        <div v-else class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          <ItemCard
            v-for="item in subCategoryItems"
            :key="item.id"
            :item="item"
            :currency="currency"
          />
        </div>
      </template>

      <p v-else-if="items.length === 0" class="py-16 text-center text-ink/50">
        {{ t("category.empty") }}
      </p>
      <div v-else class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        <ItemCard v-for="item in items" :key="item.id" :item="item" :currency="currency" />
      </div>
    </main>
  </div>
</template>
