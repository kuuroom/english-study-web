import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"));
const errors = [];
const allUnitIds = new Set();
const expectedGrammarUnits = new Map([[1, 14], [2, 12], [3, 11]]);
const expectedVocabularyCounts = new Map([[0, 154], [1, 600], [2, 450], [3, 450]]);
const allWordIds = new Set();

function addError(message) {
  errors.push(message);
}

for (const unit of data.grammarUnits || []) {
  if (allUnitIds.has(unit.id)) addError(`単元ID重複: ${unit.id}`);
  allUnitIds.add(unit.id);
  if (!unit.name || !Number.isInteger(unit.grade) || !Array.isArray(unit.questions)) {
    addError(`文法単元の必須項目不足: ${unit.id}`);
    continue;
  }
  if (unit.questions.length < unit.drawCount) {
    addError(`${unit.id}: 登録${unit.questions.length}問に対して出題${unit.drawCount}問`);
  }
  if (unit.questions.length < 20) {
    addError(`${unit.id}: ランダム出題用に20問以上必要ですが、${unit.questions.length}問です`);
  }
  const questionIds = new Set();
  unit.questions.forEach((question, index) => {
    if (question.id) {
      if (questionIds.has(question.id)) addError(`${unit.id}: 問題ID重複 ${question.id}`);
      questionIds.add(question.id);
    }
    if (!question.question || !Array.isArray(question.choices) || question.choices.length < 2) {
      addError(`${unit.id} ${index + 1}問目: 設問または選択肢不足`);
    }
    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
      addError(`${unit.id} ${index + 1}問目: correctIndex不正`);
    }
    if (!question.answer || !question.explanation) {
      addError(`${unit.id} ${index + 1}問目: 答えまたは解説不足`);
    }
  });
}

for (const unit of data.vocabularyUnits || []) {
  if (allUnitIds.has(unit.id)) addError(`単元ID重複: ${unit.id}`);
  allUnitIds.add(unit.id);
  if (!unit.name || !Number.isInteger(unit.grade) || !Array.isArray(unit.words)) {
    addError(`単語ステップの必須項目不足: ${unit.id}`);
    continue;
  }
  if (unit.words.length < unit.drawCount) {
    addError(`${unit.id}: 登録${unit.words.length}語に対して出題${unit.drawCount}問`);
  }
  if (unit.words.length > 80) {
    addError(`${unit.id}: 1カテゴリ80語以下の上限を超えています（${unit.words.length}語）`);
  }
  const wordIds = new Set();
  unit.words.forEach((word, index) => {
    if (wordIds.has(word.id)) addError(`${unit.id}: 単語ID重複 ${word.id}`);
    if (allWordIds.has(word.id)) addError(`カテゴリをまたぐ単語ID重複 ${word.id}`);
    wordIds.add(word.id);
    allWordIds.add(word.id);
    if (!word.id || !word.word || !word.meanings?.[0] || !word.partOfSpeech) {
      addError(`${unit.id} ${index + 1}語目: 必須項目不足`);
    }
  });
}

for (const [grade, expectedCount] of expectedGrammarUnits) {
  const actualCount = (data.grammarUnits || []).filter(unit => unit.grade === grade).length;
  if (actualCount !== expectedCount) {
    addError(`中${grade}文法: ${expectedCount}単元必要ですが、${actualCount}単元です`);
  }
}

for (const [grade, expectedCount] of expectedVocabularyCounts) {
  const actualCount = (data.vocabularyUnits || [])
    .filter(unit => unit.grade === grade)
    .reduce((sum, unit) => sum + unit.words.length, 0);
  if (actualCount !== expectedCount) {
    const label = grade === 0 ? "基礎" : `中${grade}`;
    addError(`${label}単語: ${expectedCount}語必要ですが、${actualCount}語です`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  const grammarCount = data.grammarUnits.reduce((sum, unit) => sum + unit.questions.length, 0);
  const vocabularyCount = data.vocabularyUnits.reduce((sum, unit) => sum + unit.words.length, 0);
  console.log(`OK: 文法${data.grammarUnits.length}単元・${grammarCount}問、単語${data.vocabularyUnits.length}カテゴリ・${vocabularyCount}語`);
}
