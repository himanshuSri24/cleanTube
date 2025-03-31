// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === "CLEANTUBE_OPEN_SUBSCRIPTIONS_PAGE") {
    chrome.tabs.create(
      { url: "https://www.youtube.com/feed/channels" },
      (tab) => {
        chrome.storage.local.set({
          cleanTubeRunScriptForRemoveSubscriptions: true,
        });

        // Waiting for the tab to load completely
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener); // Removing listener after execution

            // Injecting content script
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"],
            });
          }
        });
      }
    );
  }
});
