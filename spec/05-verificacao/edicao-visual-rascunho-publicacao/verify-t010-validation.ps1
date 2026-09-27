param([string]$PostgresImage='public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference='Stop'; $name="portfolio-t010-$PID"; $root=Split-Path -Parent $MyInvocation.MyCommand.Path; $project=Resolve-Path (Join-Path $root '..\..\..')
function F($p,$u='postgres'){Get-Content -LiteralPath $p -Raw|docker exec -i $name psql -v ON_ERROR_STOP=1 -U $u -d postgres;if($LASTEXITCODE){throw "SQL failed: $p"}}
function Q($q,[bool]$ok=$true){$q|docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres;if(($LASTEXITCODE-eq 0)-ne $ok){throw 'Unexpected SQL result'}}
try{
 docker run --rm -d --name $name -e POSTGRES_PASSWORD=t010-local-only $PostgresImage|Out-Null
 foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if(!$LASTEXITCODE){break};Start-Sleep -Milliseconds 500};Start-Sleep -Seconds 5
 F (Join-Path $root 't005-schema-fixture.sql');F (Join-Path $root 't006-media-fixture.sql');F (Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
 F (Join-Path $project 'supabase/migrations/20260926093000_create_private_editorial_schema.sql');F (Join-Path $project 'supabase/migrations/20260926100000_create_private_editorial_media_flow.sql');F (Join-Path $project 'supabase/migrations/20260926103000_import_initial_editorial_snapshot.sql');F (Join-Path $project 'supabase/migrations/20260926110000_create_atomic_editorial_commands.sql');F (Join-Path $project 'supabase/migrations/20260926113000_validate_editorial_publication.sql')
 F (Join-Path $root 't010-validation-assertions.sql')
 Q "set role anon;select public.validate_editor_publication(0);" $false
 Q "set role authenticated;set request.jwt.claims='{`"sub`":`"22222222-2222-4222-8222-222222222222`"}';select public.validate_editor_publication(0);" $false
 F (Join-Path $root 't010-rollback.sql');Write-Output 'T-010 validation, summary, review hash and rollback: PASS'
}finally{docker rm -f $name *> $null}
