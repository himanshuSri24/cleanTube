// run the script only when the user opens the subscriptions page via the extension
chrome.storage.local.get("cleanTubeRunScriptForRemoveSubscriptions", (data) => {
  if (data.cleanTubeRunScriptForRemoveSubscriptions) {
    // resetting the value ( otherwise, would cause it to run even on future reloads )
    chrome.storage.local.set({
      cleanTubeRunScriptForRemoveSubscriptions: false,
    });

    processSubscriptionsPage();
  }
});

async function scrollToBottom() {
  // Scroll to the bottom of the page initially, to ensure all the subbed channels are loaded
  return new Promise((resolve) => {
    let lastScrollHeight = document.documentElement.scrollHeight;
    let startIdleTime = Date.now();

    // Observing for new content ( height change )
    const observer = new MutationObserver(() => {
      lastScrollHeight = document.documentElement.scrollHeight;
      startIdleTime = Date.now(); // resetting the timer on mutation
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const scrollInterval = setInterval(() => {
      // adding timeouts to prevent the script from running too fast ( don't want to get blocked 🤌🏻 )
      window.scrollBy(0, 1000);

      setTimeout(() => {
        let newScrollHeight = document.documentElement.scrollHeight;

        if (
          newScrollHeight > lastScrollHeight ||
          window.scrollY < newScrollHeight - window.innerHeight
        ) {
          lastScrollHeight = newScrollHeight;
          startIdleTime = Date.now();
        }

        // waiting for 5 seconds of inactivity before stopping the scroll ( since more subs might load )
        if (
          Date.now() - startIdleTime >= 5000 &&
          window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 5
        ) {
          clearInterval(scrollInterval);
          observer.disconnect();
          resolve(true);
        }
      }, 500);
    }, 500);
  });
}

function processSubscriptionsPage() {
  let startTime = Date.now();
  let totalSubscriptions = 0;
  let processedSubscriptions = 0;

  async function unsubscribeAll() {
    const unsubscribeButtons = document.querySelectorAll(
      '[aria-label*="Unsubscribe"]'
    );

    if (unsubscribeButtons.length === 0) {
      // No subscriptions found
      showCustomMessage(processedSubscriptions, 0, 0, 0);
      return;
    }

    totalSubscriptions = unsubscribeButtons.length;
    processedSubscriptions = 0;

    for (const button of unsubscribeButtons) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      button?.click();

      await new Promise((resolve) => setTimeout(resolve, 500));
      const confirmButton = document.querySelector(
        '[aria-label="Unsubscribe"]'
      );
      confirmButton?.click();

      processedSubscriptions++;
      updateStats();
    }

    showCustomMessage(
      processedSubscriptions,
      0,
      Math.round((Date.now() - startTime) / 1000),
      0
    );
  }

  function showCustomMessage(processed, remaining, timeTaken, timeLeft) {
    let messageDiv = document.getElementById("customMessageDiv");
    if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.id = "customMessageDiv";
      messageDiv.style = `
                  position: fixed;
                  bottom: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: #222;
                  color: #fff;
                  padding: 20px;
                  border-radius: 12px;
                  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                  text-align: center;
                  font-size: 15px;
                  z-index: 9999;
                  max-width: 320px;
                  font-family: Arial, sans-serif;
              `;
      document.body.appendChild(messageDiv);
    }

    messageDiv.innerHTML = `
              <p>📊 ${
                processed === 0
                  ? "✅ No subscriptions found! 🎉"
                  : "Processing Complete!"
              }</p>
              <p>✅ Processed: ${processed}</p>
              <p>⏳ Remaining: ${remaining}</p>
              <p>⏱️ Time Taken: ${timeTaken}s</p>
              <p>⌛ Estimated Time Left: ${timeLeft}s</p>
              <p style="
                  margin-top: 8px;
                  font-size: 13px;
                  color: #bbb;
              ">
                  Built by <span style="font-weight: bold; color: #1e90ff;">Himanshu Srivastava</span>
              </p>
              <p style="
                  margin-top: 8px;
                  font-size: 13px;
              ">
                  <a href="https://devwithcoffee.com" target="_blank" style="
                      color: #1e90ff;
                      text-decoration: none;
                      font-weight: bold;
                      transition: color 0.2s ease-in-out;
                  " onmouseover="this.style.color='#00c8ff'" onmouseout="this.style.color='#1e90ff'">
                      More Projects
                  </a> |
                  <a href="https://buymeacoffee.com/devwithcoffee" target="_blank" style="
                      color: #ffb400;
                      text-decoration: none;
                      font-weight: bold;
                      transition: color 0.2s ease-in-out;
                  " onmouseover="this.style.color='#ffa600'" onmouseout="this.style.color='#ffb400'">
                      Support Me ☕
                  </a>
              </p>
          `;
  }

  function updateStats() {
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const remaining = Math.max(0, totalSubscriptions - processedSubscriptions);
    const estimatedTimeLeft = remaining > 0 ? remaining.toFixed(1) : "0";

    showCustomMessage(
      processedSubscriptions,
      remaining,
      elapsedTime,
      estimatedTimeLeft
    );
  }

  (async () => {
    await scrollToBottom();
    setTimeout(unsubscribeAll, 2000);
  })();
}
