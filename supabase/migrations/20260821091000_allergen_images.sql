-- Allow allergens/dietary tags to use an uploaded image instead of (or in
-- addition to) the built-in icon set.

alter table allergens add column image_url text;

insert into storage.buckets (id, name, public)
values ('allergen-images', 'allergen-images', true)
on conflict (id) do nothing;

create policy "public can read allergen images" on storage.objects for select
  using (bucket_id = 'allergen-images');

create policy "admin can upload allergen images" on storage.objects for insert
  with check (bucket_id = 'allergen-images' and auth.role() = 'authenticated');

create policy "admin can update allergen images" on storage.objects for update
  using (bucket_id = 'allergen-images' and auth.role() = 'authenticated');

create policy "admin can delete allergen images" on storage.objects for delete
  using (bucket_id = 'allergen-images' and auth.role() = 'authenticated');
