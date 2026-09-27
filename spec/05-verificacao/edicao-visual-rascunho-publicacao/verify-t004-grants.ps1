param(
  [string]$PostgresImage = 'postgres:18-alpine'
)

$ErrorActionPreference = 'Stop'
$containerName = "portfolio-t004-$PID"
$verificationRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $verificationRoot '..\..\..')
$migration = Join-Path $projectRoot 'supabase\migrations\20260926090000_restrict_all_portfolio_table_grants.sql'
$fixture = Join-Path $verificationRoot 't004-grants-fixture.sql'
$assertions = Join-Path $verificationRoot 't004-grants-assertions.sql'
$rollback = Join-Path $verificationRoot 't004-rollback.sql'
$rollbackAssertions = Join-Path $verificationRoot 't004-rollback-assertions.sql'

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
  docker run --rm --detach --name $containerName --env POSTGRES_PASSWORD=t004-local-only $PostgresImage |
    Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not start isolated PostgreSQL.' }

  $ready = $false
  foreach ($attempt in 1..30) {
    docker exec $containerName pg_isready -U postgres -d postgres *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'PostgreSQL did not become ready.' }

  Invoke-SqlFile $fixture
  Invoke-SqlFile $migration
  Invoke-SqlFile $assertions

  Invoke-Sql "set role anon; select count(*) from public.portfolio_texts;" $true
  Invoke-Sql "set role anon; insert into public.portfolio_texts values ('anon-write', 'denied');" $false
  Invoke-Sql "set role authenticated; set request.jwt.claim.sub = 'not-admin'; insert into public.portfolio_texts values ('non-admin-write', 'denied');" $false
  Invoke-Sql "set role authenticated; set request.jwt.claim.sub = 'admin-1'; insert into public.portfolio_texts values ('admin-write', 'allowed'); update public.portfolio_texts set value = 'updated' where id = 'admin-write';" $true
  Invoke-Sql "set role authenticated; set request.jwt.claim.sub = 'admin-1'; delete from public.portfolio_texts where id = 'admin-write';" $false

  Invoke-SqlFile $rollback
  Invoke-SqlFile $rollbackAssertions

  Write-Output 'T-004 grants, RLS matrix and rollback: PASS'
}
finally {
  docker rm --force $containerName *> $null
}
