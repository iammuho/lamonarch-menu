<script setup lang="ts">
import { computed } from "vue"
import { ChevronLeft, ChevronRight } from "@lucide/vue"
import type { Category } from "@/types/menu"
import { useLocaleStore } from "@/stores/locale"
import { isRtl } from "@/i18n"

defineProps<{ category: Category }>()

const localeStore = useLocaleStore()
const rtl = computed(() => isRtl(localeStore.locale))
</script>

<template>
  <RouterLink
    :to="{ name: 'category', params: { slug: category.slug } }"
    class="group relative flex h-[140px] overflow-hidden sm:h-[150px]"
  >
    <div
      class="relative z-10 flex w-[42%] shrink-0 items-center bg-navy px-4 sm:w-[38%] sm:px-6"
    >
      <span class="text-base font-bold uppercase leading-tight tracking-wide text-cream sm:text-lg">
        {{ category.name }}
      </span>
    </div>

    <div class="relative flex-1">
      <img
        v-if="category.image_url"
        :src="category.image_url"
        :alt="category.name"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="absolute inset-0 bg-navy" />
      <div
        class="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent"
        :class="rtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'"
      />
    </div>

    <component
      :is="rtl ? ChevronLeft : ChevronRight"
      :size="24"
      class="absolute top-1/2 z-20 -translate-y-1/2 text-gold"
      :class="rtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'"
    />
  </RouterLink>
</template>
