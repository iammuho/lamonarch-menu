-- RLS policies alone aren't enough: Postgres also requires base table
-- GRANTs for the anon/authenticated roles, which Supabase's dashboard
-- normally sets up automatically but a plain `create table` via SQL does not.

grant usage on schema public to anon, authenticated;

grant select on
  restaurant_settings,
  categories,
  category_translations,
  menu_items,
  menu_item_translations,
  allergens,
  allergen_translations,
  menu_item_allergens
to anon, authenticated;

grant insert, update, delete on
  restaurant_settings,
  categories,
  category_translations,
  menu_items,
  menu_item_translations,
  allergens,
  allergen_translations,
  menu_item_allergens
to authenticated;
