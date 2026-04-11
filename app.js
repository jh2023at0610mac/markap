import {
  getFirebaseReady,
  getSampleNews,
  subscribeNews,
  incrementViews
} from "./firebase.js";

const SITE_URL = new URL("./", window.location.href).href;

let news = [];
let currentArticleId = null;

const el = {
  newsGrid: document.getElementById("newsGrid"),
  newsListSection: document.getElementById("newsListSection"),
  articleSection: document.getElementById("articleSection"),
  articleContent: document.getElementById("articleContent"),
  backBtn: document.getElementById("backBtn"),
  homeMoreSection: document.getElementById("homeMoreSection"),
  homeMoreGrid: document.getElementById("homeMoreGrid")
};

const mainEl = document.querySelector("main");

function formatMeta(iso) {
  const dt = new Date(iso || Date.now());
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

function preferShortBrowserTitle() {
  try {
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches
    );
  } catch {
    return false;
  }
}

function updateSeoMeta(item) {
  const fullTitle = item ? `${item.title} | Markap` : "Markap - Azərbaycan Xəbərləri";
  const browserTitle =
    item && preferShortBrowserTitle() ? "Markap" : fullTitle;
  const description = item
    ? item.excerpt || item.content.slice(0, 150)
    : "Markap - Azərbaycan dilində gündəlik siyasət, hadisə və dünya xəbərləri.";
  const image = item
    ? item.image
    : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80";
  const canonical = item
    ? `${SITE_URL}?news=${encodeURIComponent(item.id)}`
    : SITE_URL;

  document.title = browserTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", fullTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", image);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonical);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", fullTitle);
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
        datePublished: new Date(item.createdAtMs).toISOString(),
        dateModified: new Date(item.createdAtMs).toISOString(),
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

function getSortedNews() {
  return [...news].sort((a, b) => Number(b.createdAtMs) - Number(a.createdAtMs));
}

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

function renderRelatedCardsInnerHTML(items) {
  if (!items.length) return "";
  return items
    .map(
      (item) => `
      <article class="related-item" data-id="${item.id}">
        <a class="related-link news-link" href="?news=${encodeURIComponent(item.id)}" aria-label="${escapeAttr(item.title)}">
          <img loading="lazy" class="related-thumb" src="${escapeAttr(item.image || PLACEHOLDER_IMG)}" alt="${escapeAttr(item.title)}" />
          <div class="related-body">
            <span class="related-cat">${escapeHtml(item.category)}</span>
            <h3 class="related-title">${escapeHtml(item.title)}</h3>
            <span class="related-meta">${formatMeta(item.createdAtMs)} · 👁 ${item.views || 0}</span>
          </div>
        </a>
      </article>
    `
    )
    .join("");
}

function buildArticleRelatedHTML(excludeId) {
  const items = getSortedNews().filter((n) => n.id !== excludeId).slice(0, 6);
  if (!items.length) return "";
  return `
    <section class="article-related" aria-label="Digər xəbərlər">
      <h2 class="section-title">Digər xəbərlər</h2>
      <div class="related-grid">${renderRelatedCardsInnerHTML(items)}</div>
    </section>
  `;
}

function renderHomeMore() {
  if (!el.homeMoreSection || !el.homeMoreGrid) return;
  const sorted = getSortedNews();
  if (sorted.length <= 3) {
    el.homeMoreSection.classList.add("hidden");
    el.homeMoreGrid.innerHTML = "";
    return;
  }
  const items = sorted.slice(3, 9);
  el.homeMoreSection.classList.remove("hidden");
  el.homeMoreGrid.innerHTML = renderRelatedCardsInnerHTML(items);
}

function renderNewsGrid() {
  const sorted = getSortedNews();
  el.newsGrid.innerHTML = sorted
    .map(
      (item) => `
      <article class="news-card" data-id="${item.id}">
        <a class="news-link" href="?news=${encodeURIComponent(item.id)}" aria-label="${escapeAttr(item.title)}">
          <img loading="lazy" class="news-cover" src="${escapeAttr(item.image || PLACEHOLDER_IMG)}" alt="${escapeAttr(item.title)}" />
          <div class="news-body">
            <div class="news-meta">
              <span>${formatMeta(item.createdAtMs)}</span>
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
  renderHomeMore();
}

function showArticle(id, { pushState = true } = {}) {
  const item = news.find((n) => n.id === id);
  if (!item) return;
  currentArticleId = item.id;
  incrementViews(item.id).catch(() => {});

  el.articleContent.innerHTML = `
    <img class="article-cover" src="${escapeAttr(item.image || PLACEHOLDER_IMG)}" alt="${escapeHtml(item.title)}" />
    <div class="article-inner">
      <div class="news-meta">${formatMeta(item.createdAtMs)} • ${escapeHtml(item.category)}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.content)}</p>
    </div>
    ${buildArticleRelatedHTML(item.id)}
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

function showList({ pushState = true } = {}) {
  currentArticleId = null;
  el.articleSection.classList.add("hidden");
  el.newsListSection.classList.remove("hidden");
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("news");
    history.pushState({}, "", nextUrl);
  }
  updateSeoMeta();
}

mainEl?.addEventListener("click", (ev) => {
  const raw = ev.target;
  const base = raw instanceof Element ? raw : raw.parentElement;
  if (!base) return;
  const link = base.closest(".news-link");
  if (!link) return;
  ev.preventDefault();
  const card = link.closest(".news-card, .related-item");
  const id = card?.getAttribute("data-id") || card?.dataset?.id;
  if (!id) return;
  showArticle(id);
});

el.backBtn.addEventListener("click", showList);

function renderFromQuery() {
  const newsIdFromUrl = new URL(window.location.href).searchParams.get("news");
  if (newsIdFromUrl) {
    showArticle(newsIdFromUrl, { pushState: false });
    return;
  }
  showList({ pushState: false });
}

function showConfigWarning() {
  el.newsGrid.innerHTML = `
    <article class="news-card">
      <div class="news-body">
        <h3 class="news-title">Firebase konfiqurasiyası tamamlanmayıb</h3>
        <p class="hint">"firebase-config.js" faylına layihə məlumatlarını əlavə edin.</p>
      </div>
    </article>
  `;
  if (el.homeMoreSection) el.homeMoreSection.classList.add("hidden");
  if (el.homeMoreGrid) el.homeMoreGrid.innerHTML = "";
}

if (!getFirebaseReady()) {
  news = getSampleNews();
  renderNewsGrid();
  renderFromQuery();
  showConfigWarning();
} else {
  subscribeNews(
    (items) => {
      news = items;
      renderNewsGrid();
      if (currentArticleId) {
        const active = news.find((n) => n.id === currentArticleId);
        if (active) showArticle(active.id, { pushState: false });
      } else {
        renderFromQuery();
      }
      updateSeoMeta();
    },
    () => {
      showConfigWarning();
    }
  );
}

window.addEventListener("popstate", () => {
  const qNews = new URL(window.location.href).searchParams.get("news");
  if (qNews) {
    showArticle(qNews, { pushState: false });
    return;
  }
  el.articleSection.classList.add("hidden");
  el.newsListSection.classList.remove("hidden");
  showList({ pushState: false });
});
