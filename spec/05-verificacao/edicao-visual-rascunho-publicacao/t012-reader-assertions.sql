do $$ declare old_id uuid; new_id uuid; v jsonb; r jsonb;
begin
 select active_publication_id into old_id from portfolio_editorial.site_state;
 if portfolio_editorial.read_publication(null)->>'publicationId'<>old_id::text then raise exception 'active read failed';end if;
 perform portfolio_editorial.apply_draft_command(0,'12000000-0000-4000-8000-000000000001','{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Versão nova"}','11111111-1111-4111-8111-111111111111');
 v:=portfolio_editorial.validate_publication(1,'11111111-1111-4111-8111-111111111111');
 r:=portfolio_editorial.publish_draft(1,'12000000-0000-4000-8000-000000000002',v->>'reviewHash','11111111-1111-4111-8111-111111111111');new_id:=(r->>'publicationId')::uuid;
 if portfolio_editorial.read_publication(old_id)->>'publicationId'<>old_id::text or portfolio_editorial.read_publication(null)->>'publicationId'<>new_id::text then raise exception 'fixed or active read mixed versions';end if;
 update portfolio_editorial.publication_access set public_until=now()-interval '1 second' where publication_id=old_id;
 begin perform portfolio_editorial.read_publication(old_id);raise exception 'expired version accepted';exception when no_data_found then null;end;
end $$;
