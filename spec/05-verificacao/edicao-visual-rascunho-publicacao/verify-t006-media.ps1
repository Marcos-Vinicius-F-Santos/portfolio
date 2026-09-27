param([string]$PostgresImage = 'public.ecr.aws/supabase/postgres:17.6.1.167')
$ErrorActionPreference = 'Stop'
$name = "portfolio-t006-$PID"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Resolve-Path (Join-Path $root '..\..\..')
function File([string]$path) { Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if($LASTEXITCODE){throw "SQL failed: $path"} }
function FileAs([string]$path,[string]$user) { Get-Content -LiteralPath $path -Raw | docker exec -i $name psql -v ON_ERROR_STOP=1 -U $user -d postgres; if($LASTEXITCODE){throw "SQL failed as ${user}: $path"} }
function Sql([string]$sql,[bool]$ok=$true) { $sql | docker exec -i $name psql -v ON_ERROR_STOP=1 -U postgres -d postgres; if(($LASTEXITCODE -eq 0) -ne $ok){throw "Unexpected SQL result: $sql"} }
try {
  docker run --rm -d --name $name -e POSTGRES_PASSWORD=t006-local-only $PostgresImage | Out-Null
  foreach($i in 1..60){docker exec $name pg_isready -U postgres -d postgres *> $null;if($LASTEXITCODE -eq 0){break};Start-Sleep -Milliseconds 500}
  Start-Sleep -Seconds 5
  File (Join-Path $root 't005-schema-fixture.sql')
  File (Join-Path $root 't006-media-fixture.sql')
  FileAs (Join-Path $root 't006-storage-fixture.sql') 'supabase_admin'
  File (Join-Path $project 'supabase\migrations\20260926093000_create_private_editorial_schema.sql')
  File (Join-Path $project 'supabase\migrations\20260926100000_create_private_editorial_media_flow.sql')
  File (Join-Path $root 't006-media-assertions.sql')
  Sql "set role portfolio_editorial_executor; select * from public.portfolio_admins;" $true
  Sql "set role authenticated; set request.jwt.claims='{""sub"":""11111111-1111-4111-8111-111111111111""}'; do `$`$ begin if (current_setting('request.jwt.claims',true)::jsonb->>'sub') <> '11111111-1111-4111-8111-111111111111' then raise exception 'claim missing'; end if; end `$`$;" $true
  Sql "set role authenticated; set request.jwt.claims='{""sub"":""22222222-2222-4222-8222-222222222222""}'; select * from public.reserve_editorial_media(0,'project_image','x.png','image/png',100);" $false
  Sql "set role authenticated; set request.jwt.claims='{""sub"":""11111111-1111-4111-8111-111111111111""}'; select * from public.reserve_editorial_media(0,'project_image','x.png','image/png',1048576);" $true
  Sql "set role authenticated; set request.jwt.claims='{""sub"":""11111111-1111-4111-8111-111111111111""}'; select * from public.reserve_editorial_media(0,'project_image','x.png','image/png',1048577);" $false
  Sql "set role authenticated; set request.jwt.claims='{""sub"":""11111111-1111-4111-8111-111111111111""}'; select * from public.reserve_editorial_media(0,'skill_icon','x.svg','image/svg+xml',100);" $false
  Sql "insert into portfolio_editorial.draft_entities(id,kind,position) values('project-1','project',0); insert into portfolio_editorial.draft_media_refs(entity_id,field,media_id) select 'project-1','projectImage',id from portfolio_editorial.media limit 1;" $false
  File (Join-Path $root 't006-rollback.sql')
  File (Join-Path $root 't005-rollback.sql')
  Write-Output 'T-006 private media flow and rollback: PASS'
} finally { docker rm -f $name *> $null }
