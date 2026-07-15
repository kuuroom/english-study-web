const EXP_PER_CORRECT = 10;
const EXP_PER_LEVEL = 100;
const PLAYER_STORAGE_KEY = "englishQuestPlayer";

const state = {
  data: null,
  currentCategory: null,
  questions: [],
  questionIndex: 0,
  correctCount: 0,
  streak: 0,
  answered: false,
  player: getPlayerData()
};

const screens = {
  category: document.getElementById("category-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen")
};

const categoryList = document.getElementById("category-list");
const totalProgress = document.getElementById("total-progress");
const categoryName = document.getElementById("category-name");
const questionCount = document.getElementById("question-count");
const questionText = document.getElementById("question-text");
const questionHint = document.getElementById("question-hint");
const choices = document.getElementById("choices");
const explanationBox = document.getElementById("explanation-box");
const resultLabel = document.getElementById("result-label");
const expGain = document.getElementById("exp-gain");
const answerText = document.getElementById("answer-text");
const explanationText = document.getElementById("explanation-text");
const pointText = document.getElementById("point-text");
const playerLevel = document.getElementById("player-level");
const expLabel = document.getElementById("exp-label");
const expBar = document.getElementById("exp-bar");
const expTrack = document.querySelector(".exp-track");
const streakCount = document.getElementById("streak-count");
const correctTotal = document.getElementById("correct-total");
const feedbackRibbon = document.getElementById("feedback-ribbon");
const feedbackCharacter = document.getElementById("feedback-character");

async function loadData() {
  const response = await fetch("data/questions.json");
  if (!response.ok) throw new Error("問題データを読み込めませんでした。");

  state.data = await response.json();
  updatePlayerStatus();
  renderCategories();
  updateTotalProgress();
  document.getElementById("loading-screen").classList.add("hidden");
}

function renderCategories() {
  categoryList.innerHTML = "";

  state.data.categories.forEach((category, index) => {
    const saved = getCategoryProgress(category.id);
    const button = document.createElement("button");
    const icons = ["📜", "🔮", "🗝️", "🌟"];

    button.type = "button";
    button.className = "category-card";
    button.dataset.icon = icons[index % icons.length];
    button.innerHTML = `
      <p class="quest-number">QUEST ${String(index + 1).padStart(2, "0")}</p>
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <div class="category-meta">
        <span>⚔️ ${category.questions.length}問</span>
        <span>${saved ? `👑 最高 ${saved.bestScore}/${saved.total}` : "✨ 未挑戦"}</span>
      </div>
    `;

    button.addEventListener("click", () => startQuiz(category.id));
    categoryList.appendChild(button);
  });
}

function startQuiz(categoryId) {
  const category = state.data.categories.find(item => item.id === categoryId);
  if (!category) return;

  const categoryIndex = state.data.categories.findIndex(item => item.id === categoryId);
  const stageBackgrounds = [
    "../data/assets/background-classroom.png",
    "../data/assets/background-forest.png",
    "../data/assets/background-castle.png"
  ];
  document.querySelector(".quest-stage").style.setProperty(
    "--stage-background",
    `url("${stageBackgrounds[categoryIndex % stageBackgrounds.length]}")`
  );

  state.currentCategory = category;
  state.questions = shuffle([...category.questions]);
  state.questionIndex = 0;
  state.correctCount = 0;
  state.streak = 0;
  state.answered = false;
  updatePlayerStatus();
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.questionIndex];

  state.answered = false;
  explanationBox.classList.add("hidden");
  resultLabel.classList.remove("correct-label");
  explanationBox.classList.remove("correct-feedback", "incorrect-feedback");
  expGain.textContent = "";
  choices.innerHTML = "";

  categoryName.textContent = state.currentCategory.name;
  questionCount.textContent = `${state.questionIndex + 1} / ${state.questions.length}`;
  questionText.textContent = question.question;
  questionHint.textContent = question.hint;

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => answerQuestion(index));
    choices.appendChild(button);
  });
}

function answerQuestion(selectedIndex) {
  if (state.answered) return;

  state.answered = true;
  const question = state.questions[state.questionIndex];
  const isCorrect = selectedIndex === question.correctIndex;
  const buttons = [...choices.querySelectorAll(".choice-button")];

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correctIndex) button.classList.add("correct");
    else if (index === selectedIndex) button.classList.add("incorrect");
  });

  if (isCorrect) {
    state.correctCount += 1;
    state.streak += 1;
    resultLabel.textContent = "Great! 正解！";
    feedbackRibbon.textContent = "正解！";
    feedbackCharacter.src = "data/assets/feedback-correct.png";
    feedbackCharacter.alt = "喜んでいる案内役のねこ";
    explanationBox.classList.add("correct-feedback");
    resultLabel.classList.add("correct-label");
    expGain.textContent = `+${EXP_PER_CORRECT} EXP`;
    addExperience(EXP_PER_CORRECT);
  } else {
    state.streak = 0;
    resultLabel.textContent = "おしい！ 次につなげよう";
    feedbackRibbon.textContent = "おしい！";
    feedbackCharacter.src = "data/assets/feedback-incorrect.png";
    feedbackCharacter.alt = "おしいと励ます案内役のペンギン";
    explanationBox.classList.add("incorrect-feedback");
    expGain.textContent = "";
    updatePlayerStatus();
  }

  answerText.textContent = `答え：${question.answer}`;
  explanationText.textContent = question.explanation;
  pointText.textContent = question.point;
  explanationBox.classList.remove("hidden");
}

function nextQuestion() {
  state.questionIndex += 1;
  if (state.questionIndex >= state.questions.length) finishQuiz();
  else renderQuestion();
}

function finishQuiz() {
  saveProgress(state.currentCategory.id, state.correctCount, state.questions.length);
  const percentage = Math.round((state.correctCount / state.questions.length) * 100);

  document.getElementById("result-title").textContent = state.currentCategory.name;
  document.getElementById("result-score").textContent = `${state.correctCount} / ${state.questions.length}問正解`;

  let message = "解説を読みながら、もう一度クエストに挑戦してみよう！";
  if (percentage === 100) message = "パーフェクト！ be動詞を使う場面がしっかり見えてきたね！";
  else if (percentage >= 80) message = "すごい！ 間違えた文を見直せば、さらにレベルアップできそう！";
  else if (percentage >= 60) message = "あと少し！『状態・場所・立場』か『動作』かを意識してみよう。";

  document.getElementById("result-message").textContent = message;
  renderCategories();
  updateTotalProgress();
  showScreen("result");
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => element.classList.toggle("hidden", key !== name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function safeParseStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

function getProgressData() { return safeParseStorage("englishStudyProgress"); }
function getCategoryProgress(categoryId) { return getProgressData()[categoryId] || null; }

function getPlayerData() {
  const saved = safeParseStorage(PLAYER_STORAGE_KEY);
  const exp = Number.isFinite(saved.exp) && saved.exp >= 0 ? Math.floor(saved.exp) : 0;
  return { exp };
}

function addExperience(amount) {
  const oldLevel = getLevel(state.player.exp);
  state.player.exp += amount;
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state.player));
  updatePlayerStatus();
  if (getLevel(state.player.exp) > oldLevel) showLevelUp();
}

function getLevel(exp) { return Math.floor(exp / EXP_PER_LEVEL) + 1; }

function updatePlayerStatus() {
  const expInLevel = state.player.exp % EXP_PER_LEVEL;
  playerLevel.textContent = getLevel(state.player.exp);
  expLabel.textContent = `${expInLevel} / ${EXP_PER_LEVEL}`;
  expBar.style.width = `${expInLevel}%`;
  expTrack.setAttribute("aria-valuenow", expInLevel);
  streakCount.textContent = state.streak;
  correctTotal.textContent = state.correctCount;
}

function showLevelUp() {
  const notice = document.getElementById("level-up");
  const newLevel = getLevel(state.player.exp);
  document.getElementById("level-up-values").textContent = `Lv. ${newLevel - 1}  ▶  Lv. ${newLevel}`;
  notice.classList.remove("hidden");
  window.setTimeout(() => notice.classList.add("hidden"), 2200);
}

function saveProgress(categoryId, score, total) {
  const progress = getProgressData();
  const previous = progress[categoryId];
  progress[categoryId] = {
    bestScore: previous ? Math.max(previous.bestScore, score) : score,
    total,
    lastScore: score,
    attempts: previous ? previous.attempts + 1 : 1
  };
  localStorage.setItem("englishStudyProgress", JSON.stringify(progress));
}

function updateTotalProgress() {
  const records = Object.values(getProgressData());
  if (records.length === 0) {
    totalProgress.textContent = "まだ記録はありません。最初のクエストへ出発しよう！";
    return;
  }
  const attempts = records.reduce((sum, item) => sum + item.attempts, 0);
  totalProgress.textContent = `${records.length}クエストに挑戦・合計${attempts}回プレイ`;
}

function resetProgress() {
  const shouldReset = window.confirm("学習記録・EXP・レベルをすべてリセットしますか？");
  if (!shouldReset) return;
  localStorage.removeItem("englishStudyProgress");
  localStorage.removeItem(PLAYER_STORAGE_KEY);
  state.player = { exp: 0 };
  state.streak = 0;
  updatePlayerStatus();
  renderCategories();
  updateTotalProgress();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.getElementById("next-button").addEventListener("click", nextQuestion);
document.getElementById("back-button").addEventListener("click", () => showScreen("category"));
document.getElementById("return-button").addEventListener("click", () => showScreen("category"));
document.getElementById("retry-button").addEventListener("click", () => startQuiz(state.currentCategory.id));
document.getElementById("reset-progress-button").addEventListener("click", resetProgress);

loadData().catch(error => {
  document.body.innerHTML = `<main class="app"><div class="result-card"><h1>読み込みエラー</h1><p>${error.message}</p><p>GitHub Pages上で開いているか確認してください。</p></div></main>`;
});
