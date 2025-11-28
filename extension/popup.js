const textarea = document.getElementById("links");
const likeInput = document.getElementById("likeCount");
const commentInput = document.getElementById("commentCount");
const startEngageBtn = document.getElementById("startBtn");


// Load saved links
chrome.storage.local.get("savedLinks", (data) => {
  if (data.savedLinks) textarea.value = data.savedLinks;
});

// Save textarea live
textarea.addEventListener("input", () => {
  chrome.storage.local.set({ savedLinks: textarea.value });
});


// ================= SCRAPING =================
document.getElementById("scrapeBtn").onclick = () => {
  const rawLinks = textarea.value.trim().split("\n").filter(l => l.trim() !== "");

  if (rawLinks.length < 3) {
    alert("Paste at least 3 LinkedIn profile links.");
    return;
  }

  chrome.runtime.sendMessage({ action: "startScraping", links: rawLinks });

  textarea.value = "";
  chrome.storage.local.set({ savedLinks: "" });

  alert("Scraping started. Keep LinkedIn logged in!");
};


// ================= ENABLE ENGAGE BUTTON =================
function validateEngage() {
  if (likeInput.value > 0 && commentInput.value > 0) {
    startEngageBtn.disabled = false;
  } else {
    startEngageBtn.disabled = true;
  }
}

likeInput.addEventListener("input", validateEngage);
commentInput.addEventListener("input", validateEngage);


// ================= AUTO ENGAGEMENT =================
startEngageBtn.onclick = () => {
  chrome.runtime.sendMessage({
    action: "startAutoEngage",
    likeCount: parseInt(likeInput.value),
    commentCount: parseInt(commentInput.value)
  });

  alert("Auto Engagement Started! Opening LinkedIn Feed...");
};


// ================= VIEW STORED DATA =================
document.getElementById("seeDataBtn").onclick = () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("data/data.html") });
};
