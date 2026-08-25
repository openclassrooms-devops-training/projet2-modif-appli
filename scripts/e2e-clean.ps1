$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $workspace 'backend\compose.e2e.yaml'

Push-Location $workspace
try {
    docker compose -p etudiant-e2e -f $composeFile down -v --remove-orphans
    Write-Host 'Base MySQL E2E et son volume supprimes.'
}
finally {
    Pop-Location
}
