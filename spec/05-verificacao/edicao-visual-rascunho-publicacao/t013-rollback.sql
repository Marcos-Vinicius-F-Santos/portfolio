drop function if exists public.discard_editor_draft(bigint,uuid);
drop function if exists portfolio_editorial.discard_draft(bigint,uuid,uuid);
drop policy if exists draft_locales_executor_write on portfolio_editorial.draft_locales;
revoke insert,update,delete on portfolio_editorial.draft_locales from portfolio_editorial_executor;
delete from portfolio_editorial.operations where type='discard';
alter table portfolio_editorial.operations drop constraint operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check check(type in('draft_command','publication'));
