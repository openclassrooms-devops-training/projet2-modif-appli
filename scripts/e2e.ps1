$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $workspace 'backend\compose.e2e.yaml'

Push-Location $workspace
try {
    docker compose -p etudiant-e2e -f $composeFile down -v
    docker compose -p etudiant-e2e -f $composeFile up -d --wait

    Write-Host 'Base MySQL E2E disponible sur localhost:3307.'
    Write-Host 'Demarrer le backend avec application-e2e.yml, puis lancer:'
    Write-Host 'npm --prefix frontend run e2e'
}
finally {
    Pop-Location
}
