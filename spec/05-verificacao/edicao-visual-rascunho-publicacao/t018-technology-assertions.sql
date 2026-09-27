set request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111"}';
set role authenticated;
do $$ declare draft jsonb; receipt jsonb; begin
  draft:=public.get_editor_draft();
  if draft->>'revision'<>'0' or jsonb_array_length(draft->'entities'->'3c67f7d3-57a6-4ece-af10-496b8ca33727'->'data'->'technologyIds')<1 then raise exception 'draft reader lost technology associations'; end if;
  receipt:=public.set_editor_technologies(0,'18000000-0000-4000-8000-000000000001','3c67f7d3-57a6-4ece-af10-496b8ca33727',array['java','postgresql']);
  if receipt->>'revision'<>'1' then raise exception 'technology command did not advance revision'; end if;
  if public.set_editor_technologies(0,'18000000-0000-4000-8000-000000000001','3c67f7d3-57a6-4ece-af10-496b8ca33727',array['java','postgresql'])->>'repeated'<>'true' then raise exception 'retry not idempotent'; end if;
end $$;
reset role;
