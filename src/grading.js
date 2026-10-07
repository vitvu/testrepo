// Quy đổi điểm hệ 10 → điểm chữ → hệ 4 (PRD F2, DESIGN.md F2). Logic thuần.

// Xếp từ mốc cao xuống thấp; điểm đã được làm tròn 1 chữ số trước khi quy đổi (D1).
export const GRADE_SCALE = [
  { min: 8.5, letter: 'A', gpa4: 4.0 },
  { min: 8.0, letter: 'B+', gpa4: 3.5 },
  { min: 7.0, letter: 'B', gpa4: 3.0 },
  { min: 6.5, letter: 'C+', gpa4: 2.5 },
  { min: 5.5, letter: 'C', gpa4: 2.0 },
  { min: 5.0, letter: 'D+', gpa4: 1.5 },
  { min: 4.0, letter: 'D', gpa4: 1.0 },
  { min: -Infinity, letter: 'F', gpa4: 0.0 },
];

/**
 * @param {number} score điểm hệ 10 (0–10, đã làm tròn 1 chữ số)
 * @returns {{ letter: string, gpa4: number }}
 */
export function convertScore(score) {
  const { letter, gpa4 } = GRADE_SCALE.find((grade) => score >= grade.min);
  return { letter, gpa4 };
}
