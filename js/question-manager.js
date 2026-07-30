const DRAFT_STORAGE_KEY = "englishQuestQuestionDraft";

const managerState = {
  data: { categories: [] },
  selectedCategoryIndex: 0,
  editingQuestionIndex: null
};

const elements = {
  status: document.getElementById("manager-status"),
  categoryList: document.getElementById("category-manager-list"),
  questionList: document.getElementById("question-manager-list"),
  questionTotal: document.getElementById("question-total"),
  categoryForm: document.getElementById("category-form"),
  categoryId: document.getElementById("category-id"),
  categoryName: document.getElementById("category-name-input"),
  categoryDescription: document.getElementById("category-description"),
  categoryLesson: document.getElementById("category-lesson"),
  deleteCategory: document.getElementById("delete-category-button"),
  questionForm: document.getElementById("question-form"),
  questionEditorTitle: document.getElementById("question-editor-title"),
  question: document.getElementById("question-input"),
  hint: document.getElementById("hint-input"),
  choices: [0, 1, 2, 3].map(index => document.getElementById(`choice-${index}`)),
  correctIndex: document.getElementById("correct-index"),
  answer: document.getElementById("answer-input"),
  explanation: document.getElementById("explanation-input"),
  point: document.getElementById("point-input"),
  deleteQuestion: document.getElementById("delete-question-button")
};

function showStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.className = `manager-status ${type}`.trim();
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function validateData(data) {
  if (!data || !Array.isArray(data.categories)) {
    throw new Error("categories配列がありません。");
  }

  const ids = new Set();
  data.categories.forEach((category, categoryIndex) => {
    if (!category.id || !category.name || !Array.isArray(category.questions)) {
      throw new Error(`${categoryIndex + 1}番目のカテゴリ形式が正しくありません。`);
    }
    if (ids.has(category.id)) throw new Error(`カテゴリID「${category.id}」が重複しています。`);
    ids.add(category.id);

    category.questions.forEach((question, questionIndex) => {
      if (!question.question || !Array.isArray(question.choices) || question.choices.length < 2) {
        throw new Error(`${category.name}の${questionIndex + 1}問目の形式が正しくありません。`);
      }
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
        throw new Error(`${category.name}の${questionIndex + 1}問目の正解番号が不正です。`);
      }
    });
  });
  return data;
}

async function fetchPublishedData() {
  const response = await fetch("data/questions.json", { cache: "no-store" });
  if (!response.ok) throw new Error("公開中の問題データを読み込めませんでした。");
  return validateData(await response.json());
}

function getCurrentCategory() {
  return managerState.data.categories[managerState.selectedCategoryIndex] || null;
}

function renderAll() {
  renderCategories();
  renderCategoryForm();
  renderQuestions();
  closeQuestionEditor();
}

function renderCategories() {
  elements.categoryList.innerHTML = "";
  managerState.data.categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-manager-button${index === managerState.selectedCategoryIndex ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(category.name)}</strong><small>${category.questions.length}問 · ${escapeHtml(category.id)}</small>`;
    button.addEventListener("click", () => {
      managerState.selectedCategoryIndex = index;
      renderAll();
    });
    elements.categoryList.appendChild(button);
  });

  if (managerState.data.categories.length === 0) {
    elements.categoryList.innerHTML = '<p class="empty-message">カテゴリがありません。</p>';
  }
}

function renderCategoryForm() {
  const category = getCurrentCategory();
  elements.categoryForm.classList.toggle("hidden", !category);
  elements.deleteCategory.disabled = !category;
  if (!category) return;

  elements.categoryId.value = category.id;
  elements.categoryName.value = category.name;
  elements.categoryDescription.value = category.description || "";
  elements.categoryLesson.value = category.lesson || "";
}

function renderQuestions() {
  const category = getCurrentCategory();
  elements.questionList.innerHTML = "";
  elements.questionTotal.textContent = category ? `（${category.questions.length}問）` : "";

  if (!category || category.questions.length === 0) {
    elements.questionList.innerHTML = '<p class="empty-message">問題がありません。「問題追加」から作成できます。</p>';
    return;
  }

  category.questions.forEach((question, index) => {
    const item = document.createElement("article");
    item.className = "question-manager-item";
    item.innerHTML = `
      <span class="question-manager-number">${index + 1}</span>
      <span class="question-manager-copy">
        <strong>${escapeHtml(question.question)}</strong>
        <small>正解：${escapeHtml(question.choices[question.correctIndex])}</small>
      </span>
      <button type="button">編集</button>
    `;
    item.querySelector("button").addEventListener("click", () => openQuestionEditor(index));
    elements.questionList.appendChild(item);
  });
}

function addCategory() {
  const usedIds = new Set(managerState.data.categories.map(category => category.id));
  let suffix = managerState.data.categories.length + 1;
  while (usedIds.has(`new-category-${suffix}`)) suffix += 1;

  managerState.data.categories.push({
    id: `new-category-${suffix}`,
    name: "新しいカテゴリ",
    description: "",
    lesson: "",
    questions: []
  });
  managerState.selectedCategoryIndex = managerState.data.categories.length - 1;
  renderAll();
  elements.categoryName.focus();
  showStatus("新しいカテゴリを追加しました。内容を入力して反映してください。");
}

function applyCategory(event) {
  event.preventDefault();
  const category = getCurrentCategory();
  if (!category) return;

  const newId = elements.categoryId.value.trim();
  const duplicated = managerState.data.categories.some((item, index) =>
    index !== managerState.selectedCategoryIndex && item.id === newId
  );
  if (duplicated) {
    showStatus(`カテゴリID「${newId}」は既に使われています。`, "error");
    return;
  }

  category.id = newId;
  category.name = elements.categoryName.value.trim();
  category.description = elements.categoryDescription.value.trim();
  category.lesson = elements.categoryLesson.value.trim();
  renderCategories();
  showStatus("カテゴリ設定を反映しました。下書き保存またはJSONダウンロードを行ってください。", "success");
}

function deleteCategory() {
  const category = getCurrentCategory();
  if (!category) return;
  if (!window.confirm(`「${category.name}」と、その中の${category.questions.length}問を削除しますか？`)) return;

  managerState.data.categories.splice(managerState.selectedCategoryIndex, 1);
  managerState.selectedCategoryIndex = Math.max(0, managerState.selectedCategoryIndex - 1);
  renderAll();
  showStatus("カテゴリを削除しました。");
}

function openQuestionEditor(index = null) {
  const category = getCurrentCategory();
  if (!category) {
    showStatus("先にカテゴリを追加してください。", "error");
    return;
  }

  managerState.editingQuestionIndex = index;
  const question = index === null ? {
    question: "", hint: "", choices: ["", ""], correctIndex: 0,
    answer: "", explanation: "", point: ""
  } : category.questions[index];

  elements.questionEditorTitle.textContent = index === null ? "問題を追加" : `${index + 1}問目を編集`;
  elements.question.value = question.question;
  elements.hint.value = question.hint || "";
  elements.choices.forEach((input, choiceIndex) => {
    input.value = question.choices[choiceIndex] || "";
  });
  elements.correctIndex.value = String(question.correctIndex);
  elements.answer.value = question.answer || "";
  elements.explanation.value = question.explanation || "";
  elements.point.value = question.point || "";
  elements.deleteQuestion.classList.toggle("hidden", index === null);
  elements.questionForm.classList.remove("hidden");
  elements.questionForm.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.question.focus({ preventScroll: true });
}

function closeQuestionEditor() {
  managerState.editingQuestionIndex = null;
  elements.questionForm.classList.add("hidden");
}

function applyQuestion(event) {
  event.preventDefault();
  const category = getCurrentCategory();
  if (!category) return;

  const rawChoices = elements.choices.map(input => input.value.trim());
  const lastFilledIndex = rawChoices.reduce((last, choice, index) => choice ? index : last, -1);
  const choices = rawChoices.slice(0, lastFilledIndex + 1);
  const correctIndex = Number(elements.correctIndex.value);
  if (choices.some(choice => !choice)) {
    showStatus("選択肢は途中を空欄にせず、上から順番に入力してください。", "error");
    return;
  }
  if (choices.length < 2) {
    showStatus("選択肢は2つ以上入力してください。", "error");
    return;
  }
  if (correctIndex >= choices.length) {
    showStatus("正解に指定した選択肢を入力してください。", "error");
    return;
  }

  const question = {
    question: elements.question.value.trim(),
    hint: elements.hint.value.trim(),
    choices,
    correctIndex,
    answer: elements.answer.value.trim(),
    explanation: elements.explanation.value.trim(),
    point: elements.point.value.trim()
  };

  if (managerState.editingQuestionIndex === null) {
    category.questions.push(question);
  } else {
    category.questions[managerState.editingQuestionIndex] = question;
  }
  renderQuestions();
  closeQuestionEditor();
  showStatus("問題を反映しました。下書き保存またはJSONダウンロードを行ってください。", "success");
}

function deleteQuestion() {
  const category = getCurrentCategory();
  const index = managerState.editingQuestionIndex;
  if (!category || index === null) return;
  if (!window.confirm(`${index + 1}問目を削除しますか？`)) return;

  category.questions.splice(index, 1);
  renderQuestions();
  closeQuestionEditor();
  showStatus("問題を削除しました。");
}

function saveDraft() {
  validateData(managerState.data);
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(managerState.data));
  showStatus("このブラウザに下書きを保存しました。", "success");
}

function downloadJson() {
  validateData(managerState.data);
  const content = `${JSON.stringify(managerState.data, null, 2)}\n`;
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "questions.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showStatus("questions.jsonをダウンロードしました。公開するにはdata/questions.jsonと置き換えてください。", "success");
}

async function importJson(file) {
  if (!file) return;
  try {
    const imported = validateData(JSON.parse(await file.text()));
    managerState.data = cloneData(imported);
    managerState.selectedCategoryIndex = 0;
    renderAll();
    showStatus(`${file.name}を読み込みました。`, "success");
  } catch (error) {
    showStatus(`読み込み失敗：${error.message}`, "error");
  }
}

async function reloadPublishedData() {
  if (!window.confirm("現在の編集内容を破棄し、公開中のquestions.jsonを読み込みますか？")) return;
  managerState.data = cloneData(await fetchPublishedData());
  managerState.selectedCategoryIndex = 0;
  renderAll();
  showStatus("公開中の問題データを再読み込みしました。", "success");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function initializeManager() {
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      managerState.data = cloneData(validateData(JSON.parse(savedDraft)));
      showStatus("このブラウザに保存された下書きを開きました。", "success");
    } else {
      managerState.data = cloneData(await fetchPublishedData());
      showStatus("公開中の問題データを読み込みました。");
    }
    renderAll();
  } catch (error) {
    showStatus(`初期化失敗：${error.message}`, "error");
  }
}

document.getElementById("add-category-button").addEventListener("click", addCategory);
elements.categoryForm.addEventListener("submit", applyCategory);
elements.deleteCategory.addEventListener("click", deleteCategory);
document.getElementById("add-question-button").addEventListener("click", () => openQuestionEditor());
elements.questionForm.addEventListener("submit", applyQuestion);
document.getElementById("close-question-button").addEventListener("click", closeQuestionEditor);
elements.deleteQuestion.addEventListener("click", deleteQuestion);
document.getElementById("save-draft-button").addEventListener("click", saveDraft);
document.getElementById("download-button").addEventListener("click", downloadJson);
document.getElementById("import-file").addEventListener("change", event => importJson(event.target.files[0]));
document.getElementById("reload-button").addEventListener("click", () => {
  reloadPublishedData().catch(error => showStatus(`再読込失敗：${error.message}`, "error"));
});

initializeManager();
