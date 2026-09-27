-- T-010 / ADR-008: authoritative validation and deterministic review summary.

create function portfolio_editorial.required_translation_fields(entity_kind text)
returns text[] language sql immutable set search_path = '' as $$
  select case entity_kind
    when 'presentation' then array['title','displayName','summary']
    when 'about' then array['title','body']
    when 'result' then array['title','value']
    when 'experience' then array['title','context']
    when 'skillCategory' then array['label']
    when 'skill' then array['name']
    when 'academic' then array['name','institution']
    when 'project' then array['name','description','problemContext']
    when 'contact' then array['label']
    when 'projectLink' then array['label']
    when 'projectImage' then array['alt']
    when 'curriculum' then array['label']
    when 'interfaceText' then array['text']
    when 'listItem' then array['text']
    else array[]::text[] end
$$;

grant select on portfolio_editorial.publications to portfolio_editorial_executor;

create function portfolio_editorial.validate_publication(expected_revision bigint, actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint; base_snapshot jsonb; errors jsonb; summary jsonb;
  draft_document jsonb; review_hash text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id=1 for share;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode='40001', detail=current_revision::text;
  end if;
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;

  select coalesce(jsonb_agg(issue order by issue->>'path'),'[]'::jsonb) into errors from (
    select jsonb_build_object('code','incomplete_locale','path',format('translations.%s.%s.%s',l.code,e.id,f.field),
      'message','Campo obrigatório ausente.') issue
    from portfolio_editorial.draft_locales l cross join portfolio_editorial.draft_entities e
    cross join lateral unnest(portfolio_editorial.required_translation_fields(e.kind)) f(field)
    left join portfolio_editorial.draft_translations t on t.draft_id=e.draft_id and t.entity_id=e.id and t.locale_code=l.code
    where l.draft_id=1 and l.status='active'
      and (t.fields is null or nullif(btrim(t.fields->>f.field),'') is null)
    union all
    select jsonb_build_object('code','unsafe_url','path',format('entities.%s.data.%s',e.id,k.key),
      'message','URL deve usar https, mailto ou tel.')
    from portfolio_editorial.draft_entities e cross join lateral jsonb_each_text(e.data) k
    where k.key='href' and k.value !~ '^(https://|mailto:|tel:)'
    union all
    select jsonb_build_object('code','media_not_ready','path',format('media.%s',r.media_id),
      'message','Mídia associada não está pronta.')
    from portfolio_editorial.draft_media_refs r join portfolio_editorial.media m on m.id=r.media_id
    where m.status <> 'ready'
  ) validation;

  select jsonb_build_object(
    'entities',coalesce(jsonb_object_agg(e.id,jsonb_build_object('kind',e.kind,'parentId',e.parent_id,'position',e.position,'data',e.data)
      order by e.id),'{}'::jsonb),
    'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code) from (
      select locale_code,jsonb_object_agg(entity_id,fields order by entity_id) items
      from portfolio_editorial.draft_translations group by locale_code) translations),'{}'::jsonb),
    'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position)
      order by position) from portfolio_editorial.draft_locales where draft_id=1),'[]'::jsonb),
    'media',coalesce((select jsonb_agg(jsonb_build_object('entityId',entity_id,'field',field,'mediaId',media_id,'position',position)
      order by entity_id,field,position) from portfolio_editorial.draft_media_refs where draft_id=1),'[]'::jsonb)
  ) into draft_document from portfolio_editorial.draft_entities e where e.draft_id=1;

  select jsonb_build_object(
    'added',count(*) filter(where base_snapshot is null or not (base_snapshot->'entities' ? e.id)),
    'removed',case when base_snapshot is null then 0 else (select count(*) from jsonb_object_keys(base_snapshot->'entities') id
      where not exists(select 1 from portfolio_editorial.draft_entities d where d.id=id)) end,
    'changed',count(*) filter(where base_snapshot->'entities'->e.id is distinct from
      jsonb_strip_nulls(jsonb_build_object('kind',e.kind,'parentId',e.parent_id,'position',e.position,'data',e.data))),
    'reordered',count(*) filter(where (base_snapshot->'entities'->e.id->>'position')::integer is distinct from e.position),
    'translations',(select count(*) from portfolio_editorial.draft_locales where draft_id=1),
    'media',jsonb_array_length(draft_document->'media')
  ) into summary from portfolio_editorial.draft_entities e where e.draft_id=1;

  review_hash := encode(extensions.digest((jsonb_build_object('revision',current_revision,'draft',draft_document))::text,'sha256'),'hex');
  return jsonb_build_object('revision',current_revision,'valid',jsonb_array_length(errors)=0,
    'errors',errors,'summary',summary,'reviewHash',review_hash);
end $$;

create function public.validate_editor_publication(expected_revision bigint)
returns jsonb language sql security definer set search_path='' as $$
  select portfolio_editorial.validate_publication(expected_revision,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on function portfolio_editorial.required_translation_fields(text),
  portfolio_editorial.validate_publication(bigint,uuid) from public,anon,authenticated,service_role;
revoke all on function public.validate_editor_publication(bigint) from public,anon;
grant execute on function public.validate_editor_publication(bigint) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.required_translation_fields(text) owner to portfolio_editorial_executor;
alter function portfolio_editorial.validate_publication(bigint,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.validate_editor_publication(bigint) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
