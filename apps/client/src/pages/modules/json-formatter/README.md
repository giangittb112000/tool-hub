# Module Frontend: JSON Formatter

## 1. Mục tiêu (Objective)

Cung cấp công cụ format (làm đẹp) chuỗi JSON ngay trên trình duyệt, giúp lập trình viên dễ dàng đọc và kiểm tra dữ liệu JSON. Hỗ trợ **nhiều tab** để so sánh hoặc xử lý nhiều chuỗi JSON cùng lúc.

## 2. Tính năng (Features)

### Core

- **Auto-format**: Tự động format JSON ngay khi paste vào input (không cần nhấn nút).
- **Collapsible Tree View**: Output hiển thị dưới dạng cây JSON có thể thu gọn/mở rộng từng tầng (sử dụng thư viện `react-json-view-lite`).
- **Multi-tab**: Tạo nhiều tab, mỗi tab là một vùng soạn thảo JSON độc lập.
- **Validation**: Phát hiện và thông báo lỗi cú pháp JSON.
- **Resizable Panels**: Người dùng có thể kéo để thay đổi kích thước giữa Input và Output (sử dụng `react-resizable-panels`).
- **Full-width Layout**: Chiếm toàn bộ chiều rộng màn hình, tối ưu không gian làm việc.

### UX Enhancements

- **Search in Tree**: Tính năng tìm kiếm chuỗi trong thẻ Output, cho phép đi đến từng kết quả với hiệu ứng highlight (vàng/cam).
- **Expand/Collapse Controls**: Nút thu gọn/mở rộng từng node, cũng như thu gọn/mở rộng toàn bộ cây.
- **Copy to Clipboard**: Nút copy nhanh kết quả đã format.
- **Minify**: Nút nén ngược lại chuỗi JSON đã format thành 1 dòng.
- **Clear**: Xóa nhanh nội dung hiện tại.
- **Indent Control**: Cho phép chọn số space indent (2 hoặc 4).

## 3. Thư viện sử dụng (Dependencies)

| Package                  | Mục đích                                       | Kích thước     |
| ------------------------ | ---------------------------------------------- | -------------- |
| `react-json-view-lite`   | Hiển thị JSON dạng cây với thu gọn/mở rộng     | ~5KB, zero-dep |
| `react-resizable-panels` | Kéo thả thay đổi kích thước panel Input/Output | ~8KB           |

## 4. Kiến trúc Component (Component Architecture)

```
json-formatter/
├── index.tsx              # Main page: quản lý tabs, auto-format logic
├── components/
│   ├── JsonEditor.tsx     # Textarea input với line numbers
│   ├── JsonOutput.tsx     # Tree view output (react-json-view-lite)
│   └── TabBar.tsx         # Thanh tab (thêm/đóng/chuyển)
└── README.md
```

## 5. Giao tiếp Backend (Backend Communication)

> ⚠️ Module này KHÔNG cần gọi API backend.

## 6. UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Tab 1] [Tab 2] [+ New]           [Indent|2|4] [Minify] [Copy] [Clear]  │
├───────────────────────┬──┬───────────────────────────────────────────────┤
│  📝 Input             │▐▐│  🌳 Output             [🔍 Search] [⇕] [⇄]  │
│  ┌─────────────────┐  │▐▐│  ▸ name: "ToolHub"                            │
│  │ paste → auto     │  │▐▐│  ▸ features: [...]                           │
│  │ format!          │  │▐▐│  ▾ config: {                                 │
│  │                  │  │▐▐│      key: "value"                            │
│  └─────────────────┘  │▐▐│    }                                          │
│                       │▐▐│                                               │
├───────────────────────┴──┴───────────────────────────────────────────────┤
│  ✅ Valid JSON  |  Size: 1.2 KB  |  Indent: 2sp                          │
└──────────────────────────────────────────────────────────────────────────┘
        Full Width — ▐▐ = Draggable Resizer
```

## 7. Quy tắc (Rules)

- **Auto-format on paste**: Không cần nhấn nút, paste vào là format ngay.
- **Hiệu năng**: Debounce 300ms để xử lý JSON lớn.
- **Responsive**: Full-width trên Desktop, Stack dọc trên Mobile.

---

[⬅ Quay lại danh sách modules](../README.md)
