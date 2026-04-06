const STORAGE_KEY = "az-news-items-v1";
const SITE_URL = "https://jh2023at0610mac.github.io/markap/";

const sampleNews = [
  {
    id: crypto.randomUUID(),
    title: "Gürcüstanda Azərbaycan Prezidentinin şərəfinə lanç verilib - FOTO",
    category: "Siyasət",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
    excerpt:
      "Tbilisidə keçirilən rəsmi tədbirdə ikitərəfli münasibətlər və regional əməkdaşlıq müzakirə olunub.",
    content:
      "Bu gün Tbilisidə Azərbaycan Prezidentinin şərəfinə rəsmi lanç təşkil olunub.\n\nTədbirdə iki ölkə arasında siyasi və iqtisadi əlaqələrin inkişafı əsas müzakirə mövzusu olub. Tərəflər regionda sabitlik və yeni əməkdaşlıq istiqamətlərinin genişləndirilməsinin vacibliyini vurğulayıblar.\n\nGörüşün sonunda bir sıra humanitar layihələrin dəstəklənməsi ilə bağlı ilkin razılıq əldə edildiyi bildirilib.",
    createdAt: new Date().toISOString(),
    views: 187
  },
  {
    id: crypto.randomUUID(),
    title: "16 yaşlı qızı maşın vurdu",
    category: "Hadisə",
    image:
      "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=1400&q=80",
    excerpt:
      "Paytaxt ərazisində baş verən yol-nəqliyyat hadisəsi ilə bağlı araşdırma aparılır.",
    content:
      "Bakının mərkəzi küçələrindən birində 16 yaşlı qızın vurulması ilə nəticələnən yol qəzası baş verib.\n\nHadisə yerinə təcili yardım və yol polisi əməkdaşları cəlb edilib. Yaralı xəstəxanaya çatdırılıb, vəziyyətinin stabil olduğu bildirilib.\n\nFaktla bağlı araşdırma aparılır, sürücünün izahatı alınıb.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    views: 428
  },
  {
    id: crypto.randomUUID(),
    title: "\"Crocus\"dakı terror aktına görə ömürlük həbs edilmiş şəxs intihar edib - FOTO",
    category: "Dünya",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80",
    excerpt:
      "Rusiya mediasının yaydığı məlumata əsasən hadisə cəzaçəkmə müəssisəsində baş verib.",
    content:
      "Rusiya mətbuatının məlumatına görə, \"Crocus\" terror aktı üzrə ömürlük həbs cəzası alan şəxsin cəzaçəkmə müəssisəsində intihar etdiyi iddia olunur.\n\nRəsmi qurumlar məsələ ilə bağlı ilkin araşdırmanın aparıldığını açıqlayıb. Hadisənin bütün detalları dəqiqləşdirildikdən sonra ictimaiyyətə əlavə məlumat veriləcəyi bildirilib.",
    createdAt: new Date(Date.now() - 1000 * 60 * 56).toISOString(),
    views: 793
  }
];

const el = {
  newsGrid: document.getElementById("newsGrid"),
  newsListSection: document.getElementById("newsListSection"),
  articleSection: document.getElementById("articleSection"),
  articleContent: document.getElementById("articleContent"),
  backBtn: document.getElementById("backBtn"),
  adminPanel: document.getElementById("adminPanel"),
  adminOpenBtn: document.getElementById("adminOpenBtn"),
  closeAdminBtn: document.getElementById("closeAdminBtn"),
  newsForm: document.getElementById("newsForm"),
  adminNewsList: document.getElementById("adminNewsList"),
  newsId: document.getElementById("newsId"),
  title: document.getElementById("title"),
  category: document.getElementById("category"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content")
};

let news = loadNews();

function loadNews() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleNews));
    return [...sampleNews];
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [...sampleNews];
  }
}

function saveNews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
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
  const canonical = item ? `${SITE_URL}?news=${encodeURIComponent(item.id)}` : SITE_URL;

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

function openAdmin() {
  el.adminPanel.classList.remove("hidden");
  el.adminPanel.setAttribute("aria-hidden", "false");
  renderAdminList();
}

function closeAdmin() {
  el.adminPanel.classList.add("hidden");
  el.adminPanel.setAttribute("aria-hidden", "true");
  clearForm();
}

function clearForm() {
  el.newsId.value = "";
  el.newsForm.reset();
}

function fillForm(item) {
  el.newsId.value = item.id;
  el.title.value = item.title;
  el.category.value = item.category;
  el.image.value = item.image;
  el.excerpt.value = item.excerpt || "";
  el.content.value = item.content || "";
}

function renderAdminList() {
  const sorted = [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  el.adminNewsList.innerHTML = sorted
    .map(
      (item) => `
      <div class="admin-news-item">
        <b>${escapeHtml(item.title)}</b>
        <div class="news-meta">${escapeHtml(item.category)} • ${formatMeta(item.createdAt)}</div>
        <div class="admin-actions">
          <button type="button" data-action="edit" data-id="${item.id}">Düzəliş</button>
          <button type="button" data-action="delete" data-id="${item.id}">Sil</button>
        </div>
      </div>
    `
    )
    .join("");
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
el.adminOpenBtn.addEventListener("click", openAdmin);
el.closeAdminBtn.addEventListener("click", closeAdmin);

document.addEventListener("keydown", (ev) => {
  if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "a") {
    openAdmin();
  }
  if (ev.key === "Escape") closeAdmin();
});

el.newsForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const record = {
    id: el.newsId.value || crypto.randomUUID(),
    title: el.title.value.trim(),
    category: el.category.value.trim(),
    image: el.image.value.trim(),
    excerpt: el.excerpt.value.trim(),
    content: el.content.value.trim(),
    views: 0,
    createdAt: new Date().toISOString()
  };

  const idx = news.findIndex((n) => n.id === record.id);
  if (idx >= 0) {
    record.views = news[idx].views || 0;
    record.createdAt = news[idx].createdAt;
    news[idx] = record;
  } else {
    news.push(record);
  }
  saveNews();
  renderNewsGrid();
  renderAdminList();
  clearForm();
});

el.adminNewsList.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "delete") {
    news = news.filter((n) => n.id !== id);
    saveNews();
    renderNewsGrid();
    renderAdminList();
    return;
  }
  if (btn.dataset.action === "edit") {
    const item = news.find((n) => n.id === id);
    if (item) fillForm(item);
  }
});

if (location.hash === "#admin") openAdmin();
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
