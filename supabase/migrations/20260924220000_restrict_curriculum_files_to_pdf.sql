alter table public.portfolio_files
  add constraint portfolio_files_curriculum_pdf_mime_check
  check (file_type <> 'curriculum' or mime_type = 'application/pdf');

update storage.buckets
set allowed_mime_types = array['application/pdf']::text[]
where id = 'curricula';

-- Rollback:
-- alter table public.portfolio_files
--   drop constraint portfolio_files_curriculum_pdf_mime_check;
-- update storage.buckets
-- set allowed_mime_types = null
-- where id = 'curricula';
