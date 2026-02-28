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

# Validate Download
FILE_SIZE=$(wc -c < "$BINARY_PATH")
if [ "$FILE_SIZE" -lt 1000000 ]; then
    if grep -q "Not Found" "$BINARY_PATH" || grep -q "<html>" "$BINARY_PATH"; then
        echo "❌ Lỗi: Không tìm thấy file binary trên GitHub Release (vừa tải về tệp lỗi HTML)."
        echo "👉 Nguyên nhân: Bạn có thể chưa upload file build vào mục Release trên GitHub hoặc sai tên file."
        echo "👉 Giải quyết: Hãy kiểm tra tại https://github.com/$REPO/releases"
        rm -f "$BINARY_PATH"
        exit 1
    fi
fi

chmod +x "$BINARY_PATH"

# Setup PATH & Alias
case "$OS_TYPE" in
    macOS) CONFIG_FILES=("$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile") ;;
    Linux) CONFIG_FILES=("$HOME/.bashrc" "$HOME/.profile") ;;
    Windows) CONFIG_FILES=("$HOME/.bash_profile" "$HOME/.bashrc" "$HOME/.zshrc") ;;
esac

# Clean up old installation
rm -f "$BINARY_PATH" "$BINARY_PATH.exe"

echo "🔧 Configuring shell path & alias..."
MARKER="# --- ToolHub Configuration ---"
for CONFIG in "${CONFIG_FILES[@]}"; do
    if [ -f "$CONFIG" ]; then
        # Remove old configuration block if exists
        sed -i '' "/$MARKER/,/$MARKER/d" "$CONFIG" 2>/dev/null || sed -i "/$MARKER/,/$MARKER/d" "$CONFIG"
        
        # Add new configuration block
        echo "" >> "$CONFIG"
        echo "$MARKER" >> "$CONFIG"
        echo "export PATH=\"\$PATH:\$HOME/.toolhub\"" >> "$CONFIG"
        echo "alias toolhub=\"\$HOME/.toolhub/toolhub\"" >> "$CONFIG"
        echo "$MARKER" >> "$CONFIG"
        echo "✅ Updated $CONFIG"
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
