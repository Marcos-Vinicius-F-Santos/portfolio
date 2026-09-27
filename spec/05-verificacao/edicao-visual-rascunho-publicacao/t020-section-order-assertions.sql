set request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111"}';set role authenticated;
do $$declare receipt jsonb;review jsonb;publication jsonb;begin
 receipt:=public.set_editor_section_order(0,'20000000-0000-4000-8000-000000000001',array['presentation-section','skills-section','about-section','results-section','experiences-section','projects-section','education-section','contact-section']);
 if receipt->>'revision'<>'1' then raise exception 'section order revision missing';end if;
 review:=public.validate_editor_publication(1);if review->>'valid'<>'true'then raise exception 'reordered draft invalid';end if;
 publication:=public.publish_editor_draft(1,'20000000-0000-4000-8000-000000000002',review->>'reviewHash');
 if public.get_published_snapshot(null)->'sections'->1->>'id'<>'skills-section'then raise exception 'published section order missing';end if;
end$$;reset role;
