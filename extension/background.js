chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "start") {
    openLinksSequentially(msg.links);
  }

  if (msg.action === "scrapeResult") {
    saveScrapedData(msg.result);

    // Send update to popup
    chrome.runtime.sendMessage({
      action: "updateProgress",
      index: msg.result.index,
      name: msg.result.name,
      location: msg.result.location,
      status: "success"
    });
  }
});


// OPEN LINKS ONE BY ONE
async function openLinksSequentially(links) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    let tab = await chrome.tabs.create({ url: link, active: true });

    await wait(6000); 

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    // attach index so content.js knows which row to update
    chrome.tabs.sendMessage(tab.id, { index: i });
  }

  chrome.runtime.sendMessage({ action: "allDone" });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}


// SAVE SCRAPED DATA
function saveScrapedData(result) {
  chrome.storage.local.get(["scrapedResults"], (res) => {
    const arr = res.scrapedResults || [];
    arr.push(result);

    chrome.storage.local.set({ scrapedResults: arr });
  });
}
