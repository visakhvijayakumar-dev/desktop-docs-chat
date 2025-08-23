#!/bin/bash

# Selective Cleanup Script
# More conservative cleanup that preserves dependencies but removes build artifacts

set -e  # Exit on any error

echo "🧹 Starting selective cleanup (preserving node_modules)..."
echo "Project size before cleanup:"
du -sh /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat

# Function to safely remove directories
safe_remove() {
    local dir="$1"
    local desc="$2"
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "Removing $desc ($size): $dir"
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
echo "🏗️  Step 1: Removing build artifacts..."
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/dist" "Frontend build artifacts"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/backend/dist" "Backend build artifacts"  
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/pixel-chat-app/dist" "Pixel-chat-app build artifacts"
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/release" "Electron release builds"

echo ""
echo "📦 Step 2: Cleaning Electron binaries (largest space consumers)..."
safe_remove "/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/frontend/node_modules/electron/dist" "Electron binaries (212MB)"

echo ""
echo "🗂️  Step 3: Removing system and temporary files..."
safe_remove_files ".DS_Store" "macOS system files"
safe_remove_files "*.log" "Log files"
safe_remove_files "*.tmp" "Temporary files"
safe_remove_files "*.temp" "Temporary files"

echo ""
echo "🧹 Step 4: Removing duplicate .gitignore files..."
find /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat -name ".gitignore" -not -path "*/node_modules/*" | grep -v "^/Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat/.gitignore$" | xargs rm -f 2>/dev/null || true

echo ""
echo "📊 Cleanup complete! Project size after cleanup:"
du -sh /Users/visakhvijayakumar/IBM/HyperBlue/desktop-docs-chat

echo ""
echo "🔄 To restore Electron binaries, run:"
echo "  cd frontend && npm install electron"

echo ""
echo "✨ Selective cleanup completed successfully!"