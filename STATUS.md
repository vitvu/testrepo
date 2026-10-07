# STATUS – GPA Tracker

_Cập nhật lần cuối: 2026-10-07_

## Giai đoạn hiện tại
**Giai đoạn 3 – Cài đặt & kiểm thử tự động** (F1, F2 xong, tiếp theo F3)

| # | Giai đoạn | Trạng thái | Ghi chú |
|---|-----------|------------|---------|
| 1 | Yêu cầu (`PRD.md`) | ✅ Xong | |
| 2 | Thiết kế (`DESIGN.md`, Mermaid) | ✅ Xong | Người dùng đã duyệt 2026-10-07 |
| 3 | Cài đặt & kiểm thử tự động | 🟡 Đang làm | F1, F2 xong |
| 4 | Kiểm thử người dùng | ⬜ Chưa làm | Người dùng thực hiện |
| 5 | Deploy Vercel | ⬜ Chưa làm | URL: — |

## Trạng thái chức năng
| Mã | Chức năng | Thiết kế | Cài đặt | Test tự động | UAT |
|----|-----------|----------|---------|--------------|-----|
| F1 | Thêm môn học | ✅ | ✅ | ✅ | ⬜ |
| F2 | Quy đổi điểm | ✅ | ✅ | ✅ | ⬜ |
| F3 | Tính GPA & xếp loại | ✅ | ⬜ | ⬜ | ⬜ |
| F4 | Sửa/xoá môn | ✅ | ⬜ | ⬜ | ⬜ |
| F5 | Lưu dữ liệu | ✅ | ⬜ | ⬜ | ⬜ |

## Quyết định kỹ thuật
| Ngày | Quyết định | Lý do |
|------|------------|-------|
| 2026-10-07 | Dùng Vite + HTML/CSS/JS thuần, test bằng Vitest | Theo yêu cầu phi chức năng trong PRD |
| 2026-10-07 | Lưu dữ liệu bằng localStorage, key `gpa-tracker:v1` | PRD F5: không đăng nhập, không dùng CSDL; hậu tố `v1` để sau này có thể đổi cấu trúc dữ liệu |
| 2026-10-07 | Ô điểm hệ 10 dùng `type="text"`, form dùng `novalidate`, kiểm tra dữ liệu bằng JS | Để nhận cả `8,5` và `8.5` và hiện lỗi tiếng Việt dưới từng ô (PRD F1) |
| 2026-10-07 | Tách phần logic (kiểm tra dữ liệu, quy đổi, tính GPA, đọc/ghi dữ liệu) khỏi phần thao tác giao diện | Để unit test bằng Vitest mà không cần giả lập trình duyệt |
| 2026-10-07 | Làm theo mô hình Waterfall, có `PLAN.md`/`STATUS.md` | Theo yêu cầu của chủ dự án |
| 2026-10-07 | Mỗi chức năng làm trên một nhánh riêng, chỉ merge vào `main` khi `npm test` và `npm run build` đều đạt | Theo yêu cầu của chủ dự án, ghi trong `CLAUDE.md` |
| 2026-10-07 | Chốt các quy ước D1–D8 trong `DESIGN.md` cho những chỗ PRD chưa nói rõ (làm tròn điểm trước khi quy đổi, xếp loại theo GPA đã làm tròn, xử lý xoá khi đang sửa, ...) | Để cài đặt và viết test không phải đoán |
| 2026-10-07 | Chỉ lưu tên, tín chỉ, điểm hệ 10; điểm chữ và hệ 4 luôn tính lại | Tránh dữ liệu lưu bị lệch với bảng quy đổi |
| 2026-10-07 | Làm tròn điểm bằng ký hiệu mũ (`Number(Math.round(x + 'e1') + 'e-1')`) thay vì `Math.round(x * 10) / 10` | Tránh sai số dấu phẩy động, ví dụ 8.45 phải ra 8.5 |
| 2026-10-07 | Điểm lớn hơn 10 bị báo lỗi kể cả khi làm tròn sẽ ra 10 (ví dụ `10.04`) | PRD yêu cầu điểm trong khoảng 0–10, kiểm tra trên giá trị người dùng nhập |
| 2026-10-07 | Ô tín chỉ (`type=number`) gõ chữ thì báo "phải là số nguyên", không báo "bỏ trống" | Trình duyệt trả `""` cho cả hai trường hợp; dùng `validity.badInput` để phân biệt |

## Thay đổi so với ban đầu
| Ngày | Thay đổi | Ảnh hưởng |
|------|----------|-----------|
| 2026-10-07 | Bỏ phần tiêu chí nghiệm thu và test case khỏi PRD (commit `81109d2`) | Test tự động sẽ được viết dựa trên quy tắc trong PRD và flowchart trong `DESIGN.md` |
| 2026-10-07 | Chuyển remote từ `tungdtfgw/gpa-tracker` sang `vitvu/testrepo`, vẫn giữ lịch sử commit | Từ nay push/pull dùng repo mới |

## Vấn đề tồn đọng
- Cột Hành động trống đến khi làm F4. Danh sách chưa được lưu (F5), tải lại trang sẽ mất.
- Thư mục `new-app/` đang trống, chưa rõ mục đích.
