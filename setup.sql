-- Run once in Supabase > SQL Editor
create table content(key text primary key, value text);
create table works(
  id uuid primary key default gen_random_uuid(),
  category text check (category in ('image','video','link')),
  title text not null, description text, media_url text, link_url text,
  created_at timestamptz default now());
alter table content enable row level security;
alter table works enable row level security;
create policy "public read content" on content for select using (true);
create policy "public read works" on works for select using (true);
create policy "admin write content" on content for all to authenticated using (true) with check (true);
create policy "admin write works" on works for all to authenticated using (true) with check (true);
insert into storage.buckets (id,name,public) values ('media','media',true);
create policy "public read media" on storage.objects for select using (bucket_id='media');
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id='media');
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id='media');
-- THEN: Authentication > Providers > Email > turn OFF "Allow new users to sign up",
-- and create your one admin user manually (Authentication > Users > Add user).
