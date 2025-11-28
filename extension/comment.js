let commentsDone = 0;
let maxComments = 0;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "startComments") {
    maxComments = msg.commentCount || 0;
    if (maxComments > 0) startAutoComments();
  }
});

async function startAutoComments() {
  console.log("💬 Auto-comment started...");

  while (commentsDone < maxComments) {

    window.scrollBy(0, 700);
    await sleep(randomDelay(900, 1500));

    // find all comment buttons
    let commentButtons = [...document.querySelectorAll('button[aria-label*="omment"]')];

    let targetBtn = null;

    for (let btn of commentButtons) {
      let post = btn.closest(
        "div.feed-shared-update-v2, div.feed-shared-update"
      );

      if (post && !post.getAttribute("data-commented")) {
        targetBtn = btn;
        break;
      }
    }

    if (!targetBtn) {
      console.log("No new commentable post found, scrolling...");
      await sleep(1500);
      continue;
    }

    // mark post as used
    let post = targetBtn.closest("div.feed-shared-update-v2, div.feed-shared-update");
    post.setAttribute("data-commented", "true");

    // open the comment box
    targetBtn.click();
    await sleep(1200);

    // find input inside THIS post only
    let input = post.querySelector('div[contenteditable="true"]');
    if (!input) {
      console.log("⚠️ Comment input not found, skipping...");
      continue;
    }

    typeText(input, "CFBR");

    await sleep(600);

    // find post button inside THIS post
    let postBtn = post.querySelector('button[aria-label="Post"], button[data-control-name*="post"]');
    if (!postBtn) {
      console.log("⚠️ Post button missing, skipping...");
      continue;
    }

    postBtn.click();
    commentsDone++;

    console.log(`✔ Commented ${commentsDone}/${maxComments}`);

    await sleep(randomDelay(2000, 3000));
  }

  console.log("🎉 Auto-comment finished.");
}


// Helpers
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function typeText(el, text) {
  el.innerText = text;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
