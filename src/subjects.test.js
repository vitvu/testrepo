import { describe, it, expect } from 'vitest';
import { addSubject, updateSubject, removeSubject } from './subjects.js';

const a = { name: 'A', credits: 1, score: 5 };
const b = { name: 'B', credits: 2, score: 6 };
const c = { name: 'C', credits: 3, score: 7 };

describe('addSubject', () => {
  it('thêm vào cuối và không sửa mảng gốc', () => {
    const list = [a];
    expect(addSubject(list, b)).toEqual([a, b]);
    expect(list).toEqual([a]);
  });
});

describe('updateSubject', () => {
  it('chỉ thay đúng dòng được sửa', () => {
    const edited = { name: 'B2', credits: 4, score: 9 };
    const list = [a, b, c];
    expect(updateSubject(list, 1, edited)).toEqual([a, edited, c]);
    expect(list).toEqual([a, b, c]);
  });
});

describe('removeSubject', () => {
  it('xoá khi không ở chế độ sửa', () => {
    expect(removeSubject([a, b, c], 1)).toEqual({ subjects: [a, c], editIndex: null });
  });

  it('xoá chính môn đang sửa thì thoát chế độ sửa', () => {
    expect(removeSubject([a, b, c], 1, 1)).toEqual({ subjects: [a, c], editIndex: null });
  });

  it('xoá môn nằm trước môn đang sửa thì chỉ số giảm 1', () => {
    expect(removeSubject([a, b, c], 0, 2)).toEqual({ subjects: [b, c], editIndex: 1 });
  });

  it('xoá môn nằm sau môn đang sửa thì chỉ số giữ nguyên', () => {
    expect(removeSubject([a, b, c], 2, 0)).toEqual({ subjects: [a, b], editIndex: 0 });
  });

  it('không sửa mảng gốc', () => {
    const list = [a, b];
    removeSubject(list, 0);
    expect(list).toEqual([a, b]);
  });
});
