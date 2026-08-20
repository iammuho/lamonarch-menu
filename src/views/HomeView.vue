<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue"
import CategoryBanner from "@/components/public/CategoryBanner.vue"
import { useCategories } from "@/composables/useCategories"

const { categories, isLoading, error } = useCategories()
</script>

<template>
  <div class="min-h-screen bg-cream">
    <AppHeader />

    <main class="mx-auto max-w-5xl px-3 py-3 sm:px-4">
      <p v-if="isLoading" class="py-16 text-center text-ink/50">Loading…</p>
      <p v-else-if="error" class="py-16 text-center text-red-600">{{ error }}</p>
      <div v-else class="flex flex-col gap-1.5">
        <CategoryBanner v-for="category in categories" :key="category.id" :category="category" />
      </div>
    </main>
  </div>
</template>
