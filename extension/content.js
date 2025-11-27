
let index = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.index !== undefined) {
    index = msg.index;
    sendResponse({ ok: true });
  }
  return true;
});

// small helpers
function q(selector) {
  try {
    return document.querySelector(selector);
  } catch (e) {
    return null;
  }
}

function getText(selector) {
  const el = q(selector);
  return el ? el.innerText.trim() : "";
}

// find first element of tag that contains substring (case-insensitive)
function findByTextContains(tag, substring) {
  const nodes = Array.from(document.getElementsByTagName(tag || "div"));
  const lower = (substring || "").toLowerCase();
  const found = nodes.find(n => (n.innerText || "").toLowerCase().includes(lower));
  return found || null;
}

function extractNumber(text) {
  if (!text) return "";
  const m = text.replace(/\u00A0/g, " ").match(/[\d,.]+/); // handle non-breaking spaces
  return m ? m[0].replace(/,/g, "") : "";
}

async function scrapeProfile() {
  // small delay to allow dynamic content to load
  await new Promise(r => setTimeout(r, 1500));

  // 1) NAME
  let name = getText("h1") || getText(".pv-text-details__left-panel h1");

  if (!name) {
    const h1 = document.querySelector("h1");
    if (h1) name = h1.innerText.trim();
  }

  // 2) LOCATION
  let location = getText("span.text-body-small.inline.t-black--light.break-words") ||
                 (findByTextContains("span", ",") ? findByTextContains("span", ",").innerText.trim() : "");

  // 3) FOLLOWERS
  let followerText = "";
  const followerLi = findByTextContains("li", "followers");
  if (followerLi) followerText = followerLi.innerText.trim();
  if (!followerText) {
    const alt = findByTextContains("span", "followers");
    if (alt) followerText = alt.innerText.trim();
  }
  const followerCount = extractNumber(followerText);

  // 4) CONNECTIONS
  let connectionText = "";
  const connectionsEl = findByTextContains("span", "connections") || findByTextContains("div", "connections");
  if (connectionsEl) connectionText = connectionsEl.innerText.trim();
  const connectionCount = extractNumber(connectionText);

  // 5) ABOUT 
  let about = "";
  const aboutCandidates = Array.from(document.querySelectorAll('div[dir="ltr"]'));
  if (aboutCandidates && aboutCandidates.length) {
    const good = aboutCandidates.find(el => (el.innerText || "").trim().length > 40);
    if (good) about = good.innerText.trim();
  }
  if (!about) {
    const fullWidth = Array.from(document.querySelectorAll("div")).find(d =>
      (d.className || "").toString().toLowerCase().includes("full-width") &&
      (d.innerText || "").trim().length > 40
    );
    if (fullWidth) about = fullWidth.innerText.trim();
  }

  // 6) BIO 
  let bioLine = getText(".text-body-medium.break-words") || getText(".pv-text-details__left-panel .text-body-medium");

  // 7) URL
  const url = window.location.href;

  const result = {
    index,
    name,
    url,
    about,
    bioLine,
    location,
    followerCount,
    connectionCount
  };

  console.info("Scraped profile:", result);

  // send to backend
  try {
    fetch("http://localhost:3000/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    })
    .then(r => r.json())
    .then(resp => {
      console.info("Saved to backend:", resp);
      chrome.runtime.sendMessage({ action: "scrapeResult", result });
    })
    .catch(err => {
      console.error("Backend save error:", err);
      chrome.runtime.sendMessage({ action: "scrapeResult", result: { ...result, error: err.message } });
    });
  } catch (err) {
    console.error("Fetch error:", err);
    chrome.runtime.sendMessage({ action: "scrapeResult", result: { ...result, error: err.message } });
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", scrapeProfile);
} else {
  scrapeProfile();
}
