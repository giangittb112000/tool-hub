#!/usr/bin/env bash

# ToolHub Release Script
# Builds frontend + backend into distributable packages.

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

# Verify frontend build output exists
if [ ! -f "apps/client/dist/index.html" ]; then
    echo "❌ Frontend build output not found at apps/client/dist/"
    exit 1
fi

# 2. Compile Server Binaries
echo "🚀 Compiling Server..."
bun build ./apps/server/src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/toolhub-macos-bin
bun build ./apps/server/src/index.ts --compile --target=bun-linux-x64 --outfile dist/toolhub-linux-bin
bun build ./apps/server/src/index.ts --compile --target=bun-windows-x64 --outfile dist/toolhub-win-bin.exe

# 3. Create Platform Packages (binary + frontend assets)
echo "📦 Creating platform packages..."

# macOS package
mkdir -p dist/pkg-macos/public
cp -r apps/client/dist/* dist/pkg-macos/public/
cp dist/toolhub-macos-bin dist/pkg-macos/toolhub
cd dist/pkg-macos && tar -czf ../toolhub-macos.tar.gz . && cd ../..

# Linux package
mkdir -p dist/pkg-linux/public
cp -r apps/client/dist/* dist/pkg-linux/public/
cp dist/toolhub-linux-bin dist/pkg-linux/toolhub
cd dist/pkg-linux && tar -czf ../toolhub-linux.tar.gz . && cd ../..

# Windows package
mkdir -p dist/pkg-windows/public
cp -r apps/client/dist/* dist/pkg-windows/public/
cp dist/toolhub-win-bin.exe dist/pkg-windows/toolhub.exe
cd dist/pkg-windows && zip -rq ../toolhub-win.zip . && cd ../..

# 4. Validation
echo ""
echo "🔍 Validating packages..."

FAIL=0
for PKG in "dist/toolhub-macos.tar.gz" "dist/toolhub-linux.tar.gz" "dist/toolhub-win.zip"; do
    if [ -f "$PKG" ]; then
        SIZE=$(du -h "$PKG" | cut -f1)
        echo "  ✅ $PKG ($SIZE)"
    else
        echo "  ❌ MISSING: $PKG"
        FAIL=1
    fi
done

if [ "$FAIL" -eq 1 ]; then
    echo ""
    echo "❌ Build failed! Some packages are missing."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Build Complete! Ready for release."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Upload these 3 files to GitHub Release:"
echo "  📦 dist/toolhub-macos.tar.gz"
echo "  📦 dist/toolhub-linux.tar.gz"
echo "  📦 dist/toolhub-win.zip"
echo ""
