do $$ declare v jsonb; h text; r jsonb; first_id text;
begin
 v:=portfolio_editorial.validate_publication(0,'11111111-1111-4111-8111-111111111111');h:=v->>'reviewHash';
 r:=portfolio_editorial.publish_draft(0,'11000000-0000-4000-8000-000000000001',h,'11111111-1111-4111-8111-111111111111');
 first_id:=r->>'publicationId';
 if (select count(*) from portfolio_editorial.publications)<>1 then raise exception 'unchanged publication duplicated snapshot';end if;
 r:=portfolio_editorial.publish_draft(0,'11000000-0000-4000-8000-000000000001',h,'11111111-1111-4111-8111-111111111111');
 if r->>'repeated'<>'true' or r->>'publicationId'<>first_id then raise exception 'publication retry changed result';end if;
 perform portfolio_editorial.apply_draft_command(0,'11000000-0000-4000-8000-000000000002','{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Novo sobre"}','11111111-1111-4111-8111-111111111111');
 begin perform portfolio_editorial.publish_draft(1,'11000000-0000-4000-8000-000000000003',h,'11111111-1111-4111-8111-111111111111');raise exception 'old review hash accepted';exception when serialization_failure then null;end;
 if (select active_publication_id::text from portfolio_editorial.site_state)<>first_id then raise exception 'failed publish changed pointer';end if;
 v:=portfolio_editorial.validate_publication(1,'11111111-1111-4111-8111-111111111111');
 r:=portfolio_editorial.publish_draft(1,'11000000-0000-4000-8000-000000000004',v->>'reviewHash','11111111-1111-4111-8111-111111111111');
 if r->>'publicationId'=first_id or (select count(*) from portfolio_editorial.publications)<>2 then raise exception 'changed publish missing';end if;
 if (select active_publication_id::text from portfolio_editorial.site_state)<>r->>'publicationId' then raise exception 'pointer not promoted';end if;
end $$;
