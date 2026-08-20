-- service_role bypasses RLS but still needs base table GRANTs, same as
-- anon/authenticated did in the previous migration.

grant usage on schema public to service_role;

grant all on
  restaurant_settings,
  categories,
  category_translations,
  menu_items,
  menu_item_translations,
  allergens,
  allergen_translations,
  menu_item_allergens
to service_role;
