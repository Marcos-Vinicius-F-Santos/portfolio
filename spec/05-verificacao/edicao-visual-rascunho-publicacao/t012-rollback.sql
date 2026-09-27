drop function if exists public.get_published_snapshot(uuid);
drop function if exists portfolio_editorial.read_publication(uuid);
drop trigger if exists track_publication_access on portfolio_editorial.site_state;
drop function if exists portfolio_editorial.track_publication_access();
drop table if exists portfolio_editorial.publication_access;
