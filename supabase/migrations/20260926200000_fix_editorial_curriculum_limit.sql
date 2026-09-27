-- T-023 / ADR-008: make the local and migrated editorial curriculum limit explicit.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']
where id = 'editorial-curricula';

-- Rollback: restore inheritance from the configured global Storage limit.
-- update storage.buckets set file_size_limit = null where id = 'editorial-curricula';
