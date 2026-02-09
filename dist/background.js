chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // Try sending a message first
    const response = await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_CHAT" });
    console.log("Message sent to content script", response);
  } catch (err) {
    console.warn("Content script not ready, injecting now...", err);
    
    // If it fails, inject the script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      
      // Retry sending message after injection
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_CHAT" });
      }, 500); // Small delay to ensure script initializes
      
    } catch (injectionErr) {
      console.error("Failed to inject script:", injectionErr);
    }
  }
});
