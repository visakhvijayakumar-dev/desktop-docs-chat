#!/bin/bash

# Codebase Cleanup Script
# This script safely removes build artifacts, cache files, and unused dependencies
# while preserving important project files

set -e  # Exit on any error

echo "🧹 Starting codebase cleanup..."
echo "Project size before cleanup:"
du -sh /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat

# Function to safely remove directories
safe_remove() {
    local dir="$1"
    local desc="$2"
    if [ -d "$dir" ]; then
        echo "Removing $desc: $dir"
        rm -rf "$dir"
        echo "✅ Removed $desc"
    else
        echo "⚠️  $desc not found: $dir"
    fi
}

# Function to safely remove files
safe_remove_files() {
    local pattern="$1"
    local desc="$2"
    echo "Removing $desc matching: $pattern"
    find /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat -name "$pattern" -type f -delete 2>/dev/null || true
    echo "✅ Removed $desc"
}

echo ""
echo "📦 Step 1: Removing node_modules directories..."
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/node_modules" "Frontend node_modules (546MB)"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/backend/node_modules" "Backend node_modules (67MB)"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/pixel-chat-app/node_modules" "Pixel-chat-app node_modules (39MB)"

echo ""
echo "🏗️  Step 2: Removing build artifacts..."
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/dist" "Frontend build artifacts"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/backend/dist" "Backend build artifacts"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/pixel-chat-app/dist" "Pixel-chat-app build artifacts"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/release" "Electron release builds"

echo ""
echo "🗂️  Step 3: Removing temporary and cache files..."
safe_remove_files ".DS_Store" "macOS system files"
safe_remove_files "*.log" "Log files"
safe_remove_files "*.tmp" "Temporary files"
safe_remove_files "*.temp" "Temporary files"

echo ""
echo "🧹 Step 4: Cleaning up duplicate config files..."
# Keep only the root .gitignore, remove others
find /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat -name ".gitignore" -not -path "*/node_modules/*" | grep -v "^/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/.gitignore$" | xargs rm -f 2>/dev/null || true

echo ""
echo "📊 Cleanup complete! Project size after cleanup:"
du -sh /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat

echo ""
echo "🔄 To restore dependencies, run:"
echo "  cd frontend && npm install"
echo "  cd backend && npm install"  
echo "  cd pixel-chat-app && npm install"

echo ""
echo "✨ Cleanup completed successfully!"