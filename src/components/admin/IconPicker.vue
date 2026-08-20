<script setup lang="ts">
import { ICON_OPTIONS, resolveIcon } from "@/lib/icons"

const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="key in ICON_OPTIONS"
      :key="key"
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded border"
      :class="
        modelValue === key
          ? 'border-navy bg-navy text-cream'
          : 'border-ink/15 text-ink/70 hover:bg-cream-dark'
      "
      :title="key"
      @click="modelValue = key"
    >
      <component :is="resolveIcon(key)" :size="16" />
    </button>
  </div>
</template>
