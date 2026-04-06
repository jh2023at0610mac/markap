import {
  getFirebaseReady,
  subscribeNews,
  upsertNews,
  removeNews,
  adminSignIn,
  adminSignOut,
  watchAuthState
} from "./firebase.js";

let news = [];
let user = null;

const el = {
  newsForm: document.getElementById("newsForm"),
  adminNewsList: document.getElementById("adminNewsList"),
  newsId: document.getElementById("newsId"),
  title: document.getElementById("title"),
  category: document.getElementById("category"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  authStatus: document.getElementById("authStatus")
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
  const sorted = [...news].sort((a, b) => Number(b.createdAtMs) - Number(a.createdAtMs));
  el.adminNewsList.innerHTML = sorted
    .map(
      (item) => `
      <div class="admin-news-item">
        <b>${escapeHtml(item.title)}</b>
        <div class="news-meta">${escapeHtml(item.category)} • ${formatMeta(item.createdAtMs)}</div>
        <div class="admin-actions">
          <button type="button" data-action="edit" data-id="${item.id}">Düzəliş</button>
          <button type="button" data-action="delete" data-id="${item.id}">Sil</button>
        </div>
      </div>
    `
    )
    .join("");
}

function setAuthUi() {
  const allowed = !!user;
  el.newsForm.style.opacity = allowed ? "1" : "0.55";
  [...el.newsForm.elements].forEach((node) => {
    node.disabled = !allowed;
  });
  el.authStatus.textContent = allowed
    ? `Daxil olmusunuz: ${user.email}`
    : "Daxil olmamısınız. Əlavə/silmə üçün giriş edin.";
}

el.newsForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  if (!user) return;
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

  const existing = news.find((n) => n.id === record.id);
  if (existing) {
    record.views = existing.views || 0;
    record.createdAtMs = existing.createdAtMs;
  } else {
    record.createdAtMs = Date.now();
  }
  upsertNews(record)
    .then(clearForm)
    .catch((err) => {
      el.authStatus.textContent = `Xəta: ${err.message}`;
    });
});

el.adminNewsList.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  if (!user) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "delete") {
    removeNews(id).catch((err) => {
      el.authStatus.textContent = `Xəta: ${err.message}`;
    });
    return;
  }
  if (btn.dataset.action === "edit") {
    const item = news.find((n) => n.id === id);
    if (item) fillForm(item);
  }
});

el.loginBtn.addEventListener("click", () => {
  adminSignIn(el.email.value.trim(), el.password.value)
    .then(() => {
      el.password.value = "";
    })
    .catch((err) => {
      el.authStatus.textContent = `Giriş alınmadı: ${err.message}`;
    });
});

el.logoutBtn.addEventListener("click", () => {
  adminSignOut().catch((err) => {
    el.authStatus.textContent = `Çıxış xətası: ${err.message}`;
  });
});

if (!getFirebaseReady()) {
  el.authStatus.textContent =
    'Firebase konfiqurasiyası tamamlanmayıb. "firebase-config.js" faylını doldurun.';
  [...el.newsForm.elements].forEach((node) => {
    node.disabled = true;
  });
} else {
  subscribeNews(
    (items) => {
      news = items;
      renderAdminList();
    },
    (err) => {
      el.authStatus.textContent = `Oxuma xətası: ${err.message}`;
    }
  );
  watchAuthState((nextUser) => {
    user = nextUser;
    setAuthUi();
  });
}
