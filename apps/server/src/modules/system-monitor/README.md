# Module: System Monitor

## 1. Mục tiêu (Objective)

Cung cấp thông tin thời gian thực về tài nguyên hệ thống (CPU và RAM) để người dùng có thể theo dõi tình trạng máy tính thông qua ToolHub Dashboard.

## 2. Tính năng (Features)

- Lấy thông tin phần trăm sử dụng CPU.
- Lấy thông tin về tổng dung lượng RAM, dung lượng đang sử dụng và phần trăm sử dụng.
- Cung cấp REST API endpoint để frontend có thể fetch dữ liệu.

## 3. Thiết kế API (API Design)

- **Endpoint**: `GET /api/system/stats`
- **Response Format**:

```json
{
  "cpu": {
    "usage": number, // Phần trăm sử dụng (0-100)
    "model": string
  },
  "memory": {
    "total": number, // Đơn vị: Bytes
    "used": number,  // Đơn vị: Bytes
    "percentage": number // Phần trăm sử dụng
  },
  "timestamp": string
}
```

## 4. Kỹ thuật triển khai (Implementation Details)

- Sử dụng module `node:os` tích hợp sẵn trong Node.js/Bun để lấy thông số phần cứng.
- Tính toán CPU usage bằng cách đo đạc sự thay đổi của `cpus()` ticks trong một khoảng thời gian ngắn (vì `os.loadavg()` không phản ánh chính xác usage tức thời trên Windows/macOS theo cách mong muốn).

## 5. Quy tắc (Rules)

- Không sử dụng thư viện bên ngoài (Zero-Dependency).
- Đảm bảo hiệu năng, không gây overhead cho hệ thống khi lấy mẫu dữ liệu.

---

[⬅ Quay lại README (Root)](../../../../../README.md) | [📘 Đặc tả kỹ thuật (Technical Specs)](../../../../../docs/TH-Technical-Specs.md)
