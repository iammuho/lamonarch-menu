import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import type { RestaurantSettings } from "@/types/menu"

const settings = ref<RestaurantSettings | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
let loaded = false

async function load(force = false) {
  if (loaded && !force) return
  isLoading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from("restaurant_settings")
    .select("id, name, subtitle, logo_url, currency")
    .eq("id", 1)
    .maybeSingle()

  if (fetchError) {
    error.value = fetchError.message
  } else {
    settings.value = data
    loaded = true
  }

  isLoading.value = false
}

export function useRestaurantSettings() {
  if (!loaded) load()
  return { settings, isLoading, error, reload: () => load(true) }
}
