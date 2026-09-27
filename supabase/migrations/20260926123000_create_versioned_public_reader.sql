-- T-012 / ADR-008: immutable public reads with a 30-minute navigation window.
create table portfolio_editorial.publication_access(
 publication_id uuid primary key references portfolio_editorial.publications(id) on delete cascade,
 public_until timestamptz,
 created_at timestamptz not null default now()
);
alter table portfolio_editorial.publication_access enable row level security;
alter table portfolio_editorial.publication_access force row level security;
grant select,insert,update on portfolio_editorial.publication_access to portfolio_editorial_executor;
create policy publication_access_executor_all on portfolio_editorial.publication_access
 for all to portfolio_editorial_executor using(true) with check(true);
create policy publication_access_owner_all on portfolio_editorial.publication_access
 for all to portfolio_editorial_owner using(true) with check(true);
insert into portfolio_editorial.publication_access(publication_id,public_until)
 select active_publication_id,null from portfolio_editorial.site_state where active_publication_id is not null;

create function portfolio_editorial.track_publication_access()
returns trigger language plpgsql set search_path='' as $$ begin
 if old.active_publication_id is distinct from new.active_publication_id then
  if old.active_publication_id is not null then
   insert into portfolio_editorial.publication_access(publication_id,public_until) values(old.active_publication_id,now()+interval '30 minutes')
   on conflict(publication_id) do update set public_until=excluded.public_until;
  end if;
  if new.active_publication_id is not null then
   insert into portfolio_editorial.publication_access(publication_id,public_until) values(new.active_publication_id,null)
   on conflict(publication_id) do update set public_until=null;
  end if;
 end if; return new;
end $$;
create trigger track_publication_access before update of active_publication_id on portfolio_editorial.site_state
 for each row execute function portfolio_editorial.track_publication_access();

create function portfolio_editorial.read_publication(requested uuid default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare chosen uuid; result jsonb;
begin
 select active_publication_id into chosen from portfolio_editorial.site_state where id=1;
 chosen:=coalesce(requested,chosen);
 if chosen is null or not exists(select 1 from portfolio_editorial.publication_access a
   join portfolio_editorial.site_state s on s.id=1
   where a.publication_id=chosen and (s.active_publication_id=chosen or a.public_until>now())) then
  raise exception 'VERSION_EXPIRED' using errcode='P0002'; end if;
 select snapshot into result from portfolio_editorial.publications where id=chosen;
 if result is null then raise exception 'VERSION_EXPIRED' using errcode='P0002'; end if;
 return result;
end $$;
create function public.get_published_snapshot(publication_id uuid default null)
returns jsonb language sql stable security definer set search_path='' as $$
 select portfolio_editorial.read_publication(publication_id)
$$;
revoke all on portfolio_editorial.publication_access from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.read_publication(uuid),portfolio_editorial.track_publication_access() from public,anon,authenticated,service_role;
revoke all on function public.get_published_snapshot(uuid) from public;
grant execute on function public.get_published_snapshot(uuid) to anon,authenticated;
alter table portfolio_editorial.publication_access owner to portfolio_editorial_owner;
alter function portfolio_editorial.track_publication_access() owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.read_publication(uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.get_published_snapshot(uuid) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
