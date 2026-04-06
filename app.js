const SITE_URL = new URL("./", window.location.href).href;

let news = MarkapStore.load();

const el = {
  newsGrid: document.getElementById("newsGrid"),
  newsListSection: document.getElementById("newsListSection"),
  articleSection: document.getElementById("articleSection"),
  articleContent: document.getElementById("articleContent"),
  backBtn: document.getElementById("backBtn")
};

function saveNews() {
  MarkapStore.save(news);
}

function formatMeta(iso) {
  const dt = new Date(iso);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `BU GÜN / ${hh}:${mm}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function updateSeoMeta(item) {
  const title = item ? `${item.title} | Markap` : "Markap - Azərbaycan Xəbərləri";
  const description = item
    ? item.excerpt || item.content.slice(0, 150)
    : "Markap - Azərbaycan dilində gündəlik siyasət, hadisə və dünya xəbərləri.";
  const image = item
    ? item.image
    : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80";
  const canonical = item
    ? `${SITE_URL}?news=${encodeURIComponent(item.id)}`
    : SITE_URL;

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", image);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonical);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", image);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);

  const jsonLd = document.getElementById("seoJsonLd");
  if (jsonLd && item) {
    jsonLd.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: item.title,
        articleSection: item.category,
        datePublished: item.createdAt,
        dateModified: item.createdAt,
        image: [item.image],
        author: { "@type": "Organization", name: "Markap" },
        publisher: { "@type": "Organization", name: "Markap" },
        description,
        mainEntityOfPage: canonical
      },
      null,
      2
    );
  }
}

function renderNewsGrid() {
  const sorted = [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  el.newsGrid.innerHTML = sorted
    .map(
      (item) => `
      <article class="news-card" data-id="${item.id}">
        <a class="news-link" href="?news=${encodeURIComponent(item.id)}" aria-label="${escapeAttr(item.title)}">
          <img loading="lazy" class="news-cover" src="${item.image}" alt="${escapeAttr(item.title)}" />
          <div class="news-body">
            <div class="news-meta">
              <span>${formatMeta(item.createdAt)}</span>
              <span>👁 ${item.views || 0}</span>
            </div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <div class="news-category">${escapeHtml(item.category)}</div>
          </div>
        </a>
      </article>
    `
    )
    .join("");
}

function showArticle(id, { pushState = true } = {}) {
  const item = news.find((n) => n.id === id);
  if (!item) return;
  item.views = (item.views || 0) + 1;
  saveNews();

  el.articleContent.innerHTML = `
    <img class="article-cover" src="${item.image}" alt="${escapeHtml(item.title)}" />
    <div class="article-inner">
      <div class="news-meta">${formatMeta(item.createdAt)} • ${escapeHtml(item.category)}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.content)}</p>
    </div>
  `;

  el.newsListSection.classList.add("hidden");
  el.articleSection.classList.remove("hidden");
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("news", item.id);
    history.pushState({ news: item.id }, "", nextUrl);
  }
  updateSeoMeta(item);
  renderNewsGrid();
}

function showList() {
  el.articleSection.classList.add("hidden");
  el.newsListSection.classList.remove("hidden");
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("news");
  history.pushState({}, "", nextUrl);
  updateSeoMeta();
}

el.newsGrid.addEventListener("click", (ev) => {
  const link = ev.target.closest(".news-link");
  if (!link) return;
  ev.preventDefault();
  const card = link.closest(".news-card");
  if (!card) return;
  showArticle(card.dataset.id);
});

el.backBtn.addEventListener("click", showList);

function refreshNewsFromStore() {
  news = MarkapStore.load();
  renderNewsGrid();
}

window.addEventListener("storage", (ev) => {
  if (ev.key === MarkapStore.STORAGE_KEY) refreshNewsFromStore();
});

window.addEventListener("focus", refreshNewsFromStore);

renderNewsGrid();
updateSeoMeta();

const newsIdFromUrl = new URL(window.location.href).searchParams.get("news");
if (newsIdFromUrl) {
  showArticle(newsIdFromUrl, { pushState: false });
}

window.addEventListener("popstate", () => {
  const qNews = new URL(window.location.href).searchParams.get("news");
  if (qNews) {
    showArticle(qNews, { pushState: false });
    return;
  }
  el.articleSection.classList.add("hidden");
  el.newsListSection.classList.remove("hidden");
  updateSeoMeta();
});
