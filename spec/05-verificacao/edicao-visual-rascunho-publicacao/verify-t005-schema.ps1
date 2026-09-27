param(
  [string]$PostgresImage = 'public.ecr.aws/supabase/postgres:17.6.1.167'
)

$ErrorActionPreference = 'Stop'
$containerName = "portfolio-t005-$PID"
$verificationRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $verificationRoot '..\..\..')
$migration = Join-Path $projectRoot 'supabase\migrations\20260926093000_create_private_editorial_schema.sql'
$fixture = Join-Path $verificationRoot 't005-schema-fixture.sql'
$assertions = Join-Path $verificationRoot 't005-schema-assertions.sql'
$rollback = Join-Path $verificationRoot 't005-rollback.sql'

function Invoke-SqlFile([string]$Path) {
  Get-Content -LiteralPath $Path -Raw |
    docker exec -i $containerName psql -v ON_ERROR_STOP=1 -U postgres -d postgres
  if ($LASTEXITCODE -ne 0) { throw "SQL failed: $Path" }
}

function Invoke-Sql([string]$Sql, [bool]$ExpectSuccess = $true) {
  $Sql | docker exec -i $containerName psql -v ON_ERROR_STOP=1 -U postgres -d postgres
  $succeeded = $LASTEXITCODE -eq 0
  if ($succeeded -ne $ExpectSuccess) {
    throw "Unexpected SQL result (success=$succeeded): $Sql"
  }
}

try {
  docker run --rm --detach --name $containerName --env POSTGRES_PASSWORD=t005-local-only $PostgresImage |
    Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not start isolated PostgreSQL.' }

  $ready = $false
  foreach ($attempt in 1..60) {
    docker exec $containerName pg_isready -U postgres -d postgres *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'PostgreSQL did not become ready.' }
  # The Supabase PostgreSQL image performs one internal restart after its first
  # readiness response while finishing extension/bootstrap configuration.
  Start-Sleep -Seconds 5
  docker exec $containerName pg_isready -U postgres -d postgres *> $null
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL did not remain stable after bootstrap.' }

  Invoke-SqlFile $fixture
  Invoke-SqlFile $migration
  Invoke-SqlFile $assertions

  Invoke-Sql "set role anon; select * from portfolio_editorial.draft;" $false
  Invoke-Sql "set role authenticated; select * from portfolio_editorial.draft;" $false
  Invoke-Sql "set role service_role; select * from portfolio_editorial.draft;" $false
  Invoke-Sql "update portfolio_editorial.publications set snapshot = '{`"formatVersion`":1,`"changed`":true}'::jsonb where id = '00000000-0000-4000-8000-000000000001';" $false
  Invoke-Sql "delete from portfolio_editorial.draft_locales where code = 'pt-BR';" $false

  Invoke-SqlFile $rollback
  Invoke-Sql "select 1 from pg_namespace where nspname = 'portfolio_editorial';" $true
  Invoke-Sql "do `$`$ begin if exists (select 1 from pg_namespace where nspname = 'portfolio_editorial') or exists (select 1 from pg_roles where rolname = 'portfolio_editorial_owner') then raise exception 'rollback incomplete'; end if; end `$`$;" $true

  Write-Output 'T-005 private schema, ACLs, invariants and rollback: PASS'
}
finally {
  docker rm --force $containerName *> $null
}
