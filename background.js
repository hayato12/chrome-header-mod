let enabled = false;

// 初期設定の読み込み
chrome.storage.sync.get("enabled", (data) => {
  enabled = data.enabled ?? false;
  updateRules();
});

// ON/OFFの変更を受け取る
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    updateRules();
  }
});

// ルールを更新する関数
function updateRules() {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [1],
      addRules: enabled
        ? [
            {
              id: 1,
              priority: 1,
              action: {
                type: "modifyHeaders",
                requestHeaders: [
                  {
                    header: "X-Custom-Header",
                    operation: "set",
                    value: "MyValue123",
                  },
                ],
              },
              condition: {
                urlFilter: "|https://example.com|https://another-example.com",
                resourceTypes: ["main_frame"],
              },
            },
          ]
        : [],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    }
  );
}
