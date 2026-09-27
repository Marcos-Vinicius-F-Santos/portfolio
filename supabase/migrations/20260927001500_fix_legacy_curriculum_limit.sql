-- T-023: make the legacy curriculum bucket deterministic during migration.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']
where id = 'curricula';

-- Rollback: restore the prior account-level inheritance.
-- update storage.buckets set file_size_limit = null where id = 'curricula';
