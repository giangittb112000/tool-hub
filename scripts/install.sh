#!/usr/bin/env bash

# ToolHub Installation Script
# This script downloads ToolHub and configures it to run as a background service.

set -e

echo "🚀 Installing ToolHub - The Ultimate Developer Control Center..."

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo " detected OS: $OS / $ARCH"

# In a real scenario, this would curl a compiled binary from GitHub Releases
# For development/monorepo, we'll build it locally using Bun
echo "📦 Building ToolHub Single Binary..."
export PATH="$HOME/.bun/bin:$PATH"
cd "$(dirname "$0")/.."
bun install
bun build ./apps/server/src/index.ts --compile --outfile dist/toolhub

BINARY_PATH="$(pwd)/dist/toolhub"

echo "✅ Build complete: $BINARY_PATH"

if [ "$OS" = "Darwin" ]; then
  # macOS LaunchAgent setup
  echo "🍎 Configuring Background Service for macOS (LaunchAgent)..."
  
  PLIST_DIR="$HOME/Library/LaunchAgents"
  PLIST_FILE="$PLIST_DIR/dev.toolhub.daemon.plist"
  
  mkdir -p "$PLIST_DIR"
  
  cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>dev.toolhub.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BINARY_PATH</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/toolhub.err.log</string>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/toolhub.out.log</string>
</dict>
</plist>
EOF

  # Unload if it already exists, then load
  launchctl unload "$PLIST_FILE" 2>/dev/null || true
  launchctl load "$PLIST_FILE"
  
  echo "🎉 ToolHub is now running in the background!"
  echo "👉 Access the Web UI at: http://localhost:3001"

elif [ "$OS" = "Linux" ]; then
    # Assuming Systemd for Linux
    echo "🐧 Configuring Background Service for Linux (Systemd)..."
    # To be implemented
    echo "Systemd setup not yet fully implemented in this stub."
else
  echo "⚠️ OS not officially supported for auto-background service yet."
  echo "You can run it manually: $BINARY_PATH"
fi
