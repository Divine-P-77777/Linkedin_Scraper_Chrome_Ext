chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startScraping") {
    openLinksSequentially(msg.links);
  }

  if (msg.action === "startAutoEngage") {
  startAutoEngage(msg.likeCount, msg.commentCount, msg.commentText);
}

});

async function openLinksSequentially(links) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    let tab = await chrome.tabs.create({ url: link, active: true });

    await wait(7000);

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]   // YOUR scraper file
    });

    await chrome.tabs.sendMessage(tab.id, { index: i });
  }

  chrome.runtime.sendMessage({ action: "allDone" });
}

// ========== AUTO ENGAGEMENT LOGIC ==========
async function startAutoEngage(likeCount, commentCount, commentText) {
  let tab = await chrome.tabs.create({
    url: "https://www.linkedin.com/feed/",
    active: true
  });

  await wait(6000);

  // Inject LIKE script
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["like.js"]
  });

  await wait(500); // IMPORTANT FIX
  await chrome.tabs.sendMessage(tab.id, {
    action: "startLikes",
    likeCount
  });

  await wait(3000);

  // Inject COMMENT script
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["comment.js"]
  });

  await wait(500); // IMPORTANT FIX
  await chrome.tabs.sendMessage(tab.id, {
    action: "startComments",
    commentCount,
    commentText
  });
}

// COMMON WAIT FUNCTION 
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
