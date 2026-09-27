create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id),
  name text not null,
  metadata jsonb,
  unique (bucket_id, name)
);
alter table storage.buckets owner to postgres;
alter table storage.objects owner to postgres;
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated;
