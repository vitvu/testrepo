# DESIGN – GPA Tracker

Thiết kế luồng nghiệp vụ cho từng chức năng F1–F5, dựng từ [PRD.md](PRD.md).
Mỗi flowchart là căn cứ để cài đặt và viết unit test ở giai đoạn 3.

## Mô hình dữ liệu

Mỗi môn học là một object:

```js
{ name: "Toán Giải tích", credits: 3, score: 8.5 }
```

- `name`: chuỗi đã bỏ khoảng trắng 2 đầu, 1–100 ký tự.
- `credits`: số nguyên 1–10.
- `score`: số 0–10, đã làm tròn 1 chữ số thập phân.
- Điểm chữ và điểm hệ 4 **không lưu**, luôn tính lại từ `score` (F2), để dữ liệu không bị lệch.
- Danh sách môn là một mảng, lưu trong localStorage key `gpa-tracker:v1` (F5).

## Quy ước thiết kế (làm rõ những chỗ PRD chưa nói)

| # | Quy ước | Lý do |
|---|---------|-------|
| D1 | Điểm hệ 10 được làm tròn 1 chữ số **trước** khi quy đổi. Ví dụ `8,45` → `8.5` → A. | Bảng F2 chỉ có mốc 1 chữ số (8.4 / 8.5), làm tròn trước thì không có điểm nào rơi vào khe giữa hai mốc. |
| D2 | Xếp loại dùng GPA hệ 4 **đã làm tròn 2 chữ số** (đúng con số người dùng nhìn thấy). | Tránh trường hợp màn hình hiện 3.60 mà xếp loại lại là Giỏi. |
| D3 | Tín chỉ đạt = tổng tín chỉ các môn có điểm hệ 10 ≥ 4.0 (tức là không phải F). | Theo PRD F3. |
| D4 | Số tín chỉ có phần thập phân (ví dụ `2.5`) hoặc bỏ trống là lỗi. | PRD yêu cầu số nguyên. |
| D5 | Đang sửa một môn mà xoá chính môn đó thì form tự hủy chế độ sửa. Xoá môn khác thì vẫn giữ chế độ sửa, chỉ số dòng đang sửa được cập nhật lại. | Tránh lưu đè vào sai dòng. |
| D6 | Danh sách rỗng thì "Xoá tất cả" không làm gì (không hỏi xác nhận). | Không có gì để xoá. |
| D7 | Ghi localStorage bị lỗi (trình duyệt chặn, đầy bộ nhớ) thì app vẫn chạy tiếp, chỉ không lưu được. | PRD F5: không được làm hỏng trang. |
| D8 | Cho phép trùng tên môn (ví dụ học lại). | PRD không cấm. |

## F1 – Thêm môn học

```mermaid
flowchart TD
    A(["Người dùng nhập Tên môn, Số tín chỉ, Điểm hệ 10"]) --> B["Nhấn 'Thêm môn' hoặc Enter"]
    B --> C["Xoá các thông báo lỗi cũ"]
    C --> N1{"Tên môn sau khi bỏ khoảng trắng 2 đầu có rỗng không?"}
    N1 -- "Rỗng" --> EN1["Lỗi dưới ô Tên: 'Vui lòng nhập tên môn học'"]
    N1 -- "Không rỗng" --> N2{"Dài hơn 100 ký tự?"}
    N2 -- "Có" --> EN2["Lỗi dưới ô Tên: 'Tên môn tối đa 100 ký tự'"]
    N2 -- "Không" --> NOK["Tên hợp lệ"]

    C --> K1{"Số tín chỉ có bỏ trống không?"}
    K1 -- "Trống" --> EK1["Lỗi dưới ô Tín chỉ: 'Vui lòng nhập số tín chỉ'"]
    K1 -- "Có giá trị" --> K2{"Là số nguyên từ 1 đến 10?"}
    K2 -- "Không" --> EK2["Lỗi dưới ô Tín chỉ: 'Số tín chỉ phải là số nguyên từ 1 đến 10'"]
    K2 -- "Có" --> KOK["Tín chỉ hợp lệ"]

    C --> S1{"Điểm có bỏ trống không?"}
    S1 -- "Trống" --> ES1["Lỗi dưới ô Điểm: 'Vui lòng nhập điểm'"]
    S1 -- "Có giá trị" --> S2["Đổi dấu phẩy thành dấu chấm"]
    S2 --> S3{"Là một số hợp lệ?"}
    S3 -- "Không" --> ES2["Lỗi dưới ô Điểm: 'Điểm phải là số từ 0 đến 10'"]
    S3 -- "Có" --> S4{"Nằm trong khoảng 0 đến 10?"}
    S4 -- "Không" --> ES2
    S4 -- "Có" --> S5["Làm tròn 1 chữ số thập phân"]
    S5 --> SOK["Điểm hợp lệ"]

    NOK & KOK & SOK --> J{"Cả 3 ô đều hợp lệ?"}
    EN1 & EN2 & EK1 & EK2 & ES1 & ES2 --> J
    J -- "Không" --> F["Giữ nguyên dữ liệu trên form, đặt con trỏ vào ô lỗi đầu tiên"]
    F --> A
    J -- "Có" --> G["Thêm môn vào cuối danh sách"]
    G --> H["Lưu localStorage (F5)"]
    H --> I["Vẽ lại bảng và thống kê (F2, F3)"]
    I --> K["Xoá trắng form, đặt con trỏ vào ô Tên môn"]
    K --> Z(["Kết thúc"])
```

Cả 3 ô được kiểm tra cùng lúc, nên ô nào sai thì đều hiện lỗi dưới ô đó trong một lần bấm.

## F2 – Quy đổi điểm

```mermaid
flowchart TD
    A(["Điểm hệ 10 đã làm tròn 1 chữ số"]) --> B{"Điểm ≥ 8.5?"}
    B -- "Có" --> RA["A – 4.0"]
    B -- "Không" --> C{"Điểm ≥ 8.0?"}
    C -- "Có" --> RBP["B+ – 3.5"]
    C -- "Không" --> D{"Điểm ≥ 7.0?"}
    D -- "Có" --> RB["B – 3.0"]
    D -- "Không" --> E{"Điểm ≥ 6.5?"}
    E -- "Có" --> RCP["C+ – 2.5"]
    E -- "Không" --> F{"Điểm ≥ 5.5?"}
    F -- "Có" --> RC["C – 2.0"]
    F -- "Không" --> G{"Điểm ≥ 5.0?"}
    G -- "Có" --> RDP["D+ – 1.5"]
    G -- "Không" --> H{"Điểm ≥ 4.0?"}
    H -- "Có" --> RD["D – 1.0"]
    H -- "Không" --> RF["F – 0.0"]
    RA & RBP & RB & RCP & RC & RDP & RD & RF --> Z(["Trả về điểm chữ và điểm hệ 4"])
```

Quy đổi chạy mỗi khi vẽ một dòng trong bảng (cột Điểm chữ và GPA hệ 4) và khi tính GPA (F3).

## F3 – Tính GPA và xếp loại

```mermaid
flowchart TD
    A(["Danh sách môn thay đổi hoặc trang vừa tải"]) --> B{"Danh sách rỗng?"}
    B -- "Có" --> E1["Mọi ô thống kê hiện '—'"]
    E1 --> E2["Hiện dòng 'Hãy thêm môn học đầu tiên'"]
    E2 --> Z(["Kết thúc"])
    B -- "Không" --> C["Ẩn dòng hướng dẫn"]
    C --> D["Với mỗi môn: quy đổi điểm sang hệ 4 (F2)"]
    D --> F["Tổng môn = số môn; Tổng tín chỉ = Σ tín chỉ"]
    F --> G["Tín chỉ đạt = Σ tín chỉ các môn có điểm ≥ 4.0"]
    G --> H["GPA hệ 4 = Σ(hệ 4 × tín chỉ) / Σ tín chỉ, làm tròn 2 chữ số"]
    H --> I["GPA hệ 10 = Σ(điểm × tín chỉ) / Σ tín chỉ, làm tròn 2 chữ số"]
    I --> R1{"GPA hệ 4 ≥ 3.6?"}
    R1 -- "Có" --> X1["Xuất sắc"]
    R1 -- "Không" --> R2{"GPA hệ 4 ≥ 3.2?"}
    R2 -- "Có" --> X2["Giỏi"]
    R2 -- "Không" --> R3{"GPA hệ 4 ≥ 2.5?"}
    R3 -- "Có" --> X3["Khá"]
    R3 -- "Không" --> R4{"GPA hệ 4 ≥ 2.0?"}
    R4 -- "Có" --> X4["Trung bình"]
    R4 -- "Không" --> X5["Yếu"]
    X1 & X2 & X3 & X4 & X5 --> K["Hiển thị các số liệu và xếp loại"]
    K --> Z
```

Vì mỗi môn có ít nhất 1 tín chỉ, danh sách không rỗng thì Σ tín chỉ luôn > 0, không có phép chia cho 0.

## F4 – Sửa và xoá môn học

### F4a – Sửa môn

```mermaid
flowchart TD
    A(["Nhấn 'Sửa' ở một dòng"]) --> B["Ghi chỉ số dòng vào ô ẩn edit-index"]
    B --> C["Đưa tên, tín chỉ, điểm của môn lên form; xoá lỗi cũ"]
    C --> D["Tiêu đề form: 'Sửa môn học'; nút chính: 'Lưu'; hiện nút 'Hủy'"]
    D --> E{"Người dùng chọn gì?"}
    E -- "Hủy" --> H1["Xoá trắng form, xoá edit-index"]
    H1 --> H2["Tiêu đề: 'Thêm môn học'; nút: 'Thêm môn'; ẩn nút 'Hủy'"]
    H2 --> Z(["Kết thúc"])
    E -- "Lưu" --> V["Kiểm tra dữ liệu như F1"]
    V --> V1{"Hợp lệ?"}
    V1 -- "Không" --> V2["Hiện lỗi dưới từng ô, vẫn ở chế độ sửa"]
    V2 --> E
    V1 -- "Có" --> S["Thay môn ở dòng đang sửa bằng dữ liệu mới"]
    S --> S1["Lưu localStorage (F5)"]
    S1 --> S2["Vẽ lại bảng và thống kê (F2, F3)"]
    S2 --> H1
```

### F4b – Xoá môn

```mermaid
flowchart TD
    A(["Nhấn 'Xoá' ở một dòng"]) --> B{"Hỏi xác nhận: 'Bạn có chắc muốn xoá môn [tên môn]?'"}
    B -- "Không" --> Z(["Kết thúc, không thay đổi gì"])
    B -- "Có" --> C["Xoá môn khỏi danh sách"]
    C --> D{"Đang ở chế độ sửa?"}
    D -- "Không" --> G
    D -- "Có" --> E{"Môn vừa xoá là môn đang sửa?"}
    E -- "Có" --> E1["Hủy chế độ sửa (như nút 'Hủy')"]
    E1 --> G
    E -- "Không" --> E2{"Môn vừa xoá nằm trước môn đang sửa?"}
    E2 -- "Có" --> E3["Giảm edit-index đi 1"]
    E2 -- "Không" --> G
    E3 --> G
    G["Lưu localStorage (F5)"] --> H["Vẽ lại bảng và thống kê (F2, F3)"]
    H --> Z2(["Kết thúc"])
```

## F5 – Lưu dữ liệu

### F5a – Tải dữ liệu khi mở trang

```mermaid
flowchart TD
    A(["Mở hoặc tải lại trang"]) --> B["Đọc localStorage key 'gpa-tracker:v1'"]
    B --> B1{"Đọc được không? (trình duyệt có thể chặn)"}
    B1 -- "Không" --> E["Khởi tạo danh sách rỗng"]
    B1 -- "Được" --> C{"Có dữ liệu không?"}
    C -- "Không" --> E
    C -- "Có" --> D{"Parse JSON thành công?"}
    D -- "Không" --> E
    D -- "Có" --> F{"Là một mảng?"}
    F -- "Không" --> E
    F -- "Có" --> G{"Mọi phần tử đều có tên, tín chỉ, điểm hợp lệ theo luật F1?"}
    G -- "Không" --> E
    G -- "Có" --> H["Dùng danh sách đã đọc"]
    E --> R["Vẽ bảng và thống kê (F2, F3)"]
    H --> R
    R --> Z(["Trang sẵn sàng"])
```

Dữ liệu hỏng thì bỏ qua toàn bộ, không giữ lại một phần, để không hiện ra dữ liệu sai lệch.

### F5b – Ghi dữ liệu sau mỗi thay đổi

```mermaid
flowchart TD
    A(["Danh sách thay đổi: thêm, sửa, xoá, xoá tất cả"]) --> B["Chuyển danh sách thành JSON"]
    B --> C["Ghi vào localStorage key 'gpa-tracker:v1'"]
    C --> D{"Ghi thành công?"}
    D -- "Có" --> Z(["Kết thúc"])
    D -- "Không" --> E["Bỏ qua lỗi, app vẫn chạy bình thường (D7)"]
    E --> Z
```

### F5c – Xoá tất cả

```mermaid
flowchart TD
    A(["Nhấn 'Xoá tất cả'"]) --> B{"Danh sách rỗng?"}
    B -- "Có" --> Z(["Kết thúc, không làm gì"])
    B -- "Không" --> C{"Hỏi xác nhận: 'Bạn có chắc muốn xoá tất cả môn học?'"}
    C -- "Không" --> Z
    C -- "Có" --> D["Danh sách = rỗng"]
    D --> E["Nếu đang sửa thì hủy chế độ sửa"]
    E --> F["Lưu localStorage (F5b)"]
    F --> G["Vẽ lại: bảng hiện 'Chưa có môn học nào.', thống kê hiện '—' (F3)"]
    G --> Z2(["Kết thúc"])
```

## Ánh xạ sang module (cho giai đoạn 3)

| Module | Nội dung | Flowchart |
|--------|----------|-----------|
| `src/validation.js` | Kiểm tra tên, tín chỉ, điểm; trả về dữ liệu đã chuẩn hoá hoặc lỗi theo từng ô | F1, F4a |
| `src/grading.js` | Quy đổi điểm hệ 10 → chữ → hệ 4 | F2 |
| `src/gpa.js` | Tính tổng môn, tín chỉ, tín chỉ đạt, GPA, xếp loại | F3 |
| `src/storage.js` | Parse/serialize, đọc/ghi localStorage an toàn | F5a, F5b |
| `src/main.js` | Gắn sự kiện vào DOM có sẵn, vẽ bảng, chế độ sửa, xác nhận xoá | F1, F4, F5c |

Bốn module đầu là logic thuần, không đụng tới DOM, nên test được bằng Vitest mà không cần giả lập trình duyệt.
