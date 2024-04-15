chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.openOptionsPage();
  });
  
  chrome.runtime.onStartup.addListener(() => {
    chrome.runtime.openOptionsPage();
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.runtime.openOptionsPage();
  });
  