param([Parameter(Mandatory = $true)][string]$ProjectPath)
$ErrorActionPreference = 'Stop'
$updateSource = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\')
$updateTarget = [IO.Path]::GetFullPath($ProjectPath).TrimEnd('\')
if ($updateSource.Equals($updateTarget, [StringComparison]::OrdinalIgnoreCase)) {
    Write-Host 'Folder ini sudah mengandungi kemas kini. Jalankan npm.cmd start.' -ForegroundColor Green
    exit 0
}
$updatePackage = Join-Path $updateTarget 'package.json'
if (!(Test-Path -LiteralPath $updatePackage -PathType Leaf)) {
    throw 'ProjectPath mesti folder projek Mathematics Slayer yang mengandungi package.json.'
}
$updateMetadata = Get-Content -LiteralPath $updatePackage -Raw | ConvertFrom-Json
if ($updateMetadata.name -ne 'duel-cube-math') { throw 'Identiti projek tidak sepadan. Tiada fail disalin.' }
$updateBackup = $updateTarget + '-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
if (Test-Path -LiteralPath $updateBackup) { throw 'Folder backup sudah wujud. Jalankan semula sebentar lagi.' }
$updateFiles = @(Get-ChildItem -LiteralPath $updateSource -Recurse -File | Where-Object {
    $_.FullName -notmatch '[\\/](node_modules|\.git|__pycache__)[\\/]'
})
# Complete the backup before replacing any project file.
foreach ($updateFile in $updateFiles) {
    $updateRelative = $updateFile.FullName.Substring($updateSource.Length).TrimStart('\')
    $updateExisting = Join-Path $updateTarget $updateRelative
    if (Test-Path -LiteralPath $updateExisting -PathType Leaf) {
        $updateBackupFile = Join-Path $updateBackup $updateRelative
        New-Item -ItemType Directory -Path (Split-Path $updateBackupFile -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $updateExisting -Destination $updateBackupFile -ErrorAction Stop
    }
}
foreach ($updateFile in $updateFiles) {
    $updateRelative = $updateFile.FullName.Substring($updateSource.Length).TrimStart('\')
    $updateDestination = Join-Path $updateTarget $updateRelative
    New-Item -ItemType Directory -Path (Split-Path $updateDestination -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $updateFile.FullName -Destination $updateDestination -Force -ErrorAction Stop
}
Write-Host ('Kemas kini siap. Backup: ' + $updateBackup) -ForegroundColor Green
Write-Host ('Buka projek: ' + $updateTarget)
Write-Host 'Jalankan npm.cmd start, kemudian buka http://localhost:4173'
