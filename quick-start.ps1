$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Agent Vibes setup..." -ForegroundColor Cyan

$REPO_URL = "https://github.com/fjiangming/agent-vibes.git"
$BRANCH = "dev"
$TARGET_DIR = "$env:USERPROFILE\.agent-vibes"

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

Write-Host "✨ Starting Agent Vibes..." -ForegroundColor Green
npm run start
