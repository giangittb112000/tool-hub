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

Chạy lệnh duy nhất sau trong Terminal để tự động tải và cài đặt ToolHub như một dịch vụ chạy ngầm (**Background Service**) mà không cần clone code:

```bash
curl -fsSL https://raw.githubusercontent.com/giangittb112000/tool-hub/main/scripts/install.sh | bash
```

**Lưu ý**: Công cụ hiện tại hỗ trợ tốt nhất trên macOS. Script sẽ tự động:

1. Tải bản binary mới nhất về `~/.toolhub/toolhub`.
2. Thêm `toolhub` vào **PATH** để bạn có thể gõ lệnh trực tiếp.
3. Đăng ký ToolHub vào **LaunchAgent** để tự khởi động cùng hệ điều hành.

## ⌨️ 4. Lệnh Command Line (CLI)

Sau khi cài đặt, bạn có thể sử dụng lệnh `toolhub` trực tiếp từ Terminal:

- `toolhub --help`: Hiển thị danh sách tất cả các lệnh.
- `toolhub start`: Khởi chạy dịch vụ chạy ngầm (**Background Service**).
- `toolhub stop`: Dừng dịch vụ chạy ngầm.
- `toolhub status`: Kiểm tra xem ToolHub đang chạy hay đang dừng.
- `toolhub update`: Tự động kiểm tra và tải bản cập nhật mới nhất.
- `toolhub -v`: Kiểm tra phiên bản hiện tại.

---

## 📂 5. Tài liệu chi tiết (Detailed Documentation)

Để tìm hiểu sâu hơn về kiến trúc, cách xây dựng module hoặc tiêu chuẩn thiết kế, vui lòng tham khảo:

- **[Quy trình Phát hành (Release Guide)](./TH-Release-Guide.md)**: Hướng dẫn quản lý version và push bản build lên GitHub.
- **[Đặc tả Kỹ thuật (Technical Specs)](./TH-Technical-Specs.md)**: Chi tiết về kiến trúc Micro-kernel, Module System, UI Design và Development Rules.

---

## 🏗️ 5. Cấu trúc Monorepo (Project Structure)

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

---

## 🛠️ 6. Dành cho nhà phát triển (Developer Guide)

Nếu bạn muốn đóng góp hoặc tự build bản phát hành:

1. **Build bản phát hành**: Chạy `bash scripts/release.sh` để tạo file binary trong thư mục `dist/`.
2. **Phát hành**: Đẩy file trong `dist/toolhub-macos` lên phần **Releases** trên GitHub của bạn với tên asset chính xác là `toolhub-macos`.
