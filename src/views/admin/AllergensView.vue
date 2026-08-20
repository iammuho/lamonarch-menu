<script setup lang="ts">
import { ref, onMounted } from "vue"
import draggable from "vuedraggable"
import { useI18n } from "vue-i18n"
import { GripVertical, Pencil, Trash2, Plus } from "@lucide/vue"
import { supabase } from "@/lib/supabase"
import { resolveIcon } from "@/lib/icons"
import AllergenFormModal from "@/components/admin/AllergenFormModal.vue"
import type { AllergenRow } from "@/types/db"

interface AdminAllergen extends AllergenRow {
  labelTr: string
}

const { t } = useI18n()
const allergens = ref<AdminAllergen[]>([])
const isLoading = ref(true)
const editingAllergenId = ref<string | null>(null)
const isModalOpen = ref(false)

async function load() {
  isLoading.value = true
  const [{ data: rows }, { data: translations }] = await Promise.all([
    supabase.from("allergens").select("*").order("sort_order"),
    supabase.from("allergen_translations").select("allergen_id, label").eq("locale", "tr"),
  ])

  const labelById = new Map(translations?.map((row) => [row.allergen_id, row.label]))
  allergens.value = ((rows as AllergenRow[]) ?? []).map((row) => ({
    ...row,
    labelTr: labelById.get(row.id) ?? "",
  }))
  isLoading.value = false
}

onMounted(load)

function openCreate() {
  editingAllergenId.value = null
  isModalOpen.value = true
}

function openEdit(id: string) {
  editingAllergenId.value = id
  isModalOpen.value = true
}

async function onReorder() {
  await Promise.all(
    allergens.value.map((allergen, index) =>
      supabase.from("allergens").update({ sort_order: index }).eq("id", allergen.id),
    ),
  )
}

async function remove(id: string) {
  await supabase.from("allergens").delete().eq("id", id)
  await load()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="font-display text-2xl font-semibold">{{ t("admin.allergens.title") }}</h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-semibold text-cream"
        @click="openCreate"
      >
        <Plus :size="16" />
        {{ t("admin.allergens.add") }}
      </button>
    </div>

    <p v-if="isLoading" class="text-ink/50">Loading…</p>
    <p v-else-if="allergens.length === 0" class="text-ink/50">{{ t("admin.allergens.empty") }}</p>

    <draggable
      v-else
      v-model="allergens"
      item-key="id"
      handle=".drag-handle"
      class="flex flex-col gap-2"
      @end="onReorder"
    >
      <template #item="{ element }: { element: AdminAllergen }">
        <div class="flex items-center gap-3 rounded border border-ink/10 bg-cream px-4 py-3">
          <GripVertical :size="18" class="drag-handle cursor-grab text-ink/30" />
          <component :is="resolveIcon(element.icon_key)" :size="18" class="text-gold" />
          <span class="flex-1 text-sm font-medium">{{ element.labelTr }}</span>
          <button
            type="button"
            class="rounded p-2 text-ink/60 hover:bg-cream-dark"
            @click="openEdit(element.id)"
          >
            <Pencil :size="16" />
          </button>
          <button
            type="button"
            class="rounded p-2 text-red-600 hover:bg-red-50"
            @click="remove(element.id)"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </template>
    </draggable>

    <AllergenFormModal
      v-if="isModalOpen"
      :allergen-id="editingAllergenId"
      @close="isModalOpen = false"
      @saved="load"
    />
  </div>
</template>
