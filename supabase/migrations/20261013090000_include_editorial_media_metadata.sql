-- Keep private editorial media addressable by the authenticated editor.
-- The browser still resolves a short-lived signed URL; raw storage paths are
-- never exposed by the public snapshot reader.

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
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes,
        'bucket', m.bucket, 'storagePath', m.path, 'originalName', m.original_name) order by m.id)
      from portfolio_editorial.media m
      where m.status = 'ready' and (
        exists(select 1 from portfolio_editorial.draft_media_refs r where r.media_id = m.id and r.draft_id = 1)
        or exists(select 1 from portfolio_editorial.technologies t where t.icon_media_id = m.id)
      )), '{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id = 1;
  return result;
end $$;
