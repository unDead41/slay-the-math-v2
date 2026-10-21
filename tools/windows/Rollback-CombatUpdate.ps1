$ErrorActionPreference = 'Stop'
$stmBackup = $PSScriptRoot
$stmInfo = Get-Content -LiteralPath (Join-Path $stmBackup 'rollback.json') -Raw | ConvertFrom-Json
$stmTarget = [IO.Path]::GetFullPath($stmInfo.projectPath).TrimEnd('\')
if (!(Test-Path -LiteralPath (Join-Path $stmTarget 'package.json') -PathType Leaf)) { throw 'Folder projek asal tidak ditemui.' }
if (@(Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue).Count) { throw 'Hentikan server dengan Ctrl+C sebelum rollback.' }
function Resolve-StmPath([string]$Base, [string]$Relative) {
    if ([IO.Path]::IsPathRooted($Relative) -or $Relative -match '(^|[\\/])\.\.([\\/]|$)') { throw 'Laluan rollback tidak sah.' }
    $stmResolved = [IO.Path]::GetFullPath((Join-Path $Base $Relative))
    if (!$stmResolved.StartsWith($Base.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Laluan rollback di luar projek.' }
    return $stmResolved
}
$stmRestore = @()
foreach ($stmFile in $stmInfo.files) {
    $stmTo = Resolve-StmPath $stmTarget $stmFile.path
    $stmCurrentHash = if (Test-Path -LiteralPath $stmTo -PathType Leaf) { (Get-FileHash -LiteralPath $stmTo -Algorithm SHA256).Hash } else { $null }
    if ($stmCurrentHash -and $stmCurrentHash -ne $stmFile.newSha256 -and $stmCurrentHash -ne $stmFile.oldSha256) { throw ('Fail ini telah diedit selepas update; rollback tidak menimpanya: ' + $stmFile.path) }
    $stmFrom = Resolve-StmPath (Join-Path $stmBackup 'files') $stmFile.path
    if ($stmFile.existed) {
        if (!(Test-Path -LiteralPath $stmFrom -PathType Leaf)) { throw ('Backup hilang: ' + $stmFile.path) }
        if ((Get-FileHash -LiteralPath $stmFrom -Algorithm SHA256).Hash -ne $stmFile.oldSha256) { throw ('Backup rosak: ' + $stmFile.path) }
    }
    $stmRestore += [pscustomobject]@{source=$stmFrom;target=$stmTo;existed=$stmFile.existed}
}
foreach ($stmFile in $stmRestore) {
    if ($stmFile.existed) {
        New-Item -ItemType Directory -Path (Split-Path $stmFile.target -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $stmFile.source -Destination $stmFile.target -Force
    } elseif (Test-Path -LiteralPath $stmFile.target -PathType Leaf) { Remove-Item -LiteralPath $stmFile.target -Force }
}
Write-Host ('Rollback siap: ' + $stmTarget) -ForegroundColor Green
