param([string]$PostgresImage='public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference='Stop'; $name="portfolio-t008-$PID"
$root=Split-Path -Parent $MyInvocation.MyCommand.Path; $project=Resolve-Path (Join-Path $root '..\..\..')
function SqlFile($path){ Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if($LASTEXITCODE-ne 0){throw "SQL failed: $path"} }
function SqlFileAs($path,$user){ Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U $user -d postgres; if($LASTEXITCODE-ne 0){throw "SQL failed as ${user}: $path"} }
function Sql($query,[bool]$ok=$true){ $query | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if(($LASTEXITCODE-eq 0)-ne $ok){throw "Unexpected SQL result: $query"} }
try {
  docker run --rm -d --name $name -e POSTGRES_PASSWORD=t008-local-only $PostgresImage | Out-Null
  foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if($LASTEXITCODE-eq 0){break};Start-Sleep -Milliseconds 500}; Start-Sleep -Seconds 5
  SqlFile (Join-Path $root 't005-schema-fixture.sql')
  SqlFile (Join-Path $root 't006-media-fixture.sql')
  SqlFileAs (Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
  SqlFile (Join-Path $project 'supabase/migrations/20260926093000_create_private_editorial_schema.sql')
  SqlFile (Join-Path $project 'supabase/migrations/20260926100000_create_private_editorial_media_flow.sql')
  SqlFile (Join-Path $project 'supabase/migrations/20260926103000_import_initial_editorial_snapshot.sql')
  SqlFile (Join-Path $project 'supabase/migrations/20260926110000_create_atomic_editorial_commands.sql')
  SqlFile (Join-Path $root 't008-command-assertions.sql')
  Sql "set role anon; select public.save_editor_command(4,'10000000-0000-4000-8000-000000000007','{`"type`":`"remove_entity`",`"entityId`":`"github`"}'::jsonb);" $false
  Sql "set role authenticated; set request.jwt.claims='{`"sub`":`"22222222-2222-4222-8222-222222222222`"}'; select public.save_editor_command(4,'10000000-0000-4000-8000-000000000007','{`"type`":`"remove_entity`",`"entityId`":`"github`"}'::jsonb);" $false
  Sql "set role authenticated; set request.jwt.claims='{`"sub`":`"11111111-1111-4111-8111-111111111111`"}'; select public.save_editor_command(0,'10000000-0000-4000-8000-000000000001','{`"type`":`"set_translation`",`"entityId`":`"copy-aboutTitle`",`"locale`":`"pt-BR`",`"field`":`"text`",`"value`":`"Sobre mim atualizado`"}'::jsonb);" $true
  SqlFile (Join-Path $root 't008-rollback.sql')
  Write-Output 'T-008 atomic commands, conflicts, idempotency and rollback: PASS'
} finally { docker rm -f $name *> $null }
