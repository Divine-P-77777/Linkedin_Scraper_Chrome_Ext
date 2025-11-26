// LOAD textarea saved text
const textarea = document.getElementById("links");

chrome.storage.local.get("savedLinks", (data) => {
  if (data.savedLinks) {
    textarea.value = data.savedLinks;
  }
});

// Save text whenever typed
textarea.addEventListener("input", () => {
  chrome.storage.local.set({ savedLinks: textarea.value });
});


// START SCRAPING
document.getElementById("startBtn").onclick = () => {
  const links = textarea.value.trim().split("\n").filter(l => l.trim() !== "");

  if (links.length < 3) {
    alert("Please paste minimum 3 LinkedIn profile links.");
    return;
  }

  document.getElementById("statusBox").classList.remove("hidden");
  document.getElementById("progressText").innerText = "Starting scraping...";

  chrome.runtime.sendMessage({ action: "start", links });

  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  links.forEach(() => {
    tbody.innerHTML += `
      <tr>
        <td>—</td>
        <td>—</td>
        <td class="status-pending">Pending</td>
      </tr>`;
  });
};


// RECEIVE PROGRESS UPDATES
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "updateProgress") {
    const { index, status, name, location } = msg;
    const rows = document.querySelectorAll("#resultTable tbody tr");
    const row = rows[index];

    if (!row) return;

    row.children[0].innerText = name || "—";
    row.children[1].innerText = location || "—";

    if (status === "success") {
      row.children[2].innerHTML = `<span class="status-success">Completed</span>`;
    } else {
      row.children[2].innerHTML = `<span class="status-error">Failed</span>`;
    }

    document.getElementById("progressText").innerText =
      `Scraping ${index + 1}/${rows.length}`;
  }

  if (msg.action === "allDone") {
    document.getElementById("progressText").innerText = "Scraping Completed ✓";
    document.getElementById("loader").classList.add("hidden");
  }
});


// LOAD previously scraped results (table persistence)
chrome.storage.local.get("scrapedResults", (res) => {
  const data = res.scrapedResults || [];
  const tbody = document.querySelector("#resultTable tbody");

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.location}</td>
        <td class="status-success">Saved</td>
      </tr>`;
  });
});
