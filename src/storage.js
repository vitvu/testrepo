// Lưu và tải danh sách môn học bằng localStorage (PRD F5, DESIGN.md F5a, F5b). Logic thuần:
// đối tượng storage được truyền vào nên test được không cần trình duyệt.
import { validateSubject } from './validation.js';

export const STORAGE_KEY = 'gpa-tracker:v1';

/** Lấy window.localStorage; trả về null nếu trình duyệt chặn truy cập. */
export function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isValidStoredSubject(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.name === 'string' &&
    typeof item.credits === 'number' &&
    typeof item.score === 'number'
  );
}

/**
 * Chuyển chuỗi JSON đã lưu thành danh sách môn. Dữ liệu hỏng ở bất kỳ đâu → danh sách rỗng.
 * @param {string | null | undefined} text
 * @returns {{ name: string, credits: number, score: number }[]}
 */
export function parseSubjects(text) {
  if (text === null || text === undefined || text === '') return [];

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const subjects = [];
  for (const item of data) {
    if (!isValidStoredSubject(item)) return [];
    const result = validateSubject(item);
    if (!result.ok) return [];
    subjects.push(result.value);
  }
  return subjects;
}

/** Chỉ lưu tên, tín chỉ, điểm; điểm chữ và hệ 4 luôn được tính lại. */
export function serializeSubjects(subjects) {
  return JSON.stringify(subjects.map(({ name, credits, score }) => ({ name, credits, score })));
}

/** Đọc danh sách từ storage; mọi lỗi đều trả về danh sách rỗng. */
export function loadSubjects(storage = getDefaultStorage()) {
  if (!storage) return [];
  try {
    return parseSubjects(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Ghi danh sách vào storage. Lỗi ghi (bị chặn, đầy bộ nhớ) được bỏ qua (D7).
 * @returns {boolean} true nếu ghi thành công
 */
export function saveSubjects(subjects, storage = getDefaultStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serializeSubjects(subjects));
    return true;
  } catch {
    return false;
  }
}
