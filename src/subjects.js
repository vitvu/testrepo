// Thao tác trên danh sách môn học (PRD F1, F4; DESIGN.md F4a, F4b). Logic thuần, không sửa mảng gốc.

/** Thêm môn vào cuối danh sách. */
export function addSubject(subjects, subject) {
  return [...subjects, subject];
}

/** Thay môn ở vị trí `index` bằng dữ liệu mới. */
export function updateSubject(subjects, index, subject) {
  return subjects.map((current, i) => (i === index ? subject : current));
}

/**
 * Xoá môn ở vị trí `index` và tính lại chỉ số dòng đang sửa (D5).
 * @param {number | null} editIndex dòng đang sửa, null nếu không ở chế độ sửa
 * @returns {{ subjects: object[], editIndex: number | null }}
 *   editIndex = null nghĩa là phải thoát chế độ sửa (hoặc vốn không sửa).
 */
export function removeSubject(subjects, index, editIndex = null) {
  const next = subjects.filter((_, i) => i !== index);

  let nextEditIndex = editIndex;
  if (editIndex === index) nextEditIndex = null;
  else if (editIndex !== null && index < editIndex) nextEditIndex = editIndex - 1;

  return { subjects: next, editIndex: nextEditIndex };
}
