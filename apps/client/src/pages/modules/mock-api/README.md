# Mock API Dashboard - Frontend Documentation

Trang quản trị Mock API cho phép người dùng cấu hình các endpoint giả lập một cách trực quan và dễ dàng.

## 🎨 Giao diện người dùng (User Interface)

Trang được thiết kế với các thành phần chính sau:

### 1. Header & Actions

- **Stats**: Hiển thị tổng số endpoint đang hoạt động.
- **New Endpoint**: Nút mở form tạo mới nhanh chóng.
- **Clear All**: Xóa toàn bộ danh sách endpoint trong RAM.

### 2. Form Cấu hình (Create/Edit)

Cung cấp đầy đủ các tùy chọn để giả lập một API thật:

- **HTTP Method**: Chọn giữa `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **Mock Path**: Nhập đường dẫn API (Ví dụ: `/users`). Hệ thống tự động tiền tố `/mock/`.
- **Status Code**: Chọn mã phản hồi (200, 404, 500, ...).
- **Delay (ms)**: Giả lập độ trễ mạng (tối đa 30 giây).
- **Description**: Note ngắn gọn cho mục đích sử dụng endpoint.
- **JSON Editor**: Trình soạn thảo có tích hợp **Real-time JSON Validation**. Bạn sẽ thấy chữ `✓ Valid` màu xanh khi JSON đúng định dạng.

### 3. Danh sách Endpoint (List View)

Mỗi item trong danh sách hiển thị:

- **Thông tin cơ bản**: Method, Full Path, Status Code, Delay.
- **Analytics**: Hiển thị số lượt gọi (Hits) và thời gian tạo.
- **Preview Response**: Click để xem nhanh nội dung JSON mà API sẽ trả về.
- **Actions**:
  - `Copy URL`: Lấy link tuyệt đối đến server (Ví dụ: `http://localhost:3001/mock/users`).
  - `Edit`: Đưa thông tin vào form để chỉnh sửa.
  - `Delete`: Xóa vĩnh viễn endpoint đó khỏi bộ nhớ RAM.

---

## 🛠️ Chi tiết kỹ thuật (Technical Details)

### 1. State Management

Sử dụng React Hooks (`useState`) để quản lý:

- `endpoints`: Danh sách lấy từ backend.
- `method`, `path`, `responseBody`, ...: Các state của form.
- `jsonValid`: Cờ kiểm tra tính hợp lệ của nội dung JSON.
- `copiedId`: Hiệu ứng phản hồi khi người dùng bấm Copy URL.

### 2. Kết nối API

Mọi request đều trỏ về `SERVER_URL` (mặc định port 3001) được định nghĩa trong file constants của dự án.

- **Fetch**: Lấy danh sách tại `GET /api/mock/endpoints`.
- **Create**: Gửi JSON payload tại `POST /api/mock/endpoints`.
- **Update**: Gửi JSON payload tại `PUT /api/mock/endpoints/:id`.
- **Delete**: Gọi `DELETE /api/mock/endpoints/:id`.

### 3. Validation & UX

- **JSON Linting**: Tự động kiểm tra cú pháp JSON ngay khi người dùng gõ phím.
- **Auto Formatting**: Nút `Format` hỗ trợ làm đẹp code JSON (Pretty print) trước khi lưu.
- **Relative Path Optimization**: Người dùng không cần quan tâm đến dấu `/` ở đầu hay cuối, hệ thống sẽ tự dọn dẹp (normalize) đường dẫn trước khi gửi lên Server.

---

## 🏗️ Hướng phát triển

- [ ] Tích hợp **JSON Schema Generator** (tự tạo schema từ object).
- [ ] Chế độ **Search & Filter** cho danh sách endpoint.
- [ ] Tính năng **Replay Request** (Cho phép test thử API ngay trên giao diện).

---

[⬅ Về lại thư mục Modules](../README.md)
