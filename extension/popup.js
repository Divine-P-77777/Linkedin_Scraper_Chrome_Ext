const textarea = document.getElementById("links");

// Load saved textarea content
chrome.storage.local.get("savedLinks", (data) => {
  if (data.savedLinks) textarea.value = data.savedLinks;
});

// Save textarea text live
textarea.addEventListener("input", () => {
  chrome.storage.local.set({ savedLinks: textarea.value });
});

// START SCRAPING
document.getElementById("startBtn").onclick = () => {
  const rawLinks = textarea.value
    .trim()
    .split("\n")
    .filter(l => l.trim() !== "");

  if (rawLinks.length < 3) {
    alert("Paste at least 3 LinkedIn profile links.");
    return;
  }


  // Send links to background script
  chrome.runtime.sendMessage({ action: "start", links: rawLinks });

  // Clear textarea after submission
  textarea.value = "";
  chrome.storage.local.set({ savedLinks: "" });

  // Optional success message
  alert("Scraping started. Please keep LinkedIn logged in.");
};

// OPEN DATA PAGE
document.getElementById("seeDataBtn").onclick = () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("data/data.html")
  });
};
