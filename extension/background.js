// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkIllegalActivity') {
    (async function() {
      try {
        const response = await fetch('http://localhost:8081/domain-research/illegal-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            domain_name: message.domain_name, 
            need_detailed_report: false 
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        sendResponse({ success: true, data });
      } catch (error) {
        console.error('Error checking illegal activity:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
});