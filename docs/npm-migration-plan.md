# 📦 Kế hoạch chuyển đổi cài đặt ToolHub sang NPM

> **Mục tiêu**: Xoá bỏ cơ chế `curl | bash` rủi ro, chuyển sang cho người dùng cài đặt bằng `npm install -g toolhub-cli`.
> Đảm bảo mọi chức năng hiện tại: `run dev`, `toolhub --help`, `start`, `stop`, `status`, `update`, release flow đều vẫn hoạt động.

---

## 📊 So sánh Cũ vs Mới

| Hạng mục           | ❌ Cũ (curl + bash)                      | ✅ Mới (npm)                      |
| ------------------ | ---------------------------------------- | --------------------------------- |
| **Cài đặt**        | `curl -fsSL ... \| bash`                 | `npm install -g toolhub-cli`      |
| **Tạo alias**      | Sửa `.zshrc`, `.bashrc`                  | NPM tự tạo symlink vào global bin |
| **Gỡ cài**         | Xoá thủ công `~/.toolhub` + dọn `.zshrc` | `npm uninstall -g toolhub-cli`    |
| **Update**         | `toolhub update` gọi lại curl script     | `npm update -g toolhub-cli`       |
| **Cross-platform** | Phải viết shell từng OS                  | NPM lo hết (Mac/Linux/Win)        |
| **Dev workflow**   | Không thay đổi                           | Không thay đổi (`bun run dev`)    |

---

## 🏗️ Kiến trúc mới

```
/toolhub (monorepo root)
├── /apps
│   ├── /server              # Backend — KHÔNG ĐỔI
│   └── /client              # Frontend — KHÔNG ĐỔI
├── /packages
│   ├── /shared              # Types — KHÔNG ĐỔI
│   └── /cli                 # 🆕 NPM Package (thay thế install.sh)
│       ├── package.json     # name: "toolhub-cli", bin: { toolhub: "./bin/run.js" }
│       ├── bin/
│       │   └── run.js       # Proxy runner: nhận args → spawn binary
│       ├── scripts/
│       │   └── postinstall.js  # Tải binary + frontend từ GitHub Releases
│       └── README.md        # NPM page documentation
├── /scripts
│   ├── release.sh           # ✏️ SỬA: thêm bước build cli package
│   ├── publish.sh           # ✏️ SỬA: thêm bước npm publish
│   ├── bump-version.ts      # ✏️ SỬA: thêm cli/package.json vào danh sách bump
│   └── install.sh           # 🗑️ XOÁ (thay bằng npm)
├── /docs
│   └── npm-migration-plan.md  # File này
├── README.md                # ✏️ SỬA: cập nhật hướng dẫn cài đặt
└── package.json
```

---

## 📋 Các bước triển khai

### Phase 1: Tạo package `@packages/cli`

#### 1.1. Khởi tạo thư mục và `package.json`

Tạo `packages/cli/package.json`:

```json
{
  "name": "toolhub-cli",
  "version": "1.0.10",
  "description": "ToolHub - The Ultimate Developer Control Center",
  "bin": {
    "toolhub": "./bin/run.js"
  },
  "scripts": {
    "postinstall": "node scripts/postinstall.js"
  },
  "os": ["darwin", "linux", "win32"],
  "files": ["bin/", "scripts/", "README.md"],
  "keywords": [
    "toolhub",
    "developer-tools",
    "system-monitor",
    "json-formatter"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/giangittb112000/tool-hub"
  }
}
```

**Giải thích:**

- `"bin"` → NPM sẽ tự tạo symlink `toolhub` → `run.js` trong global bin. Đây là điểm thay thế cho việc sửa `.zshrc`.
- `"files"` → Chỉ publish 3 thứ này lên NPM, giữ gói nhẹ nhất.
- `"postinstall"` → Ngay sau `npm install`, NPM tự chạy script tải binary.

#### 1.2. Viết `bin/run.js` (Proxy Runner)

```js
#!/usr/bin/env node

// Proxy Runner: chuyển tiếp lệnh CLI vào binary ToolHub
const { spawnSync } = require("child_process");
const { join } = require("path");
const { existsSync } = require("fs");

const isWin = process.platform === "win32";
const binaryName = isWin ? "toolhub.exe" : "toolhub";
const binaryPath = join(__dirname, "..", "vendor", binaryName);

if (!existsSync(binaryPath)) {
  console.error("❌ ToolHub binary not found. Run: npm rebuild toolhub-cli");
  process.exit(1);
}

// Truyền thẳng toàn bộ arguments: toolhub start → spawn(binary, ["start"])
const result = spawnSync(binaryPath, process.argv.slice(2), {
  stdio: "inherit",
  env: { ...process.env, RUN_AS_SERVICE: process.env.RUN_AS_SERVICE || "" },
  cwd: join(__dirname, ".."),
});

process.exit(result.status ?? 1);
```

**Giải thích:**

- Khi user gõ `toolhub start` → NPM gọi `run.js` với args `["start"]`.
- `run.js` tìm file binary trong `vendor/` và spawn nó với đúng args đó.
- `stdio: "inherit"` → output hiện thẳng trên Terminal, mọi CLI command (`--help`, `start`, `stop`, `status`, `-v`) đều hoạt tạng bình thường.

#### 1.3. Viết `scripts/postinstall.js` (Tải Binary)

```js
#!/usr/bin/env node

// Postinstall: tự động tải binary + frontend tương ứng với OS của user
const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const VERSION = require("../package.json").version;
const REPO = "giangittb112000/tool-hub";
const VENDOR_DIR = path.join(__dirname, "..", "vendor");

// Xác định OS
const PLATFORM_MAP = {
  darwin: { archive: `toolhub-macos.tar.gz`, binary: "toolhub" },
  linux: { archive: `toolhub-linux.tar.gz`, binary: "toolhub" },
  win32: { archive: `toolhub-win.zip`, binary: "toolhub.exe" },
};

const platform = PLATFORM_MAP[os.platform()];
if (!platform) {
  console.error(`❌ Unsupported platform: ${os.platform()}`);
  process.exit(1);
}

const DOWNLOAD_URL = `https://github.com/${REPO}/releases/download/v${VERSION}/${platform.archive}`;

// Tạo thư mục vendor
fs.mkdirSync(VENDOR_DIR, { recursive: true });

console.log(`📥 Downloading ToolHub v${VERSION} for ${os.platform()}...`);
console.log(`   URL: ${DOWNLOAD_URL}`);

// Download + extract
const archivePath = path.join(VENDOR_DIR, platform.archive);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https
        .get(url, (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            return follow(res.headers.location);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        })
        .on("error", reject);
    };
    follow(url);
  });
}

async function main() {
  try {
    await download(DOWNLOAD_URL, archivePath);

    // Extract
    console.log("📦 Extracting...");
    if (os.platform() === "win32") {
      // Windows: sử dụng PowerShell built-in
      execSync(
        `powershell -c "Expand-Archive -Force '${archivePath}' '${VENDOR_DIR}'"`,
        { stdio: "inherit" },
      );
    } else {
      execSync(`tar -xzf "${archivePath}" -C "${VENDOR_DIR}"`, {
        stdio: "inherit",
      });
    }

    // Cleanup archive
    fs.unlinkSync(archivePath);

    // Set executable permission
    const binaryPath = path.join(VENDOR_DIR, platform.binary);
    if (os.platform() !== "win32") {
      fs.chmodSync(binaryPath, 0o755);
    }

    // Verify
    if (!fs.existsSync(binaryPath)) {
      console.error("❌ Binary not found after extraction!");
      process.exit(1);
    }

    console.log(`✅ ToolHub v${VERSION} installed successfully!`);
    console.log(`   Binary: ${binaryPath}`);
  } catch (err) {
    console.error("❌ Installation failed:", err.message);
    console.error("   You may need to install manually from GitHub Releases.");
    // Không exit(1) ở đây để npm install không bị fail hoàn toàn
  }
}

main();
```

**Giải thích:**

- Chạy ngay sau `npm install`. Theo dõi redirect GitHub → tải archive đúng platform.
- Giải nén vào `vendor/` (nằm trong thư mục npm package, sạch sẽ).
- Khi `npm uninstall -g`, NPM tự xoá toàn bộ thư mục → không để lại rác.

---

### Phase 2: Sửa đổi Scripts hiện có

#### 2.1. `scripts/bump-version.ts` — Thêm `cli/package.json`

```diff
 const packagePaths = [
   join(rootDir, "package.json"),
   join(rootDir, "apps/server/package.json"),
   join(rootDir, "apps/client/package.json"),
   join(rootDir, "packages/shared/package.json"),
+  join(rootDir, "packages/cli/package.json"),
 ];
```

#### 2.2. `scripts/publish.sh` — Thêm bước `npm publish`

Sau bước push Git tag, thêm:

```bash
# 6. Publish NPM Package
echo "📦 Publishing to NPM..."
cd packages/cli
npm publish --access public
cd ../..
echo "✅ Published toolhub-cli@$NEW_VERSION to NPM!"
```

**Lưu trình publish mới:**

1. Bump version (tất cả package.json kể cả cli)
2. Build binary + frontend (release.sh — giữ nguyên)
3. Git commit + push + tag
4. **Upload assets lên GitHub Releases** (thủ công như hiện tại)
5. **npm publish** (chỉ cần chạy sau khi GitHub Release đã upload xong)

> ⚠️ **Quan trọng:** `npm publish` PHẢI chạy SAU khi upload files lên GitHub Releases. Vì `postinstall.js` sẽ tải file từ GitHub Release URL.

#### 2.3. `scripts/release.sh` — KHÔNG ĐỔI

Script này vẫn build binary + frontend packages ra `dist/`. Không cần thay đổi gì.

#### 2.4. `scripts/install.sh` — XOÁ

File này không còn cần thiết. Toàn bộ logic đã được chuyển vào `postinstall.js`.

---

### Phase 3: Cập nhật Server Code

#### 3.1. `apps/server/src/index.ts` — Cập nhật `findPublicDir()`

Thêm đường dẫn tìm công khai thư mục cho trường hợp chạy từ NPM global install:

```diff
 const findPublicDir = (): string => {
   const candidates = [
     join(dirname(process.execPath), "public"),
     join(process.cwd(), "public"),
     join(process.env.HOME || "~", ".toolhub", "public"),
+    // NPM global: vendor/public khi chạy qua proxy runner
+    join(dirname(process.execPath), "../vendor/public"),
     join(import.meta.dir, "../../client/dist"),
   ];
```

#### 3.2. CLI `update` command — Thay `curl` bằng hướng dẫn `npm update`

```diff
   update: async () => {
-    console.log("🚀 Updating ToolHub...");
-    try {
-      const { stdout } = await execAsync(
-        `curl -fsSL "https://..." | bash`,
-      );
-      console.log(stdout);
-    } catch (err) {
-      console.error("❌ Update failed:", err);
-    }
+    console.log("🚀 To update ToolHub, run:");
+    console.log("   npm update -g toolhub-cli");
   },
```

---

### Phase 4: Cập nhật Documentation

#### 4.1. `README.md` — Toàn bộ phần Installation

**Thay thế section 3 như sau:**

````markdown
## 🚢 3. Cài đặt & Sử dụng (Installation)

### Yêu cầu

- [Node.js](https://nodejs.org) >= 18

### Cài đặt

\```bash
npm install -g toolhub-cli
\```

### Gỡ cài đặt

\```bash
npm uninstall -g toolhub-cli
\```

### Cập nhật

\```bash
npm update -g toolhub-cli
\```
````

**Thay thế section CLI:**

```markdown
## ⌨️ 4. Lệnh Command Line (CLI)

Sau khi cài đặt, lệnh `toolhub` có sẵn ngay trên Terminal:

- `toolhub --help` — Hiển thị danh sách lệnh
- `toolhub start` — Khởi chạy dịch vụ chạy ngầm
- `toolhub stop` — Dừng dịch vụ
- `toolhub status` — Kiểm tra trạng thái
- `toolhub update` — Hướng dẫn cập nhật
- `toolhub -v` — Kiểm tra phiên bản
```

**Thay thế section Project Structure:**

````markdown
## 🏗️ Cấu trúc Monorepo

\```plaintext
/toolhub
├── /apps
│ ├── /server # Backend Core (Hono) & Modules
│ └── /client # Frontend UI (React + Vite)
├── /packages
│ ├── /shared # Types & Utils dùng chung
│ └── /cli # NPM Distribution Package
├── /scripts # Build & Release scripts
├── /docs # Tài liệu kỹ thuật
└── package.json
\```
````

**Thay thế section Developer Guide:**

```markdown
## 🛠️ Dành cho nhà phát triển

1. Clone repo → `bun install`
2. Dev mode: `bun run dev` (server port 3001, client port 5173)
3. Build release: `bash scripts/release.sh`
4. Publish: `bash scripts/publish.sh` → Upload assets lên GitHub → `cd packages/cli && npm publish`
```

---

### Phase 5: Dọn dẹp Code cũ

| Hành động         | File/Thư mục                                               |
| ----------------- | ---------------------------------------------------------- |
| 🗑️ XOÁ            | `scripts/install.sh`                                       |
| 🗑️ XOÁ tham chiếu | Xoá URL curl trong README.md                               |
| 🗑️ XOÁ tham chiếu | Xoá dòng gọi `install.sh` trong CLI `update` command       |
| ✏️ SỬA            | `apps/server/src/index.ts` → cập nhật `update` CLI command |
| ✏️ SỬA            | `scripts/bump-version.ts` → thêm cli package path          |
| ✏️ SỬA            | `scripts/publish.sh` → thêm `npm publish`                  |
| ✏️ SỬA            | `README.md` → đổi toàn bộ Installation                     |

---

## ✅ Checklist kiểm tra sau triển khai

| #   | Test Case                                     | Expected                                                 |
| --- | --------------------------------------------- | -------------------------------------------------------- |
| 1   | `bun run dev`                                 | Server 3001 + Client 5173 chạy bình thường               |
| 2   | `bun run build` (release.sh)                  | Build ra `dist/` với 3 platform packages                 |
| 3   | `npm pack` trong `packages/cli/`              | Tạo file `.tgz` không chứa binary                        |
| 4   | `npm install -g ./packages/cli/` (test local) | postinstall chạy, tải binary, `toolhub --help` hoạt động |
| 5   | `toolhub --help`                              | Hiển thị danh sách lệnh                                  |
| 6   | `toolhub -v`                                  | Hiển thị version                                         |
| 7   | `toolhub start`                               | Khởi chạy background service (macOS)                     |
| 8   | `toolhub stop`                                | Dừng service                                             |
| 9   | `toolhub status`                              | Hiển thị Running/Stopped                                 |
| 10  | `toolhub update`                              | Hiển thị hướng dẫn `npm update -g`                       |
| 11  | `npm uninstall -g toolhub-cli`                | Xoá sạch, lệnh `toolhub` biến mất                        |

---

## ⚠️ Lưu ý quan trọng

1. **Phải có tài khoản NPM** — Đăng ký tại [npmjs.com](https://npmjs.com) và chạy `npm login` trước khi publish.
2. **Tên package phải unique** — Kiểm tra `toolhub-cli` chưa ai chiếm trên NPM trước.
3. **Thứ tự publish** — GitHub Release (upload assets) → rồi mới `npm publish`. Ngược lại thì `postinstall.js` sẽ tải 404.
4. **Dev workflow không bị ảnh hưởng** — `bun run dev` vẫn chạy trực tiếp từ source, không liên quan gì đến NPM package.
