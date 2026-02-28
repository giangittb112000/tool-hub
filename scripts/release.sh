#!/usr/bin/env bash

# ToolHub Release Script
# Use this script to build the single binary for distribution.

set -e

echo "🛠 Building ToolHub for Release..."

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# 1. Build Frontend
echo "📦 Building Frontend..."
rm -rf dist
mkdir -p dist

if ! bun run --filter "@toolhub/client" build; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# 2. Compile Server into Single Binary
echo "🚀 Compiling for macOS (ARM64)..."
bun build ./apps/server/src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/toolhub-macos

echo "🚀 Compiling for Linux (x64)..."
bun build ./apps/server/src/index.ts --compile --target=bun-linux-x64 --outfile dist/toolhub-linux

echo "🚀 Compiling for Windows (x64)..."
bun build ./apps/server/src/index.ts --compile --target=bun-windows-x64 --outfile dist/toolhub-win.exe

# Validation
if [[ ! -f "dist/toolhub-macos" || ! -f "dist/toolhub-linux" || ! -f "dist/toolhub-win.exe" ]]; then
    echo "❌ One or more binaries are missing in dist/!"
    exit 1
fi

echo ""
echo "✅ Build Complete!"
echo "Next steps:"
echo "1. Go to your GitHub repository: https://github.com/giangittb112000/tool-hub"
echo "2. Create a new Release (e.g., tag v1.0.0)."
echo "3. Upload the file: dist/toolhub-macos"
echo "4. Name the asset exactly: toolhub-macos"
echo "5. Publish the release."
echo ""
echo "Then, users can install it using the one-liner in README.md!"
