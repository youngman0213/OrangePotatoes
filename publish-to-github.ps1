param(
  [string]$RepoUrl = "https://github.com/youngman0213/OrangePotatoes.git",
  [string]$Branch = "main",
  [string]$CommitMessage = "Initial Gangwon FC fan hub",
  [string]$GitUserName = "youngman0213",
  [string]$GitUserEmail = "youngman0213@users.noreply.github.com"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Git {
  git @args
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $args"
  }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed or not available in PATH." -ForegroundColor Red
  Write-Host "Install Git for Windows, then open a new PowerShell window:"
  Write-Host "https://git-scm.com/download/win"
  exit 1
}

Write-Step "Checking current folder"
Write-Host (Get-Location)

if (-not (Test-Path ".git")) {
  Write-Step "Initializing git repository"
  Invoke-Git init
}

Write-Step "Setting branch to $Branch"
Invoke-Git branch -M $Branch

Write-Step "Setting git author for this project"
Invoke-Git config user.name $GitUserName
Invoke-Git config user.email $GitUserEmail

$remoteNames = git remote
if ($remoteNames -notcontains "origin") {
  Write-Step "Adding GitHub remote"
  Invoke-Git remote add origin $RepoUrl
} else {
  $origin = git remote get-url origin
  if ($origin -ne $RepoUrl) {
    Write-Step "Updating GitHub remote URL"
    Invoke-Git remote set-url origin $RepoUrl
  }
}

Write-Step "Adding files"
Invoke-Git add .

$status = git status --porcelain
if (-not $status) {
  Write-Host "No file changes to commit. Creating a deploy trigger commit." -ForegroundColor Yellow
  Write-Step "Creating empty deploy trigger commit"
  Invoke-Git commit --allow-empty -m "Trigger Vercel deploy"
} else {
  Write-Step "Creating commit"
  Invoke-Git commit -m $CommitMessage
}

Write-Step "Syncing latest GitHub changes"
git fetch origin $Branch
if ($LASTEXITCODE -eq 0) {
  git rev-parse --verify "origin/$Branch" *> $null
  if ($LASTEXITCODE -eq 0) {
    Invoke-Git pull --rebase origin $Branch
  }
}

Write-Step "Pushing to GitHub"
Invoke-Git push -u origin $Branch

Write-Host ""
Write-Host "Done. Check your repository:" -ForegroundColor Green
Write-Host $RepoUrl
