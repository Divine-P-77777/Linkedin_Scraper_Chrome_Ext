let likesDone = 0;
let maxLikes = 0;

// Receive count from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startLikes") {
    maxLikes = msg.likeCount || 0;
    if (maxLikes > 0) startAutoLike();
  }
});

async function startAutoLike() {
  console.log(" Auto-like started...");

  while (likesDone < maxLikes) {

    // Scroll to load new posts
    window.scrollBy(0, 600);
    await sleep(randomDelay(800, 1500));

    // Get all react buttons
    let buttons = [...document.querySelectorAll('button[aria-label]')];

    // Find FIRST unliked post
    let btn = buttons.find(b =>
      b.getAttribute("aria-label").toLowerCase().includes("like") &&
      !b.getAttribute("aria-label").toLowerCase().includes("unlike") &&
      !b.disabled
    );

    if (!btn) {
      console.log("No likeable post found, scrolling…");
      await sleep(1500);
      continue;
    }

    // Click the like/react button
    btn.click();
    likesDone++;

    console.log(` Liked post: ${likesDone}/${maxLikes}`);

    // Wait natural delay before next like
    await sleep(randomDelay(1800, 2600));
  }

  console.log("✔ Auto-like completed.");
}

// Helpers
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
