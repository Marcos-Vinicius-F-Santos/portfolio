drop function if exists public.finalize_editorial_media(bigint, uuid);
drop function if exists public.reserve_editorial_media(bigint, text, text, text, bigint);
drop policy if exists editorial_media_admin_select on storage.objects;
drop policy if exists editorial_media_admin_insert on storage.objects;

delete from storage.buckets
where id in ('editorial-project-images', 'editorial-skill-icons', 'editorial-curricula')
  and not exists (select 1 from storage.objects where bucket_id = storage.buckets.id);

drop table if exists portfolio_editorial.draft_media_refs;
drop table if exists portfolio_editorial.media;
drop function if exists portfolio_editorial.validate_media_reference();
drop function if exists portfolio_editorial.finalize_media(bigint, uuid, uuid);
drop function if exists portfolio_editorial.can_access_pending_media(text, text, uuid);
drop function if exists portfolio_editorial.reserve_media(bigint, text, text, text, bigint, uuid);
drop function if exists portfolio_editorial.require_editorial_admin(uuid);
drop policy if exists portfolio_admins_editorial_executor_select on public.portfolio_admins;
drop policy if exists draft_media_executor_select on portfolio_editorial.draft;
revoke select on portfolio_editorial.draft from portfolio_editorial_executor;
revoke all on public.portfolio_admins from portfolio_editorial_executor;
revoke usage on schema portfolio_editorial from portfolio_editorial_executor;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'portfolio_editorial_executor') then
    revoke portfolio_editorial_executor from postgres;
    drop role portfolio_editorial_executor;
  end if;
end
$$;
