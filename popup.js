const checkbox = document.getElementById("toggleHeader");

// 初期状態を反映
chrome.storage.sync.get("enabled", (data) => {
  checkbox.checked = data.enabled ?? false;
});

// チェック状態を保存
checkbox.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: checkbox.checked });
});
