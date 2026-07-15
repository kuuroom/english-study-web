// ============================================================
// ゲーム全体の設定値
// ============================================================
// 正解1問でもらえる経験値と、レベルアップに必要な経験値。
const EXP_PER_CORRECT = 10;
const EXP_PER_LEVEL = 100;
// localStorageに保存するときのキー。名前を変えると過去データを読めなくなる。
const PLAYER_STORAGE_KEY = "englishQuestPlayer";

// 画面をまたいで共有する、現在のゲーム状態。
// HTMLへ直接状態を持たせず、このオブジェクトを正として画面を描画する。
const state = {
  // questions.jsonから読み込んだ全データ
  data: null,
  // 現在挑戦中のカテゴリ
  currentCategory: null,
  // 出題順にシャッフルされた問題配列
  questions: [],
  // 現在表示している問題の位置（0始まり）
  questionIndex: 0,
  // 今回のクエスト内での正解数と連続正解数
  correctCount: 0,
  streak: 0,
  // ダブルクリックなどによる同じ問題への二重回答を防ぐフラグ
  answered: false,
  // 保存済みの累計経験値を起動時に復元する
  player: getPlayerData()
};

// ============================================================
// 頻繁に操作するDOM要素
// ============================================================
// 3画面を名前で切り替えられるよう、要素をまとめて管理する。
const screens = {
  category: document.getElementById("category-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen")
};

// getElementByIdを処理のたびに繰り返さないよう、最初に参照を保持する。
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

// ============================================================
// 初期化
// ============================================================
// 問題JSONを非同期で読み込み、トップ画面を初期描画する。
async function loadData() {
  const response = await fetch("data/questions.json");
  if (!response.ok) throw new Error("問題データを読み込めませんでした。");

  state.data = await response.json();
  updatePlayerStatus();
  renderCategories();
  updateTotalProgress();
  document.getElementById("loading-screen").classList.add("hidden");
}

// ============================================================
// クエスト選択画面
// ============================================================
// questions.jsonのcategoriesからクエストカードを動的に作る。
function renderCategories() {
  // 再描画時に古いカードが重複しないよう、一度空にする。
  categoryList.innerHTML = "";

  state.data.categories.forEach((category, index) => {
    // 過去に挑戦済みなら、最高点をカードに表示する。
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

    // カード固有のIDを渡して、そのクエストを開始する。
    button.addEventListener("click", () => startQuiz(category.id));
    categoryList.appendChild(button);
  });
}

// 選択したカテゴリの状態を初期化し、問題画面へ移動する。
function startQuiz(categoryId) {
  const category = state.data.categories.find(item => item.id === categoryId);
  if (!category) return;

  const categoryIndex = state.data.categories.findIndex(item => item.id === categoryId);
  // カテゴリの並び順に応じて、問題画面の背景を順番に割り当てる。
  // 4カテゴリ以上になった場合は、%（剰余）により先頭から繰り返す。
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
  // 元のJSON配列を変更しないようコピーしてからシャッフルする。
  state.questions = shuffle([...category.questions]);
  state.questionIndex = 0;
  state.correctCount = 0;
  state.streak = 0;
  state.answered = false;
  updatePlayerStatus();
  showScreen("quiz");
  renderQuestion();
}

// ============================================================
// 問題の表示と回答判定
// ============================================================
// state.questionIndexが指す1問を画面に描画する。
function renderQuestion() {
  const question = state.questions[state.questionIndex];

  // 前の問題で付いた表示・判定状態をリセットする。
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

  // 選択肢の数に依存せず、JSONの配列からボタンを生成する。
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => answerQuestion(index));
    choices.appendChild(button);
  });
}

// 選ばれた選択肢を採点し、正解表示と解説ダイアログを出す。
function answerQuestion(selectedIndex) {
  // 一度採点した問題では、それ以降のクリックを無視する。
  if (state.answered) return;

  state.answered = true;
  const question = state.questions[state.questionIndex];
  const isCorrect = selectedIndex === question.correctIndex;
  const buttons = [...choices.querySelectorAll(".choice-button")];

  // 全ボタンを無効化し、正解と選択ミスを色分けする。
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correctIndex) button.classList.add("correct");
    else if (index === selectedIndex) button.classList.add("incorrect");
  });

  if (isCorrect) {
    // 正解時だけスコア・連続数・累計経験値を増やす。
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
    // 不正解でも正解数は減らさないが、連続正解は0へ戻す。
    state.streak = 0;
    resultLabel.textContent = "おしい！ 次につなげよう";
    feedbackRibbon.textContent = "おしい！";
    feedbackCharacter.src = "data/assets/feedback-incorrect.png";
    feedbackCharacter.alt = "おしいと励ます案内役のペンギン";
    explanationBox.classList.add("incorrect-feedback");
    expGain.textContent = "";
    updatePlayerStatus();
  }

  // 正誤に関係なく、答え・詳しい解説・覚え方を表示する。
  answerText.textContent = `答え：${question.answer}`;
  explanationText.textContent = question.explanation;
  pointText.textContent = question.point;
  explanationBox.classList.remove("hidden");
}

// 次の問題へ進む。最後の問題を終えていれば結果画面へ移動する。
function nextQuestion() {
  state.questionIndex += 1;
  if (state.questionIndex >= state.questions.length) finishQuiz();
  else renderQuestion();
}

// クエスト結果を保存し、正答率に応じたメッセージを表示する。
function finishQuiz() {
  saveProgress(state.currentCategory.id, state.correctCount, state.questions.length);
  const percentage = Math.round((state.correctCount / state.questions.length) * 100);

  document.getElementById("result-title").textContent = state.currentCategory.name;
  document.getElementById("result-score").textContent = `${state.correctCount} / ${state.questions.length}問正解`;

  // 最低条件のメッセージを初期値にし、高得点ほど内容を上書きする。
  let message = "解説を読みながら、もう一度クエストに挑戦してみよう！";
  if (percentage === 100) message = "パーフェクト！ be動詞を使う場面がしっかり見えてきたね！";
  else if (percentage >= 80) message = "すごい！ 間違えた文を見直せば、さらにレベルアップできそう！";
  else if (percentage >= 60) message = "あと少し！『状態・場所・立場』か『動作』かを意識してみよう。";

  document.getElementById("result-message").textContent = message;
  renderCategories();
  updateTotalProgress();
  showScreen("result");
}

// ============================================================
// 画面切り替えと保存データ
// ============================================================
// 指定画面だけを表示し、それ以外にはhiddenクラスを付ける。
function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => element.classList.toggle("hidden", key !== name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// localStorageが空・破損していてもアプリを停止させない安全なJSON読込。
function safeParseStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

// カテゴリごとの挑戦記録を扱う小さなヘルパー関数。
function getProgressData() { return safeParseStorage("englishStudyProgress"); }
function getCategoryProgress(categoryId) { return getProgressData()[categoryId] || null; }

// プレイヤーデータを復元する。不正な経験値は0として扱う。
function getPlayerData() {
  const saved = safeParseStorage(PLAYER_STORAGE_KEY);
  const exp = Number.isFinite(saved.exp) && saved.exp >= 0 ? Math.floor(saved.exp) : 0;
  return { exp };
}

// 経験値を保存し、レベルが上がった場合だけ通知を表示する。
function addExperience(amount) {
  const oldLevel = getLevel(state.player.exp);
  state.player.exp += amount;
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state.player));
  updatePlayerStatus();
  if (getLevel(state.player.exp) > oldLevel) showLevelUp();
}

// 経験値0をレベル1として計算する。
function getLevel(exp) { return Math.floor(exp / EXP_PER_LEVEL) + 1; }

// ヘッダーのレベル、経験値バー、連続数、正解数を現在状態に同期する。
function updatePlayerStatus() {
  const expInLevel = state.player.exp % EXP_PER_LEVEL;
  playerLevel.textContent = getLevel(state.player.exp);
  expLabel.textContent = `${expInLevel} / ${EXP_PER_LEVEL}`;
  expBar.style.width = `${expInLevel}%`;
  expTrack.setAttribute("aria-valuenow", expInLevel);
  streakCount.textContent = state.streak;
  correctTotal.textContent = state.correctCount;
}

// 一時的なレベルアップ通知を表示し、2.2秒後に自動で隠す。
function showLevelUp() {
  const notice = document.getElementById("level-up");
  const newLevel = getLevel(state.player.exp);
  document.getElementById("level-up-values").textContent = `Lv. ${newLevel - 1}  ▶  Lv. ${newLevel}`;
  notice.classList.remove("hidden");
  window.setTimeout(() => notice.classList.add("hidden"), 2200);
}

// カテゴリ別に最高点、直近点、挑戦回数をlocalStorageへ保存する。
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

// 保存された全カテゴリの記録をトップ画面用の文章にまとめる。
function updateTotalProgress() {
  const records = Object.values(getProgressData());
  if (records.length === 0) {
    totalProgress.textContent = "まだ記録はありません。最初のクエストへ出発しよう！";
    return;
  }
  const attempts = records.reduce((sum, item) => sum + item.attempts, 0);
  totalProgress.textContent = `${records.length}クエストに挑戦・合計${attempts}回プレイ`;
}

// 確認ダイアログの同意後、学習記録と経験値をすべて初期化する。
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

// Fisher–Yates法で配列を偏りにくくランダムに並べ替える。
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============================================================
// イベント登録とアプリ起動
// ============================================================
// HTML側の各ボタンと、上で定義した処理を結び付ける。
document.getElementById("next-button").addEventListener("click", nextQuestion);
document.getElementById("back-button").addEventListener("click", () => showScreen("category"));
document.getElementById("return-button").addEventListener("click", () => showScreen("category"));
document.getElementById("retry-button").addEventListener("click", () => startQuiz(state.currentCategory.id));
document.getElementById("reset-progress-button").addEventListener("click", resetProgress);

// 最後に問題データを読み込む。失敗時は操作不能なローディング画面の
// 代わりに、原因を確認できるエラー画面を表示する。
loadData().catch(error => {
  document.body.innerHTML = `<main class="app"><div class="result-card"><h1>読み込みエラー</h1><p>${error.message}</p><p>GitHub Pages上で開いているか確認してください。</p></div></main>`;
});
