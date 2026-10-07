// @vitest-environment jsdom
// Kiểm thử tích hợp giao diện: chạy main.js trên markup thật của index.html.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import html from '../index.html?raw';

const bodyHtml = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');

const $ = (id) => document.getElementById(id);

async function loadApp() {
  document.body.innerHTML = bodyHtml;
  vi.resetModules();
  await import('./main.js');
}

function submit(name, credits, score) {
  $('subject-name').value = name;
  $('subject-credits').value = credits;
  $('subject-score').value = score;
  $('subject-form').dispatchEvent(new Event('submit', { cancelable: true }));
}

const rows = () => [...$('subjects-tbody').querySelectorAll('tr')];
const cells = (row) => [...row.querySelectorAll('td')].slice(0, 6).map((td) => td.textContent);
const clickRowButton = (rowIndex, action) =>
  rows()[rowIndex].querySelector(`button[data-action="${action}"]`).click();

// Storage giả trong bộ nhớ: Node ≥ 22 có sẵn biến localStorage riêng, có thể là undefined và
// che mất localStorage của jsdom, nên không dựa vào môi trường.
function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  };
}

beforeEach(async () => {
  vi.stubGlobal('localStorage', createMemoryStorage());
  window.confirm = vi.fn(() => true);
  await loadApp();
});

describe('trạng thái ban đầu', () => {
  it('danh sách rỗng hiện "—" và dòng hướng dẫn', () => {
    expect(rows()).toHaveLength(0);
    expect($('table-empty-msg').hidden).toBe(false);
    expect($('empty-hint').hidden).toBe(false);
    for (const id of ['stat-total-subjects', 'stat-gpa4', 'stat-gpa10', 'stat-rank']) {
      expect($(id).textContent).toBe('—');
    }
  });
});

describe('F1 – thêm môn', () => {
  it('thêm môn hợp lệ, xoá trắng form, đặt con trỏ vào ô Tên', () => {
    submit('  Toán  ', '3', '8,45');
    expect(rows()).toHaveLength(1);
    expect(cells(rows()[0])).toEqual(['1', 'Toán', '3', '8.5', 'A', '4.0']);
    expect($('subject-name').value).toBe('');
    expect(document.activeElement).toBe($('subject-name'));
    expect($('table-empty-msg').hidden).toBe(true);
  });

  it('hiện lỗi dưới từng ô sai và giữ nguyên dữ liệu', () => {
    submit('', '11', 'abc');
    expect(rows()).toHaveLength(0);
    expect($('err-name').textContent).toBe('Vui lòng nhập tên môn học');
    expect($('err-credits').textContent).toBe('Số tín chỉ phải là số nguyên từ 1 đến 10');
    expect($('err-score').textContent).toBe('Điểm phải là số từ 0 đến 10');
    expect($('subject-score').value).toBe('abc');
    expect(document.activeElement).toBe($('subject-name'));
  });

  it('xoá lỗi cũ sau khi nhập đúng', () => {
    submit('', '3', '8');
    submit('Lý', '3', '8');
    expect($('err-name').textContent).toBe('');
  });
});

describe('F3 – thống kê', () => {
  it('cập nhật thống kê và xếp loại', () => {
    submit('Toán', '3', '9');
    submit('Lý', '2', '7.5');
    submit('Hoá', '1', '3');
    expect($('stat-total-subjects').textContent).toBe('3');
    expect($('stat-total-credits').textContent).toBe('6');
    expect($('stat-passed-credits').textContent).toBe('5');
    expect($('stat-gpa4').textContent).toBe('3.00');
    expect($('stat-gpa10').textContent).toBe('7.50');
    expect($('stat-rank').textContent).toBe('Khá');
    expect($('empty-hint').hidden).toBe(true);
  });
});

describe('F4 – sửa môn', () => {
  beforeEach(() => {
    submit('Toán', '3', '9');
    submit('Lý', '2', '7');
  });

  it('nhấn Sửa đưa dữ liệu lên form và đổi nút thành Lưu', () => {
    clickRowButton(1, 'edit');
    expect($('subject-name').value).toBe('Lý');
    expect($('subject-credits').value).toBe('2');
    expect($('subject-score').value).toBe('7');
    expect($('edit-index').value).toBe('1');
    expect($('submit-btn').textContent).toContain('Lưu');
    expect($('form-title').textContent).toBe('Sửa môn học');
    expect($('cancel-edit-btn').hidden).toBe(false);
  });

  it('Lưu thay đúng dòng và quay về chế độ thêm', () => {
    clickRowButton(1, 'edit');
    submit('Lý 2', '4', '8');
    expect(rows()).toHaveLength(2);
    expect(cells(rows()[1])).toEqual(['2', 'Lý 2', '4', '8.0', 'B+', '3.5']);
    expect($('submit-btn').textContent).toContain('Thêm môn');
    expect($('edit-index').value).toBe('');
    expect($('cancel-edit-btn').hidden).toBe(true);
  });

  it('dữ liệu sai khi sửa thì báo lỗi và vẫn ở chế độ sửa', () => {
    clickRowButton(0, 'edit');
    submit('Toán', '0', '9');
    expect($('err-credits').textContent).not.toBe('');
    expect($('edit-index').value).toBe('0');
    expect(cells(rows()[0])[2]).toBe('3');
  });

  it('Hủy không thay đổi dữ liệu', () => {
    clickRowButton(0, 'edit');
    $('subject-name').value = 'Đổi tên';
    $('cancel-edit-btn').click();
    expect(cells(rows()[0])[1]).toBe('Toán');
    expect($('subject-name').value).toBe('');
    expect($('submit-btn').textContent).toContain('Thêm môn');
  });
});

describe('F4 – xoá môn', () => {
  beforeEach(() => {
    submit('Toán', '3', '9');
    submit('Lý', '2', '7');
    submit('Hoá', '1', '5');
  });

  it('hỏi xác nhận và xoá khi đồng ý', () => {
    clickRowButton(1, 'delete');
    expect(window.confirm).toHaveBeenCalledWith('Bạn có chắc muốn xoá môn "Lý"?');
    expect(rows().map((r) => cells(r)[1])).toEqual(['Toán', 'Hoá']);
  });

  it('không xoá khi từ chối', () => {
    window.confirm.mockReturnValue(false);
    clickRowButton(1, 'delete');
    expect(rows()).toHaveLength(3);
  });

  it('xoá chính môn đang sửa thì thoát chế độ sửa (D5)', () => {
    clickRowButton(1, 'edit');
    clickRowButton(1, 'delete');
    expect($('edit-index').value).toBe('');
    expect($('subject-name').value).toBe('');
    expect($('cancel-edit-btn').hidden).toBe(true);
  });

  it('xoá môn phía trên môn đang sửa thì Lưu vẫn vào đúng môn (D5)', () => {
    clickRowButton(2, 'edit');
    clickRowButton(0, 'delete');
    expect($('edit-index').value).toBe('1');
    submit('Hoá 2', '1', '6');
    expect(rows().map((r) => cells(r)[1])).toEqual(['Lý', 'Hoá 2']);
  });
});

describe('F5 – lưu dữ liệu', () => {
  it('tải lại trang không mất dữ liệu, kể cả sau khi sửa và xoá', async () => {
    submit('Toán', '3', '9');
    submit('Lý', '2', '7');
    submit('Hoá', '1', '5');
    clickRowButton(0, 'edit');
    submit('Toán 2', '4', '8');
    clickRowButton(1, 'delete');

    await loadApp();
    expect(rows().map((r) => cells(r)[1])).toEqual(['Toán 2', 'Hoá']);
    expect($('stat-total-credits').textContent).toBe('5');
  });

  it('lưu vào key gpa-tracker:v1', () => {
    submit('Toán', '3', '8,5');
    expect(JSON.parse(localStorage.getItem('gpa-tracker:v1'))).toEqual([
      { name: 'Toán', credits: 3, score: 8.5 },
    ]);
  });

  it('dữ liệu hỏng thì khởi tạo rỗng và trang vẫn dùng được', async () => {
    localStorage.setItem('gpa-tracker:v1', '{hỏng');
    await loadApp();
    expect(rows()).toHaveLength(0);
    expect($('stat-gpa4').textContent).toBe('—');
    submit('Toán', '3', '9');
    expect(rows()).toHaveLength(1);
  });
});

describe('F5 – xoá tất cả', () => {
  it('danh sách rỗng thì không hỏi xác nhận (D6)', () => {
    $('clear-all-btn').click();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('hỏi xác nhận, xoá hết, lưu lại và hiện "—"', async () => {
    submit('Toán', '3', '9');
    submit('Lý', '2', '7');
    $('clear-all-btn').click();
    expect(window.confirm).toHaveBeenCalledWith('Bạn có chắc muốn xoá tất cả môn học?');
    expect(rows()).toHaveLength(0);
    expect($('table-empty-msg').hidden).toBe(false);
    expect($('stat-rank').textContent).toBe('—');
    await loadApp();
    expect(rows()).toHaveLength(0);
  });

  it('từ chối thì giữ nguyên', () => {
    submit('Toán', '3', '9');
    window.confirm.mockReturnValue(false);
    $('clear-all-btn').click();
    expect(rows()).toHaveLength(1);
  });

  it('đang sửa thì thoát chế độ sửa', () => {
    submit('Toán', '3', '9');
    clickRowButton(0, 'edit');
    $('clear-all-btn').click();
    expect($('edit-index').value).toBe('');
    expect($('cancel-edit-btn').hidden).toBe(true);
  });
});
