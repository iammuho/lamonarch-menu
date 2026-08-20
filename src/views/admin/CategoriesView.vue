<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import draggable from "vuedraggable"
import { useI18n } from "vue-i18n"
import { GripVertical, Pencil, Trash2, Plus, ListOrdered, LayoutGrid, ChevronLeft } from "@lucide/vue"
import { supabase } from "@/lib/supabase"
import { resolveIcon } from "@/lib/icons"
import CategoryFormModal from "@/components/admin/CategoryFormModal.vue"
import type { CategoryRow, CategoryTranslationRow } from "@/types/db"

const props = defineProps<{ parentId?: string }>()

interface AdminCategory extends CategoryRow {
  nameTr: string
}

const { t } = useI18n()
const categories = ref<AdminCategory[]>([])
const parentName = ref("")
const isLoading = ref(true)
const editingCategoryId = ref<string | null>(null)
const isModalOpen = ref(false)

const parentIdOrNull = computed(() => props.parentId ?? null)

async function load() {
  isLoading.value = true

  if (props.parentId) {
    const { data } = await supabase
      .from("category_translations")
      .select("name")
      .eq("category_id", props.parentId)
      .eq("locale", "tr")
      .maybeSingle()
    parentName.value = data?.name ?? ""
  }

  let query = supabase.from("categories").select("*").order("sort_order")
  query = props.parentId ? query.eq("parent_id", props.parentId) : query.is("parent_id", null)
  const [{ data: rows }, { data: translations }] = await Promise.all([
    query,
    supabase.from("category_translations").select("category_id, locale, name").eq("locale", "tr"),
  ])

  const nameByCategory = new Map(
    (translations as Pick<CategoryTranslationRow, "category_id" | "name">[] | null)?.map(
      (row) => [row.category_id, row.name],
    ),
  )

  categories.value = ((rows as CategoryRow[]) ?? []).map((row) => ({
    ...row,
    nameTr: nameByCategory.get(row.id) ?? row.slug,
  }))
  isLoading.value = false
}

onMounted(load)

function openCreate() {
  editingCategoryId.value = null
  isModalOpen.value = true
}

function openEdit(id: string) {
  editingCategoryId.value = id
  isModalOpen.value = true
}

async function onReorder() {
  await Promise.all(
    categories.value.map((category, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", category.id),
    ),
  )
}

async function remove(id: string) {
  if (!confirm(t("admin.categories.deleteConfirm"))) return
  await supabase.from("categories").delete().eq("id", id)
  await load()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <RouterLink
      v-if="parentId"
      :to="{ name: 'admin-categories' }"
      class="flex items-center gap-1 text-sm text-ink/60"
    >
      <ChevronLeft :size="16" />
      {{ t("admin.categories.title") }}
    </RouterLink>

    <div class="flex items-center justify-between">
      <h1 class="font-display text-2xl font-semibold">
        {{ t("admin.categories.title") }}<span v-if="parentId"> — {{ parentName }}</span>
      </h1>
      <button
        type="button"
        class="flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm font-semibold text-cream"
        @click="openCreate"
      >
        <Plus :size="16" />
        {{ t("admin.categories.add") }}
      </button>
    </div>

    <p v-if="isLoading" class="text-ink/50">Loading…</p>
    <p v-else-if="categories.length === 0" class="text-ink/50">
      {{ t("admin.categories.empty") }}
    </p>

    <draggable
      v-else
      v-model="categories"
      item-key="id"
      handle=".drag-handle"
      class="flex flex-col gap-2"
      @end="onReorder"
    >
      <template #item="{ element }: { element: AdminCategory }">
        <div class="flex items-center gap-3 rounded border border-ink/10 bg-cream px-4 py-3">
          <GripVertical :size="18" class="drag-handle cursor-grab text-ink/30" />
          <component :is="resolveIcon(element.icon_key)" :size="18" class="text-gold" />
          <span class="flex-1 text-sm font-medium">{{ element.nameTr }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            :class="element.is_active ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'"
          >
            {{ element.is_active ? t("admin.categories.active") : t("admin.categories.inactive") }}
          </span>
          <RouterLink
            v-if="!parentId"
            :to="{ name: 'admin-subcategories', params: { categoryId: element.id } }"
            class="flex items-center gap-1 rounded px-2 py-1 text-sm text-ink/70 hover:bg-cream-dark"
          >
            <LayoutGrid :size="16" />
            {{ t("admin.categories.subCategories") }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'admin-category-items', params: { categoryId: element.id } }"
            class="flex items-center gap-1 rounded px-2 py-1 text-sm text-ink/70 hover:bg-cream-dark"
          >
            <ListOrdered :size="16" />
            {{ t("admin.categories.items") }}
          </RouterLink>
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

    <CategoryFormModal
      v-if="isModalOpen"
      :category-id="editingCategoryId"
      :parent-id="parentIdOrNull"
      @close="isModalOpen = false"
      @saved="load"
    />
  </div>
</template>
