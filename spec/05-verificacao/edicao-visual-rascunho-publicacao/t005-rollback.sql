-- Safe while the editorial schema is not enabled and has not received data.
-- After T-007, export drafts/publications before using this destructive rollback.
drop schema if exists portfolio_editorial cascade;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'portfolio_editorial_owner') then
    revoke portfolio_editorial_owner from postgres;
    drop role portfolio_editorial_owner;
  end if;
end
$$;
