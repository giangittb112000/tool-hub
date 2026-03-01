# Frontend Modules Dữ liệu (Frontend Module Directory)

Thư mục này là nơi chứa và tổ chức **các trang và linh kiện của từng chức năng cốt lõi (Module)** của bản Front-End ToolHub. Đây là phần giao diện được kết nối trực tiếp với các API từ thư mục `server/src/modules` của backend (theo đúng chiến lược chia nhỏ module).

## Quy chuẩn xây dựng cấu trúc (Architecture Guidelines)

Khi xây dựng một module mới trên Frontend, bạn cần tuân theo các quy định dưới đây:

### 1. **Cấu Trúc Thư Mục Tiêu Chuẩn (Folder Structure)**

Mỗi module mới nên có một thư mục riêng biệt bên trong thư mục `modules`.

`src/pages/modules/ten-module/`

- `index.tsx`: Chứa component gốc để gắn vào hệ thống Router chính (`App.tsx` hoặc `router.tsx`).
- `README.md`: Mô tả rõ ràng về mục tiêu, tính năng, kiến trúc của frontend module đó.

_Optional_: Nếu module quá phức tạp, có thể chia ra thành:

- `components/`: Thư mục chứa các UI component nhỏ dùng riêng cho module.
- `hooks/`: Custom hook dành để fetch API hoặc thao tác state phức tạp dùng riêng cho module này.
- `types.ts`: TypeScript interface liên quan đến module này (ví dụ response types).

### 2. **Sự Kết Nối Giữa Các Tầng (Inter-connection Strategy)**

Thư mục Frontend module chia sẻ ý tưởng với Backend module: Mỗi một Module ở Server sẽ thường được gắn kết logic tương ứng với một Module Page ở Client.

Tuy nhiên, `src/components/` có vai trò khác với thư mục này. `src/components` được dùng làm nơi chứa **Shared UI Assets** (nút bấm, toast, modal) được dùng trên nhiều trang/module khác nhau, trong khi thư viện/component trong thư mục `modules` là những tệp **Specific (đặc thù)** phụ vụ riêng cho module đó.

### 3. **Quy Trình Tạo Một Frontend Module Mới**

1. Tạo một thư mục `module-name` bên trong `src/pages/modules/`.
2. Tạo file `index.tsx` định nghĩa UI.
3. Tạo file `README.md` với template tương tự `system-monitor`.
4. Mở file thư mục Root `src/App.tsx` và thêm `<Route>` cho trang của bạn. Đảm bảo cấu hình đường dẫn (path) như `/modules/module-name`.
5. Tạo thẻ điều hướng ở Dashboard page nếu cần (`src/pages/Dashboard.tsx`).

---

[⬅ Về lại gốc dự án](../../../../../README.md)
