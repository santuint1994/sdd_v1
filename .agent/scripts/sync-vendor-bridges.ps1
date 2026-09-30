<#
.SYNOPSIS
  Regenerates local, gitignored per-agent bridge folders from .agent/ (single source of truth) -
  only for the AI assistants actually installed on this machine.

.DESCRIPTION
  .agent/ (and AGENTS.md) is the ONLY place workflows, skills, and rules are authored.
  Different AI coding assistants each expect their own folder layout at the project root
  (Claude Code -> .claude/, Cursor -> .cursor/, Windsurf -> .windsurf/, Gemini -> .gemini/).

  This script detects which of those assistants are installed (their CLI is on PATH) and
  creates local links only for those - real symlinks where privileges allow, directory
  junctions otherwise (junctions need no admin/Developer Mode on Windows). No file is ever
  duplicated or committed to git; nothing this script creates should be tracked - see
  .gitignore.

  Safe to re-run any time .agent/ content changes/syncs, or after installing a new
  assistant. Existing real (non-link) directories are left untouched with a warning,
  never deleted.

.EXAMPLE
  powershell -File .agent\scripts\sync-vendor-bridges.ps1
#>

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Each vendor: the CLI command used to detect it's installed, and the folders it expects,
# mapped to where that content actually lives under .agent/.
$vendors = @(
    @{
        Name = "Claude Code"
        Cli  = "claude"
        Bridges = @(
            @{ Link = ".claude\commands"; Target = ".agent\workflows" }
            @{ Link = ".claude\skills";   Target = ".agent\skills" }
        )
    }
    @{
        Name = "Cursor"
        Cli  = "cursor"
        Bridges = @(
            @{ Link = ".cursor\commands"; Target = ".agent\workflows" }
            @{ Link = ".cursor\rules";    Target = ".agent\rules" }
        )
    }
    @{
        Name = "Windsurf"
        Cli  = "windsurf"
        Bridges = @(
            @{ Link = ".windsurf\workflows"; Target = ".agent\workflows" }
            @{ Link = ".windsurf\rules";     Target = ".agent\rules" }
        )
    }
    @{
        Name = "Gemini"
        Cli  = "gemini"
        Bridges = @(
            @{ Link = ".gemini\commands"; Target = ".agent\workflows" }
            @{ Link = ".gemini\skills";   Target = ".agent\skills" }
        )
    }
)

function New-Bridge($relLink, $relTarget) {
    $linkPath = Join-Path $root $relLink
    $targetPath = Join-Path $root $relTarget

    if (-not (Test-Path $targetPath)) {
        Write-Host "  Skip: $relTarget does not exist yet."
        return
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $linkPath -Parent) | Out-Null

    if (Test-Path $linkPath) {
        $item = Get-Item $linkPath -Force
        if ($item.LinkType) {
            Remove-Item $linkPath -Force -Recurse
        } else {
            Write-Warning "  $relLink exists and is a real directory, not a link. Skipping to avoid deleting content. Remove it manually and re-run this script."
            return
        }
    }

    try {
        New-Item -ItemType SymbolicLink -Path $linkPath -Target $targetPath | Out-Null
        Write-Host "  Linked (symlink): $relLink -> $relTarget"
    } catch {
        # Symlinks need admin or Developer Mode on Windows; junctions don't.
        New-Item -ItemType Junction -Path $linkPath -Target $targetPath | Out-Null
        Write-Host "  Linked (junction): $relLink -> $relTarget"
    }
}

foreach ($vendor in $vendors) {
    $installed = [bool](Get-Command $vendor.Cli -ErrorAction SilentlyContinue)
    if (-not $installed) {
        Write-Host "Skipping $($vendor.Name): '$($vendor.Cli)' not found on PATH."
        continue
    }
    Write-Host "$($vendor.Name) detected ('$($vendor.Cli)' on PATH):"
    foreach ($bridge in $vendor.Bridges) {
        New-Bridge $bridge.Link $bridge.Target
    }
}

Write-Host "`nDone. Bridges created only for installed assistants - nothing here is tracked in git."
