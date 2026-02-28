#!/usr/bin/env bash

# ToolHub One-Command Publisher
# Usage: bash scripts/publish.sh [patch|minor|major]

set -e

# 1. Determine release type (default to patch)
TYPE=${1:-patch}

echo "🎯 Starting ToolHub Publish Process ($TYPE)..."

# 2. Bump version across all package.json files
echo "🔢 Bumping version..."
bun run scripts/bump-version.ts $TYPE

# Get the new version from root package.json
NEW_VERSION=$(bun -e "console.log(require('./package.json').version)")
TAG="v$NEW_VERSION"

# 3. Build the binary
echo "📦 Building Frontend and Compiling Binary..."
bash scripts/release.sh

# 4. Git Commit and Push
echo "🐙 Committing changes to Git..."
git add .
# Nếu không có thay đổi gì để commit thì bỏ qua
git commit -m "chore: release $TAG" || echo "No changes to commit"
git push origin main

# 5. Create and Push Git Tag
echo "🏷️ Creating Git Tag $TAG..."
# Xóa tag local nếu đã tồn tại (để tránh lỗi khi chạy lại)
git tag -d $TAG 2>/dev/null || true
git tag $TAG
git push origin $TAG --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUCCESS: Version $TAG has been pushed to GitHub!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👉 FINAL STEP: You need to MANUALLY upload the binary."
echo ""
echo "1. Open: https://github.com/giangittb112000/tool-hub/releases/new?tag=$TAG"
echo "2. Title: ToolHub $TAG"
echo "3. DRAG & DROP this file: dist/toolhub-macos"
echo "4. Click 'Publish release'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
