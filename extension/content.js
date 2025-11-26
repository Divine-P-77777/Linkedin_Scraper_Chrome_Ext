function getText(selector) {
  const el = document.querySelector(selector);
  return el ? el.innerText.trim() : "";
}

const data = {
  name: getText(".pv-text-details__left-panel h1"),
  bioLine: getText(".text-body-medium.break-words"),
  about: getText("#about"),
  location: getText(".pv-text-details__left-panel .text-body-small"),
  followerCount: getText(".pvs-header__optional-info span"),
  connectionCount: getText(".pv-top-card--list li span"),
  url: window.location.href
};

fetch("http://localhost:3000/api/profile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});
