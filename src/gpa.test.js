import { describe, it, expect } from 'vitest';
import { calculateSummary, rankFromGpa4, roundTo2 } from './gpa.js';

const subject = (credits, score) => ({ name: 'Môn', credits, score });

describe('roundTo2', () => {
  it.each([
    [3.333333, 3.33],
    [3.335, 3.34],
    [2.675, 2.68],
    [1.005, 1.01],
    [4, 4],
  ])('%s → %s', (input, expected) => {
    expect(roundTo2(input)).toBe(expected);
  });
});

describe('rankFromGpa4', () => {
  it.each([
    [4.0, 'Xuất sắc'],
    [3.6, 'Xuất sắc'],
    [3.59, 'Giỏi'],
    [3.2, 'Giỏi'],
    [3.19, 'Khá'],
    [2.5, 'Khá'],
    [2.49, 'Trung bình'],
    [2.0, 'Trung bình'],
    [1.99, 'Yếu'],
    [0, 'Yếu'],
  ])('%s → %s', (gpa4, label) => {
    expect(rankFromGpa4(gpa4)).toBe(label);
  });
});

describe('calculateSummary', () => {
  it.each([[[]], [undefined], [null]])('trả về null khi danh sách rỗng: %j', (input) => {
    expect(calculateSummary(input)).toBeNull();
  });

  it('tính đúng với 1 môn', () => {
    expect(calculateSummary([subject(3, 8.5)])).toEqual({
      totalSubjects: 1,
      totalCredits: 3,
      passedCredits: 3,
      gpa4: 4,
      gpa10: 8.5,
      rank: 'Xuất sắc',
    });
  });

  it('tính trung bình có trọng số theo tín chỉ', () => {
    // hệ 4: (4.0×3 + 3.0×2 + 0×1) / 6 = 3.00; hệ 10: (9×3 + 7.5×2 + 3×1) / 6 = 7.50
    expect(calculateSummary([subject(3, 9), subject(2, 7.5), subject(1, 3)])).toEqual({
      totalSubjects: 3,
      totalCredits: 6,
      passedCredits: 5,
      gpa4: 3,
      gpa10: 7.5,
      rank: 'Khá',
    });
  });

  it('làm tròn GPA 2 chữ số', () => {
    // hệ 4: (4×2 + 3×1) / 3 = 3.666… → 3.67; hệ 10: (9×2 + 7×1) / 3 = 8.333… → 8.33
    const summary = calculateSummary([subject(2, 9), subject(1, 7)]);
    expect(summary.gpa4).toBe(3.67);
    expect(summary.gpa10).toBe(8.33);
  });

  it('điểm 4.0 được tính là đạt, 3.9 thì không', () => {
    const summary = calculateSummary([subject(2, 4.0), subject(3, 3.9)]);
    expect(summary.passedCredits).toBe(2);
  });

  it('xếp loại dựa trên GPA hệ 4 đã làm tròn (D2)', () => {
    // (4×25 + 3×17) / 42 = 3.5952… → hiển thị 3.60 → Xuất sắc (không phải Giỏi)
    const summary = calculateSummary([
      subject(10, 9),
      subject(10, 9),
      subject(5, 9),
      subject(10, 7),
      subject(7, 7),
    ]);
    expect(summary.gpa4).toBe(3.6);
    expect(summary.rank).toBe('Xuất sắc');
  });

  it('toàn môn F thì GPA 0 và xếp loại Yếu', () => {
    expect(calculateSummary([subject(3, 2), subject(2, 0)])).toEqual({
      totalSubjects: 2,
      totalCredits: 5,
      passedCredits: 0,
      gpa4: 0,
      gpa10: 1.2,
      rank: 'Yếu',
    });
  });
});
