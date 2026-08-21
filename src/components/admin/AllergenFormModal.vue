<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { supabase } from "@/lib/supabase"
import Modal from "./Modal.vue"
import IconPicker from "./IconPicker.vue"
import ImageUploader from "./ImageUploader.vue"

const props = defineProps<{ allergenId: string | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()

const iconKey = ref("wheat")
const imageUrl = ref<string | null>(null)
const labelEn = ref("")
const labelTr = ref("")
const labelAr = ref("")
const isSaving = ref(false)
const error = ref("")

onMounted(async () => {
  if (!props.allergenId) return

  const [{ data: allergen }, { data: translations }] = await Promise.all([
    supabase.from("allergens").select("icon_key, image_url").eq("id", props.allergenId).single(),
    supabase.from("allergen_translations").select("locale, label").eq("allergen_id", props.allergenId),
  ])

  if (allergen) {
    iconKey.value = allergen.icon_key
    imageUrl.value = allergen.image_url
  }
  if (translations) {
    labelEn.value = translations.find((row) => row.locale === "en")?.label ?? ""
    labelTr.value = translations.find((row) => row.locale === "tr")?.label ?? ""
    labelAr.value = translations.find((row) => row.locale === "ar")?.label ?? ""
  }
})

async function onSubmit() {
  error.value = ""
  isSaving.value = true

  try {
    let allergenId = props.allergenId

    if (allergenId) {
      const { error: updateError } = await supabase
        .from("allergens")
        .update({ icon_key: iconKey.value, image_url: imageUrl.value })
        .eq("id", allergenId)
      if (updateError) throw updateError
    } else {
      const { data: maxRow } = await supabase
        .from("allergens")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()
      const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

      const { data: inserted, error: insertError } = await supabase
        .from("allergens")
        .insert({ icon_key: iconKey.value, image_url: imageUrl.value, sort_order: nextSortOrder })
        .select("id")
        .single()
      if (insertError) throw insertError
      allergenId = inserted.id
    }

    const { error: translationError } = await supabase.from("allergen_translations").upsert(
      [
        { allergen_id: allergenId, locale: "en", label: labelEn.value },
        { allergen_id: allergenId, locale: "tr", label: labelTr.value },
        { allergen_id: allergenId, locale: "ar", label: labelAr.value },
      ],
      { onConflict: "allergen_id,locale" },
    )
    if (translationError) throw translationError

    emit("saved")
    emit("close")
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Modal :title="allergenId ? t('admin.allergens.edit') : t('admin.allergens.add')" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameEn") }}
        <input v-model="labelEn" required class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameTr") }}
        <input v-model="labelTr" required class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameAr") }}
        <input
          v-model="labelAr"
          required
          dir="rtl"
          class="rounded border border-ink/20 px-3 py-2 text-sm"
        />
      </label>

      <div class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.icon") }}
        <IconPicker v-model="iconKey" />
      </div>

      <div class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.image") }}
        <ImageUploader v-model="imageUrl" bucket="allergen-images" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="mt-2 flex justify-end gap-2">
        <button type="button" class="rounded px-4 py-2 text-sm font-medium" @click="emit('close')">
          {{ t("admin.form.cancel") }}
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="rounded bg-navy px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
        >
          {{ t("admin.form.save") }}
        </button>
      </div>
    </form>
  </Modal>
</template>
