[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet("init", "map", "progress", "resume", "health", "compact", "verify", "scaffold-phase", "scaffold-plan")]
  [string]$Command = "progress",
  [string]$Phase,
  [string]$Name,
  [string]$Plan = "01",
  [switch]$Repair,
  [switch]$Force,
  [switch]$Json,
  [string]$AnswersFile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Script:RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Script:PlanningDir = Join-Path $Script:RepoRoot ".planning"
$Script:TemplateDir = Join-Path $Script:RepoRoot "templates"

function Write-Info {
  param([string]$Message)
  Write-Host "[gtd] $Message"
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Save-Utf8NoBom {
  param(
    [string]$Path,
    [string]$Content
  )
  $parent = Split-Path -Parent $Path
  if ($parent) {
    Ensure-Dir -Path $parent
  }
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Get-Count {
  param([AllowNull()][object]$InputObject)
  if ($null -eq $InputObject) {
    return 0
  }
  return @($InputObject).Count
}

function Get-DateIso {
  (Get-Date).ToString("yyyy-MM-dd")
}

function Get-DateTimeIso {
  (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
}

function Slugify {
  param([string]$InputText)
  $lower = $InputText.ToLowerInvariant()
  $slug = $lower -replace "[^a-z0-9]+", "-"
  $slug = $slug.Trim("-")
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return "phase"
  }
  return $slug
}

function Normalize-PhaseNumber {
  param([string]$RawPhase)
  if ($RawPhase -match "^\d+\.\d+$") {
    $parts = $RawPhase.Split(".")
    return ("{0:D2}.{1}" -f [int]$parts[0], $parts[1])
  }
  if ($RawPhase -match "^\d+$") {
    return ("{0:D2}" -f [int]$RawPhase)
  }
  throw "Invalid phase number: $RawPhase"
}

function Ensure-PlanningStructure {
  Ensure-Dir -Path $Script:PlanningDir
  Ensure-Dir -Path (Join-Path $Script:PlanningDir "phases")
  Ensure-Dir -Path (Join-Path $Script:PlanningDir "codebase")
  Ensure-Dir -Path (Join-Path $Script:PlanningDir "archive")
  Ensure-Dir -Path (Join-Path $Script:PlanningDir "research")
}

function Get-MemoryInitialized {
  $required = @(
    (Join-Path $Script:PlanningDir "PROJECT.md"),
    (Join-Path $Script:PlanningDir "REQUIREMENTS.md"),
    (Join-Path $Script:PlanningDir "ROADMAP.md"),
    (Join-Path $Script:PlanningDir "STATE.md"),
    (Join-Path $Script:PlanningDir "config.json")
  )
  foreach ($file in $required) {
    if (-not (Test-Path $file)) {
      return $false
    }
  }
  return $true
}

function Get-TemplateContent {
  param(
    [string]$RelativePath,
    [hashtable]$Tokens
  )
  $templatePath = Join-Path $Script:TemplateDir $RelativePath
  if (-not (Test-Path $templatePath)) {
    throw "Template missing: $RelativePath"
  }
  $content = Get-Content $templatePath -Raw
  foreach ($key in $Tokens.Keys) {
    $pattern = [regex]::Escape("__${key}__")
    $replacement = [string]$Tokens[$key]
    $content = [regex]::Replace($content, $pattern, $replacement)
  }
  return $content
}

function Get-InteractiveAnswer {
  param(
    [string]$Prompt,
    [string]$DefaultValue
  )
  if (-not [Environment]::UserInteractive) {
    return $DefaultValue
  }
  $suffix = ""
  if (-not [string]::IsNullOrWhiteSpace($DefaultValue)) {
    $suffix = " [$DefaultValue]"
  }
  $result = Read-Host "$Prompt$suffix"
  if ([string]::IsNullOrWhiteSpace($result)) {
    return $DefaultValue
  }
  return $result.Trim()
}

function Set-MemoryStateFields {
  param(
    [string]$StatePath,
    [hashtable]$Updates
  )
  if (-not (Test-Path $StatePath)) {
    return
  }
  $content = Get-Content $StatePath -Raw
  foreach ($field in $Updates.Keys) {
    $escaped = [regex]::Escape($field)
    $pattern = "(?im)^(\*\*${escaped}:\*\*\s*).*$"
    $value = [string]$Updates[$field]
    if ([regex]::IsMatch($content, $pattern)) {
      $content = [regex]::Replace($content, $pattern, "`${1}$value", 1)
    } else {
      $content = "$content`n**${field}:** $value"
    }
  }
  Save-Utf8NoBom -Path $StatePath -Content $content
}

function Test-IncludedRelativePath {
  param([string]$RelativePath)
  $normalized = $RelativePath -replace "/", "\"
  $excluded = @(
    "^\.git\\",
    "^\.planning\\",
    "^skills\\",
    "^templates\\",
    "^scripts\\",
    "^node_modules\\",
    "^dist\\",
    "^build\\",
    "^bin\\",
    "^obj\\",
    "^vendor\\",
    "^\.venv\\",
    "^\.vscode\\",
    "^\.idea\\"
  )
  $excludedFiles = @(
    "^AGENTS\.md$",
    "^README(\..+)?$",
    "^LICENSE(\..+)?$",
    "^CHANGELOG\.md$",
    "^CONTRIBUTING\.md$"
  )
  foreach ($pattern in $excluded) {
    if ($normalized -match $pattern) {
      return $false
    }
  }
  foreach ($pattern in $excludedFiles) {
    if ($normalized -match $pattern) {
      return $false
    }
  }
  return $true
}

function Get-SourceFiles {
  $files = Get-ChildItem -Path $Script:RepoRoot -Recurse -File -Force
  $results = @()
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($Script:RepoRoot.Length).TrimStart("\")
    if (Test-IncludedRelativePath -RelativePath $relative) {
      $results += [pscustomobject]@{
        RelativePath = $relative
        Extension = $file.Extension.ToLowerInvariant()
      }
    }
  }
  return $results
}

function Get-PhaseDirectories {
  $phasesDir = Join-Path $Script:PlanningDir "phases"
  if (-not (Test-Path $phasesDir)) {
    return @()
  }
  return Get-ChildItem -Path $phasesDir -Directory | Sort-Object Name
}

function Find-PhaseDirectory {
  param([string]$PhaseNumber)
  $normalized = Normalize-PhaseNumber -RawPhase $PhaseNumber
  foreach ($dir in Get-PhaseDirectories) {
    if ($dir.Name -like "$normalized-*") {
      return $dir.FullName
    }
  }
  return $null
}

function Get-IncompletePlans {
  $phasesDir = Join-Path $Script:PlanningDir "phases"
  if (-not (Test-Path $phasesDir)) {
    return @()
  }
  $plans = Get-ChildItem -Path $phasesDir -Recurse -File -Filter "*-PLAN.md" | Sort-Object FullName
  $missing = @()
  foreach ($planFile in $plans) {
    $summaryPath = $planFile.FullName -replace "-PLAN\.md$", "-SUMMARY.md"
    if (-not (Test-Path $summaryPath)) {
      $missing += $planFile.FullName
    }
  }
  return $missing
}

function Write-JsonOrText {
  param(
    [object]$Object,
    [string]$Text
  )
  if ($Json) {
    $Object | ConvertTo-Json -Depth 8
  } else {
    $Text
  }
}

function Invoke-Map {
  param([switch]$Silent)
  Ensure-PlanningStructure

  $sourceFiles = Get-SourceFiles
  $codebaseDir = Join-Path $Script:PlanningDir "codebase"

  $manifestChecks = @(
    @{ File = "package.json"; Stack = "Node.js / JavaScript / TypeScript" },
    @{ File = "pyproject.toml"; Stack = "Python (pyproject)" },
    @{ File = "requirements.txt"; Stack = "Python (requirements)" },
    @{ File = "Cargo.toml"; Stack = "Rust" },
    @{ File = "go.mod"; Stack = "Go" },
    @{ File = "*.sln"; Stack = ".NET / C#" }
  )

  $detectedStacks = @()
  foreach ($check in $manifestChecks) {
    if ($check.File -like "*`**") {
      if (Get-ChildItem -Path $Script:RepoRoot -Filter $check.File -File -ErrorAction SilentlyContinue) {
        $detectedStacks += $check.Stack
      }
    } elseif (Test-Path (Join-Path $Script:RepoRoot $check.File)) {
      $detectedStacks += $check.Stack
    }
  }
  $detectedStacks = @($detectedStacks | Select-Object -Unique)
  if ((Get-Count -InputObject $detectedStacks) -eq 0) {
    $detectedStacks = @("Unknown stack from manifests - inferred by file extensions only")
  }

  $extCounts = @{}
  foreach ($file in $sourceFiles) {
    if ([string]::IsNullOrWhiteSpace($file.Extension)) {
      continue
    }
    if (-not $extCounts.ContainsKey($file.Extension)) {
      $extCounts[$file.Extension] = 0
    }
    $extCounts[$file.Extension]++
  }
  $extSummary = @($extCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 8 | ForEach-Object { "- $($_.Key): $($_.Value) files" })
  if ((Get-Count -InputObject $extSummary) -eq 0) {
    $extSummary = @("- No source files detected")
  }

  $topDirs = Get-ChildItem -Path $Script:RepoRoot -Directory | Where-Object {
    $_.Name -notin @(".git", ".planning", "skills", "templates", "scripts")
  } | Sort-Object Name | Select-Object -First 15
  $topDirList = @()
  foreach ($dir in $topDirs) {
    $topDirList += "- $($dir.Name)"
  }
  if ($topDirList.Count -eq 0) {
    $topDirList = @("- No top-level code directories detected")
  }

  $stackContent = Get-TemplateContent -RelativePath "codebase/STACK.md" -Tokens @{
    DATE = (Get-DateIso)
    STACK_LIST = (($detectedStacks | ForEach-Object { "- $_" }) -join "`n")
    EXT_SUMMARY = ($extSummary -join "`n")
  }
  Save-Utf8NoBom -Path (Join-Path $codebaseDir "STACK.md") -Content $stackContent

  $archContent = Get-TemplateContent -RelativePath "codebase/ARCHITECTURE.md" -Tokens @{
    DATE = (Get-DateIso)
    TOP_DIRS = ($topDirList -join "`n")
  }
  Save-Utf8NoBom -Path (Join-Path $codebaseDir "ARCHITECTURE.md") -Content $archContent

  $conventionsContent = Get-TemplateContent -RelativePath "codebase/CONVENTIONS.md" -Tokens @{
    DATE = (Get-DateIso)
  }
  Save-Utf8NoBom -Path (Join-Path $codebaseDir "CONVENTIONS.md") -Content $conventionsContent

  $concernsContent = Get-TemplateContent -RelativePath "codebase/CONCERNS.md" -Tokens @{
    DATE = (Get-DateIso)
  }
  Save-Utf8NoBom -Path (Join-Path $codebaseDir "CONCERNS.md") -Content $concernsContent

  if (-not $Silent) {
    Write-Info "Codebase map written to .planning/codebase/"
  }
}

function Invoke-Init {
  if ((Get-MemoryInitialized) -and -not $Force) {
    Write-Info "Memory is already initialized. Use -Force to reinitialize."
    return
  }

  Ensure-PlanningStructure

  $answers = $null
  if ($AnswersFile) {
    if (-not (Test-Path $AnswersFile)) {
      throw "Answers file not found: $AnswersFile"
    }
    $answers = Get-Content $AnswersFile -Raw | ConvertFrom-Json
  }

  function Resolve-Answer {
    param(
      [string]$Property,
      [string]$Prompt,
      [string]$DefaultValue
    )
    if ($answers -and $answers.PSObject.Properties.Name -contains $Property) {
      $value = [string]$answers.$Property
      if (-not [string]::IsNullOrWhiteSpace($value)) {
        return $value.Trim()
      }
    }
    return Get-InteractiveAnswer -Prompt $Prompt -DefaultValue $DefaultValue
  }

  $projectName = Resolve-Answer -Property "project_name" -Prompt "Project name" -DefaultValue "My Project"
  $description = Resolve-Answer -Property "project_description" -Prompt "One-line description" -DefaultValue "A project managed with Codex structured memory."
  $coreValue = Resolve-Answer -Property "core_value" -Prompt "Core value" -DefaultValue "Reliable delivery with explicit memory."
  $audience = Resolve-Answer -Property "audience" -Prompt "Primary audience" -DefaultValue "Internal team and project owner"
  $constraintsRaw = Resolve-Answer -Property "constraints" -Prompt "Constraints (comma-separated)" -DefaultValue "Maintainability, explicit state tracking"
  $requirementsRaw = Resolve-Answer -Property "requirements" -Prompt "Initial requirements (comma-separated)" -DefaultValue "Deliver a working baseline, Keep memory files accurate"

  $constraints = @($constraintsRaw.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  if ((Get-Count -InputObject $constraints) -eq 0) {
    $constraints = @("Maintainability")
  }
  $requirements = @($requirementsRaw.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  if ((Get-Count -InputObject $requirements) -eq 0) {
    $requirements = @("Deliver a working baseline")
  }

  $sourceFiles = Get-SourceFiles
  $needsBrownfieldMap = (Get-Count -InputObject $sourceFiles) -gt 0
  if ($needsBrownfieldMap) {
    Invoke-Map -Silent
  }

  $constraintsBullets = ($constraints | ForEach-Object { "- $_" }) -join "`n"

  $requirementsChecklist = @()
  $traceabilityRows = @()
  $index = 1
  foreach ($requirement in $requirements) {
    $reqId = ("REQ-{0:D2}" -f $index)
    $requirementsChecklist += "- [ ] **$reqId**: $requirement"
    $traceabilityRows += "| $reqId | Phase 02 | Planned |"
    $index++
  }

  $projectDoc = Get-TemplateContent -RelativePath "project.md" -Tokens @{
    PROJECT_NAME = $projectName
    PROJECT_DESCRIPTION = $description
    CORE_VALUE = $coreValue
    AUDIENCE = $audience
    CONSTRAINTS_BULLETS = $constraintsBullets
    DATE = (Get-DateIso)
  }
  Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "PROJECT.md") -Content $projectDoc

  $requirementsDoc = Get-TemplateContent -RelativePath "requirements.md" -Tokens @{
    PROJECT_NAME = $projectName
    DATE = (Get-DateIso)
    REQUIREMENTS_CHECKLIST = ($requirementsChecklist -join "`n")
    TRACEABILITY_ROWS = ($traceabilityRows -join "`n")
  }
  Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "REQUIREMENTS.md") -Content $requirementsDoc

  $phaseChecklist = @(
    "- [ ] **Phase 01: Foundation** - Set up project baseline and constraints",
    "- [ ] **Phase 02: Deliver V1** - Implement prioritized requirements"
  )
  $phaseDetails = @(
    "### Phase 01: Foundation",
    "**Goal:** Prepare architecture, standards, and memory scaffolding for safe implementation.",
    "**Depends on:** Nothing",
    "**Requirements:** Foundational setup",
    "**Plans:** 0 plans",
    "",
    "Plans:",
    "- [ ] 01-01: Establish baseline and architecture notes",
    "",
    "### Phase 02: Deliver V1",
    "**Goal:** Deliver the initial value defined in REQUIREMENTS.md.",
    "**Depends on:** Phase 01",
    "**Requirements:** " + (($requirementsChecklist | ForEach-Object { ($_ -split "\*\*")[1] }) -join ", "),
    "**Plans:** 0 plans",
    "",
    "Plans:",
    "- [ ] 02-01: Implement first vertical slice",
    "- [ ] 02-02: Stabilize and verify"
  )
  $progressRows = @(
    "| 01 Foundation | 0/0 | Not started | - |",
    "| 02 Deliver V1 | 0/0 | Not started | - |"
  )

  $roadmapDoc = Get-TemplateContent -RelativePath "roadmap.md" -Tokens @{
    PROJECT_NAME = $projectName
    DATE = (Get-DateIso)
    ROADMAP_PHASE_CHECKLIST = ($phaseChecklist -join "`n")
    ROADMAP_PHASE_DETAILS = ($phaseDetails -join "`n")
    ROADMAP_PROGRESS_ROWS = ($progressRows -join "`n")
  }
  Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "ROADMAP.md") -Content $roadmapDoc

  $stateDoc = Get-TemplateContent -RelativePath "state.md" -Tokens @{
    PROJECT_NAME = $projectName
    DATE = (Get-DateIso)
    DATETIME = (Get-DateTimeIso)
  }
  Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "STATE.md") -Content $stateDoc

  $configDoc = Get-TemplateContent -RelativePath "config.json" -Tokens @{}
  Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "config.json") -Content $configDoc

  $mapNote = "no codebase files were detected"
  if ($needsBrownfieldMap) {
    $mapNote = "brownfield codebase map generated"
  }

  Write-Info "Memory initialized for '$projectName' ($mapNote)."
  Write-Info "Next: discuss decisions for Phase 01, then scaffold/author plans."
}

function Get-StateSummaryObject {
  if (-not (Test-Path (Join-Path $Script:PlanningDir "STATE.md"))) {
    return [pscustomobject]@{
      initialized = $false
      next_action = "Run init"
      incomplete_plans = @()
    }
  }

  $stateContent = Get-Content (Join-Path $Script:PlanningDir "STATE.md") -Raw
  $field = {
    param([string]$Name)
    $match = [regex]::Match($stateContent, "(?im)^\*\*${Name}:\*\*\s*(.+)$")
    if ($match.Success) { $match.Groups[1].Value.Trim() } else { "" }
  }

  $incomplete = @(Get-IncompletePlans)
  $nextAction = "Create or update plan for current phase"
  if ((Get-Count -InputObject $incomplete) -gt 0) {
    $nextAction = "Resume incomplete plan: " + (Split-Path $incomplete[0] -Leaf)
  } else {
    $currentPhase = & $field "Current Phase"
    $phaseDir = $null
    if (-not [string]::IsNullOrWhiteSpace($currentPhase)) {
      $phaseDir = Find-PhaseDirectory -PhaseNumber $currentPhase
    }
    if ($phaseDir) {
      $contextExists = Get-ChildItem -Path $phaseDir -Filter "*-CONTEXT.md" -File -ErrorAction SilentlyContinue
      $planExists = Get-ChildItem -Path $phaseDir -Filter "*-PLAN.md" -File -ErrorAction SilentlyContinue
      if (-not $contextExists) {
        $nextAction = "Capture phase context decisions"
      } elseif (-not $planExists) {
        $nextAction = "Create execution plan(s) for current phase"
      } else {
        $nextAction = "All plans complete for current phase; verify and transition"
      }
    }
  }

  return [pscustomobject]@{
    initialized = $true
    project = (& $field "Project")
    current_phase = (& $field "Current Phase")
    current_phase_name = (& $field "Current Phase Name")
    current_plan = (& $field "Current Plan")
    status = (& $field "Status")
    progress = (& $field "Progress")
    last_activity = (& $field "Last Activity")
    last_activity_description = (& $field "Last Activity Description")
    incomplete_plans = $incomplete
    next_action = $nextAction
  }
}

function Invoke-Progress {
  $summary = Get-StateSummaryObject
  if (-not $summary.initialized) {
    $text = "Memory is not initialized. Run: .\scripts\gtd.ps1 init"
    Write-Output (Write-JsonOrText -Object $summary -Text $text)
    return
  }

  $incompleteCount = Get-Count -InputObject $summary.incomplete_plans
  $text = @(
    "Project: $($summary.project)",
    "Phase: $($summary.current_phase) - $($summary.current_phase_name)",
    "Plan: $($summary.current_plan)",
    "Status: $($summary.status)",
    "Progress: $($summary.progress)",
    "Last activity: $($summary.last_activity) - $($summary.last_activity_description)",
    "Incomplete plans: $incompleteCount",
    "Next action: $($summary.next_action)"
  ) -join "`n"

  Write-Output (Write-JsonOrText -Object $summary -Text $text)
}

function Invoke-Resume {
  Invoke-Progress
}

function Invoke-Health {
  Ensure-PlanningStructure
  $required = @(
    "PROJECT.md",
    "REQUIREMENTS.md",
    "ROADMAP.md",
    "STATE.md",
    "config.json"
  )
  $missing = @()
  foreach ($file in $required) {
    if (-not (Test-Path (Join-Path $Script:PlanningDir $file))) {
      $missing += $file
    }
  }

  $issues = @()
  if ((Get-Count -InputObject $missing) -gt 0) {
    $issues += "Missing core files: " + ($missing -join ", ")
  }

  $statePath = Join-Path $Script:PlanningDir "STATE.md"
  if (Test-Path $statePath) {
    $state = Get-Content $statePath -Raw
    foreach ($requiredField in @("Project", "Current Phase", "Status", "Progress", "Last Date", "Resume File")) {
      if (-not [regex]::IsMatch($state, "(?im)^\*\*$([regex]::Escape($requiredField)):\*\*")) {
        $issues += "STATE.md missing field: $requiredField"
      }
    }
  }

  if ($Repair -and (Get-Count -InputObject $missing) -gt 0) {
    if ($missing -contains "STATE.md") {
      $stateDoc = Get-TemplateContent -RelativePath "state.md" -Tokens @{
        PROJECT_NAME = "Recovered Project"
        DATE = (Get-DateIso)
        DATETIME = (Get-DateTimeIso)
      }
      Save-Utf8NoBom -Path $statePath -Content $stateDoc
    }
    if ($missing -contains "config.json") {
      $configDoc = Get-TemplateContent -RelativePath "config.json" -Tokens @{}
      Save-Utf8NoBom -Path (Join-Path $Script:PlanningDir "config.json") -Content $configDoc
    }
    $issues += "Repair mode created missing baseline files where templates were available."
  }

  $ok = (Get-Count -InputObject $issues) -eq 0
  $result = [pscustomobject]@{
    healthy = $ok
    issues = $issues
  }
  if ($ok) {
    Write-Output (Write-JsonOrText -Object $result -Text "Health check passed.")
  } else {
    Write-Output (Write-JsonOrText -Object $result -Text ("Health check found issues:`n- " + ($issues -join "`n- ")))
  }
}

function Invoke-Compact {
  $statePath = Join-Path $Script:PlanningDir "STATE.md"
  if (-not (Test-Path $statePath)) {
    throw "STATE.md not found."
  }

  $configPath = Join-Path $Script:PlanningDir "config.json"
  $maxLines = 220
  $keepDecisions = 7
  if (Test-Path $configPath) {
    try {
      $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
      if ($cfg.memory.state_max_lines) { $maxLines = [int]$cfg.memory.state_max_lines }
      if ($cfg.memory.recent_decisions_to_keep) { $keepDecisions = [int]$cfg.memory.recent_decisions_to_keep }
    } catch {
      # Ignore malformed config and use defaults.
    }
  }

  $stateContent = Get-Content $statePath -Raw
  $lineCount = ($stateContent -split "`r?`n").Count
  if (($lineCount -le $maxLines) -and -not $Force) {
    Write-Info "No compaction needed ($lineCount lines <= $maxLines)."
    return
  }

  $decisionsSection = [regex]::Match($stateContent, "(?ms)(## Recent Decisions\s*\r?\n)(.*?)(\r?\n## |\z)")
  $archived = @()
  if ($decisionsSection.Success) {
    $body = $decisionsSection.Groups[2].Value
    $decisionLines = @($body -split "`r?`n" | Where-Object { $_ -match "^\s*-\s" -and $_ -notmatch "None yet" })
    if ((Get-Count -InputObject $decisionLines) -gt $keepDecisions) {
      $archiveItems = $decisionLines[0..((Get-Count -InputObject $decisionLines) - $keepDecisions - 1)]
      $keptItems = $decisionLines[((Get-Count -InputObject $decisionLines) - $keepDecisions)..((Get-Count -InputObject $decisionLines) - 1)]
      $replacementBody = ($keptItems -join "`n")
      if ([string]::IsNullOrWhiteSpace($replacementBody)) {
        $replacementBody = "- None yet."
      }
      $prefix = $decisionsSection.Groups[1].Value
      $suffix = $decisionsSection.Groups[3].Value
      $replacement = "$prefix$replacementBody$suffix"
      $stateContent = $stateContent.Substring(0, $decisionsSection.Index) + $replacement + $stateContent.Substring($decisionsSection.Index + $decisionsSection.Length)
      $archived = $archiveItems
    }
  }

  if ((Get-Count -InputObject $archived) -gt 0) {
    $archiveMonth = (Get-Date).ToString("yyyy-MM")
    $archiveDir = Join-Path (Join-Path $Script:PlanningDir "archive") $archiveMonth
    Ensure-Dir -Path $archiveDir
    $archiveName = "state-compaction-{0}.md" -f (Get-Date).ToString("yyyyMMdd-HHmmss")
    $archivePath = Join-Path $archiveDir $archiveName
    $archiveContent = @(
      "# State Compaction Archive",
      "",
      "- Date: $(Get-DateTimeIso)",
      "- Source: .planning/STATE.md",
      "",
      "## Archived Decisions",
      ""
    ) + $archived
    Save-Utf8NoBom -Path $archivePath -Content ($archiveContent -join "`n")
  }

  Save-Utf8NoBom -Path $statePath -Content $stateContent
  Set-MemoryStateFields -StatePath $statePath -Updates @{
    "Last Activity" = (Get-DateIso)
    "Last Activity Description" = "Compacted state and archived older entries"
    "Last Date" = (Get-DateTimeIso)
    "Stopped At" = "Memory compaction completed"
    "Resume File" = "None"
  }

  Write-Info "Compaction complete."
}

function Invoke-CommandCapture {
  param([string]$CommandText)
  $output = ""
  $exitCode = 0
  try {
    $output = (& pwsh -NoProfile -Command $CommandText 2>&1 | Out-String).Trim()
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) {
      $exitCode = 0
    }
  } catch {
    $exitCode = 1
    $output = $_.Exception.Message
  }
  [pscustomobject]@{
    command = $CommandText
    exit_code = $exitCode
    passed = ($exitCode -eq 0)
    output = $output
  }
}

function Get-VerificationCommands {
  $commands = @()

  $packagePath = Join-Path $Script:RepoRoot "package.json"
  if (Test-Path $packagePath) {
    try {
      $pkg = Get-Content $packagePath -Raw | ConvertFrom-Json
      if ($pkg.scripts.test) { $commands += "npm test -- --watch=false" }
      if ($pkg.scripts.lint) { $commands += "npm run lint" }
      if ($pkg.scripts.build) { $commands += "npm run build" }
    } catch {
      # Ignore malformed package.json.
    }
  }

  if (((Test-Path (Join-Path $Script:RepoRoot "pyproject.toml")) -or (Test-Path (Join-Path $Script:RepoRoot "requirements.txt"))) -and (Get-Command pytest -ErrorAction SilentlyContinue)) {
    $commands += "pytest -q"
  }
  if ((Test-Path (Join-Path $Script:RepoRoot "Cargo.toml")) -and (Get-Command cargo -ErrorAction SilentlyContinue)) {
    $commands += "cargo test"
  }
  if ((Test-Path (Join-Path $Script:RepoRoot "go.mod")) -and (Get-Command go -ErrorAction SilentlyContinue)) {
    $commands += "go test ./..."
  }

  return @($commands | Select-Object -Unique)
}

function Invoke-Verify {
  Ensure-PlanningStructure
  $commands = Get-VerificationCommands
  $results = @()
  if ((Get-Count -InputObject $commands) -eq 0) {
    $results += [pscustomobject]@{
      command = "(no commands detected)"
      exit_code = 0
      passed = $true
      output = "No stack-aware verification commands were detected in this repository."
    }
  } else {
    foreach ($check in $commands) {
      Write-Info "Running check: $check"
      $results += Invoke-CommandCapture -CommandText $check
    }
  }

  $phaseDir = $null
  if (-not [string]::IsNullOrWhiteSpace($Phase)) {
    $phaseDir = Find-PhaseDirectory -PhaseNumber $Phase
  }
  $reportPath = if ($phaseDir) {
    $phaseNorm = Normalize-PhaseNumber -RawPhase $Phase
    Join-Path $phaseDir "$phaseNorm-VERIFICATION.md"
  } else {
    Join-Path $Script:PlanningDir "VERIFICATION.md"
  }

  $rows = @("| Command | Exit | Result |", "|---|---:|---|")
  foreach ($result in $results) {
    $status = if ($result.passed) { "PASS" } else { "FAIL" }
    $rows += ('| `{0}` | {1} | {2} |' -f $result.command, $result.exit_code, $status)
  }
  $detailBlocks = @()
  foreach ($result in $results) {
    $detailBlocks += "### $($result.command)"
    $detailBlocks += ""
    $detailBlocks += "Exit code: $($result.exit_code)"
    $detailBlocks += ""
    $detailBlocks += '```text'
    if ([string]::IsNullOrWhiteSpace($result.output)) {
      $detailBlocks += "(no output)"
    } else {
      $detailBlocks += $result.output
    }
    $detailBlocks += '```'
    $detailBlocks += ""
  }

  $overallPassed = ((Get-Count -InputObject ($results | Where-Object { -not $_.passed })) -eq 0)
  $statusText = if ($overallPassed) { "passed" } else { "failed" }
  $verificationLines = @(
    "---",
    "generated: $(Get-DateTimeIso)",
    "status: $statusText",
    "---",
    "",
    "# Verification Report",
    "",
    "## Summary",
    "",
    "- Status: **$statusText**",
    "- Timestamp: $(Get-DateTimeIso)",
    "",
    "## Checks",
    ""
  )
  $verificationLines += $rows
  $verificationLines += @(
    "",
    "## Detailed Output",
    ""
  )
  $verificationLines += $detailBlocks
  $verificationDoc = $verificationLines -join "`n"
  Save-Utf8NoBom -Path $reportPath -Content $verificationDoc

  $statePath = Join-Path $Script:PlanningDir "STATE.md"
  Set-MemoryStateFields -StatePath $statePath -Updates @{
    "Last Activity" = (Get-DateIso)
    "Last Activity Description" = "Verification completed ($statusText)"
    "Last Date" = (Get-DateTimeIso)
    "Stopped At" = "Verification completed"
    "Resume File" = "None"
  }

  Write-Info "Verification report written: $reportPath"
}

function Invoke-ScaffoldPhase {
  if ([string]::IsNullOrWhiteSpace($Phase)) {
    throw "Phase is required for scaffold-phase."
  }
  if ([string]::IsNullOrWhiteSpace($Name)) {
    throw "Name is required for scaffold-phase."
  }

  Ensure-PlanningStructure
  $phaseNorm = Normalize-PhaseNumber -RawPhase $Phase
  $slug = Slugify -InputText $Name
  $phaseDir = Join-Path (Join-Path $Script:PlanningDir "phases") "$phaseNorm-$slug"
  Ensure-Dir -Path $phaseDir

  $contextDoc = Get-TemplateContent -RelativePath "context.md" -Tokens @{
    PHASE_NUMBER = $phaseNorm
    PHASE_NAME = $Name
    DATE = (Get-DateIso)
    PHASE_DIR = "$phaseNorm-$slug"
  }
  Save-Utf8NoBom -Path (Join-Path $phaseDir "$phaseNorm-CONTEXT.md") -Content $contextDoc

  $roadmapPath = Join-Path $Script:PlanningDir "ROADMAP.md"
  if (Test-Path $roadmapPath) {
    $roadmap = Get-Content $roadmapPath -Raw
    if ($roadmap -notmatch [regex]::Escape("Phase ${phaseNorm}: $Name")) {
      $checklistPattern = "(?ms)(## Phase Checklist\s*\r?\n)"
      if ([regex]::IsMatch($roadmap, $checklistPattern)) {
        $roadmap = [regex]::Replace($roadmap, $checklistPattern, "`${1}- [ ] **Phase ${phaseNorm}: $Name** - Added via scaffold-phase`n", 1)
      }
      $roadmap += "`n`n### Phase ${phaseNorm}: $Name`n**Goal:** Define and execute this phase scope.`n**Depends on:** TBD`n**Requirements:** TBD`n**Plans:** 0 plans`n`nPlans:`n- [ ] $phaseNorm-01: Define first plan"
      $roadmap += "`n`n| $phaseNorm $Name | 0/0 | Not started | - |"
      Save-Utf8NoBom -Path $roadmapPath -Content $roadmap
    }
  }

  $statePath = Join-Path $Script:PlanningDir "STATE.md"
  Set-MemoryStateFields -StatePath $statePath -Updates @{
    "Current Phase" = $phaseNorm
    "Current Phase Name" = $Name
    "Current Plan" = "Not started"
    "Total Plans in Phase" = "0"
    "Status" = "Ready to discuss"
    "Last Activity" = (Get-DateIso)
    "Last Activity Description" = "Scaffolded phase $phaseNorm ($Name)"
    "Last Date" = (Get-DateTimeIso)
    "Stopped At" = "Phase scaffold complete"
    "Resume File" = (Join-Path ".planning/phases/$phaseNorm-$slug" "$phaseNorm-CONTEXT.md")
  }

  Write-Info "Phase scaffolded at: $phaseDir"
}

function Invoke-ScaffoldPlan {
  if ([string]::IsNullOrWhiteSpace($Phase)) {
    throw "Phase is required for scaffold-plan."
  }
  if ([string]::IsNullOrWhiteSpace($Name)) {
    throw "Name is required for scaffold-plan."
  }
  $phaseDir = Find-PhaseDirectory -PhaseNumber $Phase
  if (-not $phaseDir) {
    throw "Phase directory not found for phase $Phase. Run scaffold-phase first."
  }

  $phaseNorm = Normalize-PhaseNumber -RawPhase $Phase
  $planNorm = if ($Plan -match "^\d+$") { "{0:D2}" -f [int]$Plan } else { $Plan }
  $planDoc = Get-TemplateContent -RelativePath "plan.md" -Tokens @{
    PHASE_NUMBER = $phaseNorm
    PLAN_NUMBER = $planNorm
    PLAN_TITLE = $Name
    DATE = (Get-DateIso)
  }
  $planPath = Join-Path $phaseDir "$phaseNorm-$planNorm-PLAN.md"
  Save-Utf8NoBom -Path $planPath -Content $planDoc

  $statePath = Join-Path $Script:PlanningDir "STATE.md"
  Set-MemoryStateFields -StatePath $statePath -Updates @{
    "Current Phase" = $phaseNorm
    "Current Plan" = "$phaseNorm-$planNorm"
    "Status" = "Ready to execute"
    "Last Activity" = (Get-DateIso)
    "Last Activity Description" = "Scaffolded plan $phaseNorm-$planNorm"
    "Last Date" = (Get-DateTimeIso)
    "Stopped At" = "Plan scaffold complete"
    "Resume File" = (Join-Path (Split-Path $phaseDir -Leaf) "$phaseNorm-$planNorm-PLAN.md")
  }

  Write-Info "Plan scaffolded at: $planPath"
}

Set-Location $Script:RepoRoot

switch ($Command) {
  "init" { Invoke-Init }
  "map" { Invoke-Map }
  "progress" { Invoke-Progress }
  "resume" { Invoke-Resume }
  "health" { Invoke-Health }
  "compact" { Invoke-Compact }
  "verify" { Invoke-Verify }
  "scaffold-phase" { Invoke-ScaffoldPhase }
  "scaffold-plan" { Invoke-ScaffoldPlan }
  default { throw "Unsupported command: $Command" }
}
