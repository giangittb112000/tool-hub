# 🚀 ToolHub - The Ultimate Developer Control Center

ToolHub là một nền tảng quản lý quy trình phát triển phần mềm (Developer Workflow Monitor) chạy native trên macOS và Windows. Ứng dụng cung cấp một giao diện Web UI hiện đại để theo dõi và quản lý các công cụ, dịch vụ và cấu hình hệ thống một cách tập trung.

---

## 🎯 1. Về ToolHub (About)

ToolHub được xây dựng trên triết lý **Micro-kernel**. Nhân của ứng dụng cực kỳ mỏng và nhẹ, trong khi mọi tính năng đều được triển khai dưới dạng các **Modules** độc lập:

- **System Monitor**: Theo dõi tài nguyên hệ thống (CPU/RAM) theo thời gian thực.
- **Hosts Manager**: Quản lý file hosts thông minh.
- **Reverse Proxy**: Điều hướng traffic linh hoạt.
- **Mock API**: Giả lập API cho quá trình phát triển Frontend.

---

## 🏗️ 2. Công nghệ cốt lõi (Tech Stack)

| Thành phần   | Công nghệ                           |
| :----------- | :---------------------------------- |
| **Runtime**  | Bun (Fast TS/JS Runtime)            |
| **Backend**  | Hono.js (Lightweight Web Framework) |
| **Frontend** | React + Vite                        |
| **Styling**  | Tailwind CSS + Shadcn UI            |
| **Database** | SQLite                              |

---

## 🚢 3. Cài đặt & Sử dụng (Installation)

### Cài đặt nhanh (Quick Install)

Chạy lệnh sau trong Terminal để tự động tải và cài đặt bản build phù hợp cho hệ điều hành của bạn:

```bash
curl -fsSL https://get.toolhub.dev | sh
```

Giao diện quản lý sẽ khả dụng tại: `http://localhost:3001`

---

## 📂 4. Tài liệu chi tiết (Detailed Documentation)

Để tìm hiểu sâu hơn về kiến trúc, cách xây dựng module hoặc tiêu chuẩn thiết kế, vui lòng tham khảo:

- **[Đặc tả Kỹ thuật (Technical Specs)](./docs/TH-Technical-Specs.md)**: Chi tiết về kiến trúc Micro-kernel, Module System, UI Design và Development Rules.

---

## � 5. Cấu trúc Monorepo (Project Structure)

```plaintext
/toolhub
├── /apps
│   ├── /server             # Backend Core (Hono) & Modules
│   └── /client             # Frontend UI (React + Vite)
├── /packages
│   ├── /shared             # Types & Utils dùng chung
│   └── /config             # Cấu hình ESLint, Tailwind, Build
├── /docs                   # Tài liệu kỹ thuật
└── package.json
```
