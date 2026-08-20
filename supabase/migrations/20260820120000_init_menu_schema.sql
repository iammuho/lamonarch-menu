-- Single-restaurant QR menu schema: settings, categories, menu items, allergens,
-- all bilingual (en/tr) via separate translation tables.

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- restaurant_settings (singleton row, id = 1)
-- ---------------------------------------------------------------------------
create table restaurant_settings (
  id integer primary key default 1,
  name text not null default '',
  subtitle text,
  logo_url text,
  currency text not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_settings_singleton check (id = 1)
);

insert into restaurant_settings (id, name, subtitle, currency) values (1, 'Your Restaurant', 'MENU', 'TRY');

create trigger restaurant_settings_set_updated_at
  before update on restaurant_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon_key text not null default 'utensils',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_sort_order_idx on categories (sort_order);

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

create table category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  locale text not null check (locale in ('en', 'tr')),
  name text not null,
  unique (category_id, locale)
);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  image_url text,
  price numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_category_id_idx on menu_items (category_id);
create index menu_items_sort_order_idx on menu_items (sort_order);

create trigger menu_items_set_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

create table menu_item_translations (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items (id) on delete cascade,
  locale text not null check (locale in ('en', 'tr')),
  name text not null,
  description text,
  unique (menu_item_id, locale)
);

-- ---------------------------------------------------------------------------
-- allergens / dietary tags
-- ---------------------------------------------------------------------------
create table allergens (
  id uuid primary key default gen_random_uuid(),
  icon_key text not null default 'wheat',
  sort_order integer not null default 0
);

create table allergen_translations (
  id uuid primary key default gen_random_uuid(),
  allergen_id uuid not null references allergens (id) on delete cascade,
  locale text not null check (locale in ('en', 'tr')),
  label text not null,
  unique (allergen_id, locale)
);

create table menu_item_allergens (
  menu_item_id uuid not null references menu_items (id) on delete cascade,
  allergen_id uuid not null references allergens (id) on delete cascade,
  primary key (menu_item_id, allergen_id)
);

-- ---------------------------------------------------------------------------
-- RLS: public reads active content, only authenticated (the admin) can write
-- ---------------------------------------------------------------------------
alter table restaurant_settings enable row level security;
alter table categories enable row level security;
alter table category_translations enable row level security;
alter table menu_items enable row level security;
alter table menu_item_translations enable row level security;
alter table allergens enable row level security;
alter table allergen_translations enable row level security;
alter table menu_item_allergens enable row level security;

create policy "public can read settings" on restaurant_settings for select using (true);
create policy "admin can write settings" on restaurant_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read active categories" on categories for select using (is_active = true);
create policy "admin can read all categories" on categories for select using (auth.role() = 'authenticated');
create policy "admin can write categories" on categories for insert with check (auth.role() = 'authenticated');
create policy "admin can update categories" on categories for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin can delete categories" on categories for delete using (auth.role() = 'authenticated');

create policy "public can read category translations" on category_translations for select using (true);
create policy "admin can write category translations" on category_translations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read active menu items" on menu_items for select using (is_active = true);
create policy "admin can read all menu items" on menu_items for select using (auth.role() = 'authenticated');
create policy "admin can write menu items" on menu_items for insert with check (auth.role() = 'authenticated');
create policy "admin can update menu items" on menu_items for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin can delete menu items" on menu_items for delete using (auth.role() = 'authenticated');

create policy "public can read menu item translations" on menu_item_translations for select using (true);
create policy "admin can write menu item translations" on menu_item_translations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read allergens" on allergens for select using (true);
create policy "admin can write allergens" on allergens for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read allergen translations" on allergen_translations for select using (true);
create policy "admin can write allergen translations" on allergen_translations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read menu item allergens" on menu_item_allergens for select using (true);
create policy "admin can write menu item allergens" on menu_item_allergens for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage buckets: public read, admin-only write
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true),
       ('menu-item-images', 'menu-item-images', true),
       ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "public can read menu images" on storage.objects for select
  using (bucket_id in ('category-images', 'menu-item-images', 'branding'));

create policy "admin can upload menu images" on storage.objects for insert
  with check (
    bucket_id in ('category-images', 'menu-item-images', 'branding')
    and auth.role() = 'authenticated'
  );

create policy "admin can update menu images" on storage.objects for update
  using (
    bucket_id in ('category-images', 'menu-item-images', 'branding')
    and auth.role() = 'authenticated'
  );

create policy "admin can delete menu images" on storage.objects for delete
  using (
    bucket_id in ('category-images', 'menu-item-images', 'branding')
    and auth.role() = 'authenticated'
  );
