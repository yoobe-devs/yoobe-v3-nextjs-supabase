-- Create public storage bucket (idempotent) - compatible with Postgres 15
insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do nothing;

-- Policies: public read, authenticated write on 'public' bucket (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read on public bucket'
  ) then
    create policy "Public read on public bucket" on storage.objects for select using (bucket_id = 'public');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated insert on public bucket'
  ) then
    create policy "Authenticated insert on public bucket" on storage.objects for insert to authenticated with check (bucket_id = 'public');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated update on public bucket'
  ) then
    create policy "Authenticated update on public bucket" on storage.objects for update to authenticated using (bucket_id = 'public') with check (bucket_id = 'public');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated delete on public bucket'
  ) then
    create policy "Authenticated delete on public bucket" on storage.objects for delete to authenticated using (bucket_id = 'public');
  end if;
end $$;


