-- Run once in Supabase SQL Editor. No passwords or service_role keys belong here.
begin;
create table if not exists public.site_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.site_owner enable row level security;
revoke all on public.site_owner from anon, authenticated;
grant select on public.site_owner to authenticated;
drop policy if exists owner_reads_own_identity on public.site_owner;
create policy owner_reads_own_identity on public.site_owner for select to authenticated using (user_id = (select auth.uid()));
create or replace function public.is_site_owner() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.site_owner where user_id = (select auth.uid())); $$;
revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to authenticated;

create table if not exists public.site_journal (
  id smallint primary key default 1 check (id = 1),
  revision bigint not null default 0,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint content_shape check (
    content ?& array['version','countries','memories'] and content->>'version' = '1' and jsonb_typeof(content->'countries') = 'array'
    and jsonb_typeof(content->'memories') = 'array'
    and octet_length(content::text) <= 5242880
  )
);
alter table public.site_journal enable row level security;
revoke all on public.site_journal from anon, authenticated;
grant select on public.site_journal to anon, authenticated;
grant update on public.site_journal to authenticated;
drop policy if exists everyone_reads_published on public.site_journal;
create policy everyone_reads_published on public.site_journal for select to anon, authenticated using (true);
drop policy if exists owner_publishes on public.site_journal;
create policy owner_publishes on public.site_journal for update to authenticated
using (public.is_site_owner()) with check (public.is_site_owner());
create or replace function public.advance_journal_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists journal_revision on public.site_journal;
create trigger journal_revision before update on public.site_journal for each row execute function public.advance_journal_revision();
insert into public.site_journal(id,content) values (1,'{"version":1,"countries":["ID","MY","KH","SG","TH","JP","CN"],"memories":[]}') on conflict (id) do nothing;

-- Only images explicitly published by the owner are uploaded here.
-- Local drafts and their photos remain in the owner's browser until publication.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('journal-photos','journal-photos',true,3145728,array['image/jpeg']) on conflict (id) do nothing;
drop policy if exists owner_uploads_photos on storage.objects;
create policy owner_uploads_photos on storage.objects for insert to authenticated
with check (bucket_id = 'journal-photos' and public.is_site_owner());
drop policy if exists owner_reads_photo_metadata on storage.objects;
create policy owner_reads_photo_metadata on storage.objects for select to authenticated
using (bucket_id = 'journal-photos' and public.is_site_owner());
-- No browser UPDATE or DELETE policy: published images keep immutable paths.
-- The owner can remove obsolete photos manually in Supabase Storage if needed.
commit;
