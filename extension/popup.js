// popup.js
console.log("popup.js loaded");

// Listen for the button click
document.getElementById("check-domains").addEventListener("click", async () => {
    // Send a message to the content script to start the domain check
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    // diable the button
    document.getElementById("check-domains").disabled = true;
});