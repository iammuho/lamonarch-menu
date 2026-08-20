<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const email = ref("")
const password = ref("")
const error = ref("")
const isSubmitting = ref(false)

async function onSubmit() {
  error.value = ""
  isSubmitting.value = true
  try {
    await auth.signIn(email.value, password.value)
    const redirect = (route.query.redirect as string) || { name: "admin-categories" }
    router.push(redirect)
  } catch {
    error.value = t("admin.login.error")
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-cream-dark px-4">
    <form
      class="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-cream p-8 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <h1 class="font-display text-2xl font-semibold">{{ $t("admin.login.title") }}</h1>

      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ $t("admin.login.email") }}
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="rounded border border-ink/20 px-3 py-2 text-sm focus:border-navy focus:outline-none"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ $t("admin.login.password") }}
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="rounded border border-ink/20 px-3 py-2 text-sm focus:border-navy focus:outline-none"
        />
      </label>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="mt-2 rounded bg-navy px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {{ $t("admin.login.submit") }}
      </button>
    </form>
  </div>
</template>
