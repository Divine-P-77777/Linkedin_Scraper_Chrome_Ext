const API_URL = "http://localhost:3000/api/profile";

async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  data.forEach(item => {
    const aboutShort = item.about 
      ? item.about.substring(0, 50) + (item.about.length > 50 ? "..." : "")
      : "-";

    const fullAbout = item.about || "-";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name || "-"}</td>
      <td><a href="${item.url}" target="_blank" class="profile-link">Profile</a></td>
      <td>${item.location || "-"}</td>
      <td>${item.followerCount || "-"}</td>
      <td>${item.connectionCount || "-"}</td>
      <td>${item.bioLine || "-"}</td>

      <td>
          <div class="about-box">
            <span class="about-short">${aboutShort}</span>
            <span class="about-full hidden">${fullAbout}</span>
            ${fullAbout.length > 50 
              ? `<button class="toggle-btn">More</button>`
              : ""
            }
          </div>
      </td>
    `;

    tbody.appendChild(row);
  });

  attachToggleButtons();
}

// Add show more / show less behavior
function attachToggleButtons() {
  const buttons = document.querySelectorAll(".toggle-btn");

  buttons.forEach(btn => {
    btn.onclick = () => {
      const parent = btn.parentElement;

      const shortText = parent.querySelector(".about-short");
      const fullText = parent.querySelector(".about-full");

      const isExpanded = !fullText.classList.contains("hidden");

      if (isExpanded) {
        // Switch to short
        fullText.classList.add("hidden");
        shortText.classList.remove("hidden");
        btn.innerText = "More";
      } else {
        // Switch to full
        shortText.classList.add("hidden");
        fullText.classList.remove("hidden");
        btn.innerText = "Less";
      }
    };
  });
}

loadData();
