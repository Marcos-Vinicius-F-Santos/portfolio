set role authenticated;
set request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111"}';
select public.save_editor_command(0,'15000000-0000-4000-8000-000000000001',
 '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Sobre mim vertical"}'::jsonb);

reset role;
set role anon;
do $$ begin
 if public.get_published_snapshot(null)->'translations'->'pt-BR'->'copy-aboutTitle'->>'text'='Sobre mim vertical'
 then raise exception 'anonymous reader observed the private draft';end if;
end $$;

reset role;
set role authenticated;
set request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111"}';
select (public.validate_editor_publication(1)->>'reviewHash') as review_hash \gset
select public.publish_editor_draft(1,'15000000-0000-4000-8000-000000000002',:'review_hash');
select public.publish_editor_draft(1,'15000000-0000-4000-8000-000000000002',:'review_hash');

reset role;
set role anon;
do $$ begin
 if public.get_published_snapshot(null)->'translations'->'pt-BR'->'copy-aboutTitle'->>'text'<>'Sobre mim vertical'
 then raise exception 'anonymous reader did not observe the confirmed publication';end if;
end $$;
reset role;
