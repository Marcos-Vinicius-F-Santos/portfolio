-- Safe feature rollback: keep the additive table for compatibility, restore the active order and disable writes.
revoke all on function public.set_editor_section_order(bigint,uuid,text[]) from authenticated;
drop function public.set_editor_section_order(bigint,uuid,text[]);
drop function portfolio_editorial.set_section_order(bigint,uuid,text[],uuid);
delete from portfolio_editorial.draft_sections where draft_id=1;
insert into portfolio_editorial.draft_sections(draft_id,id,kind,position)
select 1,s.value->>'id',s.value->>'kind',(s.value->>'position')::integer from portfolio_editorial.site_state st join portfolio_editorial.publications p on p.id=st.active_publication_id cross join lateral jsonb_array_elements(p.snapshot->'sections')s where st.id=1;
