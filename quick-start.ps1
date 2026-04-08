param (
    [string]$TargetDir = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Cursor Proxy setup..." -ForegroundColor Cyan

$REPO_URL = "https://github.com/fjiangming/cursor-proxy.git"
$BRANCH = "dev"

if (-not [string]::IsNullOrWhiteSpace($TargetDir)) {
    $TARGET_DIR = $TargetDir
} elseif (-not [string]::IsNullOrWhiteSpace($env:AGENT_VIBES_DIR)) {
    $TARGET_DIR = $env:AGENT_VIBES_DIR
} else {
    $TARGET_DIR = "$env:USERPROFILE\.cursor-proxy"
}

Write-Host "📂 Target directory: $TARGET_DIR" -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v24 or later." -ForegroundColor Red
    exit 1
}

# Check Git
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git." -ForegroundColor Red
    exit 1
}

if (Test-Path $TARGET_DIR) {
    Write-Host "📦 Updating existing repository..." -ForegroundColor Yellow
    Set-Location $TARGET_DIR
    git fetch origin $BRANCH
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to fetch from origin. Please check your network connection." -ForegroundColor Red
        exit 1
    }
    git reset --hard origin/$BRANCH
} else {
    Write-Host "📦 Cloning repository..." -ForegroundColor Yellow
    git clone -b $BRANCH $REPO_URL $TARGET_DIR
    Set-Location $TARGET_DIR
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

Write-Host "✨ Starting Cursor Proxy..." -ForegroundColor Green
npm run start
