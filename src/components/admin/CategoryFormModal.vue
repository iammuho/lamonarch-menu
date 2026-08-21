<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { supabase } from "@/lib/supabase"
import Modal from "./Modal.vue"
import IconPicker from "./IconPicker.vue"
import ImageUploader from "./ImageUploader.vue"

const props = defineProps<{ categoryId: string | null; parentId: string | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()

const slug = ref("")
const iconKey = ref("utensils")
const imageUrl = ref<string | null>(null)
const isActive = ref(true)
const nameEn = ref("")
const nameTr = ref("")
const nameAr = ref("")
const isSaving = ref(false)
const error = ref("")

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

onMounted(async () => {
  if (!props.categoryId) return

  const [{ data: category }, { data: translations }] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, icon_key, image_url, is_active")
      .eq("id", props.categoryId)
      .single(),
    supabase
      .from("category_translations")
      .select("locale, name")
      .eq("category_id", props.categoryId),
  ])

  if (category) {
    slug.value = category.slug
    iconKey.value = category.icon_key
    imageUrl.value = category.image_url
    isActive.value = category.is_active
  }
  if (translations) {
    nameEn.value = translations.find((row) => row.locale === "en")?.name ?? ""
    nameTr.value = translations.find((row) => row.locale === "tr")?.name ?? ""
    nameAr.value = translations.find((row) => row.locale === "ar")?.name ?? ""
  }
})

async function onSubmit() {
  error.value = ""
  if (!slug.value) slug.value = slugify(nameEn.value)
  isSaving.value = true

  try {
    let categoryId = props.categoryId

    if (categoryId) {
      const { error: updateError } = await supabase
        .from("categories")
        .update({
          slug: slug.value,
          icon_key: iconKey.value,
          image_url: imageUrl.value,
          is_active: isActive.value,
        })
        .eq("id", categoryId)
      if (updateError) throw updateError
    } else {
      let sortOrderQuery = supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
      sortOrderQuery = props.parentId
        ? sortOrderQuery.eq("parent_id", props.parentId)
        : sortOrderQuery.is("parent_id", null)
      const { data: maxRow } = await sortOrderQuery.maybeSingle()
      const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

      const { data: inserted, error: insertError } = await supabase
        .from("categories")
        .insert({
          slug: slug.value,
          icon_key: iconKey.value,
          image_url: imageUrl.value,
          is_active: isActive.value,
          sort_order: nextSortOrder,
          parent_id: props.parentId,
        })
        .select("id")
        .single()
      if (insertError) throw insertError
      categoryId = inserted.id
    }

    const { error: translationError } = await supabase
      .from("category_translations")
      .upsert(
        [
          { category_id: categoryId, locale: "en", name: nameEn.value },
          { category_id: categoryId, locale: "tr", name: nameTr.value },
          { category_id: categoryId, locale: "ar", name: nameAr.value },
        ],
        { onConflict: "category_id,locale" },
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
  <Modal :title="categoryId ? t('admin.categories.edit') : t('admin.categories.add')" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameEn") }}
        <input v-model="nameEn" required class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameTr") }}
        <input v-model="nameTr" required class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.nameAr") }}
        <input
          v-model="nameAr"
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
        <ImageUploader v-model="imageUrl" bucket="category-images" />
      </div>

      <label class="flex items-center gap-2 text-sm font-medium">
        <input v-model="isActive" type="checkbox" />
        {{ t("admin.categories.active") }}
      </label>

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
