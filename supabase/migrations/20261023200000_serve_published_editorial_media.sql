-- Serve only media referenced by a currently public editorial publication.
-- Buckets stay private; visitors receive short-lived signed URLs.

-- The project revokes CREATE from the editorial executor after migrations. Grant it
-- only for the function definitions in this migration and revoke it at the end.
grant create on schema portfolio_editorial, public to portfolio_editorial_executor;

create or replace function portfolio_editorial.get_public_media_reference(
  requested_media_id uuid,
  requested_publication_id uuid default null
)
returns table(bucket text, path text, mime text, bytes bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  chosen_publication_id uuid;
begin
  select coalesce(requested_publication_id, s.active_publication_id)
    into chosen_publication_id
    from portfolio_editorial.site_state s
   where s.id = 1;

  if chosen_publication_id is null then
    return;
  end if;

  if not exists (
    select 1
      from portfolio_editorial.publication_access a
      join portfolio_editorial.site_state s on s.id = 1
     where a.publication_id = chosen_publication_id
       and (s.active_publication_id = chosen_publication_id or a.public_until > now())
  ) then
    return;
  end if;

  return query
  select m.bucket, m.path, m.mime, m.bytes
    from portfolio_editorial.media m
    join portfolio_editorial.publications p on p.id = chosen_publication_id
   where m.id = requested_media_id
     and m.status = 'ready'
     and p.snapshot->'media' ? requested_media_id::text;
end;
$$;

create or replace function public.get_public_media_reference(
  media_id uuid,
  publication_id uuid default null
)
returns table(bucket text, path text, mime text, bytes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select *
    from portfolio_editorial.get_public_media_reference(media_id, publication_id)
$$;

create or replace function portfolio_editorial.can_read_public_media(
  object_bucket text,
  object_path text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from portfolio_editorial.media m
      join portfolio_editorial.publications p
        on p.snapshot->'media' ? m.id::text
      join portfolio_editorial.publication_access a
        on a.publication_id = p.id
      join portfolio_editorial.site_state s
        on s.id = 1
     where m.bucket = object_bucket
       and m.path = object_path
       and m.status = 'ready'
       and (s.active_publication_id = p.id or a.public_until > now())
  )
$$;

revoke all on function portfolio_editorial.get_public_media_reference(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function portfolio_editorial.can_read_public_media(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.get_public_media_reference(uuid, uuid)
  from public;

grant execute on function public.get_public_media_reference(uuid, uuid)
  to anon, authenticated;
grant execute on function portfolio_editorial.can_read_public_media(text, text)
  to anon, authenticated;
grant usage on schema portfolio_editorial to anon, authenticated;

alter function portfolio_editorial.get_public_media_reference(uuid, uuid)
  owner to portfolio_editorial_executor;
alter function portfolio_editorial.can_read_public_media(text, text)
  owner to portfolio_editorial_executor;
alter function public.get_public_media_reference(uuid, uuid)
  owner to portfolio_editorial_executor;

drop policy if exists editorial_media_public_select on storage.objects;
create policy editorial_media_public_select
  on storage.objects for select
  to anon, authenticated
  using (portfolio_editorial.can_read_public_media(bucket_id, name));

-- Future snapshots must not expose private Storage paths. Existing publications remain
-- immutable and are resolved through get_public_media_reference by media ID.
create or replace function portfolio_editorial.build_publication_content()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  base_snapshot jsonb;
  result jsonb;
begin
  select p.snapshot
    into base_snapshot
    from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id = d.base_publication_id
   where d.id = 1;

  select jsonb_build_object(
    'formatVersion', 1,
    'defaultLocale', 'pt-BR',
    'locales', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', code,
        'label', label,
        'direction', direction,
        'position', position
      ) order by position)
      from portfolio_editorial.draft_locales
      where draft_id = 1 and status = 'active'
    ), '[]'::jsonb),
    'sections', coalesce(base_snapshot->'sections', '[]'::jsonb),
    'entities', coalesce((
      select jsonb_object_agg(
        id,
        jsonb_strip_nulls(jsonb_build_object(
          'kind', kind,
          'parentId', parent_id,
          'position', position,
          'data', data
        )) order by id
      )
      from portfolio_editorial.draft_entities
      where draft_id = 1
    ), '{}'::jsonb),
    'translations', coalesce((
      select jsonb_object_agg(locale_code, items order by locale_code)
      from (
        select
          t.locale_code,
          jsonb_object_agg(t.entity_id, t.fields order by t.entity_id) as items
        from portfolio_editorial.draft_translations t
        join portfolio_editorial.draft_locales l
          on l.draft_id = t.draft_id
         and l.code = t.locale_code
         and l.status = 'active'
        where t.draft_id = 1
        group by t.locale_code
      ) x
    ), '{}'::jsonb),
    'technologies', coalesce((
      select jsonb_object_agg(
        t.id,
        jsonb_build_object(
          'label', t.label,
          'aliases', to_jsonb(t.aliases)
        ) || case
          when t.icon_media_id is not null then jsonb_build_object('iconMediaId', t.icon_media_id::text)
          when t.bundled_asset is not null then jsonb_build_object('iconMediaId', 'asset-' || t.id)
          else '{}'::jsonb
        end
      )
      from portfolio_editorial.technologies t
    ), '{}'::jsonb),
    'media', coalesce((
      select jsonb_object_agg(
        key,
        case when value->>'source' = 'managed' then value - 'assetPath' else value end
      )
      from jsonb_each(coalesce(base_snapshot->'media', '{}'::jsonb))
    ), '{}'::jsonb) || coalesce((
      select jsonb_object_agg(
        m.id::text,
        jsonb_build_object(
          'source', 'managed',
          'mime', m.mime,
          'bytes', m.bytes
        ) order by m.id
      )
      from portfolio_editorial.media m
      where m.status = 'ready'
        and (
          exists (
            select 1
            from portfolio_editorial.draft_media_refs r
            where r.media_id = m.id and r.draft_id = 1
          )
          or exists (
            select 1
            from portfolio_editorial.technologies t
            where t.icon_media_id = m.id
          )
        )
    ), '{}'::jsonb)
  ) into result;

  return result;
end;
$$;

alter function portfolio_editorial.build_publication_content()
  owner to portfolio_editorial_executor;

revoke create on schema portfolio_editorial, public from portfolio_editorial_executor;

