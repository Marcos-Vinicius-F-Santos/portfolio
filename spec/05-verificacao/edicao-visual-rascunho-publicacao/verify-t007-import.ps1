param(
  [string]$PostgresImage = 'public.ecr.aws/supabase/postgres:17.6.1.167'
)

$ErrorActionPreference = 'Stop'
$containerName = "portfolio-t007-$PID"
$verificationRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $verificationRoot '..\..\..')
$fixture = Join-Path $verificationRoot 't005-schema-fixture.sql'
$schemaMigration = Join-Path $projectRoot 'supabase\migrations\20260926093000_create_private_editorial_schema.sql'
$importMigration = Join-Path $projectRoot 'supabase\migrations\20260926103000_import_initial_editorial_snapshot.sql'
$assertions = Join-Path $verificationRoot 't007-import-assertions.sql'
$rollback = Join-Path $verificationRoot 't007-rollback.sql'
$schemaRollback = Join-Path $verificationRoot 't005-rollback.sql'

function Invoke-SqlFile([string]$Path) {
  Get-Content -LiteralPath $Path -Raw |
    docker exec -i $containerName psql -v ON_ERROR_STOP=1 -U postgres -d postgres
  if ($LASTEXITCODE -ne 0) { throw "SQL failed: $Path" }
}

try {
  docker run --rm --detach --name $containerName --env POSTGRES_PASSWORD=t007-local-only $PostgresImage |
    Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not start isolated PostgreSQL.' }

  $ready = $false
  foreach ($attempt in 1..60) {
    docker exec $containerName pg_isready -U postgres -d postgres *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'PostgreSQL did not become ready.' }
  Start-Sleep -Seconds 5
  docker exec $containerName pg_isready -U postgres -d postgres *> $null
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL did not remain stable after bootstrap.' }

  Invoke-SqlFile $fixture
  Invoke-SqlFile $schemaMigration
  Invoke-SqlFile $importMigration
  Invoke-SqlFile $assertions

  # A second run must preserve the same snapshot, IDs and singleton publication.
  Invoke-SqlFile $importMigration
  Invoke-SqlFile $assertions

  Invoke-SqlFile $rollback
  Invoke-SqlFile $schemaRollback

  Write-Output 'T-007 initial import, idempotency, cutover and rollback: PASS'
}
finally {
  docker rm --force $containerName *> $null
}
