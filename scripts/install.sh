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

# Setup PATH & Alias
SHELL_TYPE=$(basename "$SHELL")
CONFIG_FILES=()

case "$SHELL_TYPE" in
    zsh)  CONFIG_FILES=("$HOME/.zshrc") ;;
    bash) CONFIG_FILES=("$HOME/.bashrc" "$HOME/.bash_profile") ;;
    *)    CONFIG_FILES=("$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.profile") ;;
esac

echo "🔧 Configuring shell path & alias..."
for CONFIG in "${CONFIG_FILES[@]}"; do
    if [ -f "$CONFIG" ]; then
        # Cập nhật PATH nếu chưa có
        if ! grep -q "export PATH=.*$INSTALL_DIR" "$CONFIG"; then
            echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$CONFIG"
            echo "✅ Added PATH to $CONFIG"
        fi
        
        # Cập nhật Alias nếu chưa có (Rất quan trọng để nhận lệnh ngay)
        if ! grep -q "alias toolhub=" "$CONFIG"; then
            echo "alias toolhub=\"$BINARY_PATH\"" >> "$CONFIG"
            echo "✅ Added alias to $CONFIG"
        fi
    fi
done

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
fi

# Final Message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ToolHub Installation Successful!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$OS" = "Darwin" ]; then
    ACTIVE_CMD="source $([ -f "$HOME/.zshrc" ] && echo "~/.zshrc" || echo "~/.bashrc")"
    echo "🍎 macOS Detected"
    echo "👉 COPY & PASTE this to start using ToolHub now:"
    echo "   $ACTIVE_CMD && toolhub --help"
elif [ "$OS" = "Linux" ]; then
    echo "🐧 Linux Detected"
    echo "👉 COPY & PASTE this to start using ToolHub now:"
    echo "   source ~/.bashrc && toolhub --help"
fi

echo ""
echo "🪟 If you are using Windows (PowerShell):"
echo "   New-Item -ItemType SymbolLink -Path \"C:\\Windows\\System32\\toolhub.exe\" -Target \"(path to toolhub-win.exe)\""
echo "   (Or add the directory containing ToolHub to your Environment Variables PATH)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
