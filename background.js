let enabled = false;
let config = { urls: [], headers: [] };

// 初期設定の読み込み
chrome.storage.sync.get(["enabled", "headerConfig"], (data) => {
  enabled = data.enabled ?? false;

  if (data.headerConfig) {
    config = data.headerConfig;
    updateRules();
  } else {
    // 初回起動時：デフォルト設定を header-config.json から読み込む
    loadDefaultConfig();
  }
});

// ON/OFFの変更またはヘッダー設定の変更を受け取る
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    updateRules();
  }

  if (changes.headerConfig) {
    config = changes.headerConfig.newValue;
    updateRules();
  }
});

// header-config.jsonからデフォルト設定を読み込む関数
function loadDefaultConfig() {
  fetch(chrome.runtime.getURL("header-config.json"))
    .then((response) => response.json())
    .then((json) => {
      config = json;
      // デフォルト設定を保存
      chrome.storage.sync.set({ headerConfig: config });
      updateRules();
    })
    .catch((error) =>
      console.error("Failed to load header-config.json:", error)
    );
}

// ルールを更新する関数
function updateRules() {
  // URLフィルターの作成（URLが空の場合はエラー回避のため）
  const urlFilter =
    config.urls && config.urls.length > 0
      ? config.urls.join("|")
      : "example.com/invalid-placeholder";

  const rules =
    enabled && config.headers && config.headers.length > 0
      ? [
          {
            id: 1,
            priority: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: config.headers.map((header) => ({
                header: header.name,
                operation: "set",
                value: header.value,
              })),
            },
            condition: {
              urlFilter: urlFilter,
              resourceTypes: ["main_frame"],
            },
          },
        ]
      : [];

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [1],
      addRules: rules,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    }
  );
}
