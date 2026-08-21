<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { supabase } from "@/lib/supabase"
import { resolveIcon } from "@/lib/icons"
import Modal from "./Modal.vue"
import ImageUploader from "./ImageUploader.vue"
import type { AllergenRow, AllergenTranslationRow } from "@/types/db"

const props = defineProps<{ categoryId: string; itemId: string | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { t } = useI18n()

const imageUrl = ref<string | null>(null)
const price = ref<number>(0)
const isActive = ref(true)
const nameEn = ref("")
const nameTr = ref("")
const nameAr = ref("")
const descriptionEn = ref("")
const descriptionTr = ref("")
const descriptionAr = ref("")
const selectedAllergenIds = ref<Set<string>>(new Set())
const isSaving = ref(false)
const error = ref("")

const allAllergens = ref<{ id: string; icon_key: string; image_url: string | null; label: string }[]>([])

onMounted(async () => {
  const [{ data: allergenRows }, { data: allergenTranslations }] = await Promise.all([
    supabase.from("allergens").select("*").order("sort_order"),
    supabase.from("allergen_translations").select("*").eq("locale", "tr"),
  ])
  const labelById = new Map(
    (allergenTranslations as AllergenTranslationRow[] | null)?.map((row) => [
      row.allergen_id,
      row.label,
    ]),
  )
  allAllergens.value = ((allergenRows as AllergenRow[]) ?? []).map((row) => ({
    id: row.id,
    icon_key: row.icon_key,
    image_url: row.image_url,
    label: labelById.get(row.id) ?? row.icon_key,
  }))

  if (!props.itemId) return

  const [{ data: item }, { data: translations }, { data: links }] = await Promise.all([
    supabase.from("menu_items").select("*").eq("id", props.itemId).single(),
    supabase.from("menu_item_translations").select("*").eq("menu_item_id", props.itemId),
    supabase.from("menu_item_allergens").select("allergen_id").eq("menu_item_id", props.itemId),
  ])

  if (item) {
    imageUrl.value = item.image_url
    price.value = item.price
    isActive.value = item.is_active
  }
  if (translations) {
    nameEn.value = translations.find((row) => row.locale === "en")?.name ?? ""
    nameTr.value = translations.find((row) => row.locale === "tr")?.name ?? ""
    nameAr.value = translations.find((row) => row.locale === "ar")?.name ?? ""
    descriptionEn.value = translations.find((row) => row.locale === "en")?.description ?? ""
    descriptionTr.value = translations.find((row) => row.locale === "tr")?.description ?? ""
    descriptionAr.value = translations.find((row) => row.locale === "ar")?.description ?? ""
  }
  if (links) {
    selectedAllergenIds.value = new Set(links.map((row) => row.allergen_id))
  }
})

function toggleAllergen(id: string) {
  if (selectedAllergenIds.value.has(id)) selectedAllergenIds.value.delete(id)
  else selectedAllergenIds.value.add(id)
}

async function onSubmit() {
  error.value = ""
  isSaving.value = true

  try {
    let itemId = props.itemId

    if (itemId) {
      const { error: updateError } = await supabase
        .from("menu_items")
        .update({ image_url: imageUrl.value, price: price.value, is_active: isActive.value })
        .eq("id", itemId)
      if (updateError) throw updateError
    } else {
      const { data: maxRow } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", props.categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()
      const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

      const { data: inserted, error: insertError } = await supabase
        .from("menu_items")
        .insert({
          category_id: props.categoryId,
          image_url: imageUrl.value,
          price: price.value,
          is_active: isActive.value,
          sort_order: nextSortOrder,
        })
        .select("id")
        .single()
      if (insertError) throw insertError
      itemId = inserted.id
    }

    const { error: translationError } = await supabase.from("menu_item_translations").upsert(
      [
        {
          menu_item_id: itemId,
          locale: "en",
          name: nameEn.value,
          description: descriptionEn.value || null,
        },
        {
          menu_item_id: itemId,
          locale: "tr",
          name: nameTr.value,
          description: descriptionTr.value || null,
        },
        {
          menu_item_id: itemId,
          locale: "ar",
          name: nameAr.value,
          description: descriptionAr.value || null,
        },
      ],
      { onConflict: "menu_item_id,locale" },
    )
    if (translationError) throw translationError

    await supabase.from("menu_item_allergens").delete().eq("menu_item_id", itemId)
    if (selectedAllergenIds.value.size > 0) {
      const { error: linkError } = await supabase.from("menu_item_allergens").insert(
        Array.from(selectedAllergenIds.value).map((allergenId) => ({
          menu_item_id: itemId,
          allergen_id: allergenId,
        })),
      )
      if (linkError) throw linkError
    }

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
  <Modal :title="itemId ? t('admin.items.edit') : t('admin.items.add')" @close="emit('close')">
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
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.descriptionEn") }}
        <textarea v-model="descriptionEn" rows="2" class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.descriptionTr") }}
        <textarea v-model="descriptionTr" rows="2" class="rounded border border-ink/20 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.descriptionAr") }}
        <textarea
          v-model="descriptionAr"
          rows="2"
          dir="rtl"
          class="rounded border border-ink/20 px-3 py-2 text-sm"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.items.price") }}
        <input
          v-model.number="price"
          type="number"
          step="0.01"
          min="0"
          required
          class="rounded border border-ink/20 px-3 py-2 text-sm"
        />
      </label>

      <div class="flex flex-col gap-1 text-sm font-medium">
        {{ t("admin.form.image") }}
        <ImageUploader v-model="imageUrl" bucket="menu-item-images" />
      </div>

      <div class="flex flex-col gap-2 text-sm font-medium">
        {{ t("admin.items.allergens") }}
        <div class="flex flex-wrap gap-2">
          <button
            v-for="allergen in allAllergens"
            :key="allergen.id"
            type="button"
            class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
            :class="
              selectedAllergenIds.has(allergen.id)
                ? 'border-navy bg-navy text-cream'
                : 'border-ink/20 text-ink/70 hover:bg-cream-dark'
            "
            @click="toggleAllergen(allergen.id)"
          >
            <span
              v-if="allergen.image_url"
              class="h-3.5 w-3.5 overflow-hidden rounded-full bg-ink/10"
            >
              <img :src="allergen.image_url" :alt="allergen.label" class="h-full w-full object-cover" />
            </span>
            <component :is="resolveIcon(allergen.icon_key)" v-else :size="14" />
            {{ allergen.label }}
          </button>
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm font-medium">
        <input v-model="isActive" type="checkbox" />
        {{ t("admin.items.active") }}
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
