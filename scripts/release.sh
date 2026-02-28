#!/usr/bin/env bash

# ToolHub Release Script
# Use this script to build the single binary for distribution.

set -e

echo "🛠 Building ToolHub for Release..."

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# 1. Build Frontend
echo "📦 Building Frontend..."
bun run --filter "@toolhub/client" build

# 2. Compile Server into Single Binary
echo "🚀 Compiling Single Binary (macOS)..."
mkdir -p dist
bun build ./apps/server/src/index.ts --compile --outfile dist/toolhub-macos

echo "🚀 Compiling Single Binary (Linux)..."
# Note: To compile for Linux from Mac, you might need a container or a Linux environment.
# But for now, we'll provide the command.
# bun build ./apps/server/src/index.ts --compile --target bun-linux-x64 --outfile dist/toolhub-linux

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
