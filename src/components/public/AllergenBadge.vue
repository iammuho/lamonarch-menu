<script setup lang="ts">
import { resolveIcon } from "@/lib/icons"
import type { Allergen } from "@/types/menu"

defineProps<{ allergen: Allergen }>()
</script>

<template>
  <span
    :title="allergen.label"
    class="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-gold"
  >
    <component :is="resolveIcon(allergen.icon_key)" :size="14" />
  </span>
</template>
