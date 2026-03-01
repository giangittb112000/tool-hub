# Module Backend: JSON Formatter (Stub)

## 1. Mục tiêu (Objective)

Đây là module **stub (rỗng)** được tạo để đồng bộ kiến trúc với Frontend module `json-formatter`. Toàn bộ logic format/validate JSON được xử lý hoàn toàn trên Client (trình duyệt) mà không cần gọi API backend.

## 2. Tính năng (Features)

- Module hiện tại **không có API endpoint** nào.
- Được đăng ký vào hệ thống module registry để đảm bảo tính nhất quán kiến trúc.
- Có thể mở rộng trong tương lai nếu cần các tính năng server-side (ví dụ: lưu JSON snippets, chia sẻ giữa các thiết bị).

## 3. Thiết kế API (API Design)

> Hiện tại không có API. Dự phòng cho tương lai:

| Endpoint                   | Method | Mô tả                         | Trạng thái   |
| -------------------------- | ------ | ----------------------------- | ------------ |
| `/api/json-formatter/save` | POST   | Lưu 1 đoạn JSON snippet       | 🔮 Tương lai |
| `/api/json-formatter/list` | GET    | Lấy danh sách snippets đã lưu | 🔮 Tương lai |

## 4. Kỹ thuật triển khai (Implementation Details)

- File `module.ts` chỉ implement interface `ToolHubModule` với các hàm lifecycle trống (`onInit`, `onStart`, `onStop`).
- Không đăng ký route API nào.

## 5. Quy tắc (Rules)

- Giữ module tối giản, không thêm logic không cần thiết.
- Khi cần mở rộng, phải cập nhật README này trước khi code.

---

[⬅ Quay lại README (Root)](../../../../../README.md) | [📘 Frontend Module](../../../client/src/pages/modules/json-formatter/README.md)
