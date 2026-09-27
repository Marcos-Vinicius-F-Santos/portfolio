param([string]$PostgresImage='public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference='Stop';$name="portfolio-t013-$PID";$root=Split-Path -Parent $MyInvocation.MyCommand.Path;$project=Resolve-Path(Join-Path $root '..\..\..')
function F($p,$u='postgres'){Get-Content -LiteralPath $p -Raw|docker exec -i $name psql -v ON_ERROR_STOP=1 -U $u -d postgres;if($LASTEXITCODE){throw "SQL failed: $p"}}
function Q($q,[bool]$ok=$true){$q|docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres;if(($LASTEXITCODE-eq 0)-ne $ok){throw 'Unexpected SQL result'}}
try{docker run --rm -d --name $name -e POSTGRES_PASSWORD=t013-local-only $PostgresImage|Out-Null;foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if(!$LASTEXITCODE){break};Start-Sleep -Milliseconds 500};Start-Sleep -Seconds 5
 F(Join-Path $root 't005-schema-fixture.sql');F(Join-Path $root 't006-media-fixture.sql');F(Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
 foreach($m in '20260926093000_create_private_editorial_schema.sql','20260926100000_create_private_editorial_media_flow.sql','20260926103000_import_initial_editorial_snapshot.sql','20260926110000_create_atomic_editorial_commands.sql','20260926113000_validate_editorial_publication.sql','20260926120000_publish_editorial_draft.sql','20260926130000_discard_editorial_draft.sql'){F(Join-Path $project "supabase/migrations/$m")}
 F(Join-Path $root 't013-discard-assertions.sql')
 Q "set role anon;select public.discard_editor_draft(2,'13000000-0000-4000-8000-000000000009');" $false
 Q "set role authenticated;set request.jwt.claims='{`"sub`":`"22222222-2222-4222-8222-222222222222`"}';select public.discard_editor_draft(2,'13000000-0000-4000-8000-000000000009');" $false
 F(Join-Path $root 't013-rollback.sql');Write-Output 'T-013 discard, session history contract and rollback: PASS'
}finally{docker rm -f $name *> $null}
