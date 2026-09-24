alter table public.portfolio_experiences
  rename column company_context to name;

-- Rollback manual:
-- alter table public.portfolio_experiences
--   rename column name to company_context;
