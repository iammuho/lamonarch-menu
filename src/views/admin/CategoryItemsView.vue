<script setup lang="ts">
import { ref, onMounted } from "vue"
import draggable from "vuedraggable"
import { useI18n } from "vue-i18n"
import { GripVertical, Pencil, Trash2, Plus, ChevronLeft } from "@lucide/vue"
import { supabase } from "@/lib/supabase"
import ItemFormModal from "@/components/admin/ItemFormModal.vue"
import { formatPrice } from "@/lib/format"
import { useRestaurantSettings } from "@/composables/useRestaurantSettings"
import type { MenuItemRow } from "@/types/db"

const props = defineProps<{ categoryId: string }>()
const { t } = useI18n()
const { settings } = useRestaurantSettings()

interface AdminItem extends MenuItemRow {
  nameTr: string
}

const categoryName = ref("")
const items = ref<AdminItem[]>([])
const isLoading = ref(true)
const editingItemId = ref<string | null>(null)
const isModalOpen = ref(false)

async function load() {
  isLoading.value = true
  const [{ data: category }, { data: rows }, { data: translations }] = await Promise.all([
    supabase
      .from("category_translations")
      .select("name")
      .eq("category_id", props.categoryId)
      .eq("locale", "tr")
      .maybeSingle(),
    supabase.from("menu_items").select("*").eq("category_id", props.categoryId).order("sort_order"),
    supabase.from("menu_item_translations").select("menu_item_id, name").eq("locale", "tr"),
  ])

  categoryName.value = category?.name ?? ""

  const nameByItem = new Map(translations?.map((row) => [row.menu_item_id, row.name]))
  items.value = ((rows as MenuItemRow[]) ?? []).map((row) => ({
    ...row,
    nameTr: nameByItem.get(row.id) ?? "",
  }))
  isLoading.value = false
}

onMounted(load)

function openCreate() {
  editingItemId.value = null
  isModalOpen.value = true
}

function openEdit(id: string) {
  editingItemId.value = id
  isModalOpen.value = true
}

async function onReorder() {
  await Promise.all(
    items.value.map((item, index) =>
      supabase.from("menu_items").update({ sort_order: index }).eq("id", item.id),
    ),
  )
}

async function remove(id: string) {
  if (!confirm(t("admin.items.deleteConfirm"))) return
  await supabase.from("menu_items").delete().eq("id", id)
  await load()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink :to="{ name: 'admin-categories' }" class="flex items-center gap-1 text-sm text-ink/60">
      <ChevronLeft :size="16" />
      {{ t("admin.items.backToCategories") }}
    </RouterLink>

    <div class="flex items-center justify-between">
      <h1 class="font-display text-2xl font-semibold">
        {{ t("admin.items.title") }} — {{ categoryName }}
      </h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-semibold text-cream"
        @click="openCreate"
      >
        <Plus :size="16" />
        {{ t("admin.items.add") }}
      </button>
    </div>

    <p v-if="isLoading" class="text-ink/50">Loading…</p>
    <p v-else-if="items.length === 0" class="text-ink/50">{{ t("admin.items.empty") }}</p>

    <draggable
      v-else
      v-model="items"
      item-key="id"
      handle=".drag-handle"
      class="flex flex-col gap-2"
      @end="onReorder"
    >
      <template #item="{ element }: { element: AdminItem }">
        <div class="flex items-center gap-3 rounded border border-ink/10 bg-cream px-4 py-3">
          <GripVertical :size="18" class="drag-handle cursor-grab text-ink/30" />
          <img
            v-if="element.image_url"
            :src="element.image_url"
            class="h-10 w-10 shrink-0 rounded object-cover"
          />
          <span class="flex-1 text-sm font-medium">{{ element.nameTr }}</span>
          <span class="text-sm font-semibold text-gold">{{
            formatPrice(element.price, settings?.currency ?? "TRY")
          }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            :class="element.is_active ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'"
          >
            {{ element.is_active ? t("admin.items.active") : t("admin.items.inactive") }}
          </span>
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

    <ItemFormModal
      v-if="isModalOpen"
      :category-id="categoryId"
      :item-id="editingItemId"
      @close="isModalOpen = false"
      @saved="load"
    />
  </div>
</template>
