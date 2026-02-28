#!/usr/bin/env bash

# ToolHub Installation Script
# This script downloads ToolHub and configures it to run as a background service.

set -e

echo "🚀 Installing ToolHub - The Ultimate Developer Control Center..."

# Configuration
OS="$(uname -s)"
REPO="giangittb112000/tool-hub"
INSTALL_DIR="$HOME/.toolhub"
BINARY_NAME="toolhub"
BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"

mkdir -p "$INSTALL_DIR"

if [ "$OS" = "Darwin" ]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-macos"
elif [ "$OS" = "Linux" ]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-linux"
else
    echo "❌ OS not supported."
    exit 1
fi

echo "📥 Downloading ToolHub binary..."
curl -L "$DOWNLOAD_URL" -o "$BINARY_PATH"
chmod +x "$BINARY_PATH"

# Setup PATH
SHELL_CONFIG=""
if [[ "$SHELL" == */zsh ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ "$SHELL" == */bash ]]; then
    SHELL_CONFIG="$HOME/.bashrc"
fi

if [ -n "$SHELL_CONFIG" ]; then
    if ! grep -q "$INSTALL_DIR" "$SHELL_CONFIG"; then
        echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$SHELL_CONFIG"
        echo "✅ Added $INSTALL_DIR to PATH in $SHELL_CONFIG"
    fi
fi

echo "✅ Installation complete: $BINARY_PATH"
echo "🚀 You can now run 'toolhub' from your terminal (you may need to restart your terminal)."

if [ "$OS" = "Darwin" ]; then
  # macOS LaunchAgent setup
  echo "🍎 Configuring Background Service for macOS..."
  
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
    <key>EnvironmentVariables</key>
    <dict>
        <key>RUN_AS_SERVICE</key>
        <string>true</string>
    </dict>
</dict>
</plist>
EOF

  # We don't load it automatically - user must run 'toolhub start'
  echo "🎉 ToolHub installed successfully!"
  echo "⚠️ Status: Stopped"
  echo "👉 To start the service, run: toolhub start"
fi
