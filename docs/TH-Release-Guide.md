# 🚀 Hướng dẫn Phát hành ToolHub (Release Guide)

Tài liệu này cung cấp quy trình tối giản để bạn phát hành phiên bản mới của ToolHub lên GitHub.

---

## 🛠 1. Lệnh Phát hành Duy nhất (One-Command Publish)

Thay vì phải chạy nhiều bước thủ công, bạn chỉ cần sử dụng lệnh sau trong Terminal tại thư mục gốc của dự án:

```bash
# Phát hành bản sửa lỗi (VD: 1.0.0 -> 1.0.1)
bun run pub patch

# Phát hành tính năng mới (VD: 1.0.0 -> 1.1.0)
bun run pub minor

# Phát hành thay đổi lớn (VD: 1.0.0 -> 2.0.0)
bun run pub major
```

### Lệnh này sẽ tự động thực hiện:

1.  **Sửa Version**: Tăng số phiên bản trong toàn bộ project.
2.  **Build Binary**: Đóng gói Frontend và tạo file thực thi `dist/toolhub-macos`.
3.  **Git Push**: Đẩy toàn bộ mã nguồn mới nhất lên GitHub (main branch).
4.  **Tạo Tag**: Tự động tạo nhãn phiên bản (VD: `v1.0.1`) và đẩy lên GitHub.

---

## 🏗️ 2. Bước cuối cùng trên GitHub

Sau khi lệnh trên chạy xong, Terminal sẽ hiển thị một **đường link**. Hãy click vào link đó để hoàn tất quá trình:

1.  **Truy cập link**: Trình duyệt sẽ mở trang "New Release" gắn với Tag bạn vừa tạo.
2.  **Upload File**: Kéo và thả tệp **`dist/toolhub-macos`** vào vùng đính kèm (Attach binaries).
3.  **Publish**: Nhấn nút **"Publish release"**.

> [!IMPORTANT]
> Việc upload file binary lên phần Release là BẮT BUỘC để cơ chế tự động cập nhật (Auto-update) của người dùng có thể tải về bản mới nhất.

---

## 🔄 3. Cách người dùng nhận bản cập nhật

Khi bạn đã nhấn "Publish release", ToolHub sẽ tự động thông báo cho người dùng:

- **Thông báo trên Web**: Một banner "New Update" sẽ xuất hiện trên Dashboard.
- **Cập nhật nhanh**: Người dùng nhấn "Copy" câu lệnh trên Web hoặc gõ `toolhub update` trong Terminal.
- **CLI**: Người dùng có thể kiểm tra trạng thái bằng `toolhub status` hoặc xem phiên bản bằng `toolhub -v`.

---

## 📝 4. Lưu ý cho nhà phát triển

- **Chỉ dành cho macOS**: Hiện tại script build binary (`release.sh`) được tối ưu cho kiến trúc macOS.
- **GitHub Assets**: Tên file binary khi upload lên GitHub phải giữ nguyên là `toolhub-macos`.
- **Cấu hình**: Mọi logic tự động hóa nằm trong `scripts/publish.sh` và `scripts/bump-version.ts`.
