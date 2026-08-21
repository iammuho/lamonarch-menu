-- Allow Arabic as a third content locale alongside English and Turkish.

alter table category_translations drop constraint category_translations_locale_check;
alter table category_translations add constraint category_translations_locale_check
  check (locale in ('en', 'tr', 'ar'));

alter table menu_item_translations drop constraint menu_item_translations_locale_check;
alter table menu_item_translations add constraint menu_item_translations_locale_check
  check (locale in ('en', 'tr', 'ar'));

alter table allergen_translations drop constraint allergen_translations_locale_check;
alter table allergen_translations add constraint allergen_translations_locale_check
  check (locale in ('en', 'tr', 'ar'));
