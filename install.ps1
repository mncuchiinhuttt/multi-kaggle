# Multi-Kaggle 1-line PowerShell installer for Windows
$ErrorActionPreference = "Stop"

$Repo = "mncuchiinhuttt/multi-kaggle"
$InstallDir = "$env:LOCALAPPDATA\Programs\MultiKaggle"
$BinaryName = "multikaggle-windows-x64.exe"
$DownloadUrl = "https://github.com/$Repo/releases/latest/download/$BinaryName"

Write-Host "==> Multi-Kaggle Windows Installer" -ForegroundColor Cyan
Write-Host "==> Target: windows-x64"

if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$DestPath = "$InstallDir\multikaggle.exe"
Write-Host "==> Downloading latest release from $DownloadUrl..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile $DestPath

# Add to User PATH if not present
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host "==> Adding $InstallDir to User PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    $env:Path += ";$InstallDir"
}

Write-Host "`nMulti-Kaggle installed successfully!" -ForegroundColor Green
Write-Host "Run 'multikaggle' to start the Web UI."
Write-Host "Run 'multikaggle --help' to view all commands."
