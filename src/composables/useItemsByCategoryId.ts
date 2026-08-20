import { ref, watch, type Ref } from "vue"
import { fetchMenuItems } from "@/lib/fetchMenuItems"
import type { MenuItem } from "@/types/menu"
import { useLocaleStore } from "@/stores/locale"

export function useItemsByCategoryId(categoryId: Ref<string | null>) {
  const localeStore = useLocaleStore()
  const items = ref<MenuItem[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    if (!categoryId.value) {
      items.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    const result = await fetchMenuItems(categoryId.value, localeStore.locale)
    items.value = result.items
    error.value = result.error

    isLoading.value = false
  }

  watch([() => localeStore.locale, categoryId], load, { immediate: true })

  return { items, isLoading, error }
}
