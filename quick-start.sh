#!/bin/bash
set -e

echo "🚀 Starting Agent Vibes setup..."

REPO_URL="https://github.com/fjiangming/agent-vibes.git"
BRANCH="dev"
TARGET_DIR="$HOME/.agent-vibes"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v24 or later."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git."
    exit 1
fi

if [ -d "$TARGET_DIR" ]; then
    echo "📦 Updating existing repository..."
    cd "$TARGET_DIR"
    git fetch origin $BRANCH
    git reset --hard origin/$BRANCH
else
    echo "📦 Cloning repository..."
    git clone -b $BRANCH $REPO_URL "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "✨ Starting Agent Vibes..."
npm run start
