import { supabase } from "@/lib/supabase"
import type { MenuItem } from "@/types/menu"

interface MenuItemQueryRow {
  id: string
  category_id: string
  image_url: string | null
  price: number
  sort_order: number
  is_active: boolean
  menu_item_translations: { name: string; description: string | null }[]
  menu_item_allergens: {
    allergens: {
      id: string
      icon_key: string
      sort_order: number
      allergen_translations: { label: string }[]
    }[]
  }[]
}

export async function fetchMenuItems(
  categoryId: string,
  locale: string,
): Promise<{ items: MenuItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `id, category_id, image_url, price, sort_order, is_active,
       menu_item_translations!inner(name, description),
       menu_item_allergens(
         allergens(
           id, icon_key, sort_order,
           allergen_translations!inner(label)
         )
       )`,
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .eq("menu_item_translations.locale", locale)
    .eq("menu_item_allergens.allergens.allergen_translations.locale", locale)
    .order("sort_order")

  if (error) return { items: [], error: error.message }

  const items = (data as MenuItemQueryRow[]).map((item) => ({
    id: item.id,
    category_id: item.category_id,
    image_url: item.image_url,
    price: item.price,
    sort_order: item.sort_order,
    is_active: item.is_active,
    name: item.menu_item_translations[0]?.name ?? "",
    description: item.menu_item_translations[0]?.description ?? null,
    allergens: item.menu_item_allergens
      .flatMap((link) => link.allergens)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((a) => ({
        id: a.id,
        icon_key: a.icon_key,
        sort_order: a.sort_order,
        label: a.allergen_translations[0]?.label ?? "",
      })),
  }))

  return { items, error: null }
}
