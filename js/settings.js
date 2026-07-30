// ゲーム本体と同じ保存キーを使い、設定ページから学習状況を初期化する。
const PLAYER_STORAGE_KEY = "englishQuestPlayer";
const PROGRESS_STORAGE_KEY = "englishStudyProgress";

const resetProgressButton = document.getElementById("reset-progress-button");
const settingsStatus = document.getElementById("settings-status");

// 誤操作を防ぐため、確認に同意した場合だけ記録とプレイヤー情報を削除する。
function resetProgress() {
  const shouldReset = window.confirm("学習記録・EXP・レベルをすべてリセットしますか？");
  if (!shouldReset) return;

  localStorage.removeItem(PROGRESS_STORAGE_KEY);
  localStorage.removeItem(PLAYER_STORAGE_KEY);
  settingsStatus.textContent = "学習記録・EXP・レベルをリセットしました。";
  settingsStatus.className = "manager-status success";
}

resetProgressButton.addEventListener("click", resetProgress);
