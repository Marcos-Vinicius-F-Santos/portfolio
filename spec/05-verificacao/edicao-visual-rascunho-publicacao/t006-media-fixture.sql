create table public.portfolio_admins (user_id uuid primary key);
alter table public.portfolio_admins enable row level security;
create policy portfolio_admins_select_self on public.portfolio_admins for select to authenticated
using (user_id = (select auth.uid()));
grant select on public.portfolio_admins to authenticated;
insert into public.portfolio_admins values ('11111111-1111-4111-8111-111111111111');
