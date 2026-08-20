import { ref, watch, type Ref } from "vue"
import { supabase } from "@/lib/supabase"
import { fetchMenuItems } from "@/lib/fetchMenuItems"
import type { Category, MenuItem } from "@/types/menu"
import { useLocaleStore } from "@/stores/locale"

interface CategoryQueryRow {
  id: string
  slug: string
  icon_key: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  parent_id: string | null
  category_translations: { name: string }[]
}

function mapCategory(row: CategoryQueryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    icon_key: row.icon_key,
    image_url: row.image_url,
    sort_order: row.sort_order,
    is_active: row.is_active,
    parent_id: row.parent_id,
    name: row.category_translations[0]?.name ?? row.slug,
  }
}

/**
 * Loads a category by slug plus, depending on whether it has sub-categories,
 * either its sub-category list (a "hub" page) or its menu items (a leaf page).
 */
export function useCategoryPage(slug: Ref<string>) {
  const localeStore = useLocaleStore()
  const category = ref<Category | null>(null)
  const subCategories = ref<Category[]>([])
  const items = ref<MenuItem[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    isLoading.value = true
    error.value = null
    subCategories.value = []
    items.value = []

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select(
        "id, slug, icon_key, image_url, sort_order, is_active, parent_id, category_translations!inner(name)",
      )
      .eq("slug", slug.value)
      .eq("is_active", true)
      .eq("category_translations.locale", localeStore.locale)
      .maybeSingle()

    if (categoryError || !categoryData) {
      error.value = categoryError?.message ?? "Category not found"
      category.value = null
      isLoading.value = false
      return
    }

    const row = categoryData as CategoryQueryRow
    category.value = mapCategory(row)

    const { data: childrenData, error: childrenError } = await supabase
      .from("categories")
      .select(
        "id, slug, icon_key, image_url, sort_order, is_active, parent_id, category_translations!inner(name)",
      )
      .eq("parent_id", row.id)
      .eq("is_active", true)
      .eq("category_translations.locale", localeStore.locale)
      .order("sort_order")

    if (childrenError) {
      error.value = childrenError.message
      isLoading.value = false
      return
    }

    if (childrenData.length > 0) {
      subCategories.value = (childrenData as CategoryQueryRow[]).map(mapCategory)
      isLoading.value = false
      return
    }

    const result = await fetchMenuItems(row.id, localeStore.locale)
    items.value = result.items
    if (result.error) error.value = result.error

    isLoading.value = false
  }

  watch([() => localeStore.locale, slug], load, { immediate: true })

  return { category, subCategories, items, isLoading, error, reload: load }
}
