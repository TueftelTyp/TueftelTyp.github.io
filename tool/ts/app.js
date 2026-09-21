const SUBMISSION_EMAIL = "hello@yourdomain.com";

const toolsGrid = document.getElementById("toolsGrid");
const categoryFilters = document.getElementById("categoryFilters");
const categoryCards = document.getElementById("categoryCards");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const clearFilters = document.getElementById("clearFilters");
const themeToggle = document.getElementById("themeToggle");
const submitForm = document.getElementById("submitForm");

let tools = [];
let activeCategory = "All";

const categoryIcons = {
  Design: "✦",
  Productivity: "◷",
  Development: "</>",
  Writing: "✎",
  Marketing: "↗",
  Utilities: "⚙",
  Finance: "$",
  Other: "●"
};

async function loadTools() {
  try {
    const response = await fetch("tools.json");

    if (!response.ok) {
      throw new Error("Could not load tools.json");
    }

    tools = await response.json();

    updateStats();
    createCategoryFilters();
    createCategoryCards();
    renderTools();
  } catch (error) {
    console.error(error);

    toolsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Could not load the tools</h3>
        <p>
          Make sure that tools.json exists in the same folder as index.html.
        </p>
      </div>
    `;
  }
}

function updateStats() {
  const categories = [...new Set(tools.map(tool => tool.category))];

  document.getElementById("toolCount").textContent = tools.length;
  document.getElementById("categoryCount").textContent = categories.length;
}

function getCategories() {
  return [...new Set(tools.map(tool => tool.category))].sort();
}

function createCategoryFilters() {
  const categories = getCategories();

  categoryFilters.innerHTML = `
    <button class="category-button active" data-category="All">
      All tools
    </button>
  `;

  categories.forEach(category => {
    const button = document.createElement("button");

    button.className = "category-button";
    button.dataset.category = category;
    button.textContent = category;

    categoryFilters.appendChild(button);
  });

  categoryFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".category-button").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.category === activeCategory
      );
    });

    renderTools();
  });
}

function createCategoryCards() {
  categoryCards.innerHTML = "";

  getCategories().forEach(category => {
    const amount = tools.filter(tool => tool.category === category).length;
    const card = document.createElement("div");

    card.className = "category-card";
    card.innerHTML = `
      <div class="category-card-icon">
        ${categoryIcons[category] || "●"}
      </div>
      <h3>${escapeHtml(category)}</h3>
      <p>${amount} ${amount === 1 ? "tool" : "tools"}</p>
    `;

    card.addEventListener("click", () => {
      activeCategory = category;

      document.querySelectorAll(".category-button").forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.category === activeCategory
        );
      });

      renderTools();

      document.getElementById("tools").scrollIntoView({
        behavior: "smooth"
      });
    });

    categoryCards.appendChild(card);
  });
}

function renderTools() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  let filteredTools = tools.filter(tool => {
    const searchableText = [
      tool.name,
      tool.description,
      tool.category,
      ...(tool.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);
    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortSelect.value === "az") {
    filteredTools.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortSelect.value === "za") {
    filteredTools.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (sortSelect.value === "featured") {
    filteredTools.sort((a, b) => {
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }

  toolsGrid.innerHTML = "";

  filteredTools.forEach(tool => {
    toolsGrid.appendChild(createToolCard(tool));
  });

  emptyState.classList.toggle("hidden", filteredTools.length !== 0);
}

function createToolCard(tool) {
  const card = document.createElement("article");
  const icon = tool.icon || tool.name.charAt(0).toUpperCase();

  const sourceLink = tool.source
    ? `
      <a
        class="source-link"
        href="${escapeAttribute(tool.source)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source code
      </a>
    `
    : "";

  card.className = "tool-card";

  card.innerHTML = `
    <div class="tool-top">
      <div class="tool-icon">${escapeHtml(icon)}</div>

      ${
        tool.featured
          ? '<span class="featured-label">Featured</span>'
          : ""
      }
    </div>

    <h3>${escapeHtml(tool.name)}</h3>

    <p>${escapeHtml(tool.description)}</p>

    <div class="tool-footer">
      <div class="tool-tags">
        ${(tool.tags || [])
          .slice(0, 3)
          .map(tag => `<span class="tool-tag">#${escapeHtml(tag)}</span>`)
          .join("")}
      </div>

      <div class="tool-links">
        <a
          class="visit-link"
          href="${escapeAttribute(tool.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit →
        </a>

        ${sourceLink}
      </div>
    </div>
  `;

  return card;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "%22")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E");
}

searchInput.addEventListener("input", renderTools);
sortSelect.addEventListener("change", renderTools);

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  activeCategory = "All";

  document.querySelectorAll(".category-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderTools();
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem("toolscout-theme", newTheme);

  themeToggle.textContent = newTheme === "dark" ? "☼" : "☾";
  themeToggle.setAttribute(
    "aria-label",
    newTheme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode"
  );
});

submitForm.addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(submitForm);

  const toolName = formData.get("toolName");
  const toolUrl = formData.get("toolUrl");
  const category = formData.get("category");
  const sourceUrl = formData.get("sourceUrl") || "Not provided";
  const description = formData.get("description");

  const subject = encodeURIComponent(
    `ToolScout submission: ${toolName}`
  );

  const body = encodeURIComponent(
`New ToolScout submission

Tool name: ${toolName}
Tool URL: ${toolUrl}
Category: ${category}
Source code URL: ${sourceUrl}

Description:
${description}`
  );

  window.location.href =
    `mailto:${SUBMISSION_EMAIL}?subject=${subject}&body=${body}`;
});

const savedTheme = localStorage.getItem("toolscout-theme");

/*
  Dark mode is the default.
  A previously selected theme is still remembered.
*/
const initialTheme = savedTheme || "dark";

document.documentElement.dataset.theme = initialTheme;
themeToggle.textContent = initialTheme === "dark" ? "☼" : "☾";
themeToggle.setAttribute(
  "aria-label",
  initialTheme === "dark"
    ? "Switch to light mode"
    : "Switch to dark mode"
);

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

loadTools();
