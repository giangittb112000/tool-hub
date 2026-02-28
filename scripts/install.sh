#!/usr/bin/env bash

# ToolHub Installation Script
# This script downloads ToolHub and configures it to run as a background service.

set -e

echo "🚀 Installing ToolHub - The Ultimate Developer Control Center..."

# Configuration
OS="$(uname -s)"
REPO="giangittb112000/tool-hub"
INSTALL_DIR="$HOME/.toolhub"
mkdir -p "$INSTALL_DIR"

BINARY_NAME="toolhub"
if [[ "$OS" == *"MSYS"* || "$OS" == *"MINGW"* || "$OS" == *"CYGWIN"* || "$OS" == *"Windows"* ]]; then
    # Windows Case
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-win.exe"
    BINARY_PATH="$INSTALL_DIR/$BINARY_NAME.exe"
    OS_TYPE="Windows"
elif [ "$OS" = "Darwin" ]; then
    # macOS Case
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-macos"
    BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"
    OS_TYPE="macOS"
elif [ "$OS" = "Linux" ]; then
    # Linux Case
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-linux"
    BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"
    OS_TYPE="Linux"
else
    echo "❌ OS not supported: $OS"
    exit 1
fi

echo "📥 Downloading ToolHub binary for $OS_TYPE..."
curl -L "$DOWNLOAD_URL" -o "$BINARY_PATH"
chmod +x "$BINARY_PATH"

# Setup PATH & Alias
case "$OS_TYPE" in
    macOS) CONFIG_FILES=("$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile") ;;
    Linux) CONFIG_FILES=("$HOME/.bashrc" "$HOME/.profile") ;;
    Windows) CONFIG_FILES=("$HOME/.bash_profile" "$HOME/.bashrc" "$HOME/.zshrc") ;;
esac

echo "🔧 Configuring shell path & alias..."
for CONFIG in "${CONFIG_FILES[@]}"; do
    if [ -f "$CONFIG" ]; then
        # Cập nhật PATH nếu chưa có
        if ! grep -q "$INSTALL_DIR" "$CONFIG"; then
            echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$CONFIG"
            echo "✅ Added PATH to $CONFIG"
        fi
        
        # Cập nhật Alias nếu chưa có
        if ! grep -q "alias toolhub=" "$CONFIG"; then
            echo "alias toolhub=\"$BINARY_PATH\"" >> "$CONFIG"
            echo "✅ Added alias to $CONFIG"
        fi
    fi
done

if [ "$OS_TYPE" = "macOS" ]; then
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

if [ "$OS_TYPE" = "macOS" ]; then
    echo "🍎 macOS Detected"
    ACTIVE_CMD="source $([ -f "$HOME/.zshrc" ] && echo "~/.zshrc" || echo "~/.bashrc")"
    echo "👉 COPY & PASTE this to start using ToolHub now:"
    echo "   $ACTIVE_CMD && toolhub --help"
elif [ "$OS_TYPE" = "Linux" ]; then
    echo "🐧 Linux Detected"
    echo "👉 COPY & PASTE this to start using ToolHub now:"
    echo "   source ~/.bashrc && toolhub --help"
elif [ "$OS_TYPE" = "Windows" ]; then
    echo "🪟 Windows (Git Bash/Mingw) Detected"
    echo "👉 COPY & PASTE this to start using ToolHub now:"
    echo "   source ~/.bash_profile && toolhub --help"
    echo ""
    echo "⚠️ Note: Windows background service is not yet supported via script."
    echo "   For PowerShell users, add $INSTALL_DIR to your PATH manually."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
