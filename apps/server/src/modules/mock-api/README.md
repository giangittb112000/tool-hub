# Mock API Module - Documentation

Module mang lại khả năng giả lập (mock) các API endpoint cực kỳ nhanh chóng cho Frontend Developer mà không cần phải chờ đợi Backend hoàn thiện.

## 🧠 Cơ chế hoạt động (How it works)

Module này hoạt động dựa trên mô hình **In-Memory Dynamic Routing**. Có hai thành phần chính:

### 1. Server-Side (Backend)

- **Lưu trữ dữ liệu (Memory Cache)**: Vì đây là một công cụ hỗ trợ phát triển máy local (Desktop App/CLI), chúng ta sử dụng một đối tượng **`Map`** trong JavaScript để lưu trữ danh sách các cấu hình API.
  - **Lưu ý**: Dữ liệu này nằm trên RAM của tiến trình Node.js/Bun. Khi bạn tắt ToolHub hoặc restart server, dữ liệu này sẽ bị xóa sạch.
  - _Tại sao không dùng Database?_: Để đảm bảo tính gọn nhẹ, tốc độ truy cập tức thì và không cần cấu hình cài đặt phức tạp cho mọi môi trường.
- **Management API**: Cung cấp các endpoint tại `/api/mock/endpoints` để Frontend có thể thực hiện các thao tác CRUD (Thêm, Sửa, Xóa) cấu hình mock.
- **Dynamic Handler**: Một router "bắt tất" (catch-all) tại `/mock/*`. Khi có bất kỳ request nào đến đường dẫn này, server sẽ:
  1. Chẻ nhỏ (parse) path và method từ request.
  2. Tra cứu trong `Map` xem có cấu hình nào khớp không.
  3. Nếu khớp: Áp dụng trì hoãn (delay nếu có), sau đó trả về body và status code đã cấu hình.
  4. Nếu không khớp: Trả về lỗi 404 kèm thông tin gợi ý.

### 2. Client-Side (Frontend)

- **UI Management**: Dashboard cho phép người dùng nhập thông tin trực quan thay vì phải dùng lệnh `curl` hay Postman.
- **Trình soạn thảo JSON**: Tích hợp kiểm tra cú pháp JSON thời gian thực để đảm bảo body trả về không bị lỗi.
- **Kết nối**: Gọi trực tiếp đến API của server (mặc định port 3001) để đồng bộ hóa danh sách mock API.

---

## 🏗️ Kiến trúc hệ thống (Architecture)

```mermaid
graph TD
    subgraph "Frontend (Port 5173/3001)"
        UI[Mock API Page]
        UI -->|CRUD Requests| API_MGMT
    end

    subgraph "Backend (Port 3001)"
        API_MGMT[/api/mock/endpoints] --> STORE[(In-Memory Map)]
        MOCK_ROUTER[/mock/*] -->|Tra cứu| STORE
        STORE -->|Trả về cấu hình| MOCK_ROUTER
    end

    EXTERNAL[Ứng dụng bên thứ 3] -->|Gọi API Test| MOCK_ROUTER
```

---

## 📂 Quản lý dữ liệu (Data Storage)

Hiện tại, module này **không sử dụng Database**.

- **Ưu điểm**:
  - Tốc độ cực nhanh (Zero Latency).
  - Không cần cài đặt (No dependencies).
  - An toàn (Dữ liệu không lưu trên đĩa cứng, tắt app là sạch).
- **Nhược điểm**:
  - Mất dữ liệu khi restart app.
  - _Hướng phát triển_: Nếu bạn muốn lưu trữ lâu dài, chúng ta có thể mở rộng bằng cách ghi file JSON xuống thư mục cấu hình của ToolHub tại `~/.toolhub/mock-data.json`.

---

## 🚀 API Reference

### Management Interface (Dành cho UI)

| Method   | Path                      | Mô tả                     |
| -------- | ------------------------- | ------------------------- |
| `GET`    | `/api/mock/endpoints`     | Lấy danh sách mock API    |
| `POST`   | `/api/mock/endpoints`     | Tạo cấu hình mock mới     |
| `PUT`    | `/api/mock/endpoints/:id` | Sửa cấu hình đã có        |
| `DELETE` | `/api/mock/endpoints/:id` | Xóa cấu hình              |
| `DELETE` | `/api/mock/endpoints`     | Xóa trắng toàn bộ dữ liệu |

### Mock Interface (Dành cho việc test)

Mọi request bắt đầu bằng `/mock/` sẽ được server xử lý.

- **URL Gốc**: `http://localhost:3001/mock`
- **Ví dụ**: Nếu bạn tạo path là `/users` với method `GET`.
- **Thực thi**: `GET http://localhost:3001/mock/users`

---

## 📝 Các tính năng nâng cao đã tích hợp

1. **Normalize Path**: Bạn nhập `users`, `/users/`, hay `USERS` thì server đều tự động chuyển về `/users` để tránh lỗi sai ký tự.
2. **Duplicate Detection**: Không cho phép tạo 2 API cùng Method + Path (Ví dụ: Không thể có 2 cái `GET /users`).
3. **Response Delay**: Giả lập mạng chậm từ 0ms đến 30.000ms để test trạng thái Loading của giao diện.
4. **Hit Counter**: Server đếm mỗi lần API được gọi thành công để bạn biết script của mình có đang chạy đúng hay không.

---

[⬅ Về lại Dashboard](../../../../../README.md)
