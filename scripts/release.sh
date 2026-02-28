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

# 2. Compile Server and Package assets
echo "🚀 Compiling Server..."
bun build ./apps/server/src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/toolhub-macos-bin
bun build ./apps/server/src/index.ts --compile --target=bun-linux-x64 --outfile dist/toolhub-linux-bin
bun build ./apps/server/src/index.ts --compile --target=bun-windows-x64 --outfile dist/toolhub-win.exe

echo "📦 Creating platform packages..."
# macOS package
mkdir -p dist/macos/public
cp -r apps/client/dist/* dist/macos/public/
cp dist/toolhub-macos-bin dist/macos/toolhub
cd dist/macos && tar -czf ../toolhub-macos.tar.gz . && cd ../..

# Linux package
mkdir -p dist/linux/public
cp -r apps/client/dist/* dist/linux/public/
cp dist/toolhub-linux-bin dist/linux/toolhub
cd dist/linux && tar -czf ../toolhub-linux.tar.gz . && cd ../..

# Windows package
mkdir -p dist/windows/public
cp -r apps/client/dist/* dist/windows/public/
cp dist/toolhub-win.exe dist/windows/toolhub.exe
cd dist/windows && zip -r ../toolhub-win.zip . && cd ../..

# Validation
if [[ ! -f "dist/toolhub-macos.tar.gz" || ! -f "dist/toolhub-linux.tar.gz" || ! -f "dist/toolhub-win.zip" ]]; then
    echo "❌ One or more packages are missing in dist/!"
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
