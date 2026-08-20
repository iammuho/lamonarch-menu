<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { supabase } from "@/lib/supabase"
import ImageUploader from "@/components/admin/ImageUploader.vue"

const { t } = useI18n()

const name = ref("")
const subtitle = ref("")
const logoUrl = ref<string | null>(null)
const currency = ref("TRY")
const isSaving = ref(false)
const savedMessage = ref("")

onMounted(async () => {
  const { data } = await supabase
    .from("restaurant_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle()

  if (data) {
    name.value = data.name
    subtitle.value = data.subtitle ?? ""
    logoUrl.value = data.logo_url
    currency.value = data.currency
  }
})

async function onSubmit() {
  isSaving.value = true
  savedMessage.value = ""

  await supabase.from("restaurant_settings").upsert({
    id: 1,
    name: name.value,
    subtitle: subtitle.value || null,
    logo_url: logoUrl.value,
    currency: currency.value,
  })

  isSaving.value = false
  savedMessage.value = t("admin.settings.saved")
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="font-display text-2xl font-semibold">{{ t("admin.settings.title") }}</h1>

    <form class="flex max-w-md flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.settings.name") }}
        <input v-model="name" required class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>

      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.settings.subtitle") }}
        <input v-model="subtitle" class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>

      <div class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.settings.logo") }}
        <ImageUploader v-model="logoUrl" bucket="branding" />
      </div>

      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.settings.currency") }}
        <select v-model="currency" class="rounded border border-ink/20 px-3 py-2 text-sm">
          <option value="TRY">₺ TRY</option>
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="GBP">£ GBP</option>
        </select>
      </label>

      <p v-if="savedMessage" class="text-sm text-green-700">{{ savedMessage }}</p>

      <button
        type="submit"
        :disabled="isSaving"
        class="mt-2 self-start rounded bg-navy px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {{ t("admin.settings.save") }}
      </button>
    </form>
  </div>
</template>
