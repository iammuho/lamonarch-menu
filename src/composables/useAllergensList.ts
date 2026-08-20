import { ref, watch } from "vue"
import { supabase } from "@/lib/supabase"
import type { Allergen } from "@/types/menu"
import { useLocaleStore } from "@/stores/locale"

interface AllergenQueryRow {
  id: string
  icon_key: string
  sort_order: number
  allergen_translations: { label: string }[]
}

export function useAllergensList() {
  const localeStore = useLocaleStore()
  const allergens = ref<Allergen[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    isLoading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from("allergens")
      .select("id, icon_key, sort_order, allergen_translations!inner(label)")
      .eq("allergen_translations.locale", localeStore.locale)
      .order("sort_order")

    if (fetchError) {
      error.value = fetchError.message
      allergens.value = []
    } else {
      allergens.value = (data as AllergenQueryRow[]).map((row) => ({
        id: row.id,
        icon_key: row.icon_key,
        sort_order: row.sort_order,
        label: row.allergen_translations[0]?.label ?? "",
      }))
    }

    isLoading.value = false
  }

  watch(() => localeStore.locale, load, { immediate: true })

  return { allergens, isLoading, error }
}
