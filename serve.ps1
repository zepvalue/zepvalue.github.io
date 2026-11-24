# Windows version of `make serve`: run the site locally at http://localhost:4000
#
#   .\serve.ps1            install gems if needed, then serve
#   .\serve.ps1 -Build     build into _site/ and run the site check (like `make test`)
#
# Needs Ruby 3.3 with DevKit:  winget install RubyInstallerTeam.RubyWithDevKit.3.3
# No --livereload: its native gem often fails to build on Windows.

param(
  [switch]$Build,
  [int]$Port = 4000
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# A terminal opened before the Ruby install does not have it on PATH yet.
if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
  $ruby = Get-ChildItem 'C:\Ruby*-x64\bin' -Directory -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending | Select-Object -First 1
  if (-not $ruby) {
    Write-Error 'Ruby not found. Install it: winget install RubyInstallerTeam.RubyWithDevKit.3.3'
  }
  $env:Path = "$($ruby.FullName);$env:Path"
}

bundle check *> $null
if ($LASTEXITCODE -ne 0) {
  bundle install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($Build) {
  bundle exec jekyll build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  # Use Git Bash: `bash` alone can resolve to WSL.
  $gitBash = Join-Path (Split-Path (Split-Path (Get-Command git).Source)) 'bin\bash.exe'
  & $gitBash scripts/check-site.sh
  exit $LASTEXITCODE
}

bundle exec jekyll serve --port $Port
