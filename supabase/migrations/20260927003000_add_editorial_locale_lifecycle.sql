-- T-025: locale lifecycle through the same revisioned command boundary.
create function public.set_editor_locale(
  expected_revision bigint, operation_id uuid, code text, label text, status text, locale_position integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''), nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid);
  if code is null or code !~ '^[a-z]{2,3}(?:-[A-Z]{2})?$' or code = 'pt-BR' or label is null or length(trim(label)) = 0 or status not in ('preparation','active') or locale_position < 0 then raise exception 'invalid locale' using errcode='22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object('code',code,'label',label,'status',status,'position',locale_position)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=set_editor_locale.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result || jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode='40001', detail=current_revision::text; end if;
  insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values(1,code,label,'ltr',status,locale_position)
    on conflict (draft_id,code) do update set label=excluded.label,status=excluded.status,position=excluded.position;
  update portfolio_editorial.draft set revision=revision+1,updated_at=now() where id=1 returning revision into current_revision;
  receipt=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;
revoke all on function public.set_editor_locale(bigint,uuid,text,text,text,integer) from public,anon;
grant execute on function public.set_editor_locale(bigint,uuid,text,text,text,integer) to authenticated;
