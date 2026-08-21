export type Locale = "en" | "tr" | "ar"

export interface RestaurantSettings {
  id: number
  name: string
  subtitle: string | null
  logo_url: string | null
  currency: string
}

export interface Allergen {
  id: string
  icon_key: string
  image_url: string | null
  sort_order: number
  label: string
}

export interface Category {
  id: string
  slug: string
  icon_key: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  parent_id: string | null
  name: string
}

export interface MenuItem {
  id: string
  category_id: string
  image_url: string | null
  price: number
  sort_order: number
  is_active: boolean
  name: string
  description: string | null
  allergens: Allergen[]
}
