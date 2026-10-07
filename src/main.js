// Phần giao diện: gắn sự kiện vào markup có sẵn trong index.html và vẽ bảng.
// Logic thuần nằm ở các module riêng (validation.js, ...).
import { validateSubject } from './validation.js';
import { convertScore } from './grading.js';
import { calculateSummary } from './gpa.js';

const FIELDS = ['name', 'credits', 'score'];

const form = document.getElementById('subject-form');
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

/** @type {{ name: string, credits: number, score: number }[]} */
const subjects = [];

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
      tr.append(
        createCell(String(index + 1)),
        createCell(subject.name),
        createCell(String(subject.credits)),
        createCell(subject.score.toFixed(1)),
        createCell(letter),
        createCell(gpa4.toFixed(1)),
        createCell(''), // Sửa/Xoá: F4
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

  subjects.push(result.value);
  render();
  resetForm();
});

render();
