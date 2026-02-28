#!/usr/bin/env bash

# ToolHub Installation Script
# This script downloads ToolHub and configures it to run as a background service.

set -e

echo "🚀 Installing ToolHub - The Ultimate Developer Control Center..."

# Configuration
OS="$(uname -s)"
REPO="giangittb112000/tool-hub"
INSTALL_DIR="$HOME/.toolhub"

# Clean previous installation
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Detect OS and set download URL
if [[ "$OS" == *"MSYS"* || "$OS" == *"MINGW"* || "$OS" == *"CYGWIN"* || "$OS" == *"Windows"* ]]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-win.zip"
    BINARY_NAME="toolhub.exe"
    OS_TYPE="Windows"
elif [ "$OS" = "Darwin" ]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-macos.tar.gz"
    BINARY_NAME="toolhub"
    OS_TYPE="macOS"
elif [ "$OS" = "Linux" ]; then
    DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/toolhub-linux.tar.gz"
    BINARY_NAME="toolhub"
    OS_TYPE="Linux"
else
    echo "❌ OS not supported: $OS"
    exit 1
fi

BINARY_PATH="$INSTALL_DIR/$BINARY_NAME"

# Download
echo "📥 Downloading ToolHub package for $OS_TYPE..."
TEMP_FILE="$INSTALL_DIR/_download.tmp"
curl -L "$DOWNLOAD_URL" -o "$TEMP_FILE"

# Validate: check file is not a GitHub 404 page
FILE_SIZE=$(wc -c < "$TEMP_FILE" | tr -d ' ')
if [ "$FILE_SIZE" -lt 100000 ]; then
    echo "❌ Download failed! File is too small ($FILE_SIZE bytes)."
    echo "👉 Make sure the release assets are uploaded at: https://github.com/$REPO/releases"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Extract
echo "📦 Extracting ToolHub..."
if [ "$OS_TYPE" = "Windows" ]; then
    unzip -o "$TEMP_FILE" -d "$INSTALL_DIR"
else
    tar -xzf "$TEMP_FILE" -C "$INSTALL_DIR"
fi
rm -f "$TEMP_FILE"

# Verify binary exists after extraction
if [ ! -f "$BINARY_PATH" ]; then
    echo "❌ Extraction failed! Binary not found at $BINARY_PATH"
    echo "   Contents of $INSTALL_DIR:"
    ls -la "$INSTALL_DIR"
    exit 1
fi

chmod +x "$BINARY_PATH"
echo "✅ Binary installed at $BINARY_PATH ($(du -h "$BINARY_PATH" | cut -f1))"

# Setup PATH & Alias in shell config
echo "🔧 Configuring shell..."
case "$OS_TYPE" in
    macOS)   CONFIG_FILES=("$HOME/.zshrc" "$HOME/.bashrc") ;;
    Linux)   CONFIG_FILES=("$HOME/.bashrc" "$HOME/.profile") ;;
    Windows) CONFIG_FILES=("$HOME/.bash_profile" "$HOME/.bashrc") ;;
esac

MARKER="# --- ToolHub Configuration ---"
for CONFIG in "${CONFIG_FILES[@]}"; do
    # Create config file if it doesn't exist
    touch "$CONFIG"

    # Remove old ToolHub configuration block
    if grep -q "$MARKER" "$CONFIG" 2>/dev/null; then
        sed -i '' "/$MARKER/,/$MARKER/d" "$CONFIG" 2>/dev/null || sed -i "/$MARKER/,/$MARKER/d" "$CONFIG"
    fi

    # Add new configuration block
    {
        echo ""
        echo "$MARKER"
        echo "export PATH=\"\$PATH:\$HOME/.toolhub\""
        echo "alias toolhub=\"\$HOME/.toolhub/toolhub\""
        echo "$MARKER"
    } >> "$CONFIG"
    echo "  ✅ Updated $CONFIG"
done

# macOS LaunchAgent setup (background service)
if [ "$OS_TYPE" = "macOS" ]; then
    echo "🍎 Configuring Background Service for macOS..."
    PLIST_DIR="$HOME/Library/LaunchAgents"
    PLIST_FILE="$PLIST_DIR/dev.toolhub.daemon.plist"
    mkdir -p "$PLIST_DIR"

    # Unload old plist if exists
    launchctl unload "$PLIST_FILE" 2>/dev/null || true

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
    <key>WorkingDirectory</key>
    <string>$INSTALL_DIR</string>
    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <true/>
    <key>EnvironmentVariables</key>
    <dict>
        <key>RUN_AS_SERVICE</key>
        <string>true</string>
    </dict>
    <key>StandardOutPath</key>
    <string>$INSTALL_DIR/toolhub.log</string>
    <key>StandardErrorPath</key>
    <string>$INSTALL_DIR/toolhub.error.log</string>
</dict>
</plist>
EOF
    echo "  ✅ LaunchAgent configured"
fi

# Final Message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ToolHub Installation Successful!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$OS_TYPE" = "macOS" ]; then
    echo ""
    echo "👉 Run these commands to get started:"
    echo "   source ~/.zshrc"
    echo "   toolhub --help"
    echo "   toolhub start        # Start background service"
elif [ "$OS_TYPE" = "Linux" ]; then
    echo ""
    echo "👉 Run these commands to get started:"
    echo "   source ~/.bashrc"
    echo "   toolhub --help"
elif [ "$OS_TYPE" = "Windows" ]; then
    echo ""
    echo "👉 Run these commands to get started:"
    echo "   source ~/.bash_profile"
    echo "   toolhub --help"
    echo ""
    echo "⚠️  For PowerShell users, add $INSTALL_DIR to your PATH manually."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
