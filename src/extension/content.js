// content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "show_snapshot") {
        // Add overlay with real-time state data here
        document.body.innerHTML += `<div style="position:fixed; top: 0; right: 0; z-index: 1000;">Current State: ${msg.state}</div>`;
    }
});
