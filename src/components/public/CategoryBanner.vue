<script setup lang="ts">
import { ChevronRight } from "@lucide/vue"
import type { Category } from "@/types/menu"

defineProps<{ category: Category }>()
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
      <div class="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent" />
    </div>

    <ChevronRight
      :size="24"
      class="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-gold sm:right-6"
    />
  </RouterLink>
</template>
