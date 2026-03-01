# Module Frontend: System Monitor

## 1. Mục tiêu (Objective)

Cung cấp giao diện hiển thị thông tin thời gian thực về tài nguyên hệ thống (CPU và RAM) để người dùng có thể theo dõi tình trạng máy tính thông qua ToolHub Dashboard.

## 2. Tính năng (Features)

- **Hiển thị thông số tổng quan**: Hiển thị phần trăm sử dụng CPU hiện tại và dung lượng RAM đang sử dụng so với tổng số.
- **Biểu đồ thời gian thực (Real-time Charts)**: Vẽ biểu đồ biến động lịch sử sử dụng CPU và RAM trong thời gian thực.
- **Cập nhật tự động (Auto-refresh)**: Fetch dữ liệu từ backend mỗi giây để duy trì trạng thái mới nhất mà không cần tải lại trang.

## 3. Kiến trúc Component (Component Architecture)

- **`SystemMonitor` (Main Component)**:
  - Đóng vai trò là trang (page component) chính cho tính năng này.
  - Chịu trách nhiệm thực hiện HTTP request (`fetch`) đến backend `api/system/stats`.
  - Quản lý state dữ liệu, lưu lại lịch sử thay đổi để truyền xuống biểu đồ.
  - Sử dụng thư viện `recharts` để vẽ biểu đồ và `lucide-react` cho các icon hiển thị.

## 4. Giao tiếp Backend (Backend Communication)

- Fetch API mỗi giây: `GET /api/system/stats`
- **Dữ liệu mong đợi**:

```json
{
  "cpu": {
    "usage": number,
    "model": string
  },
  "memory": {
    "total": number,
    "used": number,
    "percentage": number
  },
  "timestamp": string
}
```

## 5. Quy tắc (Rules)

- **Hiệu năng Render**: Cần kiểm soát việc re-render do call API quá nhiều. Sử dụng state một cách hợp lý để tránh rò rỉ bộ nhớ khi lưu trữ lịch sử dữ liệu dùng cho biểu đồ.
- **Responsive**: Giao diện cần hiển thị tốt trên tất cả các loại màn hình (Desktop/Mobile), lưới phải tự động co dãn.

---

[⬅ Quay lại danh sách modules](../README.md)
