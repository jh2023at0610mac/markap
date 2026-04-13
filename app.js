import {
  getFirebaseReady,
  getSampleNews,
  getSampleVacancies,
  subscribeNews,
  subscribeVacancies,
  incrementViews
} from "./firebase.js";

const SITE_URL = new URL("./", window.location.href).href;
const PAGE_SIZE = 51;

let news = [];
let vacancies = [];
let currentArticleId = null;
let currentVacancyId = null;
let currentPage = 1;
let lastNewsListSig = "";
let lastArticleContentSig = "";
let lastVacancyDetailSig = "";

const el = {
  mainTabs: document.getElementById("mainTabs"),
  tabBtnNews: document.getElementById("tabBtnNews"),
  tabBtnVacancies: document.getElementById("tabBtnVacancies"),
  tabPanelNews: document.getElementById("tabPanelNews"),
  tabPanelVacancies: document.getElementById("tabPanelVacancies"),
  vacancyGrid: document.getElementById("vacancyGrid"),
  vacancySection: document.getElementById("vacancySection"),
  vacancyContent: document.getElementById("vacancyContent"),
  vacancyBackBtn: document.getElementById("vacancyBackBtn"),
  newsGrid: document.getElementById("newsGrid"),
  newsListSection: document.getElementById("newsListSection"),
  articleSection: document.getElementById("articleSection"),
  articleContent: document.getElementById("articleContent"),
  backBtn: document.getElementById("backBtn"),
  homeMoreSection: document.getElementById("homeMoreSection"),
  homeMoreGrid: document.getElementById("homeMoreGrid"),
  pager: document.getElementById("pager")
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
  if (jsonLd && !item) {
    jsonLd.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "NewsMediaOrganization",
        name: "Markap",
        url: SITE_URL.replace(/\/?$/, "/"),
        logo: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
        sameAs: ["https://github.com/jh2023at0610mac/markap"]
      },
      null,
      2
    );
  }
}

function updateSeoMetaVacancy(v) {
  const fullTitle = `${v.title} | ${v.company} | Markap`;
  const browserTitle = preferShortBrowserTitle() ? "Markap" : fullTitle;
  const descBody = String(v.description || "");
  const description =
    (v.summary && String(v.summary).trim()) || descBody.slice(0, 160) || "Vakansiya — Markap.";
  const image =
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80";
  const canonical = `${SITE_URL}?tab=vakansiyalar&vacancy=${encodeURIComponent(v.id)}`;

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
  if (jsonLd) {
    jsonLd.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: v.title,
        datePosted: new Date(v.postedAtMs).toISOString(),
        description: `${descBody}\n\nTələblər:\n${v.requirements || ""}`,
        hiringOrganization: { "@type": "Organization", name: v.company },
        jobLocation: { "@type": "Place", name: v.location },
        employmentType: v.employment,
        identifier: { "@type": "PropertyValue", name: "Mənbə", value: v.source || "—" },
        mainEntityOfPage: canonical
      },
      null,
      2
    );
  }
}

function getPageFromUrl() {
  const raw = Number(new URL(window.location.href).searchParams.get("page") || "1");
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

function getArticleHref(id) {
  const p = getPageFromUrl();
  return p > 1 ? `?page=${p}&news=${encodeURIComponent(id)}` : `?news=${encodeURIComponent(id)}`;
}

function getVacancyHref(id) {
  return `?tab=vakansiyalar&vacancy=${encodeURIComponent(id)}`;
}

function formatVacancyPosted(ms) {
  try {
    return new Date(ms || Date.now()).toLocaleDateString("az-AZ", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

function setActiveTabButtons(tab) {
  el.tabBtnNews?.classList.toggle("is-active", tab === "xeberler");
  el.tabBtnVacancies?.classList.toggle("is-active", tab === "vakansiyalar");
}

function switchMainTab(tab, { pushState = true } = {}) {
  if (currentArticleId || currentVacancyId) return;
  el.mainTabs?.classList.remove("hidden");
  el.articleSection.classList.add("hidden");
  el.vacancySection?.classList.add("hidden");
  if (tab === "vakansiyalar") {
    el.tabPanelNews?.classList.add("hidden");
    el.tabPanelVacancies?.classList.remove("hidden");
    setActiveTabButtons("vakansiyalar");
    renderVacancyGrid();
  } else {
    el.tabPanelVacancies?.classList.add("hidden");
    el.tabPanelNews?.classList.remove("hidden");
    el.newsListSection.classList.remove("hidden");
    setActiveTabButtons("xeberler");
    renderNewsGrid();
  }
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("news");
    nextUrl.searchParams.delete("vacancy");
    if (tab === "vakansiyalar") {
      nextUrl.searchParams.delete("page");
      nextUrl.searchParams.set("tab", "vakansiyalar");
    } else {
      nextUrl.searchParams.delete("tab");
    }
    history.pushState({}, "", nextUrl);
  }
  updateSeoMeta();
}

function vacancyDetailSignature(v) {
  return JSON.stringify({
    id: v.id,
    title: v.title,
    company: v.company,
    location: v.location,
    employment: v.employment,
    salary: v.salary,
    source: v.source,
    summary: v.summary || "",
    description: v.description || "",
    requirements: v.requirements || "",
    postedAtMs: Number(v.postedAtMs || 0)
  });
}

function renderVacancyGrid() {
  if (!el.vacancyGrid) return;
  if (!vacancies.length) {
    el.vacancyGrid.innerHTML = `<p class="hint vacancy-empty">Hal-hazırda açıq vakansiya yoxdur.</p>`;
    return;
  }
  el.vacancyGrid.innerHTML = vacancies.map(
    (v) => `
    <article class="vacancy-card" data-vacancy-id="${escapeAttr(v.id)}">
      <a class="vacancy-link" href="${getVacancyHref(v.id)}" aria-label="${escapeAttr(v.title)}">
        <div class="vacancy-body">
          <div class="vacancy-meta">
            <span class="vacancy-source">${escapeHtml(v.source)}</span>
            <span>${formatVacancyPosted(v.postedAtMs)}</span>
          </div>
          <h3 class="vacancy-title">${escapeHtml(v.title)}</h3>
          <div class="vacancy-company">${escapeHtml(v.company)}</div>
          <p class="vacancy-summary">${escapeHtml(v.summary)}</p>
          <div class="vacancy-tags">
            <span>${escapeHtml(v.location)}</span>
            <span>${escapeHtml(v.employment)}</span>
            <span>${escapeHtml(v.salary)}</span>
          </div>
        </div>
      </a>
    </article>
  `
  ).join("");
}

function showVacancy(id, { pushState = true } = {}) {
  const v = vacancies.find((x) => x.id === id);
  if (!v) return;
  currentVacancyId = v.id;
  currentArticleId = null;
  lastArticleContentSig = "";

  el.vacancyContent.innerHTML = `
    <div class="vacancy-detail-head">
      <div class="vacancy-detail-meta">
        <span class="vacancy-source">${escapeHtml(v.source)}</span>
        <span>${formatVacancyPosted(v.postedAtMs)}</span>
      </div>
      <h2>${escapeHtml(v.title)}</h2>
      <div class="vacancy-detail-company">${escapeHtml(v.company)}</div>
      <ul class="vacancy-detail-facts">
        <li><strong>Yer</strong> ${escapeHtml(v.location)}</li>
        <li><strong>İş növü</strong> ${escapeHtml(v.employment)}</li>
        <li><strong>Əməkhaqqı</strong> ${escapeHtml(v.salary)}</li>
        <li><strong>Mənbə</strong> ${escapeHtml(v.source)}</li>
      </ul>
    </div>
    <div class="article-inner vacancy-detail-inner">
      <h3 class="vacancy-block-title">İşin təsviri</h3>
      <p>${escapeHtml(v.description)}</p>
      <h3 class="vacancy-block-title">Tələblər</h3>
      <p class="vacancy-req">${escapeHtml(v.requirements)}</p>
    </div>
  `;

  el.mainTabs?.classList.add("hidden");
  el.tabPanelNews?.classList.add("hidden");
  el.tabPanelVacancies?.classList.add("hidden");
  el.articleSection.classList.add("hidden");
  el.vacancySection?.classList.remove("hidden");

  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("news");
    nextUrl.searchParams.delete("page");
    nextUrl.searchParams.set("tab", "vakansiyalar");
    nextUrl.searchParams.set("vacancy", v.id);
    history.pushState({ vacancy: v.id }, "", nextUrl);
  }
  lastVacancyDetailSig = vacancyDetailSignature(v);
  updateSeoMetaVacancy(v);
}

function showVacancyList({ pushState = true } = {}) {
  currentVacancyId = null;
  lastVacancyDetailSig = "";
  el.vacancySection?.classList.add("hidden");
  el.articleSection.classList.add("hidden");
  el.mainTabs?.classList.remove("hidden");
  el.tabPanelNews?.classList.add("hidden");
  el.tabPanelVacancies?.classList.remove("hidden");
  setActiveTabButtons("vakansiyalar");
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("vacancy");
    nextUrl.searchParams.delete("news");
    nextUrl.searchParams.delete("page");
    nextUrl.searchParams.set("tab", "vakansiyalar");
    history.pushState({}, "", nextUrl);
  }
  renderVacancyGrid();
  updateSeoMeta();
}

function buildPagerPages(totalPages, page) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }
  return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
}

function renderPager(totalPages) {
  if (!el.pager) return;
  if (totalPages <= 1) {
    el.pager.classList.add("hidden");
    el.pager.innerHTML = "";
    return;
  }
  const pages = buildPagerPages(totalPages, currentPage);
  const bits = [];
  bits.push(
    `<button class="pager-btn" data-page="${Math.max(1, currentPage - 1)}" ${
      currentPage <= 1 ? "disabled" : ""
    }>Əvvəlki</button>`
  );
  pages.forEach((num, idx) => {
    const prev = pages[idx - 1];
    if (prev && num - prev > 1) {
      bits.push('<span class="pager-gap">…</span>');
    }
    bits.push(
      `<button class="pager-btn ${num === currentPage ? "is-active" : ""}" data-page="${num}">${num}</button>`
    );
  });
  bits.push(
    `<button class="pager-btn" data-page="${Math.min(totalPages, currentPage + 1)}" ${
      currentPage >= totalPages ? "disabled" : ""
    }>Növbəti</button>`
  );
  el.pager.classList.remove("hidden");
  el.pager.innerHTML = bits.join("");
}

function getSortedNews() {
  return [...news].sort((a, b) => Number(b.createdAtMs) - Number(a.createdAtMs));
}

function newsListSignature(items) {
  return JSON.stringify(
    [...items]
      .map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        image: i.image || "",
        excerpt: i.excerpt || "",
        content: i.content || "",
        createdAtMs: Number(i.createdAtMs || 0)
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  );
}

function articleContentSignature(item) {
  return JSON.stringify({
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
    excerpt: item.excerpt || "",
    image: item.image || "",
    createdAtMs: Number(item.createdAtMs || 0)
  });
}

function patchViewCountsInList(items) {
  const byId = new Map(items.map((i) => [i.id, i]));
  el.newsGrid?.querySelectorAll(".news-meta-views[data-news-id]").forEach((span) => {
    const id = span.getAttribute("data-news-id");
    const it = id ? byId.get(id) : null;
    if (it) span.textContent = `👁 ${it.views || 0}`;
  });
}

function patchRelatedViewCounts(items) {
  const byId = new Map(items.map((i) => [i.id, i]));
  el.articleContent?.querySelectorAll(".related-item[data-id]").forEach((row) => {
    const id = row.getAttribute("data-id");
    const it = id ? byId.get(id) : null;
    const meta = row.querySelector(".related-meta");
    if (it && meta) {
      meta.textContent = `${formatMeta(it.createdAtMs)} · 👁 ${it.views || 0}`;
    }
  });
}

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

function renderRelatedCardsInnerHTML(items) {
  if (!items.length) return "";
  return items
    .map(
      (item) => `
      <article class="related-item" data-id="${item.id}">
        <a class="related-link news-link" href="${getArticleHref(item.id)}" aria-label="${escapeAttr(item.title)}">
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
  el.homeMoreSection.classList.add("hidden");
  el.homeMoreGrid.innerHTML = "";
}

function renderNewsGrid() {
  const sorted = getSortedNews();
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  currentPage = Math.min(getPageFromUrl(), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  el.newsGrid.innerHTML = pageItems
    .map(
      (item) => `
      <article class="news-card" data-id="${item.id}">
        <a class="news-link" href="${getArticleHref(item.id)}" aria-label="${escapeAttr(item.title)}">
          <img loading="lazy" class="news-cover" src="${escapeAttr(item.image || PLACEHOLDER_IMG)}" alt="${escapeAttr(item.title)}" />
          <div class="news-body">
            <div class="news-meta">
              <span>${formatMeta(item.createdAtMs)}</span>
              <span class="news-meta-views" data-news-id="${item.id}">👁 ${item.views || 0}</span>
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
  renderPager(totalPages);
}

function showArticle(id, { pushState = true, skipViewIncrement = false } = {}) {
  const item = news.find((n) => n.id === id);
  if (!item) return;
  currentArticleId = item.id;
  if (!skipViewIncrement) {
    incrementViews(item.id).catch(() => {});
  }

  el.articleContent.innerHTML = `
    <img class="article-cover" src="${escapeAttr(item.image || PLACEHOLDER_IMG)}" alt="${escapeHtml(item.title)}" />
    <div class="article-inner">
      <div class="news-meta">${formatMeta(item.createdAtMs)} • ${escapeHtml(item.category)}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.content)}</p>
    </div>
    ${buildArticleRelatedHTML(item.id)}
  `;

  el.mainTabs?.classList.add("hidden");
  el.tabPanelNews?.classList.add("hidden");
  el.tabPanelVacancies?.classList.add("hidden");
  el.vacancySection?.classList.add("hidden");
  el.newsListSection.classList.add("hidden");
  el.articleSection.classList.remove("hidden");
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("vacancy");
    nextUrl.searchParams.delete("tab");
    nextUrl.searchParams.set("news", item.id);
    history.pushState({ news: item.id }, "", nextUrl);
  }
  lastArticleContentSig = articleContentSignature(item);
  updateSeoMeta(item);
}

function showList({ pushState = true } = {}) {
  currentArticleId = null;
  currentVacancyId = null;
  lastArticleContentSig = "";
  lastVacancyDetailSig = "";
  el.articleSection.classList.add("hidden");
  el.vacancySection?.classList.add("hidden");
  el.mainTabs?.classList.remove("hidden");
  el.tabPanelVacancies?.classList.add("hidden");
  el.tabPanelNews?.classList.remove("hidden");
  el.newsListSection.classList.remove("hidden");
  setActiveTabButtons("xeberler");
  if (pushState) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("news");
    nextUrl.searchParams.delete("vacancy");
    nextUrl.searchParams.delete("tab");
    history.pushState({}, "", nextUrl);
  }
  updateSeoMeta();
}

mainEl?.addEventListener("click", (ev) => {
  const raw = ev.target;
  const base = raw instanceof Element ? raw : raw.parentElement;
  if (!base) return;
  const vlink = base.closest(".vacancy-link");
  if (vlink) {
    ev.preventDefault();
    const card = vlink.closest("[data-vacancy-id]");
    const vid = card?.getAttribute("data-vacancy-id");
    if (vid) showVacancy(vid);
    return;
  }
  const link = base.closest(".news-link");
  if (!link) return;
  ev.preventDefault();
  const card = link.closest(".news-card, .related-item");
  const id = card?.getAttribute("data-id") || card?.dataset?.id;
  if (!id) return;
  showArticle(id);
});

el.pager?.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".pager-btn[data-page]");
  if (!btn || btn.disabled) return;
  const page = Number(btn.dataset.page);
  if (!Number.isFinite(page) || page < 1) return;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("page", String(page));
  nextUrl.searchParams.delete("news");
  nextUrl.searchParams.delete("vacancy");
  nextUrl.searchParams.delete("tab");
  history.pushState({}, "", nextUrl);
  showList({ pushState: false });
  renderNewsGrid();
  el.newsListSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

el.backBtn.addEventListener("click", showList);
el.vacancyBackBtn?.addEventListener("click", () => showVacancyList());
el.tabBtnNews?.addEventListener("click", () => switchMainTab("xeberler"));
el.tabBtnVacancies?.addEventListener("click", () => switchMainTab("vakansiyalar"));

function renderFromQuery() {
  currentPage = getPageFromUrl();
  const url = new URL(window.location.href);
  const newsIdFromUrl = url.searchParams.get("news");
  const vacancyIdFromUrl = url.searchParams.get("vacancy");
  if (newsIdFromUrl) {
    showArticle(newsIdFromUrl, { pushState: false });
    return;
  }
  if (vacancyIdFromUrl) {
    showVacancy(vacancyIdFromUrl, { pushState: false });
    return;
  }
  currentArticleId = null;
  currentVacancyId = null;
  lastArticleContentSig = "";
  lastVacancyDetailSig = "";
  el.articleSection.classList.add("hidden");
  el.vacancySection?.classList.add("hidden");
  el.mainTabs?.classList.remove("hidden");
  const onVacancies = url.searchParams.get("tab") === "vakansiyalar";
  if (onVacancies) {
    el.tabPanelNews?.classList.add("hidden");
    el.tabPanelVacancies?.classList.remove("hidden");
    setActiveTabButtons("vakansiyalar");
    renderVacancyGrid();
  } else {
    el.tabPanelVacancies?.classList.add("hidden");
    el.tabPanelNews?.classList.remove("hidden");
    el.newsListSection.classList.remove("hidden");
    setActiveTabButtons("xeberler");
    renderNewsGrid();
  }
  updateSeoMeta();
}

function showConfigWarning() {
  lastNewsListSig = "";
  lastArticleContentSig = "";
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
  if (el.pager) {
    el.pager.classList.add("hidden");
    el.pager.innerHTML = "";
  }
}

if (!getFirebaseReady()) {
  news = getSampleNews();
  vacancies = getSampleVacancies();
  renderNewsGrid();
  renderVacancyGrid();
  renderFromQuery();
  showConfigWarning();
} else {
  vacancies = [];
  subscribeVacancies(
    (items) => {
      vacancies = items;
      renderVacancyGrid();
      if (currentVacancyId) {
        const v = vacancies.find((x) => x.id === currentVacancyId);
        if (!v) {
          lastVacancyDetailSig = "";
          currentVacancyId = null;
          renderFromQuery();
        } else {
          const dSig = vacancyDetailSignature(v);
          if (dSig !== lastVacancyDetailSig) {
            showVacancy(v.id, { pushState: false });
          }
        }
      }
    },
    (err) => {
      console.warn("[vacancies] Firestore listen failed (rules or network?)", err?.message || err);
      vacancies = getSampleVacancies();
      renderVacancyGrid();
    }
  );

  subscribeNews(
    (items) => {
      news = items;
      const listSig = newsListSignature(items);
      if (listSig !== lastNewsListSig) {
        lastNewsListSig = listSig;
        renderNewsGrid();
      } else {
        patchViewCountsInList(items);
      }

      let active = currentArticleId
        ? news.find((n) => n.id === currentArticleId)
        : null;

      if (currentArticleId) {
        if (!active) {
          lastArticleContentSig = "";
          showList({ pushState: false });
        } else {
          const aSig = articleContentSignature(active);
          if (aSig !== lastArticleContentSig) {
            showArticle(active.id, { pushState: false, skipViewIncrement: true });
          } else {
            patchViewCountsInList(items);
            patchRelatedViewCounts(items);
          }
        }
      } else if (currentVacancyId) {
        const v = vacancies.find((x) => x.id === currentVacancyId);
        if (v) {
          updateSeoMetaVacancy(v);
        } else {
          lastVacancyDetailSig = "";
          currentVacancyId = null;
          renderFromQuery();
        }
      } else {
        renderFromQuery();
      }

      active = currentArticleId
        ? news.find((n) => n.id === currentArticleId)
        : null;
      if (!currentVacancyId) {
        updateSeoMeta(active || undefined);
      }
    },
    () => {
      showConfigWarning();
    }
  );
}

window.addEventListener("popstate", () => {
  currentPage = getPageFromUrl();
  const url = new URL(window.location.href);
  const qNews = url.searchParams.get("news");
  const qVacancy = url.searchParams.get("vacancy");
  if (qNews) {
    showArticle(qNews, { pushState: false });
    return;
  }
  if (qVacancy) {
    showVacancy(qVacancy, { pushState: false });
    return;
  }
  renderFromQuery();
});
