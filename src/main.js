// Phần giao diện: gắn sự kiện vào markup có sẵn trong index.html và vẽ bảng.
// Logic thuần nằm ở các module riêng (validation.js, ...).
import { validateSubject } from './validation.js';
import { convertScore } from './grading.js';
import { calculateSummary } from './gpa.js';
import { addSubject, updateSubject, removeSubject } from './subjects.js';
import { loadSubjects, saveSubjects } from './storage.js';

const FIELDS = ['name', 'credits', 'score'];
const LABELS = {
  addTitle: 'Thêm môn học',
  editTitle: 'Sửa môn học',
  addButton: '➕ Thêm môn',
  saveButton: '💾 Lưu',
};

const form = document.getElementById('subject-form');
const formTitle = document.getElementById('form-title');
const editIndexInput = document.getElementById('edit-index');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const inputs = {
  name: document.getElementById('subject-name'),
  credits: document.getElementById('subject-credits'),
  score: document.getElementById('subject-score'),
};
const errorEls = {
  name: document.getElementById('err-name'),
  credits: document.getElementById('err-credits'),
  score: document.getElementById('err-score'),
};
const tbody = document.getElementById('subjects-tbody');
const tableEmptyMsg = document.getElementById('table-empty-msg');
const stats = {
  totalSubjects: document.getElementById('stat-total-subjects'),
  totalCredits: document.getElementById('stat-total-credits'),
  passedCredits: document.getElementById('stat-passed-credits'),
  gpa4: document.getElementById('stat-gpa4'),
  gpa10: document.getElementById('stat-gpa10'),
  rank: document.getElementById('stat-rank'),
};
const emptyHint = document.getElementById('empty-hint');
const clearAllBtn = document.getElementById('clear-all-btn');

/** @type {{ name: string, credits: number, score: number }[]} */
let subjects = loadSubjects();
/** Dòng đang sửa, null khi ở chế độ thêm. Ghi kèm vào ô ẩn #edit-index. */
let editIndex = null;

function clearErrors() {
  for (const field of FIELDS) {
    errorEls[field].textContent = '';
    inputs[field].removeAttribute('aria-invalid');
  }
}

function showErrors(errors) {
  for (const field of FIELDS) {
    if (!errors[field]) continue;
    errorEls[field].textContent = errors[field];
    inputs[field].setAttribute('aria-invalid', 'true');
  }
  // Đặt con trỏ vào ô lỗi đầu tiên theo thứ tự trên form.
  const firstInvalid = FIELDS.find((field) => errors[field]);
  inputs[firstInvalid].focus();
}

function resetForm() {
  form.reset();
  clearErrors();
  inputs.name.focus();
}

function setEditIndex(index) {
  editIndex = index;
  editIndexInput.value = index === null ? '' : String(index);
}

function enterEditMode(index) {
  const subject = subjects[index];
  setEditIndex(index);
  clearErrors();
  inputs.name.value = subject.name;
  inputs.credits.value = String(subject.credits);
  inputs.score.value = String(subject.score);
  formTitle.textContent = LABELS.editTitle;
  submitBtn.textContent = LABELS.saveButton;
  cancelEditBtn.hidden = false;
  renderTable();
  inputs.name.focus();
}

function exitEditMode() {
  setEditIndex(null);
  formTitle.textContent = LABELS.addTitle;
  submitBtn.textContent = LABELS.addButton;
  cancelEditBtn.hidden = true;
  resetForm();
}

function createActionButton(label, action, index, variant) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn--sm ${variant}`;
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.index = String(index);
  return button;
}

function createCell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function renderTable() {
  tbody.replaceChildren(
    ...subjects.map((subject, index) => {
      const { letter, gpa4 } = convertScore(subject.score);
      const tr = document.createElement('tr');
      if (index === editIndex) tr.classList.add('row--editing');

      const actions = document.createElement('td');
      actions.className = 'row-actions';
      actions.append(
        createActionButton('✏️ Sửa', 'edit', index, 'btn--secondary'),
        createActionButton('🗑️ Xoá', 'delete', index, 'btn--danger'),
      );

      tr.append(
        createCell(String(index + 1)),
        createCell(subject.name),
        createCell(String(subject.credits)),
        createCell(subject.score.toFixed(1)),
        createCell(letter),
        createCell(gpa4.toFixed(1)),
        actions,
      );
      return tr;
    }),
  );
  tableEmptyMsg.hidden = subjects.length > 0;
}

function renderSummary() {
  const summary = calculateSummary(subjects);
  emptyHint.hidden = summary !== null;

  if (summary === null) {
    for (const el of Object.values(stats)) el.textContent = '—';
    return;
  }

  stats.totalSubjects.textContent = String(summary.totalSubjects);
  stats.totalCredits.textContent = String(summary.totalCredits);
  stats.passedCredits.textContent = String(summary.passedCredits);
  stats.gpa4.textContent = summary.gpa4.toFixed(2);
  stats.gpa10.textContent = summary.gpa10.toFixed(2);
  stats.rank.textContent = summary.rank;
}

function render() {
  renderTable();
  renderSummary();
}

/** Cập nhật danh sách, lưu localStorage (F5) rồi vẽ lại. */
function setSubjects(next) {
  subjects = next;
  saveSubjects(subjects);
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();

  const result = validateSubject({
    name: inputs.name.value,
    // Ô number trả về "" khi gõ chữ; badInput giúp phân biệt với bỏ trống.
    credits: inputs.credits.validity.badInput ? 'NaN' : inputs.credits.value,
    score: inputs.score.value,
  });

  if (!result.ok) {
    showErrors(result.errors);
    return;
  }

  if (editIndex === null) {
    setSubjects(addSubject(subjects, result.value));
    resetForm();
  } else {
    const index = editIndex;
    exitEditMode();
    setSubjects(updateSubject(subjects, index, result.value));
  }
});

cancelEditBtn.addEventListener('click', () => {
  exitEditMode();
  renderTable();
});

function deleteSubject(index) {
  const { name } = subjects[index];
  if (!window.confirm(`Bạn có chắc muốn xoá môn "${name}"?`)) return;

  const wasEditing = editIndex !== null;
  const result = removeSubject(subjects, index, editIndex);
  if (wasEditing && result.editIndex === null) exitEditMode();
  else setEditIndex(result.editIndex);
  setSubjects(result.subjects);
}

clearAllBtn.addEventListener('click', () => {
  if (subjects.length === 0) return; // D6
  if (!window.confirm('Bạn có chắc muốn xoá tất cả môn học?')) return;
  if (editIndex !== null) exitEditMode();
  setSubjects([]);
});

tbody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.action === 'edit') enterEditMode(index);
  else if (button.dataset.action === 'delete') deleteSubject(index);
});

render();
