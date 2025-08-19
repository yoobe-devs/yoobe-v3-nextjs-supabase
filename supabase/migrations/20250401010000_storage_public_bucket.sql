-- Create public storage bucket (idempotent)
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'public'
  ) then
    perform storage.create_bucket(
      id => 'public',
      name => 'public',
      public => true,
      file_size_limit => null,
      allowed_mime_types => null
    );
  end if;
end $$;

-- Policies: public read, authenticated write on 'public' bucket
create policy if not exists "Public read on public bucket"
  on storage.objects for select
  using (bucket_id = 'public');

create policy if not exists "Authenticated insert on public bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public');

create policy if not exists "Authenticated update on public bucket"
  on storage.objects for update to authenticated
  using (bucket_id = 'public')
  with check (bucket_id = 'public');

create policy if not exists "Authenticated delete on public bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public');


