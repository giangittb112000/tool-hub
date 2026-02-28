# System Module

Module này chịu trách nhiệm quản lý các tác vụ cốt lõi của hệ thống ToolHub, bao gồm quản lý phiên bản (version), kiểm tra cập nhật (check-update) và thực hiện quy trình nâng cấp ứng dụng.

## Tính năng

- **Version Tracking**: Cung cấp phiên bản hiện tại của dự án (đọc từ root `package.json`).
- **Update Checking**: Tự động so sánh phiên bản hiện tại với phiên bản mới nhất trên GitHub.
- **Auto Update**: Kích hoạt script Bash để tự động tải và cài đặt bản binary mới nhất.

## API Endpoints

- `GET /api/system/version`: Trả về số phiên bản hiện tại và thông tin repo.
- `GET /api/system/check-update`: Đối chiếu phiên bản với GitHub và trả về lệnh update nếu cần.
- `POST /api/system/update`: Kích hoạt tiến trình update ngay lập tức (Exit app để script cài đặt ghi đè file).

## Tích hợp

Module này được đăng ký tự động thông qua `registry` trong file khởi tạo server chính.
