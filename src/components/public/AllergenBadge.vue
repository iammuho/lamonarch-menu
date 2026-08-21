<script setup lang="ts">
import { resolveIcon } from "@/lib/icons"
import type { Allergen } from "@/types/menu"

defineProps<{ allergen: Allergen }>()
</script>

<template>
  <span
    :title="allergen.label"
    class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink text-gold"
  >
    <img
      v-if="allergen.image_url"
      :src="allergen.image_url"
      :alt="allergen.label"
      class="h-full w-full object-cover"
    />
    <component :is="resolveIcon(allergen.icon_key)" v-else :size="14" />
  </span>
</template>
