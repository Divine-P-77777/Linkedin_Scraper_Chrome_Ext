chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "start") {
    openLinksSequentially(msg.links);
  }
});

// OPEN LINKS ONE BY ONE
async function openLinksSequentially(links) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    // open the LinkedIn profile tab
    let tab = await chrome.tabs.create({ url: link, active: true });

    // wait for LinkedIn to fully load
    await wait(7000);

    // inject scraper
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    await chrome.tabs.sendMessage(tab.id, { index: i });
  }

  chrome.runtime.sendMessage({ action: "allDone" });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
