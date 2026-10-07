// Tính GPA và xếp loại (PRD F3, DESIGN.md F3). Logic thuần.
import { convertScore } from './grading.js';

export const PASS_SCORE = 4.0;

// Xếp từ mốc cao xuống thấp, so với GPA hệ 4 đã làm tròn 2 chữ số (D2).
export const RANKS = [
  { min: 3.6, label: 'Xuất sắc' },
  { min: 3.2, label: 'Giỏi' },
  { min: 2.5, label: 'Khá' },
  { min: 2.0, label: 'Trung bình' },
  { min: -Infinity, label: 'Yếu' },
];

/** Làm tròn 2 chữ số thập phân; EPSILON để 2.675 ra 2.68 thay vì 2.67. */
export function roundTo2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** @param {number} gpa4 GPA hệ 4 đã làm tròn */
export function rankFromGpa4(gpa4) {
  return RANKS.find((rank) => gpa4 >= rank.min).label;
}

/**
 * @param {{ name: string, credits: number, score: number }[]} subjects
 * @returns {null | {
 *   totalSubjects: number, totalCredits: number, passedCredits: number,
 *   gpa4: number, gpa10: number, rank: string
 * }} null khi danh sách rỗng
 */
export function calculateSummary(subjects) {
  if (!subjects || subjects.length === 0) return null;

  let totalCredits = 0;
  let passedCredits = 0;
  let weighted4 = 0;
  let weighted10 = 0;

  for (const { credits, score } of subjects) {
    totalCredits += credits;
    if (score >= PASS_SCORE) passedCredits += credits;
    weighted4 += convertScore(score).gpa4 * credits;
    weighted10 += score * credits;
  }

  // Mỗi môn có ít nhất 1 tín chỉ nên totalCredits > 0.
  const gpa4 = roundTo2(weighted4 / totalCredits);
  const gpa10 = roundTo2(weighted10 / totalCredits);

  return {
    totalSubjects: subjects.length,
    totalCredits,
    passedCredits,
    gpa4,
    gpa10,
    rank: rankFromGpa4(gpa4),
  };
}
