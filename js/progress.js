const PROGRESS_STORAGE_KEY = "englishStudyProgress";

const totalProgress = document.getElementById("total-progress");
const overallCorrectRate = document.getElementById("overall-correct-rate");
const grammarProgress = document.getElementById("grammar-progress");
const vocabularyProgress = document.getElementById("vocabulary-progress");
const weakCategoryList = document.getElementById("weak-category-list");
const categoryRecordList = document.getElementById("category-record-list");

// 保存データが壊れていても記録ページ全体が停止しないよう、空の記録へ戻す。
function getProgressData() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getRecordRate(record) {
  const correct = record.totalCorrect ?? record.lastScore ?? 0;
  const questions = record.totalQuestions ?? record.total ?? 0;
  return questions ? Math.round((correct / questions) * 100) : 0;
}

function createRecordItems(units, progress) {
  return units
    .filter(unit => progress[unit.id])
    .map(unit => {
      const record = progress[unit.id];
      return {
        ...unit,
        record,
        rate: getRecordRate(record)
      };
    });
}

function renderProgress(data) {
  const progress = getProgressData();
  const records = Object.values(progress);
  const grammarUnits = data.grammarUnits || [];
  const vocabularyUnits = data.vocabularyUnits || [];
  const grammarRecords = createRecordItems(
    grammarUnits.map(unit => ({ ...unit, courseLabel: "文法" })),
    progress
  );
  const vocabularyRecords = createRecordItems(
    vocabularyUnits.map(unit => ({ ...unit, courseLabel: "単語" })),
    progress
  );
  const recordItems = [...grammarRecords, ...vocabularyRecords];

  grammarProgress.textContent = `${grammarRecords.length} / ${grammarUnits.length}`;
  vocabularyProgress.textContent = `${vocabularyRecords.length} / ${vocabularyUnits.length}`;

  if (records.length === 0) {
    totalProgress.textContent = "まだ記録はありません。最初のクエストへ出発しよう！";
    overallCorrectRate.textContent = "--%";
    weakCategoryList.innerHTML = "<li>クエストに挑戦すると表示されます。</li>";
    categoryRecordList.innerHTML = '<p class="empty-message">まだ挑戦したカテゴリはありません。</p>';
    return;
  }

  const attempts = records.reduce((sum, item) => sum + (item.attempts || 0), 0);
  const correctAnswers = records.reduce(
    (sum, item) => sum + (item.totalCorrect ?? item.lastScore ?? 0),
    0
  );
  const answeredQuestions = records.reduce(
    (sum, item) => sum + (item.totalQuestions ?? item.total ?? 0),
    0
  );
  const correctRate = answeredQuestions
    ? Math.round((correctAnswers / answeredQuestions) * 100)
    : 0;

  totalProgress.textContent = `${recordItems.length}クエストに挑戦・合計${attempts}回プレイ`;
  overallCorrectRate.textContent = `${correctRate}%`;

  const weakCategories = recordItems
    .filter(item => item.rate < 80)
    .sort((a, b) => a.rate - b.rate || (b.record.attempts || 1) - (a.record.attempts || 1))
    .slice(0, 3);

  weakCategoryList.innerHTML = weakCategories.length
    ? weakCategories.map(item =>
      `<li><span>${escapeHtml(item.courseLabel)}・${escapeHtml(item.name)}</span><strong>${item.rate}%</strong></li>`
    ).join("")
    : "<li>正答率80%未満のカテゴリはありません。</li>";

  categoryRecordList.innerHTML = recordItems.length
    ? recordItems
      .sort((a, b) => a.courseLabel.localeCompare(b.courseLabel, "ja") || a.rate - b.rate)
      .map(item => `
        <article class="category-record">
          <div>
            <span class="record-course">${escapeHtml(item.courseLabel)}</span>
            <strong>${escapeHtml(item.name)}</strong>
          </div>
          <dl>
            <div><dt>正答率</dt><dd>${item.rate}%</dd></div>
            <div><dt>最高</dt><dd>${item.record.bestScore ?? 0}/${item.record.total ?? 10}</dd></div>
            <div><dt>直近</dt><dd>${item.record.lastScore ?? 0}/${item.record.total ?? 10}</dd></div>
            <div><dt>挑戦</dt><dd>${item.record.attempts ?? 1}回</dd></div>
          </dl>
        </article>
      `).join("")
    : '<p class="empty-message">現在のカテゴリに対応する記録はありません。</p>';
}

async function loadProgress() {
  const response = await fetch("data/questions.json", { cache: "no-store" });
  if (!response.ok) throw new Error("問題データを読み込めませんでした。");
  renderProgress(await response.json());
}

loadProgress().catch(error => {
  totalProgress.textContent = error.message;
  categoryRecordList.innerHTML = '<p class="empty-message">記録を表示できませんでした。</p>';
});
