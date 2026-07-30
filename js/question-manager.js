const DRAFT_STORAGE_KEY = "englishQuestQuestionDraft";

const managerState = {
  data: { version: 2, grammarUnits: [], vocabularyUnits: [] },
  mode: "grammar",
  selectedGrammarIndex: 0,
  selectedVocabularyIndex: 0,
  editingQuestionIndex: null,
  editingWordIndex: null
};

const byId = id => document.getElementById(id);
const elements = {
  status: byId("manager-status"),
  grammarManager: byId("grammar-manager"),
  vocabularyManager: byId("vocabulary-manager"),
  modeTabs: [...document.querySelectorAll(".manager-mode-tab")],

  categoryList: byId("category-manager-list"),
  questionList: byId("question-manager-list"),
  questionTotal: byId("question-total"),
  categoryForm: byId("category-form"),
  categoryId: byId("category-id"),
  categoryName: byId("category-name-input"),
  categoryGrade: byId("category-grade"),
  categoryOrder: byId("category-order"),
  categoryDrawCount: byId("category-draw-count"),
  categoryPriority: byId("category-priority"),
  categoryDescription: byId("category-description"),
  categoryLesson: byId("category-lesson"),
  deleteCategory: byId("delete-category-button"),
  questionForm: byId("question-form"),
  questionEditorTitle: byId("question-editor-title"),
  question: byId("question-input"),
  hint: byId("hint-input"),
  choices: [0, 1, 2, 3].map(index => byId(`choice-${index}`)),
  correctIndex: byId("correct-index"),
  answer: byId("answer-input"),
  explanation: byId("explanation-input"),
  point: byId("point-input"),
  deleteQuestion: byId("delete-question-button"),

  vocabularyUnitList: byId("vocabulary-unit-list"),
  vocabularyUnitForm: byId("vocabulary-unit-form"),
  vocabularyUnitId: byId("vocabulary-unit-id"),
  vocabularyUnitName: byId("vocabulary-unit-name"),
  vocabularyUnitGrade: byId("vocabulary-unit-grade"),
  vocabularyUnitStep: byId("vocabulary-unit-step"),
  vocabularyUnitOrder: byId("vocabulary-unit-order"),
  vocabularyUnitDrawCount: byId("vocabulary-unit-draw-count"),
  vocabularyUnitDescription: byId("vocabulary-unit-description"),
  deleteVocabularyUnit: byId("delete-vocabulary-unit-button"),
  wordList: byId("word-list"),
  wordTotal: byId("word-total"),
  wordForm: byId("word-form"),
  wordEditorTitle: byId("word-editor-title"),
  wordId: byId("word-id"),
  word: byId("word-input"),
  wordMeaning: byId("word-meaning"),
  wordPartOfSpeech: byId("word-part-of-speech"),
  wordExample: byId("word-example"),
  wordExampleJa: byId("word-example-ja"),
  wordNote: byId("word-note"),
  deleteWord: byId("delete-word-button")
};

function showStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.className = `manager-status ${type}`.trim();
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeData(data) {
  return {
    version: 2,
    grammarUnits: data.grammarUnits || data.categories || [],
    vocabularyUnits: data.vocabularyUnits || []
  };
}

function validateData(rawData) {
  const data = normalizeData(rawData);
  const ids = new Set();

  data.grammarUnits.forEach((unit, unitIndex) => {
    if (!unit.id || !unit.name || !Number.isInteger(Number(unit.grade)) || !Array.isArray(unit.questions)) {
      throw new Error(`${unitIndex + 1}番目の文法単元の形式が正しくありません。`);
    }
    assertUniqueId(ids, unit.id, "単元");
    unit.questions.forEach((question, questionIndex) => {
      if (!question.question || !Array.isArray(question.choices) || question.choices.length < 2) {
        throw new Error(`${unit.name}の${questionIndex + 1}問目の形式が正しくありません。`);
      }
      if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
        throw new Error(`${unit.name}の${questionIndex + 1}問目の正解番号が不正です。`);
      }
    });
  });

  data.vocabularyUnits.forEach((unit, unitIndex) => {
    if (!unit.id || !unit.name || !Number.isInteger(Number(unit.grade)) || !Array.isArray(unit.words)) {
      throw new Error(`${unitIndex + 1}番目の単語ステップの形式が正しくありません。`);
    }
    assertUniqueId(ids, unit.id, "単元");
    const wordIds = new Set();
    unit.words.forEach((word, wordIndex) => {
      if (!word.id || !word.word || !Array.isArray(word.meanings) || !word.meanings[0] || !word.partOfSpeech) {
        throw new Error(`${unit.name}の${wordIndex + 1}語目の形式が正しくありません。`);
      }
      assertUniqueId(wordIds, word.id, "単語");
    });
  });
  return data;
}

function assertUniqueId(ids, id, label) {
  if (ids.has(id)) throw new Error(`${label}ID「${id}」が重複しています。`);
  ids.add(id);
}

async function fetchPublishedData() {
  const response = await fetch("data/questions.json", { cache: "no-store" });
  if (!response.ok) throw new Error("公開中の問題データを読み込めませんでした。");
  return validateData(await response.json());
}

function getCurrentGrammarUnit() {
  return managerState.data.grammarUnits[managerState.selectedGrammarIndex] || null;
}

function getCurrentVocabularyUnit() {
  return managerState.data.vocabularyUnits[managerState.selectedVocabularyIndex] || null;
}

function setMode(mode) {
  managerState.mode = mode;
  elements.modeTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.managerMode === mode));
  elements.grammarManager.classList.toggle("hidden", mode !== "grammar");
  elements.vocabularyManager.classList.toggle("hidden", mode !== "vocabulary");
  closeQuestionEditor();
  closeWordEditor();
}

function renderAll() {
  renderGrammar();
  renderVocabulary();
  setMode(managerState.mode);
}

function renderGrammar() {
  renderGrammarUnits();
  renderGrammarUnitForm();
  renderQuestions();
  closeQuestionEditor();
}

function renderGrammarUnits() {
  elements.categoryList.innerHTML = "";
  managerState.data.grammarUnits.forEach((unit, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-manager-button${index === managerState.selectedGrammarIndex ? " active" : ""}`;
    button.innerHTML = `<strong>中${unit.grade} ${escapeHtml(unit.name)}</strong><small>${unit.questions.length}問 · ${escapeHtml(unit.id)}</small>`;
    button.addEventListener("click", () => {
      managerState.selectedGrammarIndex = index;
      renderGrammar();
    });
    elements.categoryList.appendChild(button);
  });
  if (!managerState.data.grammarUnits.length) {
    elements.categoryList.innerHTML = '<p class="empty-message">文法単元がありません。</p>';
  }
}

function renderGrammarUnitForm() {
  const unit = getCurrentGrammarUnit();
  elements.categoryForm.classList.toggle("hidden", !unit);
  if (!unit) return;
  elements.categoryId.value = unit.id;
  elements.categoryName.value = unit.name;
  elements.categoryGrade.value = String(unit.grade || 1);
  elements.categoryOrder.value = unit.order || 1;
  elements.categoryDrawCount.value = unit.drawCount || 10;
  elements.categoryPriority.value = unit.priority || "normal";
  elements.categoryDescription.value = unit.description || "";
  elements.categoryLesson.value = unit.lesson || "";
}

function renderQuestions() {
  const unit = getCurrentGrammarUnit();
  elements.questionList.innerHTML = "";
  elements.questionTotal.textContent = unit ? `（${unit.questions.length}問）` : "";
  if (!unit || !unit.questions.length) {
    elements.questionList.innerHTML = '<p class="empty-message">問題がありません。</p>';
    return;
  }
  unit.questions.forEach((question, index) => {
    elements.questionList.appendChild(createListItem(index, question.question, `正解：${question.choices[question.correctIndex]}`, () => openQuestionEditor(index)));
  });
}

function createListItem(index, title, subtitle, onEdit) {
  const item = document.createElement("article");
  item.className = "question-manager-item";
  item.innerHTML = `
    <span class="question-manager-number">${index + 1}</span>
    <span class="question-manager-copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(subtitle)}</small></span>
    <button type="button">編集</button>`;
  item.querySelector("button").addEventListener("click", onEdit);
  return item;
}

function addGrammarUnit() {
  const order = managerState.data.grammarUnits.length + 1;
  const id = createUnusedId("new-grammar-unit", managerState.data.grammarUnits);
  managerState.data.grammarUnits.push({
    id, grade: 1, order, drawCount: 10, priority: "normal",
    name: "新しい文法単元", description: "", lesson: "", questions: []
  });
  managerState.selectedGrammarIndex = managerState.data.grammarUnits.length - 1;
  renderGrammar();
  elements.categoryName.focus();
  showStatus("文法単元を追加しました。");
}

function applyGrammarUnit(event) {
  event.preventDefault();
  const unit = getCurrentGrammarUnit();
  if (!unit) return;
  const id = elements.categoryId.value.trim();
  if (isDuplicateId(id, managerState.data.grammarUnits, managerState.selectedGrammarIndex)) {
    showStatus(`単元ID「${id}」は既に使われています。`, "error");
    return;
  }
  Object.assign(unit, {
    id,
    name: elements.categoryName.value.trim(),
    grade: Number(elements.categoryGrade.value),
    order: Number(elements.categoryOrder.value),
    drawCount: Number(elements.categoryDrawCount.value),
    priority: elements.categoryPriority.value,
    description: elements.categoryDescription.value.trim(),
    lesson: elements.categoryLesson.value.trim()
  });
  renderGrammarUnits();
  showStatus("文法単元の設定を反映しました。", "success");
}

function deleteGrammarUnit() {
  const unit = getCurrentGrammarUnit();
  if (!unit || !window.confirm(`「${unit.name}」と${unit.questions.length}問を削除しますか？`)) return;
  managerState.data.grammarUnits.splice(managerState.selectedGrammarIndex, 1);
  managerState.selectedGrammarIndex = Math.max(0, managerState.selectedGrammarIndex - 1);
  renderGrammar();
  showStatus("文法単元を削除しました。");
}

function openQuestionEditor(index = null) {
  const unit = getCurrentGrammarUnit();
  if (!unit) return showStatus("先に文法単元を追加してください。", "error");
  managerState.editingQuestionIndex = index;
  const question = index === null
    ? { question: "", hint: "", choices: ["", ""], correctIndex: 0, answer: "", explanation: "", point: "" }
    : unit.questions[index];
  elements.questionEditorTitle.textContent = index === null ? "問題を追加" : `${index + 1}問目を編集`;
  elements.question.value = question.question;
  elements.hint.value = question.hint || "";
  elements.choices.forEach((input, choiceIndex) => { input.value = question.choices[choiceIndex] || ""; });
  elements.correctIndex.value = String(question.correctIndex);
  elements.answer.value = question.answer || "";
  elements.explanation.value = question.explanation || "";
  elements.point.value = question.point || "";
  elements.deleteQuestion.classList.toggle("hidden", index === null);
  elements.questionForm.classList.remove("hidden");
  elements.questionForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeQuestionEditor() {
  managerState.editingQuestionIndex = null;
  elements.questionForm.classList.add("hidden");
}

function applyQuestion(event) {
  event.preventDefault();
  const unit = getCurrentGrammarUnit();
  if (!unit) return;
  const rawChoices = elements.choices.map(input => input.value.trim());
  const lastFilledIndex = rawChoices.reduce((last, choice, index) => choice ? index : last, -1);
  const choices = rawChoices.slice(0, lastFilledIndex + 1);
  const correctIndex = Number(elements.correctIndex.value);
  if (choices.length < 2 || choices.some(choice => !choice)) {
    return showStatus("選択肢は上から順番に2つ以上入力してください。", "error");
  }
  if (correctIndex >= choices.length) return showStatus("正解に指定した選択肢を入力してください。", "error");
  const previous = managerState.editingQuestionIndex === null ? {} : unit.questions[managerState.editingQuestionIndex];
  const question = {
    ...previous,
    id: previous.id || createQuestionId(unit),
    type: previous.type || "choice",
    question: elements.question.value.trim(),
    hint: elements.hint.value.trim(),
    choices,
    correctIndex,
    answer: elements.answer.value.trim(),
    explanation: elements.explanation.value.trim(),
    point: elements.point.value.trim()
  };
  if (managerState.editingQuestionIndex === null) unit.questions.push(question);
  else unit.questions[managerState.editingQuestionIndex] = question;
  renderQuestions();
  closeQuestionEditor();
  showStatus("文法問題を反映しました。", "success");
}

function deleteQuestion() {
  const unit = getCurrentGrammarUnit();
  const index = managerState.editingQuestionIndex;
  if (!unit || index === null || !window.confirm(`${index + 1}問目を削除しますか？`)) return;
  unit.questions.splice(index, 1);
  renderQuestions();
  closeQuestionEditor();
  showStatus("文法問題を削除しました。");
}

function renderVocabulary() {
  renderVocabularyUnits();
  renderVocabularyUnitForm();
  renderWords();
  closeWordEditor();
}

function renderVocabularyUnits() {
  elements.vocabularyUnitList.innerHTML = "";
  managerState.data.vocabularyUnits.forEach((unit, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-manager-button${index === managerState.selectedVocabularyIndex ? " active" : ""}`;
    button.innerHTML = `<strong>中${unit.grade} ${escapeHtml(unit.name)}</strong><small>${unit.words.length}語 · ${escapeHtml(unit.id)}</small>`;
    button.addEventListener("click", () => {
      managerState.selectedVocabularyIndex = index;
      renderVocabulary();
    });
    elements.vocabularyUnitList.appendChild(button);
  });
  if (!managerState.data.vocabularyUnits.length) {
    elements.vocabularyUnitList.innerHTML = '<p class="empty-message">単語ステップがありません。</p>';
  }
}

function renderVocabularyUnitForm() {
  const unit = getCurrentVocabularyUnit();
  elements.vocabularyUnitForm.classList.toggle("hidden", !unit);
  if (!unit) return;
  elements.vocabularyUnitId.value = unit.id;
  elements.vocabularyUnitName.value = unit.name;
  elements.vocabularyUnitGrade.value = String(unit.grade || 1);
  elements.vocabularyUnitStep.value = unit.step || 1;
  elements.vocabularyUnitOrder.value = unit.order || 1;
  elements.vocabularyUnitDrawCount.value = unit.drawCount || 10;
  elements.vocabularyUnitDescription.value = unit.description || "";
}

function renderWords() {
  const unit = getCurrentVocabularyUnit();
  elements.wordList.innerHTML = "";
  elements.wordTotal.textContent = unit ? `（${unit.words.length}語）` : "";
  if (!unit || !unit.words.length) {
    elements.wordList.innerHTML = '<p class="empty-message">単語がありません。</p>';
    return;
  }
  unit.words.forEach((word, index) => {
    elements.wordList.appendChild(createListItem(index, word.word, `${word.meanings.join("、")} · ${partOfSpeechLabel(word.partOfSpeech)}`, () => openWordEditor(index)));
  });
}

function addVocabularyUnit() {
  const id = createUnusedId("new-vocabulary-unit", managerState.data.vocabularyUnits);
  managerState.data.vocabularyUnits.push({
    id, grade: 1, step: 1, order: managerState.data.vocabularyUnits.length + 1,
    drawCount: 10, name: "新しい単語ステップ", description: "", words: []
  });
  managerState.selectedVocabularyIndex = managerState.data.vocabularyUnits.length - 1;
  renderVocabulary();
  elements.vocabularyUnitName.focus();
  showStatus("単語ステップを追加しました。");
}

function applyVocabularyUnit(event) {
  event.preventDefault();
  const unit = getCurrentVocabularyUnit();
  if (!unit) return;
  const id = elements.vocabularyUnitId.value.trim();
  const allOtherUnits = [
    ...managerState.data.grammarUnits,
    ...managerState.data.vocabularyUnits.filter((_, index) => index !== managerState.selectedVocabularyIndex)
  ];
  if (allOtherUnits.some(item => item.id === id)) return showStatus(`単元ID「${id}」は既に使われています。`, "error");
  Object.assign(unit, {
    id,
    name: elements.vocabularyUnitName.value.trim(),
    grade: Number(elements.vocabularyUnitGrade.value),
    step: Number(elements.vocabularyUnitStep.value),
    order: Number(elements.vocabularyUnitOrder.value),
    drawCount: Number(elements.vocabularyUnitDrawCount.value),
    description: elements.vocabularyUnitDescription.value.trim()
  });
  renderVocabularyUnits();
  showStatus("単語ステップの設定を反映しました。", "success");
}

function deleteVocabularyUnit() {
  const unit = getCurrentVocabularyUnit();
  if (!unit || !window.confirm(`「${unit.name}」と${unit.words.length}語を削除しますか？`)) return;
  managerState.data.vocabularyUnits.splice(managerState.selectedVocabularyIndex, 1);
  managerState.selectedVocabularyIndex = Math.max(0, managerState.selectedVocabularyIndex - 1);
  renderVocabulary();
  showStatus("単語ステップを削除しました。");
}

function openWordEditor(index = null) {
  const unit = getCurrentVocabularyUnit();
  if (!unit) return showStatus("先に単語ステップを追加してください。", "error");
  managerState.editingWordIndex = index;
  const word = index === null
    ? { id: "", word: "", meanings: [""], partOfSpeech: "verb", example: "", exampleJa: "", note: "" }
    : unit.words[index];
  elements.wordEditorTitle.textContent = index === null ? "単語を追加" : `${index + 1}語目を編集`;
  elements.wordId.value = word.id;
  elements.word.value = word.word;
  elements.wordMeaning.value = word.meanings.join("、");
  elements.wordPartOfSpeech.value = word.partOfSpeech;
  elements.wordExample.value = word.example || "";
  elements.wordExampleJa.value = word.exampleJa || "";
  elements.wordNote.value = word.note || "";
  elements.deleteWord.classList.toggle("hidden", index === null);
  elements.wordForm.classList.remove("hidden");
  elements.wordForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeWordEditor() {
  managerState.editingWordIndex = null;
  elements.wordForm.classList.add("hidden");
}

function applyWord(event) {
  event.preventDefault();
  const unit = getCurrentVocabularyUnit();
  if (!unit) return;
  const id = elements.wordId.value.trim();
  if (isDuplicateId(id, unit.words, managerState.editingWordIndex)) return showStatus(`単語ID「${id}」は既に使われています。`, "error");
  const previous = managerState.editingWordIndex === null ? {} : unit.words[managerState.editingWordIndex];
  const word = {
    ...previous,
    id,
    word: elements.word.value.trim(),
    meanings: elements.wordMeaning.value.split(/[、,]/).map(value => value.trim()).filter(Boolean),
    partOfSpeech: elements.wordPartOfSpeech.value,
    grade: unit.grade,
    step: unit.step,
    order: previous.order || unit.words.length + 1,
    example: elements.wordExample.value.trim(),
    exampleJa: elements.wordExampleJa.value.trim(),
    note: elements.wordNote.value.trim()
  };
  if (managerState.editingWordIndex === null) unit.words.push(word);
  else unit.words[managerState.editingWordIndex] = word;
  renderWords();
  closeWordEditor();
  showStatus("単語を反映しました。", "success");
}

function deleteWord() {
  const unit = getCurrentVocabularyUnit();
  const index = managerState.editingWordIndex;
  if (!unit || index === null || !window.confirm(`「${unit.words[index].word}」を削除しますか？`)) return;
  unit.words.splice(index, 1);
  renderWords();
  closeWordEditor();
  showStatus("単語を削除しました。");
}

function saveDraft() {
  const validated = validateData(managerState.data);
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(validated));
  showStatus("このブラウザに下書きを保存しました。", "success");
}

function downloadJson() {
  const validated = validateData(managerState.data);
  const blob = new Blob([`${JSON.stringify(validated, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "questions.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showStatus("questions.jsonをダウンロードしました。", "success");
}

async function importJson(file) {
  if (!file) return;
  try {
    managerState.data = cloneData(validateData(JSON.parse(await file.text())));
    managerState.selectedGrammarIndex = 0;
    managerState.selectedVocabularyIndex = 0;
    renderAll();
    showStatus(`${file.name}を読み込みました。`, "success");
  } catch (error) {
    showStatus(`読み込み失敗：${error.message}`, "error");
  }
}

async function reloadPublishedData() {
  if (!window.confirm("現在の編集内容を破棄し、公開中データを読み込みますか？")) return;
  managerState.data = cloneData(await fetchPublishedData());
  managerState.selectedGrammarIndex = 0;
  managerState.selectedVocabularyIndex = 0;
  renderAll();
  showStatus("公開中の問題データを再読み込みしました。", "success");
}

function createUnusedId(base, items) {
  let number = items.length + 1;
  let id = `${base}-${number}`;
  while (items.some(item => item.id === id)) id = `${base}-${++number}`;
  return id;
}

function createQuestionId(unit) {
  const used = new Set(unit.questions.map(question => question.id).filter(Boolean));
  let number = unit.questions.length + 1;
  let id = `${unit.id}-${String(number).padStart(3, "0")}`;
  while (used.has(id)) id = `${unit.id}-${String(++number).padStart(3, "0")}`;
  return id;
}

function isDuplicateId(id, items, currentIndex) {
  return items.some((item, index) => index !== currentIndex && item.id === id);
}

function partOfSpeechLabel(value) {
  return {
    verb: "動詞", noun: "名詞", adjective: "形容詞", adverb: "副詞",
    pronoun: "代名詞", preposition: "前置詞", conjunction: "接続詞", phrase: "熟語・表現"
  }[value] || value;
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
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    managerState.data = draft
      ? cloneData(validateData(JSON.parse(draft)))
      : cloneData(await fetchPublishedData());
    renderAll();
    showStatus(draft ? "保存された下書きを開きました。" : "公開中の問題データを読み込みました。", "success");
  } catch (error) {
    showStatus(`初期化失敗：${error.message}`, "error");
  }
}

elements.modeTabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.managerMode)));
byId("add-category-button").addEventListener("click", addGrammarUnit);
elements.categoryForm.addEventListener("submit", applyGrammarUnit);
elements.deleteCategory.addEventListener("click", deleteGrammarUnit);
byId("add-question-button").addEventListener("click", () => openQuestionEditor());
elements.questionForm.addEventListener("submit", applyQuestion);
byId("close-question-button").addEventListener("click", closeQuestionEditor);
elements.deleteQuestion.addEventListener("click", deleteQuestion);
byId("add-vocabulary-unit-button").addEventListener("click", addVocabularyUnit);
elements.vocabularyUnitForm.addEventListener("submit", applyVocabularyUnit);
elements.deleteVocabularyUnit.addEventListener("click", deleteVocabularyUnit);
byId("add-word-button").addEventListener("click", () => openWordEditor());
elements.wordForm.addEventListener("submit", applyWord);
byId("close-word-button").addEventListener("click", closeWordEditor);
elements.deleteWord.addEventListener("click", deleteWord);
byId("save-draft-button").addEventListener("click", saveDraft);
byId("download-button").addEventListener("click", downloadJson);
byId("import-file").addEventListener("change", event => importJson(event.target.files[0]));
byId("reload-button").addEventListener("click", () => reloadPublishedData().catch(error => showStatus(`再読込失敗：${error.message}`, "error")));

initializeManager();
