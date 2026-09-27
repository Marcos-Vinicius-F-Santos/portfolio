param([string]$PostgresImage='public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference='Stop'; $name="portfolio-t018-$PID"
$root=Split-Path -Parent $MyInvocation.MyCommand.Path; $project=Resolve-Path (Join-Path $root '..\..\..')
function SqlFile($path){ Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if($LASTEXITCODE-ne 0){throw "SQL failed: $path"} }
function SqlFileAs($path,$user){ Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U $user -d postgres; if($LASTEXITCODE-ne 0){throw "SQL failed as ${user}: $path"} }
function Sql($query,[bool]$ok=$true){ $query | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if(($LASTEXITCODE-eq 0)-ne $ok){throw "Unexpected SQL result"} }
try {
  docker run --rm -d --name $name -e POSTGRES_PASSWORD=t018-local-only $PostgresImage | Out-Null
  foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if($LASTEXITCODE-eq 0){break};Start-Sleep -Milliseconds 500}; Start-Sleep -Seconds 5
  SqlFile (Join-Path $root 't005-schema-fixture.sql'); SqlFile (Join-Path $root 't006-media-fixture.sql'); SqlFileAs (Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
  foreach($migration in @('20260926093000_create_private_editorial_schema.sql','20260926100000_create_private_editorial_media_flow.sql','20260926103000_import_initial_editorial_snapshot.sql','20260926110000_create_atomic_editorial_commands.sql','20260926113000_validate_editorial_publication.sql','20260926120000_publish_editorial_draft.sql','20260926123000_create_versioned_public_reader.sql','20260926130000_discard_editorial_draft.sql','20260926133000_create_editorial_history.sql','20260926140000_read_draft_and_manage_technologies.sql')){SqlFile (Join-Path $project "supabase/migrations/$migration")}
  SqlFile (Join-Path $root 't018-technology-assertions.sql')
  Sql "set role anon; select public.get_editor_draft();" $false
  Sql "set role authenticated; set request.jwt.claims='{`"sub`":`"11111111-1111-4111-8111-111111111111`"}'; select public.set_editor_technologies(1,'18000000-0000-4000-8000-000000000002','3c67f7d3-57a6-4ece-af10-496b8ca33727',array['missing']);" $false
  Write-Output 'T-018 draft reader and technology associations: PASS'
} finally { docker rm -f $name *> $null }
