-- ADR-012: the shared catalog is the source for editorial reads and publication.

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id = d.base_publication_id where d.id = 1;
  select jsonb_build_object(
    'formatVersion', 1, 'revision', d.revision, 'basePublicationId', d.base_publication_id,
    'defaultLocale', d.default_locale,
    'locales', (select coalesce(jsonb_agg(jsonb_build_object('code', code, 'label', label,
      'direction', direction, 'status', status, 'position', position) order by position), '[]'::jsonb)
      from portfolio_editorial.draft_locales where draft_id = 1),
    'sections', coalesce(base->'sections', '[]'::jsonb),
    'entities', (select coalesce(jsonb_object_agg(id, jsonb_build_object('kind', kind,
      'position', position, 'data', data) || case when parent_id is null then '{}'::jsonb
      else jsonb_build_object('parentId', parent_id) end), '{}'::jsonb)
      from portfolio_editorial.draft_entities where draft_id = 1),
    'translations', (select coalesce(jsonb_object_agg(locale_code, items), '{}'::jsonb)
      from (select locale_code, jsonb_object_agg(entity_id, fields) items
        from portfolio_editorial.draft_translations where draft_id = 1 group by locale_code) x),
    'technologies', (select coalesce(jsonb_object_agg(t.id,
      jsonb_build_object('label', t.label, 'aliases', to_jsonb(t.aliases)) ||
      case when t.icon_media_id is not null then jsonb_build_object('iconMediaId', t.icon_media_id::text)
        when t.bundled_asset is not null then jsonb_build_object('iconMediaId', 'asset-' || t.id)
        else '{}'::jsonb end), '{}'::jsonb) from portfolio_editorial.technologies t),
    'media', coalesce(base->'media', '{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes)
      order by m.id) from portfolio_editorial.media m
      join portfolio_editorial.technologies t on t.icon_media_id = m.id
      where m.status = 'ready'), '{}'::jsonb)
      || coalesce((select jsonb_object_agg(m.id::text, jsonb_build_object('source', 'managed',
        'mime', m.mime, 'bytes', m.bytes) order by m.id) from portfolio_editorial.media m
        join portfolio_editorial.draft_media_refs r on r.media_id = m.id
        where r.draft_id = 1 and m.status = 'ready'), '{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id = 1;
  return result;
end $$;

create or replace function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base_snapshot jsonb; result jsonb;
begin
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id = d.base_publication_id where d.id = 1;
  select jsonb_build_object(
    'formatVersion', 1,
    'defaultLocale', 'pt-BR',
    'locales', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label,
      'direction', direction, 'position', position) order by position)
      from portfolio_editorial.draft_locales where draft_id = 1 and status = 'active'), '[]'::jsonb),
    'sections', coalesce(base_snapshot->'sections', '[]'::jsonb),
    'entities', coalesce((select jsonb_object_agg(id, jsonb_strip_nulls(jsonb_build_object(
      'kind', kind, 'parentId', parent_id, 'position', position, 'data', data)) order by id)
      from portfolio_editorial.draft_entities where draft_id = 1), '{}'::jsonb),
    'translations', coalesce((select jsonb_object_agg(locale_code, items order by locale_code)
      from (select t.locale_code, jsonb_object_agg(t.entity_id, t.fields order by t.entity_id) items
        from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l
          on l.draft_id = t.draft_id and l.code = t.locale_code and l.status = 'active'
        where t.draft_id = 1 group by t.locale_code) x), '{}'::jsonb),
    'technologies', coalesce((select jsonb_object_agg(t.id,
      jsonb_build_object('label', t.label, 'aliases', to_jsonb(t.aliases)) ||
      case when t.icon_media_id is not null then jsonb_build_object('iconMediaId', t.icon_media_id::text)
        when t.bundled_asset is not null then jsonb_build_object('iconMediaId', 'asset-' || t.id)
        else '{}'::jsonb end) from portfolio_editorial.technologies t), '{}'::jsonb),
    'media', coalesce(base_snapshot->'media', '{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes) order by m.id)
      from portfolio_editorial.media m where m.status = 'ready' and (
        exists(select 1 from portfolio_editorial.draft_media_refs r where r.media_id = m.id and r.draft_id = 1)
        or exists(select 1 from portfolio_editorial.technologies t where t.icon_media_id = m.id)
      )), '{}'::jsonb)
  ) into result;
  return result;
end $$;
