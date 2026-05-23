#requires -version 5.1
[CmdletBinding()]
param(
  [int]$Port = 5173,
  [int[]]$PortsToClean = @(5173, 5174, 4173, 3000, 3001, 8787, 8788)
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-IsWindows {
  if ($env:OS -eq "Windows_NT") {
    return $true
  }

  try {
    return [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform(
      [System.Runtime.InteropServices.OSPlatform]::Windows
    )
  } catch {
    return $false
  }
}

function Assert-Command {
  param(
    [string]$Name,
    [string]$InstallHint
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $InstallHint"
  }
}

function Invoke-CheckedCommand {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Assert-NodeVersion {
  $nodeVersionText = (& node -p "process.versions.node").Trim()
  $nodeVersion = [version]$nodeVersionText
  $minimumVersion = [version]"22.12.0"

  if ($nodeVersion -lt $minimumVersion) {
    throw "Node.js $minimumVersion or newer is required. Found Node.js $nodeVersionText. Install the current LTS from https://nodejs.org/ and run this script again."
  }

  Write-Host "Node.js $nodeVersionText detected."
  return $nodeVersionText
}

function Get-RepoRoot {
  $scriptPath = $PSCommandPath
  if (-not $scriptPath) {
    $scriptPath = $MyInvocation.MyCommand.Path
  }

  $scriptDirectory = Split-Path -Parent $scriptPath
  return (Resolve-Path (Join-Path $scriptDirectory "..")).Path
}

function Get-DependencyStamp {
  param(
    [string]$LockPath,
    [string]$NodeVersionText,
    [string]$NpmVersionText
  )

  $lockHash = (Get-FileHash $LockPath -Algorithm SHA256).Hash
  return @(
    "platform=win32"
    "node=$NodeVersionText"
    "npm=$NpmVersionText"
    "package-lock=$lockHash"
  ) -join "`n"
}

function Update-DependenciesIfNeeded {
  param(
    [string]$RepoRoot,
    [string]$NodeVersionText
  )

  $lockPath = Join-Path $RepoRoot "package-lock.json"
  if (-not (Test-Path $lockPath)) {
    throw "package-lock.json is required for the Windows npm install path."
  }

  $npmVersionText = (& npm -v).Trim()
  Write-Host "npm $npmVersionText detected."

  $nodeModulesPath = Join-Path $RepoRoot "node_modules"
  $stampPath = Join-Path $nodeModulesPath ".windows-install-stamp"
  $expectedStamp = Get-DependencyStamp -LockPath $lockPath -NodeVersionText $NodeVersionText -NpmVersionText $npmVersionText
  $shouldInstall = $false

  if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "node_modules is missing."
    $shouldInstall = $true
  } elseif (-not (Test-Path $stampPath)) {
    Write-Host "Windows dependency stamp is missing. Refreshing native packages for Windows."
    $shouldInstall = $true
  } else {
    $currentStamp = Get-Content $stampPath -Raw
    if ($currentStamp.TrimEnd() -ne $expectedStamp.TrimEnd()) {
      Write-Host "Dependency stamp changed."
      $shouldInstall = $true
    }
  }

  if ($shouldInstall) {
    Write-Step "Installing dependencies"
    Invoke-CheckedCommand -Command "npm" -Arguments @("install")

    if (-not (Test-Path $nodeModulesPath)) {
      New-Item -ItemType Directory -Path $nodeModulesPath | Out-Null
    }

    Set-Content -Path $stampPath -Value $expectedStamp -Encoding ASCII
  } else {
    Write-Step "Checking installed dependencies"
    & npm ls --depth=0 --silent
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Dependency check failed. Running npm install to repair the install."
      Invoke-CheckedCommand -Command "npm" -Arguments @("install")
      Set-Content -Path $stampPath -Value $expectedStamp -Encoding ASCII
    }
  }
}

function Stop-ListenersOnPorts {
  param([int[]]$Ports)

  $uniquePorts = @($Ports | Sort-Object -Unique)
  Write-Step "Clearing ports: $($uniquePorts -join ', ')"

  foreach ($targetPort in $uniquePorts) {
    $connections = @(Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) {
      Write-Host "Port $targetPort is free."
      continue
    }

    $processIds = @($connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -and $_ -ne $PID })
    foreach ($processId in $processIds) {
      try {
        $process = Get-Process -Id $processId -ErrorAction Stop
        Write-Host "Stopping $($process.ProcessName) (PID $processId) on port $targetPort."
        Stop-Process -Id $processId -Force -ErrorAction Stop
      } catch {
        Write-Warning "Could not stop PID $processId on port $targetPort. Run PowerShell as Administrator if this port stays busy."
      }
    }
  }
}

function Test-EnvironmentFile {
  param(
    [string]$RepoRoot,
    [string[]]$RequiredKeys
  )

  $envFiles = @(".env.local", ".env") | ForEach-Object { Join-Path $RepoRoot $_ } | Where-Object { Test-Path $_ }
  if ($envFiles.Count -eq 0) {
    Write-Warning "No .env.local or .env file was found. The app can start, but Supabase-backed pages need VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    return
  }

  $missingKeys = New-Object System.Collections.Generic.List[string]
  foreach ($key in $RequiredKeys) {
    $found = $false
    foreach ($file in $envFiles) {
      if (Select-String -Path $file -Pattern "^\s*$([regex]::Escape($key))\s*=" -Quiet) {
        $found = $true
        break
      }
    }

    if (-not $found) {
      $missingKeys.Add($key)
    }
  }

  if ($missingKeys.Count -gt 0) {
    Write-Warning "Missing environment keys: $($missingKeys -join ', '). Supabase features may fail until they are added."
  } else {
    Write-Host "Environment file check passed."
  }
}

if (-not (Test-IsWindows)) {
  throw "This launcher is Windows-only. Use npm run dev on macOS or Linux."
}

$repoRoot = Get-RepoRoot
Set-Location $repoRoot

Write-Step "Checking required tools"
Assert-Command -Name "node" -InstallHint "Install Node.js from https://nodejs.org/."
Assert-Command -Name "npm" -InstallHint "npm is installed with Node.js. Reinstall Node.js if npm is missing."
$nodeVersionText = Assert-NodeVersion

Update-DependenciesIfNeeded -RepoRoot $repoRoot -NodeVersionText $nodeVersionText

Test-EnvironmentFile -RepoRoot $repoRoot -RequiredKeys @("VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY")

$ports = @($PortsToClean + @($Port) | Sort-Object -Unique)
Stop-ListenersOnPorts -Ports $ports

$env:HOST = "127.0.0.1"
$env:PORT = "$Port"
$env:BROWSER = "none"

Write-Step "Starting the system on http://127.0.0.1:$Port"
& npm run dev -- --host 127.0.0.1 --port $Port --strictPort
exit $LASTEXITCODE
