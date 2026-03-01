#!/usr/bin/env node

/**
 * ToolHub CLI — Postinstall Script
 *
 * Runs automatically after `npm install -g toolhub-cli`.
 * Downloads the platform-specific binary + frontend from GitHub Releases
 * into the vendor/ directory.
 *
 * Uses only Node.js built-in modules (no external dependencies).
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const VERSION = require("../package.json").version;
const REPO = "giangittb112000/tool-hub";
const VENDOR_DIR = path.join(__dirname, "..", "vendor");

// Platform mapping
const PLATFORM_MAP = {
  darwin: { archive: "toolhub-macos.tar.gz", binary: "toolhub" },
  linux: { archive: "toolhub-linux.tar.gz", binary: "toolhub" },
  win32: { archive: "toolhub-win.zip", binary: "toolhub.exe" },
};

const platform = PLATFORM_MAP[os.platform()];
if (!platform) {
  console.error(`❌ Unsupported platform: ${os.platform()}`);
  console.error("   Supported: macOS (darwin), Linux, Windows");
  process.exit(1);
}

// Always download LATEST release — no need to republish npm package for each version
const DOWNLOAD_URL = `https://github.com/${REPO}/releases/latest/download/${platform.archive}`;

/**
 * Download a file, following HTTP redirects (GitHub uses 302).
 */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      const client = url.startsWith("https") ? https : http;
      client
        .get(
          url,
          { headers: { "User-Agent": "@giangnt112000/toolhub-cli" } },
          (res) => {
            // Follow redirects (301, 302, 307)
            if (
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              return follow(res.headers.location);
            }
            if (res.statusCode !== 200) {
              return reject(
                new Error(
                  `Download failed: HTTP ${res.statusCode} from ${url}`,
                ),
              );
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
            file.on("error", (err) => {
              fs.unlink(dest, () => {});
              reject(err);
            });
          },
        )
        .on("error", reject);
    };
    follow(url);
  });
}

async function main() {
  // Skip during CI or if TOOLHUB_SKIP_DOWNLOAD is set
  if (process.env.TOOLHUB_SKIP_DOWNLOAD) {
    console.log("⏭️  Skipping binary download (TOOLHUB_SKIP_DOWNLOAD is set)");
    return;
  }

  // Create vendor directory
  fs.mkdirSync(VENDOR_DIR, { recursive: true });

  const archivePath = path.join(VENDOR_DIR, platform.archive);
  const binaryPath = path.join(VENDOR_DIR, platform.binary);

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📥 Installing ToolHub v${VERSION} for ${os.platform()}...`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   Source: ${DOWNLOAD_URL}`);
  console.log("");

  try {
    // 1. Download
    await download(DOWNLOAD_URL, archivePath);

    // Validate file size (GitHub 404 pages are small HTML)
    const stats = fs.statSync(archivePath);
    if (stats.size < 100000) {
      throw new Error(
        `Downloaded file is too small (${stats.size} bytes). ` +
          `Release v${VERSION} may not exist on GitHub yet.`,
      );
    }

    // 2. Extract
    console.log("📦 Extracting...");
    if (os.platform() === "win32") {
      execSync(
        `powershell -Command "Expand-Archive -Force -Path '${archivePath}' -DestinationPath '${VENDOR_DIR}'"`,
        { stdio: "inherit" },
      );
    } else {
      execSync(`tar -xzf "${archivePath}" -C "${VENDOR_DIR}"`, {
        stdio: "inherit",
      });
    }

    // 3. Cleanup archive
    fs.unlinkSync(archivePath);

    // 4. Set executable permission (Unix only)
    if (os.platform() !== "win32" && fs.existsSync(binaryPath)) {
      fs.chmodSync(binaryPath, 0o755);
    }

    // 5. Verify
    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Binary not found at ${binaryPath} after extraction`);
    }

    // 6. Verify public/ directory exists (frontend assets)
    const publicDir = path.join(VENDOR_DIR, "public");
    const hasPublic = fs.existsSync(path.join(publicDir, "index.html"));

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 ToolHub installed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Binary:   ${binaryPath}`);
    console.log(`   Frontend: ${hasPublic ? "✅ Found" : "⚠️  Not found"}`);
    console.log("");
    console.log("   Run 'toolhub --help' to get started.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
  } catch (err) {
    console.error("");
    console.error("⚠️  ToolHub postinstall: Could not download binary.");
    console.error(`   Error: ${err.message}`);
    console.error("");
    console.error("   This is non-fatal. You can manually download from:");
    console.error(`   https://github.com/${REPO}/releases/tag/v${VERSION}`);
    console.error(`   Extract to: ${VENDOR_DIR}`);
    console.error("");
    // Don't exit(1) — npm install should not fail just because download failed
  }
}

main();
