param([string]$PostgresImage='public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference='Stop';$name="portfolio-t012-$PID";$root=Split-Path -Parent $MyInvocation.MyCommand.Path;$project=Resolve-Path(Join-Path $root '..\..\..')
function F($p,$u='postgres'){Get-Content -LiteralPath $p -Raw|docker exec -i $name psql -v ON_ERROR_STOP=1 -U $u -d postgres;if($LASTEXITCODE){throw "SQL failed: $p"}}
function Q($q){$q|docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres;if($LASTEXITCODE){throw 'SQL failed'}}
try{docker run --rm -d --name $name -e POSTGRES_PASSWORD=t012-local-only $PostgresImage|Out-Null;foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if(!$LASTEXITCODE){break};Start-Sleep -Milliseconds 500};Start-Sleep -Seconds 5
 F(Join-Path $root 't005-schema-fixture.sql');F(Join-Path $root 't006-media-fixture.sql');F(Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
 foreach($m in '20260926093000_create_private_editorial_schema.sql','20260926100000_create_private_editorial_media_flow.sql','20260926103000_import_initial_editorial_snapshot.sql','20260926110000_create_atomic_editorial_commands.sql','20260926113000_validate_editorial_publication.sql','20260926120000_publish_editorial_draft.sql','20260926123000_create_versioned_public_reader.sql'){F(Join-Path $project "supabase/migrations/$m")}
 Q 'set role anon;select public.get_published_snapshot(null)->>''publicationId'';'
 F(Join-Path $root 't012-reader-assertions.sql');F(Join-Path $root 't012-rollback.sql');Write-Output 'T-012 fixed public reader, window and rollback: PASS'
}finally{docker rm -f $name *> $null}
