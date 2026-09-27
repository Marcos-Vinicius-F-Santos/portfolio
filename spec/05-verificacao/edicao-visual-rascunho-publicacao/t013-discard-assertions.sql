do $$ declare active_id uuid; original text; r jsonb;
begin
 select active_publication_id into active_id from portfolio_editorial.site_state;
 select fields->>'text' into original from portfolio_editorial.draft_translations where entity_id='copy-aboutTitle' and locale_code='pt-BR';
 perform portfolio_editorial.apply_draft_command(0,'13000000-0000-4000-8000-000000000001','{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Descartar"}','11111111-1111-4111-8111-111111111111');
 r:=portfolio_editorial.discard_draft(1,'13000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111');
 if r->>'revision'<>'2' or (select fields->>'text' from portfolio_editorial.draft_translations where entity_id='copy-aboutTitle' and locale_code='pt-BR')<>original then raise exception 'discard did not restore active snapshot';end if;
 if (select active_publication_id from portfolio_editorial.site_state)<>active_id then raise exception 'discard changed public pointer';end if;
 r:=portfolio_editorial.discard_draft(1,'13000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111');
 if r->>'repeated'<>'true' or r->>'revision'<>'2' then raise exception 'discard retry failed';end if;
 begin perform portfolio_editorial.discard_draft(1,'13000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111');raise exception 'stale discard accepted';exception when serialization_failure then null;end;
end $$;
