let news = MarkapStore.load();

const el = {
  newsForm: document.getElementById("newsForm"),
  adminNewsList: document.getElementById("adminNewsList"),
  newsId: document.getElementById("newsId"),
  title: document.getElementById("title"),
  category: document.getElementById("category"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content")
};

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
  MarkapStore.save(news);
  renderAdminList();
  clearForm();
});

el.adminNewsList.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "delete") {
    news = news.filter((n) => n.id !== id);
    MarkapStore.save(news);
    renderAdminList();
    return;
  }
  if (btn.dataset.action === "edit") {
    const item = news.find((n) => n.id === id);
    if (item) fillForm(item);
  }
});

renderAdminList();
