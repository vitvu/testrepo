import { describe, it, expect } from 'vitest';
import {
  MESSAGES,
  roundTo1,
  validateName,
  validateCredits,
  validateScore,
  validateSubject,
} from './validation.js';

describe('roundTo1', () => {
  it.each([
    [8.45, 8.5],
    [8.44, 8.4],
    [1.05, 1.1],
    [7, 7],
    [9.99, 10],
  ])('%s → %s', (input, expected) => {
    expect(roundTo1(input)).toBe(expected);
  });
});

describe('validateName', () => {
  it('bỏ khoảng trắng 2 đầu', () => {
    expect(validateName('  Toán Giải tích  ')).toEqual({ ok: true, value: 'Toán Giải tích' });
  });

  it.each(['', '   ', undefined, null])('báo lỗi khi rỗng: %j', (input) => {
    expect(validateName(input)).toEqual({ ok: false, error: MESSAGES.nameRequired });
  });

  it('chấp nhận đúng 100 ký tự', () => {
    expect(validateName('a'.repeat(100)).ok).toBe(true);
  });

  it('báo lỗi khi quá 100 ký tự', () => {
    expect(validateName('a'.repeat(101))).toEqual({ ok: false, error: MESSAGES.nameTooLong });
  });

  it('tính độ dài sau khi bỏ khoảng trắng', () => {
    expect(validateName(`  ${'a'.repeat(100)}  `).ok).toBe(true);
  });
});

describe('validateCredits', () => {
  it.each([
    ['1', 1],
    ['10', 10],
    [' 3 ', 3],
    [4, 4],
  ])('chấp nhận %j', (input, expected) => {
    expect(validateCredits(input)).toEqual({ ok: true, value: expected });
  });

  it.each(['', '  ', undefined])('báo lỗi khi bỏ trống: %j', (input) => {
    expect(validateCredits(input)).toEqual({ ok: false, error: MESSAGES.creditsRequired });
  });

  it.each(['0', '11', '2.5', '-1', 'abc', '1e1', '3,0'])('báo lỗi khi không hợp lệ: %j', (input) => {
    expect(validateCredits(input)).toEqual({ ok: false, error: MESSAGES.creditsInvalid });
  });
});

describe('validateScore', () => {
  it.each([
    ['8.5', 8.5],
    ['8,5', 8.5],
    ['0', 0],
    ['10', 10],
    ['10.0', 10],
    ['7', 7],
    [' 6,25 ', 6.3],
    ['8,45', 8.5],
    ['8.44', 8.4],
    ['.5', 0.5],
    ['9.', 9],
  ])('chấp nhận %j → %s', (input, expected) => {
    expect(validateScore(input)).toEqual({ ok: true, value: expected });
  });

  it.each(['', '   ', undefined])('báo lỗi khi bỏ trống: %j', (input) => {
    expect(validateScore(input)).toEqual({ ok: false, error: MESSAGES.scoreRequired });
  });

  it.each(['-1', '10.1', '10.04', '11', 'abc', '8,5,1', '8.5.1', '1e1', ',', '.'])(
    'báo lỗi khi không hợp lệ: %j',
    (input) => {
      expect(validateScore(input)).toEqual({ ok: false, error: MESSAGES.scoreInvalid });
    },
  );
});

describe('validateSubject', () => {
  it('trả về dữ liệu đã chuẩn hoá khi hợp lệ', () => {
    expect(validateSubject({ name: ' Vật lý ', credits: '3', score: '8,45' })).toEqual({
      ok: true,
      value: { name: 'Vật lý', credits: 3, score: 8.5 },
    });
  });

  it('báo lỗi cho tất cả các ô sai cùng lúc', () => {
    expect(validateSubject({ name: '', credits: '0', score: '' })).toEqual({
      ok: false,
      errors: {
        name: MESSAGES.nameRequired,
        credits: MESSAGES.creditsInvalid,
        score: MESSAGES.scoreRequired,
      },
    });
  });

  it('chỉ báo lỗi ở ô sai', () => {
    expect(validateSubject({ name: 'Hoá', credits: '2', score: '12' })).toEqual({
      ok: false,
      errors: { score: MESSAGES.scoreInvalid },
    });
  });

  it('không ném exception khi không có input, báo lỗi cả 3 ô', () => {
    expect(Object.keys(validateSubject(undefined).errors)).toEqual(['name', 'credits', 'score']);
  });
});
