let enabled = false;
let config = { urls: [], headers: [] };

// 初期設定の読み込み
chrome.storage.sync.get("enabled", (data) => {
  enabled = data.enabled ?? false;
  loadConfigAndUpdateRules();
});

// ON/OFFの変更を受け取る
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    loadConfigAndUpdateRules();
  }
});

// header-config.jsonを読み込む関数
function loadConfigAndUpdateRules() {
  fetch(chrome.runtime.getURL("header-config.json"))
    .then((response) => response.json())
    .then((json) => {
      config = json;
      updateRules();
    })
    .catch((error) =>
      console.error("Failed to load header-config.json:", error)
    );
}

// ルールを更新する関数
function updateRules() {
  const rules = enabled
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
            urlFilter: config.urls.join("|"),
            resourceTypes: ["main_frame","sub_frame","script","stylesheet","image","object","xmlhttprequest"], 
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
