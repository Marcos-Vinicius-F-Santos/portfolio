do $$ declare active_id uuid;source_id uuid;before_text text;restored_text text;r jsonb;i int;
begin
 select active_publication_id into active_id from portfolio_editorial.site_state;
 for i in 1..10 loop insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision)
  values(gen_random_uuid(),1,jsonb_build_object('formatVersion',1,'marker',i),encode(extensions.digest(('history-'||i)::text,'sha256'),'hex'),i);end loop;
 update portfolio_editorial.site_state set active_publication_id=(select id from portfolio_editorial.publications order by sequence desc limit 1) where id=1;
 select active_publication_id into active_id from portfolio_editorial.site_state;
 if(select count(*) from portfolio_editorial.publications where retained)<>10 then raise exception 'retention did not keep ten: %',(select count(*) from portfolio_editorial.publications where retained);end if;
 select id into source_id from portfolio_editorial.publications where retained and id<>active_id order by sequence asc limit 1;
 select snapshot->>'marker' into before_text from portfolio_editorial.publications where id=source_id;
 r:=portfolio_editorial.restore_publication(source_id,0,'14000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111');
 select p.snapshot->>'marker' into restored_text from portfolio_editorial.draft d join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
 if r->>'revision'<>'1' or restored_text<>before_text then raise exception 'restore did not target retained version';end if;
 if(select active_publication_id from portfolio_editorial.site_state)<>active_id then raise exception 'restore published unexpectedly';end if;
 if jsonb_array_length(portfolio_editorial.list_history('11111111-1111-4111-8111-111111111111'))<>10 then raise exception 'history list invalid';end if;
 r:=portfolio_editorial.restore_publication(source_id,0,'14000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111');if r->>'repeated'<>'true' then raise exception 'restore retry failed';end if;
end $$;
