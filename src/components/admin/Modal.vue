<script setup lang="ts">
import { X } from "@lucide/vue"

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" @click.self="emit('close')">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-cream p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-display text-xl font-semibold">{{ title }}</h2>
        <button type="button" aria-label="Close" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
