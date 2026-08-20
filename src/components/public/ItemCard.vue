<script setup lang="ts">
import AllergenBadge from "./AllergenBadge.vue"
import { formatPrice } from "@/lib/format"
import type { MenuItem } from "@/types/menu"

defineProps<{ item: MenuItem; currency: string }>()
</script>

<template>
  <article class="flex flex-col gap-3">
    <div class="aspect-[4/3] overflow-hidden rounded-sm bg-cream-dark">
      <img
        v-if="item.image_url"
        :src="item.image_url"
        :alt="item.name"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="flex items-start justify-between gap-3">
      <h3 class="text-sm font-bold uppercase tracking-wide text-ink">
        {{ item.name }}
      </h3>
      <span class="shrink-0 text-sm font-semibold text-gold">
        {{ formatPrice(item.price, currency) }}
      </span>
    </div>

    <div v-if="item.allergens.length" class="flex flex-wrap gap-1.5">
      <AllergenBadge v-for="allergen in item.allergens" :key="allergen.id" :allergen="allergen" />
    </div>

    <p v-if="item.description" class="text-sm leading-relaxed text-ink/60">
      {{ item.description }}
    </p>
  </article>
</template>
