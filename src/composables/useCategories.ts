import { ref, watch, type Ref } from "vue"
import { supabase } from "@/lib/supabase"
import type { Category } from "@/types/menu"
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

/**
 * Fetches active, translated categories. Pass `parentId` to list a category's
 * sub-categories; omit it (or pass a ref holding null) to list top-level categories.
 */
export function useCategories(parentId?: Ref<string | null> | null) {
  const localeStore = useLocaleStore()
  const categories = ref<Category[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    isLoading.value = true
    error.value = null

    let query = supabase
      .from("categories")
      .select(
        "id, slug, icon_key, image_url, sort_order, is_active, parent_id, category_translations!inner(name)",
      )
      .eq("is_active", true)
      .eq("category_translations.locale", localeStore.locale)

    query = parentId?.value ? query.eq("parent_id", parentId.value) : query.is("parent_id", null)

    const { data, error: fetchError } = await query.order("sort_order")

    if (fetchError) {
      error.value = fetchError.message
      categories.value = []
    } else {
      categories.value = (data as CategoryQueryRow[]).map((row) => ({
        id: row.id,
        slug: row.slug,
        icon_key: row.icon_key,
        image_url: row.image_url,
        sort_order: row.sort_order,
        is_active: row.is_active,
        parent_id: row.parent_id,
        name: row.category_translations[0]?.name ?? row.slug,
      }))
    }

    isLoading.value = false
  }

  watch([() => localeStore.locale, () => parentId?.value], load, { immediate: true })

  return { categories, isLoading, error, reload: load }
}
