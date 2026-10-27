param(
    [string]$ProjectPath = 'C:\Users\ijmah\Desktop\slay-the-math-v2',
    [switch]$Start
)
$ErrorActionPreference = 'Stop'
$stmSource = Join-Path $PSScriptRoot 'payload'
$stmManifestPath = Join-Path $PSScriptRoot 'UPDATE-MANIFEST.json'
if (!(Test-Path -LiteralPath $stmManifestPath -PathType Leaf)) {
    throw 'Jalankan installer dari ZIP HUD Icons Fix yang diekstrak, bukan dari dalam projek.'
}
$stmManifest = Get-Content -LiteralPath $stmManifestPath -Raw | ConvertFrom-Json
$stmTarget = [IO.Path]::GetFullPath($ProjectPath).TrimEnd('\')
$stmPackage = Join-Path $stmTarget 'package.json'
if (!(Test-Path -LiteralPath $stmPackage -PathType Leaf)) { throw 'Folder projek asal tidak ditemui. Tiada folder projek baharu dibuat.' }
$stmInfo = Get-Content -LiteralPath $stmPackage -Raw | ConvertFrom-Json
if ($stmInfo.name -ne 'duel-cube-math') { throw 'Folder sasaran bukan projek Mathematics Slayer.' }
if (@('2.3.0','2.3.1','2.3.2') -notcontains $stmInfo.version) { throw 'Hotfix ini memerlukan Dungeon Update 2.3. Pasang 2.3 dahulu. Tiada fail diganti.' }
if ($stmManifest.schemaVersion -ne 1 -or $stmManifest.release -ne '2.3.2') { throw 'Manifest kemas kini tidak sah.' }
$stmNode = (Get-Command node.exe -ErrorAction Stop).Source
$stmNpm = (Get-Command npm.cmd -ErrorAction Stop).Source
function Resolve-StmPath([string]$Base, [string]$Relative) {
    if ([IO.Path]::IsPathRooted($Relative) -or $Relative -match '(^|[\\/])\.\.([\\/]|$)') { throw 'Laluan manifest tidak sah.' }
    $stmResolved = [IO.Path]::GetFullPath((Join-Path $Base $Relative))
    if (!$stmResolved.StartsWith($Base.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Laluan di luar folder projek ditolak.' }
    return $stmResolved
}
$stmChanges = @()
$stmConflicts = @()
# Validate every source and affected existing file before replacing anything.
foreach ($stmEntry in $stmManifest.files) {
    # PowerShell foreach iterations share scope. A new path must never inherit
    # the hash/existed flag of the preceding existing file.
    $stmOldHash = $null
    $stmFrom = Resolve-StmPath $stmSource $stmEntry.path
    $stmTo = Resolve-StmPath $stmTarget $stmEntry.path
    if (!(Test-Path -LiteralPath $stmFrom -PathType Leaf)) { throw ('Fail ZIP tidak lengkap: ' + $stmEntry.path) }
    if ((Get-FileHash -LiteralPath $stmFrom -Algorithm SHA256).Hash -ne $stmEntry.sha256) { throw ('Hash fail ZIP tidak sepadan: ' + $stmEntry.path) }
    $stmOldHash = $null
    if (Test-Path -LiteralPath $stmTo) {
        if (!(Test-Path -LiteralPath $stmTo -PathType Leaf)) { throw ('Fail sasaran ialah direktori: ' + $stmEntry.path) }
        $stmOldHash = (Get-FileHash -LiteralPath $stmTo -Algorithm SHA256).Hash
        if ($stmOldHash -eq $stmEntry.sha256) { continue }
        if (@($stmEntry.previousHashes) -notcontains $stmOldHash.ToLowerInvariant()) { $stmConflicts += $stmEntry.path; continue }
    }
    $stmChanges += [pscustomobject]@{path=$stmEntry.path; source=$stmFrom; target=$stmTo; existed=($null -ne $stmOldHash); oldSha256=$stmOldHash; newSha256=$stmEntry.sha256}
}
if ($stmConflicts.Count) { throw ("Fail ini mempunyai perubahan yang tiada dalam ZIP sumber. Tiada fail diganti. Kekalkan edit anda dan semak/merge dahulu:`n" + ($stmConflicts -join "`n")) }
foreach ($stmRequired in $stmManifest.requires) {
    if (!(Test-Path -LiteralPath (Resolve-StmPath $stmTarget $stmRequired) -PathType Leaf)) { throw ('Fail asas projek tidak lengkap: ' + $stmRequired) }
}
# A one-use marker proves the listener serves THIS exact dist folder.
# Never stop another project's Node process merely because it uses port 4173.
$stmOwners = @(Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
if ($stmOwners.Count) {
    $stmMarkerName = 'stm-update-' + [guid]::NewGuid().ToString('N') + '.html'
    $stmMarker = Join-Path (Join-Path $stmTarget 'dist') $stmMarkerName
    $stmNonce = [guid]::NewGuid().ToString('N')
    $stmOwnServer = $false
    try {
        [IO.File]::WriteAllText($stmMarker, $stmNonce)
        try {
            $stmReply = Invoke-WebRequest -Uri ('http://127.0.0.1:4173/' + $stmMarkerName) -UseBasicParsing -TimeoutSec 4 -MaximumRedirection 0
            $stmOwnServer = $stmReply.Content.Trim() -eq $stmNonce
        } catch { $stmOwnServer = $false }
    } finally {
        if (Test-Path -LiteralPath $stmMarker) { Remove-Item -LiteralPath $stmMarker -Force }
    }
    if (!$stmOwnServer -or $stmOwners.Count -ne 1) { throw ('Port 4173 sedang digunakan oleh proses lain (PID ' + ($stmOwners -join ', ') + '). Hentikan server itu dengan Ctrl+C dahulu. Tiada fail diganti.') }
    $stmProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $stmOwners[0])
    if (!$stmProcess -or $stmProcess.Name -ne 'node.exe' -or $stmProcess.CommandLine -notmatch 'server\.cjs') { throw 'Pemilik port bukan server Mathematics Slayer yang dijangka. Tiada proses dihentikan.' }
    Stop-Process -Id $stmOwners[0] -Force
    Write-Host 'Server lama untuk folder projek ini dihentikan.'
}
$stmBackup = $stmTarget + '-backup-hudicons-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,6)
$stmRecords = @($stmChanges | Select-Object path,existed,oldSha256,newSha256)
$stmPortable = Join-Path $stmTarget 'MAIN-SEKARANG.html'
$stmRecords += [pscustomobject]@{path='MAIN-SEKARANG.html';existed=(Test-Path -LiteralPath $stmPortable -PathType Leaf);oldSha256=$null;newSha256=$null}
New-Item -ItemType Directory -Path $stmBackup | Out-Null
# Finish the complete byte-for-byte backup before writing project files.
foreach ($stmRecord in $stmRecords) {
    if ($stmRecord.existed) {
        $stmExisting = Resolve-StmPath $stmTarget $stmRecord.path
        $stmSaved = Resolve-StmPath (Join-Path $stmBackup 'files') $stmRecord.path
        New-Item -ItemType Directory -Path (Split-Path $stmSaved -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $stmExisting -Destination $stmSaved
        $stmRecord.oldSha256 = (Get-FileHash -LiteralPath $stmSaved -Algorithm SHA256).Hash
    }
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'ROLLBACK-UPDATE.ps1') -Destination (Join-Path $stmBackup 'ROLLBACK-UPDATE.ps1')
$stmRollback = [pscustomobject]@{projectPath=$stmTarget;release='2.3.2';files=$stmRecords}
$stmRollback | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $stmBackup 'rollback.json') -Encoding UTF8
$stmCompleted = @()
try {
    foreach ($stmChange in $stmChanges) {
        New-Item -ItemType Directory -Path (Split-Path $stmChange.target -Parent) -Force | Out-Null
        $stmPending = $stmChange.target + '.stm-' + [guid]::NewGuid().ToString('N')
        try {
            Copy-Item -LiteralPath $stmChange.source -Destination $stmPending
            Move-Item -LiteralPath $stmPending -Destination $stmChange.target -Force
        } finally { if (Test-Path -LiteralPath $stmPending) { Remove-Item -LiteralPath $stmPending -Force } }
        $stmCompleted += $stmChange.path
    }
    Push-Location -LiteralPath $stmTarget
    try {
        & $stmNpm run check
        if ($LASTEXITCODE -ne 0) { throw 'Semakan kod gagal.' }
        $stmCompleted += 'MAIN-SEKARANG.html'
        & $stmNpm run build
        if ($LASTEXITCODE -ne 0) { throw 'Binaan offline gagal.' }
    } finally { Pop-Location }
    foreach ($stmRecord in $stmRecords) {
        $stmNow = Resolve-StmPath $stmTarget $stmRecord.path
        if (Test-Path -LiteralPath $stmNow -PathType Leaf) { $stmRecord.newSha256 = (Get-FileHash -LiteralPath $stmNow -Algorithm SHA256).Hash }
    }
    $stmRollback | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $stmBackup 'rollback.json') -Encoding UTF8
} catch {
    foreach ($stmRelative in $stmCompleted) {
        $stmRecord = $stmRecords | Where-Object { $_.path -eq $stmRelative } | Select-Object -First 1
        $stmTo = Resolve-StmPath $stmTarget $stmRelative
        if ($stmRecord.existed) { Copy-Item -LiteralPath (Resolve-StmPath (Join-Path $stmBackup 'files') $stmRelative) -Destination $stmTo -Force }
        elseif (Test-Path -LiteralPath $stmTo -PathType Leaf) { Remove-Item -LiteralPath $stmTo -Force }
    }
    throw ('Pemasangan dibatalkan dan fail dikembalikan. Backup: ' + $stmBackup + '. Sebab: ' + $_.Exception.Message)
}
Write-Host ('Hotfix ikon 2.3.2 siap dalam folder asal: ' + $stmTarget) -ForegroundColor Green
Write-Host ('Backup dan rollback: ' + $stmBackup)
Write-Host 'Tekan Ctrl+0 untuk zoom 100%, kemudian Ctrl+F5 dalam browser.'
Write-Host 'Buka http://localhost:4173 dan refresh dengan Ctrl+F5.'
if ($Start) {
    Set-Location -LiteralPath $stmTarget
    Remove-Item Env:PORT -ErrorAction SilentlyContinue
    & $stmNpm start
    exit $LASTEXITCODE
}
