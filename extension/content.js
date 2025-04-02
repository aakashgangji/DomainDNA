// content.js
console.log('Faith Domain Checker content script loaded');

// Function to check illegal activity via background script
async function checkIllegalActivity(domainName) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { 
        action: 'checkIllegalActivity', 
        domain_name: domainName 
      }, 
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
          return;
        }
        
        if (!response) {
          reject('No response received');
          return;
        }

        if (response.success) {
          resolve(response.data);
        } else {
          reject(response.error || 'Unknown error occurred');
        }
      }
    );
  });
}

// Function to create a loading indicator
function createLoadingIndicator(element) {
  const loader = document.createElement('span');
  loader.innerHTML = '🔍';
  loader.style.marginLeft = '5px';
  loader.style.fontSize = '18px';
  loader.style.cursor = 'default';
  element.appendChild(loader);
  return loader;
}

// Function to create status badge
function createStatusBadge(status, details) {
  const badge = document.createElement('span');
  badge.style.borderRadius = '50px';
  badge.style.padding = '6px 9px';
  badge.style.marginLeft = '5px';
  badge.style.fontSize = '18px';
  badge.style.color = 'white';
  badge.style.cursor = 'pointer';
  badge.style.fontWeight = 'bold';
  
  if (status === 'Haunted') {
    badge.style.background = '#f46565';
    badge.textContent = '⚠️ Haunted';
  } else if (status === 'Error') {
    badge.style.background = '#ffa500';
    badge.textContent = '❌ Error';
  } else {
    badge.style.background = '#63c14a';
    badge.textContent = '✓ Safe';
  }
  
  badge.title = details || 'Click for details';
  return badge;
}

// Function to create the popup overlay
function createPopup(content) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('faith-domain-popup');
  if (existingPopup) existingPopup.remove();

  const overlay = document.createElement('div');
  overlay.id = 'faith-domain-popup';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10000';
  overlay.style.backdropFilter = 'blur(2px)';

  const popupBox = document.createElement('div');
  popupBox.style.backgroundColor = '#2d2d2d';
  popupBox.style.padding = '25px';
  popupBox.style.borderRadius = '12px';
  popupBox.style.width = '90%';
  popupBox.style.maxWidth = '500px';
  popupBox.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
  popupBox.style.color = '#ffffff';

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = '#ffffff';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => overlay.remove());

  const heading = document.createElement('h3');
  heading.style.margin = '0 0 15px 0';
  heading.style.fontSize = '22px';
  heading.style.fontWeight = 'bold';
  
  if (content.status === 'Haunted') {
    heading.style.color = '#f46565';
    heading.textContent = "🚨 Beware! This domain may be haunted!";
  } else if (content.status === 'Error') {
    heading.style.color = '#ffa500';
    heading.textContent = "⚠️ Couldn't verify this domain";
  } else {
    heading.style.color = '#63c14a';
    heading.textContent = "✅ This domain looks safe!";
  }

  const domainName = document.createElement('div');
  domainName.style.marginBottom = '15px';
  domainName.style.fontSize = '18px';
  domainName.style.fontWeight = 'bold';
  domainName.textContent = content.domain_name;

  const details = document.createElement('div');
  details.style.marginBottom = '20px';
  details.style.lineHeight = '1.5';
  details.textContent = content.details || 'No additional details available.';

  const moreInfoLink = document.createElement('a');
  moreInfoLink.href = `https://www.google.com/search?q=${encodeURIComponent(content.domain_name)}`;
  moreInfoLink.target = '_blank';
  moreInfoLink.rel = 'noopener noreferrer';
  moreInfoLink.textContent = 'Search for more info';
  moreInfoLink.style.display = 'inline-block';
  moreInfoLink.style.padding = '8px 15px';
  moreInfoLink.style.background = '#3a3a3a';
  moreInfoLink.style.color = '#ffffff';
  moreInfoLink.style.borderRadius = '4px';
  moreInfoLink.style.textDecoration = 'none';
  moreInfoLink.style.marginTop = '10px';

  popupBox.appendChild(closeButton);
  popupBox.appendChild(heading);
  popupBox.appendChild(domainName);
  popupBox.appendChild(details);
  popupBox.appendChild(moreInfoLink);
  overlay.appendChild(popupBox);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

// Main function to check domains on the page
async function checkDomainsOnPage() {
  try {
    console.log('Starting domain check...');
    
    // Find all domain elements on Godaddy's search results
    const domainElements = document.querySelectorAll('.spin-domain-span.overflow-wrap.text-break.lh-reset.spin-domain-span-dynamic-font-scaling');
    
    if (!domainElements.length) {
      console.log('No domain elements found on this page');
      return;
    }

    console.log(`Found ${domainElements.length} domains to check`);

    for (const element of domainElements) {
      try {
        const domainName = element.textContent.trim();
        if (!domainName) continue;

        // Add loading indicator
        const loader = createLoadingIndicator(element);
        
        // Check domain status
        const result = await checkIllegalActivity(domainName);
        
        // Remove loader
        element.removeChild(loader);
        
        // Process result
        let status, details;
        if (result && typeof result.illegal_activity !== 'undefined') {
          status = result.illegal_activity ? 'Haunted' : 'Safe';
          details = result.details || 
            (result.illegal_activity 
              ? 'This domain has been associated with suspicious activity.' 
              : 'No suspicious activity detected for this domain.');
        } else {
          status = 'Error';
          details = 'Could not verify domain status.';
        }

        // Add status badge
        const badge = createStatusBadge(status, details);
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          createPopup({
            domain_name: domainName,
            status: status,
            details: details
          });
        });
        
        element.appendChild(badge);
      } catch (error) {
        console.error(`Error processing domain: ${error}`);
        // Add error indicator if loader exists
        const loader = element.querySelector('span[style*="margin-left: 5px"]');
        if (loader) {
          element.removeChild(loader);
          const errorBadge = createStatusBadge('Error', error.message);
          element.appendChild(errorBadge);
        }
      }
    }
    
    console.log('Domain check completed');
  } catch (error) {
    console.error('Error in checkDomainsOnPage:', error);
  }
}

// Wait for page to fully load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // Page already loaded or partially loaded
  setTimeout(checkDomainsOnPage, 2000);
} else {
  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(checkDomainsOnPage, 2000);
  });
}

// Export functions for testing (they won't pollute global scope)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkIllegalActivity,
    createLoadingIndicator,
    createStatusBadge,
    createPopup,
    checkDomainsOnPage
  };
}