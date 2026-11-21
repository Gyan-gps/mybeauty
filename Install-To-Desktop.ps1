# Run this script yourself to copy the project to your requested Desktop folder.
# Existing .env and .env.example files are preserved.
$ErrorActionPreference = 'Stop'
$projectSource = $PSScriptRoot
$projectTarget = 'C:\Users\Rahul\Desktop\SAAS Project\mybeauty'
if ([IO.Path]::GetFullPath($projectSource).TrimEnd('\') -eq [IO.Path]::GetFullPath($projectTarget).TrimEnd('\')) {
    Write-Host 'The project is already in the requested folder.'
    return
}
New-Item -ItemType Directory -Path $projectTarget -Force | Out-Null
Get-ChildItem -LiteralPath $projectSource -Force | Where-Object { $_.Name -notin @('.env', '.env.example', 'node_modules', '.next', '.git') } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $projectTarget -Recurse -Force
}
$exampleTarget = Join-Path $projectTarget '.env.example'
if (-not (Test-Path -LiteralPath $exampleTarget)) {
    Copy-Item -LiteralPath (Join-Path $projectSource '.env.example') -Destination $exampleTarget
}
Write-Host "Project copied to $projectTarget. Existing environment files were preserved."
Write-Host 'Next: open that folder, configure .env, run npm install, npm run seed, and npm run dev.'
