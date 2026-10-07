// Kiểm tra dữ liệu môn học (PRD F1, DESIGN.md F1). Logic thuần, không đụng DOM.

export const NAME_MAX_LENGTH = 100;
export const CREDITS_MIN = 1;
export const CREDITS_MAX = 10;
export const SCORE_MIN = 0;
export const SCORE_MAX = 10;

export const MESSAGES = {
  nameRequired: 'Vui lòng nhập tên môn học',
  nameTooLong: `Tên môn tối đa ${NAME_MAX_LENGTH} ký tự`,
  creditsRequired: 'Vui lòng nhập số tín chỉ',
  creditsInvalid: `Số tín chỉ phải là số nguyên từ ${CREDITS_MIN} đến ${CREDITS_MAX}`,
  scoreRequired: 'Vui lòng nhập điểm',
  scoreInvalid: `Điểm phải là số từ ${SCORE_MIN} đến ${SCORE_MAX}`,
};

const INTEGER_RE = /^\d+$/;
// Chấp nhận "8", "8.5", "8." và ".5" (sau khi đã đổi dấu phẩy thành dấu chấm).
const DECIMAL_RE = /^(\d+(\.\d*)?|\.\d+)$/;

/** Làm tròn 1 chữ số thập phân, tránh sai số dấu phẩy động (8.45 → 8.5). */
export function roundTo1(value) {
  return Number(Math.round(Number(`${value}e1`)) + 'e-1');
}

/** @returns {{ ok: true, value: string } | { ok: false, error: string }} */
export function validateName(raw) {
  const name = String(raw ?? '').trim();
  if (name === '') return { ok: false, error: MESSAGES.nameRequired };
  if (name.length > NAME_MAX_LENGTH) return { ok: false, error: MESSAGES.nameTooLong };
  return { ok: true, value: name };
}

/** @returns {{ ok: true, value: number } | { ok: false, error: string }} */
export function validateCredits(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return { ok: false, error: MESSAGES.creditsRequired };
  if (!INTEGER_RE.test(text)) return { ok: false, error: MESSAGES.creditsInvalid };
  const credits = Number(text);
  if (credits < CREDITS_MIN || credits > CREDITS_MAX) {
    return { ok: false, error: MESSAGES.creditsInvalid };
  }
  return { ok: true, value: credits };
}

/** @returns {{ ok: true, value: number } | { ok: false, error: string }} */
export function validateScore(raw) {
  const text = String(raw ?? '').trim().replace(',', '.');
  if (text === '') return { ok: false, error: MESSAGES.scoreRequired };
  if (!DECIMAL_RE.test(text)) return { ok: false, error: MESSAGES.scoreInvalid };
  const score = Number(text);
  if (score < SCORE_MIN || score > SCORE_MAX) return { ok: false, error: MESSAGES.scoreInvalid };
  return { ok: true, value: roundTo1(score) };
}

/**
 * Kiểm tra cả 3 ô cùng lúc để hiện lỗi dưới mọi ô sai trong một lần bấm.
 * @param {{ name: unknown, credits: unknown, score: unknown }} input giá trị thô từ form
 * @returns {{ ok: true, value: { name: string, credits: number, score: number } }
 *         | { ok: false, errors: { name?: string, credits?: string, score?: string } }}
 */
export function validateSubject(input) {
  const results = {
    name: validateName(input?.name),
    credits: validateCredits(input?.credits),
    score: validateScore(input?.score),
  };

  const errors = {};
  for (const [field, result] of Object.entries(results)) {
    if (!result.ok) errors[field] = result.error;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: results.name.value,
      credits: results.credits.value,
      score: results.score.value,
    },
  };
}
