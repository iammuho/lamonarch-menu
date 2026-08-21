export interface CategoryRow {
  id: string
  slug: string
  icon_key: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  parent_id: string | null
}

export interface CategoryTranslationRow {
  id: string
  category_id: string
  locale: "en" | "tr" | "ar"
  name: string
}

export interface MenuItemRow {
  id: string
  category_id: string
  image_url: string | null
  price: number
  sort_order: number
  is_active: boolean
}

export interface MenuItemTranslationRow {
  id: string
  menu_item_id: string
  locale: "en" | "tr" | "ar"
  name: string
  description: string | null
}

export interface AllergenRow {
  id: string
  icon_key: string
  image_url: string | null
  sort_order: number
}

export interface AllergenTranslationRow {
  id: string
  allergen_id: string
  locale: "en" | "tr" | "ar"
  label: string
}

export interface RestaurantSettingsRow {
  id: number
  name: string
  subtitle: string | null
  logo_url: string | null
  currency: string
}
