<script setup lang="ts">
import { ref } from "vue"
import { Upload, Loader2 } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { supabase } from "@/lib/supabase"

const props = defineProps<{ bucket: string }>()
const modelValue = defineModel<string | null>({ default: null })

const { t } = useI18n()
const isUploading = ref(false)
const error = ref("")
const fileInput = ref<HTMLInputElement | null>(null)

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isUploading.value = true
  error.value = ""

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(props.bucket)
    .upload(path, file, { upsert: true })

  if (uploadError) {
    error.value = uploadError.message
  } else {
    const { data } = supabase.storage.from(props.bucket).getPublicUrl(path)
    modelValue.value = data.publicUrl
  }

  isUploading.value = false
  if (fileInput.value) fileInput.value.value = ""
}
</script>

<template>
  <div class="flex items-center gap-3">
    <div
      class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-ink/15 bg-cream-dark"
    >
      <img v-if="modelValue" :src="modelValue" class="h-full w-full object-cover" />
    </div>

    <label
      class="flex cursor-pointer items-center gap-2 rounded border border-ink/20 px-3 py-2 text-sm font-medium hover:bg-cream-dark"
    >
      <Loader2 v-if="isUploading" :size="16" class="animate-spin" />
      <Upload v-else :size="16" />
      {{ isUploading ? t("admin.form.uploading") : t("admin.form.uploadImage") }}
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="isUploading"
        @change="onFileChange"
      />
    </label>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
