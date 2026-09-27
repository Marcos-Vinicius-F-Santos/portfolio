-- T-005 / ADR-008: private editorial persistence only.
-- RPCs, media workflow and publication commands are introduced by later tasks.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'portfolio_editorial_owner') then
    create role portfolio_editorial_owner nologin noinherit nobypassrls;
  end if;
end
$$;

-- Supabase's migration role is not a superuser; membership lets migrations
-- create and evolve objects owned by the dedicated NOLOGIN role.
grant portfolio_editorial_owner to postgres;

create schema portfolio_editorial authorization portfolio_editorial_owner;
revoke all on schema portfolio_editorial from public, anon, authenticated, service_role;

create table portfolio_editorial.draft (
  id smallint primary key default 1 check (id = 1),
  revision bigint not null default 0 check (revision >= 0),
  base_publication_id uuid,
  default_locale text not null default 'pt-BR' check (default_locale = 'pt-BR'),
  updated_at timestamptz not null default now()
);

create table portfolio_editorial.draft_locales (
  draft_id smallint not null default 1,
  code text not null check (code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  label text not null check (length(trim(label)) > 0),
  direction text not null default 'ltr' check (direction = 'ltr'),
  status text not null default 'preparation' check (status in ('preparation', 'active')),
  position integer not null check (position >= 0),
  primary key (draft_id, code),
  unique (draft_id, position),
  foreign key (draft_id) references portfolio_editorial.draft(id) on delete cascade
);

create table portfolio_editorial.technologies (
  id text primary key check (id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  label text not null check (length(trim(label)) > 0),
  aliases text[] not null default '{}',
  bundled_asset text,
  license_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolio_editorial.draft_entities (
  draft_id smallint not null default 1,
  id text not null check (id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  kind text not null check (kind in (
    'presentation', 'about', 'result', 'experience', 'skillCategory', 'skill',
    'academic', 'project', 'contact', 'projectLink', 'projectImage', 'curriculum',
    'interfaceText', 'listItem'
  )),
  parent_id text,
  position integer not null check (position >= 0),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  primary key (draft_id, id),
  unique nulls not distinct (draft_id, kind, parent_id, position),
  foreign key (draft_id) references portfolio_editorial.draft(id) on delete cascade,
  foreign key (draft_id, parent_id)
    references portfolio_editorial.draft_entities(draft_id, id)
    on delete cascade deferrable initially deferred,
  check (parent_id is null or parent_id <> id)
);

create table portfolio_editorial.draft_translations (
  draft_id smallint not null default 1,
  entity_id text not null,
  locale_code text not null,
  fields jsonb not null default '{}'::jsonb check (jsonb_typeof(fields) = 'object'),
  primary key (draft_id, entity_id, locale_code),
  foreign key (draft_id, entity_id)
    references portfolio_editorial.draft_entities(draft_id, id) on delete cascade,
  foreign key (draft_id, locale_code)
    references portfolio_editorial.draft_locales(draft_id, code) on delete cascade
);

create table portfolio_editorial.publications (
  id uuid primary key,
  sequence bigint generated always as identity unique,
  format_version integer not null check (format_version = 1),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and snapshot ->> 'formatVersion' = format_version::text
  ),
  hash text not null unique check (hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  source_revision bigint not null check (source_revision >= 0),
  retained boolean not null default true
);

alter table portfolio_editorial.draft
  add constraint draft_base_publication_fk
  foreign key (base_publication_id) references portfolio_editorial.publications(id)
  on delete restrict;

create table portfolio_editorial.site_state (
  id smallint primary key default 1 check (id = 1),
  active_publication_id uuid references portfolio_editorial.publications(id) on delete restrict,
  editorial_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create index draft_entities_parent_idx
  on portfolio_editorial.draft_entities (draft_id, parent_id, position);
create index draft_entities_kind_idx
  on portfolio_editorial.draft_entities (draft_id, kind, position);
create index draft_translations_locale_idx
  on portfolio_editorial.draft_translations (draft_id, locale_code, entity_id);
create index publications_created_at_idx
  on portfolio_editorial.publications (created_at desc);
create index publications_retained_idx
  on portfolio_editorial.publications (retained, sequence desc);

create function portfolio_editorial.protect_default_locale()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.code = 'pt-BR' and (
    tg_op = 'DELETE'
    or new.code <> 'pt-BR'
    or new.status <> 'active'
    or new.direction <> 'ltr'
  ) then
    raise exception 'pt-BR is the required active default locale';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger protect_default_locale
before update or delete on portfolio_editorial.draft_locales
for each row execute function portfolio_editorial.protect_default_locale();

create function portfolio_editorial.protect_publication_payload()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.sequence <> old.sequence
    or new.format_version <> old.format_version
    or new.snapshot <> old.snapshot
    or new.hash <> old.hash
    or new.created_at <> old.created_at
    or new.source_revision <> old.source_revision then
    raise exception 'published snapshot payload is immutable';
  end if;
  return new;
end
$$;

create trigger protect_publication_payload
before update on portfolio_editorial.publications
for each row execute function portfolio_editorial.protect_publication_payload();

insert into portfolio_editorial.draft (id) values (1);
insert into portfolio_editorial.draft_locales
  (draft_id, code, label, direction, status, position)
values (1, 'pt-BR', 'Português', 'ltr', 'active', 0);
insert into portfolio_editorial.site_state (id) values (1);

alter table portfolio_editorial.draft enable row level security;
alter table portfolio_editorial.draft_locales enable row level security;
alter table portfolio_editorial.technologies enable row level security;
alter table portfolio_editorial.draft_entities enable row level security;
alter table portfolio_editorial.draft_translations enable row level security;
alter table portfolio_editorial.publications enable row level security;
alter table portfolio_editorial.site_state enable row level security;

alter table portfolio_editorial.draft force row level security;
alter table portfolio_editorial.draft_locales force row level security;
alter table portfolio_editorial.technologies force row level security;
alter table portfolio_editorial.draft_entities force row level security;
alter table portfolio_editorial.draft_translations force row level security;
alter table portfolio_editorial.publications force row level security;
alter table portfolio_editorial.site_state force row level security;

revoke all privileges on all tables in schema portfolio_editorial
  from public, anon, authenticated, service_role;
revoke all privileges on all sequences in schema portfolio_editorial
  from public, anon, authenticated, service_role;
revoke all privileges on all functions in schema portfolio_editorial
  from public, anon, authenticated, service_role;

alter table portfolio_editorial.draft owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_locales owner to portfolio_editorial_owner;
alter table portfolio_editorial.technologies owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_entities owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_translations owner to portfolio_editorial_owner;
alter table portfolio_editorial.publications owner to portfolio_editorial_owner;
alter table portfolio_editorial.site_state owner to portfolio_editorial_owner;
alter sequence portfolio_editorial.publications_sequence_seq owner to portfolio_editorial_owner;
alter function portfolio_editorial.protect_default_locale() owner to portfolio_editorial_owner;
alter function portfolio_editorial.protect_publication_payload() owner to portfolio_editorial_owner;
