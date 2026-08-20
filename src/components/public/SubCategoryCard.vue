<script setup lang="ts">
import { resolveIcon } from "@/lib/icons"
import type { Category } from "@/types/menu"

defineProps<{ category: Category; active: boolean }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex aspect-[2/1] flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-center transition-colors"
    :class="active ? 'border-gold bg-navy' : 'border-gold/30 bg-navy/40 hover:bg-navy/70'"
    @click="$emit('select')"
  >
    <component :is="resolveIcon(category.icon_key)" :size="20" class="text-gold" />
    <span
      class="text-[11px] font-bold uppercase leading-tight tracking-wide sm:text-xs"
      :class="active ? 'text-cream' : 'text-cream/70'"
    >
      {{ category.name }}
    </span>
  </button>
</template>
