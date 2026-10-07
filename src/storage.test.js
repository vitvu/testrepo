import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEY,
  parseSubjects,
  serializeSubjects,
  loadSubjects,
  saveSubjects,
} from './storage.js';

const toan = { name: 'Toán', credits: 3, score: 8.5 };
const ly = { name: 'Lý', credits: 2, score: 7 };

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const throwingStorage = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
};

describe('STORAGE_KEY', () => {
  it('đúng key trong PRD', () => {
    expect(STORAGE_KEY).toBe('gpa-tracker:v1');
  });
});

describe('serializeSubjects / parseSubjects', () => {
  it('ghi rồi đọc lại ra đúng dữ liệu', () => {
    expect(parseSubjects(serializeSubjects([toan, ly]))).toEqual([toan, ly]);
  });

  it('chỉ lưu tên, tín chỉ, điểm', () => {
    const text = serializeSubjects([{ ...toan, letter: 'A', gpa4: 4 }]);
    expect(JSON.parse(text)).toEqual([toan]);
  });

  it('mảng rỗng', () => {
    expect(parseSubjects('[]')).toEqual([]);
  });

  it.each([null, undefined, ''])('chưa có dữ liệu: %j → rỗng', (input) => {
    expect(parseSubjects(input)).toEqual([]);
  });

  it.each([
    ['JSON hỏng', '{not json'],
    ['không phải mảng', '{"name":"Toán"}'],
    ['chuỗi JSON', '"abc"'],
    ['số', '42'],
    ['phần tử null', '[null]'],
    ['phần tử không phải object', '["Toán"]'],
    ['thiếu điểm', '[{"name":"Toán","credits":3}]'],
    ['tín chỉ là chuỗi', '[{"name":"Toán","credits":"3","score":8}]'],
    ['điểm là chuỗi', '[{"name":"Toán","credits":3,"score":"8"}]'],
    ['tên rỗng', '[{"name":"  ","credits":3,"score":8}]'],
    ['tín chỉ ngoài khoảng', '[{"name":"Toán","credits":11,"score":8}]'],
    ['tín chỉ lẻ', '[{"name":"Toán","credits":2.5,"score":8}]'],
    ['điểm ngoài khoảng', '[{"name":"Toán","credits":3,"score":12}]'],
  ])('dữ liệu hỏng (%s) → rỗng', (_, text) => {
    expect(parseSubjects(text)).toEqual([]);
  });

  it('một phần tử hỏng thì bỏ toàn bộ', () => {
    const text = JSON.stringify([toan, { name: '', credits: 3, score: 8 }]);
    expect(parseSubjects(text)).toEqual([]);
  });

  it('chuẩn hoá dữ liệu đọc được (bỏ khoảng trắng, làm tròn điểm)', () => {
    const text = JSON.stringify([{ name: ' Toán ', credits: 3, score: 8.45 }]);
    expect(parseSubjects(text)).toEqual([{ name: 'Toán', credits: 3, score: 8.5 }]);
  });
});

describe('loadSubjects', () => {
  it('đọc từ key gpa-tracker:v1', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: serializeSubjects([toan]) });
    expect(loadSubjects(storage)).toEqual([toan]);
  });

  it('chưa có key → rỗng', () => {
    expect(loadSubjects(memoryStorage())).toEqual([]);
  });

  it('storage ném lỗi → rỗng', () => {
    expect(loadSubjects(throwingStorage)).toEqual([]);
  });

  it('không có storage → rỗng', () => {
    expect(loadSubjects(null)).toEqual([]);
  });
});

describe('saveSubjects', () => {
  it('ghi vào key gpa-tracker:v1', () => {
    const storage = memoryStorage();
    expect(saveSubjects([toan], storage)).toBe(true);
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual([toan]);
  });

  it('storage ném lỗi thì trả về false, không ném tiếp (D7)', () => {
    expect(saveSubjects([toan], throwingStorage)).toBe(false);
  });

  it('không có storage → false', () => {
    expect(saveSubjects([toan], null)).toBe(false);
  });
});
