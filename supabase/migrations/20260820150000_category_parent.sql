-- Allow a category to optionally nest under a parent category, so a top-level
-- category (e.g. "Breakfasts") can show sub-category cards (e.g. "Selected
-- Breakfast") instead of items directly.

alter table categories add column parent_id uuid references categories (id) on delete cascade;

create index categories_parent_id_idx on categories (parent_id);
