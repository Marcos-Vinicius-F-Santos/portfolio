import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const snapshotPath = resolve(root, 'spec/05-verificacao/joao-vitor/snapshot-joao-v1.json');
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
const compactSnapshot = JSON.stringify(snapshot).replaceAll("'", "''");
const hash = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

const sql = `-- =====================================================================
-- PUBLICACAO DIRETA DE SNAPSHOT E BUCKETS — JOAO VITOR
-- =====================================================================

-- 1. Buckets de Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 3145728, array['image/png', 'image/jpeg', 'image/webp']),
  ('skill-icons', 'skill-icons', true, 1048576, array['image/png', 'image/jpeg', 'image/svg+xml']),
  ('curricula', 'curricula', true, 52428800, array['application/pdf']),
  ('editorial-profile-images', 'editorial-profile-images', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Leitura publica dos buckets
drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('project-images', 'skill-icons', 'curricula', 'editorial-profile-images'));

-- 3. Atualizar constraint de entidades para aceitar 'profile'
alter table portfolio_editorial.draft_entities drop constraint if exists draft_entities_kind_check;
alter table portfolio_editorial.draft_entities add constraint draft_entities_kind_check check (kind in (
  'presentation', 'profile', 'about', 'result', 'experience', 'skillCategory', 'skill',
  'academic', 'project', 'contact', 'projectLink', 'projectImage', 'curriculum',
  'interfaceText', 'listItem'
));

-- 4. Insercao e publicacao do snapshot
do $$
declare
  payload jsonb := '${compactSnapshot}'::jsonb;
begin
  insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position)
    values (1,'en','English','ltr','active',1)
    on conflict(draft_id,code) do update set label=excluded.label,status=excluded.status,position=excluded.position;

  insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data)
    select 1,e.key,e.value->>'kind',nullif(e.value->>'parentId',''),(e.value->>'position')::int,e.value->'data'
    from jsonb_each(payload->'entities') e
    on conflict(draft_id,id) do update set kind=excluded.kind,parent_id=excluded.parent_id,position=excluded.position,data=excluded.data;

  insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields)
    select 1,e.key,l.key,l.value->e.key
    from jsonb_each(payload->'entities') e
    cross join jsonb_each(payload->'translations') l
    on conflict(draft_id,entity_id,locale_code) do update set fields=excluded.fields;

  insert into portfolio_editorial.technologies(id,label,aliases,bundled_asset)
    select t.key,t.value->>'label',array(select jsonb_array_elements_text(t.value->'aliases')),
           case when t.value ? 'iconMediaId' then payload->'media'->(t.value->>'iconMediaId')->>'assetPath' end
    from jsonb_each(payload->'technologies') t
    on conflict(id) do update set label=excluded.label,aliases=excluded.aliases,bundled_asset=excluded.bundled_asset;

  insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision)
    values ('${snapshot.publicationId}',1,payload,'${hash}',0)
    on conflict(id) do update set snapshot=excluded.snapshot, hash=excluded.hash;

  update portfolio_editorial.draft set base_publication_id='${snapshot.publicationId}',updated_at=now() where id=1;
  update portfolio_editorial.site_state set active_publication_id='${snapshot.publicationId}',updated_at=now() where id=1;
end $$;
`;

const outputPath = resolve(root, 'spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql');
await writeFile(outputPath, sql, 'utf8');
console.log('Criado com sucesso em:', outputPath);
