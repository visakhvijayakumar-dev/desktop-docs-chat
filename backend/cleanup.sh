#!/bin/bash

# Backend Cleanup Script
# This script safely removes build artifacts, temporary files, and unused dependencies

set -e

echo "🧹 Starting backend cleanup..."

# Function to safely remove directory if it exists
safe_remove_dir() {
    if [ -d "$1" ]; then
        echo "Removing $1..."
        rm -rf "$1"
    else
        echo "Directory $1 does not exist, skipping..."
    fi
}

# Function to safely remove file if it exists
safe_remove_file() {
    if [ -f "$1" ]; then
        echo "Removing $1..."
        rm -f "$1"
    else
        echo "File $1 does not exist, skipping..."
    fi
}

# 1. Remove build artifacts
echo "📦 Cleaning build artifacts..."
safe_remove_dir "dist"

# 2. Remove temporary files
echo "🗂️ Cleaning temporary files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# 3. Clean npm cache and node_modules for fresh install
echo "📚 Cleaning node_modules and npm cache..."
safe_remove_dir "node_modules"
safe_remove_file "package-lock.json"
npm cache clean --force 2>/dev/null || true

# 4. Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm install

echo "✅ Cleanup completed successfully!"
echo ""
echo "Next steps:"
echo "- Run 'npm run build' to rebuild the project"
echo "- Run 'npm run dev' to start development server"