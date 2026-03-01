[CmdletBinding()]
param(
  [string]$TargetSkillsDir,
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Copy-SkillFolder {
  param(
    [string]$Source,
    [string]$Destination,
    [switch]$Overwrite
  )
  if (Test-Path $Destination) {
    if ($Overwrite) {
      Remove-Item -Path $Destination -Recurse -Force
    } else {
      throw "Skill already exists at $Destination. Re-run with -Force."
    }
  }
  Copy-Item -Path $Source -Destination $Destination -Recurse -Force
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sourceSkills = Join-Path $repoRoot "skills"

if (-not (Test-Path $sourceSkills)) {
  throw "No local skills directory found at $sourceSkills"
}

if ([string]::IsNullOrWhiteSpace($TargetSkillsDir)) {
  $codexHome = $env:CODEX_HOME
  if ([string]::IsNullOrWhiteSpace($codexHome)) {
    $codexHome = Join-Path $HOME ".codex"
  }
  $TargetSkillsDir = Join-Path $codexHome "skills"
}

Ensure-Dir -Path $TargetSkillsDir

$skillFolders = Get-ChildItem -Path $sourceSkills -Directory | Sort-Object Name
if ($skillFolders.Count -eq 0) {
  throw "No skills found to install."
}

$installed = @()
foreach ($folder in $skillFolders) {
  $destination = Join-Path $TargetSkillsDir $folder.Name
  Copy-SkillFolder -Source $folder.FullName -Destination $destination -Overwrite:$Force
  $installed += $folder.Name
}

Write-Host "[gtd] Installed skills to $TargetSkillsDir"
foreach ($name in $installed) {
  Write-Host "[gtd] - $name"
}
