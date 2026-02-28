# 📘 ToolHub Technical Specifications

Tài liệu này tổng hợp các đặc tả kỹ thuật chi tiết của dự án ToolHub, bao gồm kiến trúc hệ thống, đặc tả modules, quy tắc thiết kế UI và tiêu chuẩn phát triển.

---

## 🏗 1. Kiến trúc hệ thống (System Architecture)

ToolHub hoạt động theo mô hình Micro-kernel (nhân siêu nhỏ) kết hợp với Plugin System. Cấu trúc này đảm bảo ứng dụng luôn nhẹ, ổn định và dễ dàng mở rộng.

### Triết lý thiết kế (Design Philosophy)

- **Core Independence**: Lõi (Kernel) không chứa bất kỳ logic nghiệp vụ nào (như logic web, proxy, v.v.). Nhiệm vụ duy nhất của nó là cung cấp tài nguyên, nạp module và quản lý tiến trình.
- **Everything is a Module**: Mọi tính năng cốt lõi hoặc mở rộng đều hoạt động dưới dạng Module độc lập (Decoupled).
- **Fail-safe & Fault Isolation**: Một module bị lỗi (crash/exception) sẽ bị cô lập, không được phép làm sập tiến trình chính.

### Các thành phần của Kernel

1. **Module Registry**: Cơ sở dữ liệu in-memory lưu trữ và quản lý vòng đời của các Module (Load, Start, Stop, Unload).
2. **Event Bus**: Hệ thống thông điệp (Pub/Sub) nội bộ. Cho phép Core và các Module giao tiếp không đồng bộ.
3. **Config Store**: Kho lưu trữ cấu hình cục bộ (dựa trên SQLite hoặc JSON cục bộ), tự động đồng bộ hóa.
4. **Logger System**: Quản lý log tập trung, chuyển hướng stdout/stderr của từng module ra giao diện Terminal theo thời gian thực.

### Cơ chế Nạp Module Động (Dynamic Loading)

1. **Discovery Stage**: Khi app khởi chạy, Core đọc tệp manifest hoặc quét thư mục `src/modules`.
2. **Registration Stage**: Các Module tự gọi hàm đăng ký của Core.
3. **Initialization Stage**: Lõi gọi hàm `onInit` để cung cấp `CoreContext` cho Module.
4. **Execution Stage**: Lõi duyệt qua danh sách module có đánh dấu `autorun` và gọi `onStart()`.

---

## 🧩 2. Đặc tả Kỹ thuật Hệ thống Modules

### Hosts Manager Module (`module-hosts`)

- **Mục đích**: Thay đổi linh hoạt các bản ghi DNS cục bộ.
- **OS Abstraction**: Sử dụng `OSAdapter` để hỗ trợ cả macOS (`/etc/hosts`) và Windows.
- **Safety**: Sử dụng Boundary Markers `# --- TOOLHUB MANAGED BLOCK ---` để bảo vệ dữ liệu người dùng.

### Reverse Proxy Module (`module-proxy`)

- **Mục đích**: Chuyển hướng traffic từ port/domain về ứng dụng thực tế.
- **Hot-Reload**: Routing map nằm trong RAM, cho phép thay đổi rule mà không cần restart server.
- **Protocol**: Hỗ trợ HTTP/2, CORS, và WebSocket.

### Mock API Module (`module-mock`)

- **Mục đích**: Tạo endpoint giả lập JSON/Text cho Frontend.
- **Features**: Response Delay (giả lập mạng chậm), Chaos mode (giả lập lỗi 500/401), và Data Faking.

---

## 🎨 3. Hướng dẫn Thiết kế UI (React, Tailwind, Shadcn UI)

### Stack & UI Strategy

- **Framework**: `React + Vite` + `react-router-dom` + `TanStack Query`.
- **Theme**: Deep Dark Mode làm chủ đạo. Màu **Cam (Orange/Amber)** là màu Primary, kết hợp với các hiệu ứng Gradient hiện đại và Glow để tạo cảm giác "Premium".
- **Shadcn UI**: Tuân thủ nghiêm ngặt hệ thống component của Shadcn để đảm bảo tính nhất quán.

### Trải nghiệm người dùng (UX)

1. **Status-first**: Hiển thị trạng thái trực quan (🟢 Running, 🔴 Stopped, 🟡 Warning).
2. **Command Palette**: Tích hợp `Cmd+K` để tìm kiếm và thao tác nhanh.
3. **Real-time Terminal**: Tích hợp `xterm.js` hoặc khối UI giả lập để hiển thị log trực tiếp từ server.

---

## 📏 4. Tiêu chuẩn Phát triển (Development Rules)

### Cấu trúc Monorepo

Sử dụng **Bun Workspaces** kết hợp với **Turborepo**:

- `/apps/server`: Hono.js core & backend modules.
- `/apps/client`: Vite React & UI components.
- `/packages/shared`: Shared types, schemas (End-to-End Type Safety).

### Coding Convention

- **TypeScript**: Bắt buộc Strict Mode, nghiêm cấm `any`.
- **Linter/Formatter**: Sử dụng **Biome** (thay thế Eslint/Prettier) vì tốc độ vượt trội.
- **Git**: Tuân thủ **Conventional Commits**.

---

[⬅ Quay lại README](../README.md)
