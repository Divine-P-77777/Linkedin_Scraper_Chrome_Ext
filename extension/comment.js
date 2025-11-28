// comment.js (optimized & stable)
let commentsDone = 0;
let maxComments = 0;

// Persist comment text across re-injections
let userCommentText = window.__AUTO_COMMENT_TEXT__ || "👍";

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "startComments") {
        console.log("DEBUG RECEIVED commentText:", msg.commentText);

        commentsDone = 0;                     // reset for each new run
        maxComments = msg.commentCount || 0;

        if (msg.commentText && msg.commentText.trim() !== "") {
            window.__AUTO_COMMENT_TEXT__ = msg.commentText.trim(); 
            userCommentText = window.__AUTO_COMMENT_TEXT__;
        }

        console.log("DEBUG USING comment:", userCommentText);

        if (maxComments > 0) startAutoComments();
    }
});


// ======================== MAIN LOGIC ============================
async function startAutoComments() {
    console.log(" Auto-comment started...");

    while (commentsDone < maxComments) {

        // Load more posts
        window.scrollBy(0, 900);
        await sleep(randomDelay(900, 1300));

        // Find comment buttons
        const commentBtns = [...document.querySelectorAll('button[aria-label="Comment"]')];

        let targetBtn = null;
        let targetPost = null;

        for (const btn of commentBtns) {
            const post = btn.closest("div.feed-shared-update-v2, div.feed-shared-update");

            // Skip posts that already got comments
            if (post && !post.dataset.commented) {
                targetBtn = btn;
                targetPost = post;
                break;
            }
        }

        if (!targetBtn || !targetPost) {
            console.log(" No available post. Scrolling...");
            await sleep(1500);
            continue;
        }

        // Flag post to avoid repeat
        targetPost.dataset.commented = "true";

        // Open comment box
        targetBtn.click();
        console.log(" Opening comment box...");
        await sleep(1400);

        // Get input box
        const inputBox = targetPost.querySelector('div[contenteditable="true"]');
        if (!inputBox) {
            console.log(" Comment box missing - skipping...");
            continue;
        }

        // Insert text (React-safe)
        typeText(inputBox, userCommentText);
        await sleep(650);

        // Find submit
        const postBtn = targetPost.querySelector(
            "button.comments-comment-box__submit-button--cr, button.comments-comment-box__submit-button"
        );

        if (!postBtn) {
            console.log(" Submit button missing - skipping...");
            continue;
        }

        postBtn.click();
        commentsDone++;

        console.log(`✔ Commented on post ${commentsDone}/${maxComments}`);

        await sleep(randomDelay(1800, 2600));
    }

    console.log(" Auto-comment finished.");
}


// ======================== HELPERS ==============================
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// React-compatible text injection
function typeText(el, text) {
    el.focus();
    el.textContent = text;  // safer than innerHTML

    // Fire LinkedIn's React events
    el.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text
    }));
}
