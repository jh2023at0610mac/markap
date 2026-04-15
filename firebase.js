import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  increment,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

const SAMPLE_NEWS = [
  {
    id: crypto.randomUUID(),
    title: "Gürcüstanda Azərbaycan Prezidentinin şərəfinə lanç verilib - FOTO",
    category: "Siyasət",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80",
    excerpt:
      "Tbilisidə keçirilən rəsmi tədbirdə ikitərəfli münasibətlər və regional əməkdaşlıq müzakirə olunub.",
    content:
      "Bu gün Tbilisidə Azərbaycan Prezidentinin şərəfinə rəsmi lanç təşkil olunub.\n\nTədbirdə iki ölkə arasında siyasi və iqtisadi əlaqələrin inkişafı əsas müzakirə mövzusu olub.",
    createdAtMs: Date.now(),
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
      "Bakının mərkəzi küçələrindən birində 16 yaşlı qızın vurulması ilə nəticələnən yol qəzası baş verib.\n\nFaktla bağlı araşdırma aparılır.",
    createdAtMs: Date.now() - 30 * 60 * 1000,
    views: 428
  }
];

function getNewsCollection() {
  return collection(db, "news");
}

function getVacanciesCollection() {
  return collection(db, "vacancies");
}

function getArticlesCollection() {
  return collection(db, "articles");
}

const SAMPLE_VACANCIES = [
  {
    id: "vac-markap-001",
    title: "Kontent redaktoru",
    company: "Markap Media",
    location: "Bakı (ofis)",
    employment: "Tam ştat",
    salary: "1200–1800 ₼",
    source: "markap.az",
    postedAtMs: 1712505600000,
    summary: "Azərbaycan dilində xəbər və analitik mətnlər hazırlayan redaktor axtarılır.",
    description:
      "Komanda ilə birlikdə gündəlik xəbər axınını izləyəcək, mənbələrdən təsdiqlənmiş məlumatları qısa və dəqiq mətnə çevirəcəksiniz. SEO başlıqları, sosial paylaşım üçün qısa variantlar və foto/video ilə işləmə bacarığı gözlənilir.",
    requirements:
      "- Azərbaycan və ingilis dillərində sərbəst yazı\n- 2+ il media/redaksiya təcrübəsi\n- Fact-checking və etik jurnalistikaya hörmət\n- Təzyiq altında son tarixə uyğun işləmə",
    status: "published"
  },
  {
    id: "vac-tech-002",
    title: "Full-stack developer (Node / React)",
    company: "Caspian Digital Solutions",
    location: "Bakı (hibrid)",
    employment: "Tam ştat",
    salary: "3000–4500 ₼",
    source: "linkedin.com",
    postedAtMs: 1712332800000,
    summary: "REST API, serverless və React ilə veb məhsulların inkişafı üzrə mütəxəssis.",
    description:
      "Mövcud monolit və mikroservis arxitekturasına yeni xüsusiyyətlər əlavə edəcək, kod keyfiyyətini test və CI/CD ilə qoruyacaqsınız. Komanda code review və texniki sənədləşmə ilə işləyir.",
    requirements:
      "- TypeScript, Node.js, React\n- PostgreSQL və ya Firestore təcrübəsi\n- Git, Docker əsasları\n- Azərbaycan və ya ingilis dillərində texniki ünsiyyət",
    status: "published"
  },
  {
    id: "vac-bank-003",
    title: "Məlumat təhlükəsizliyi analitiki",
    company: "Regional Maliyyə Qrupu",
    location: "Bakı",
    employment: "Tam ştat",
    salary: "Gizli (müsahibədə)",
    source: "bankcareers.az",
    postedAtMs: 1712159999999,
    summary: "SOC hadisələri, risk qiymətləndirməsi və uyğunluq tapşırıqları üzrə analitik.",
    description:
      "Daxili auditlər üçün sübut toplanması, SIEM korrelyasiyalarının yoxlanması və təhlükəsizlik siyasətlərinin yenilənməsində iştirak edəcəksiniz. Üçüncü tərəf təchizatçılarla risk sorğuları aparılır.",
    requirements:
      "- 3+ il SOC / IR və ya risk təcrübəsi\n- ISO 27001 və ya oxşar çərçivələrə bələdçilik\n- Azərbaycan və ingilis dilləri\n- Sertifikat (Security+, CEH və s.) üstünlük",
    status: "published"
  },
  {
    id: "vac-ngo-004",
    title: "Layihə koordinatoru (EKO)",
    company: "Yaşıl Gələcək İctimai Birliyi",
    location: "Gəncə / ezamiyyə",
    employment: "Müqavilə (12 ay)",
    salary: "1500 ₼ (brüt)",
    source: "jobs.civil.az",
    postedAtMs: 1711987200000,
    summary: "Regionlarda təhsil və icma iştirakı layihələrinin icrası və hesabatı.",
    description:
      "Tərəfdaş məktəblərlə tədbirlərin planlaşdırılması, könüllülərin koordinasiyası və donor hesabatlarının hazırlanması daxildir. Səfər xərcləri təşkilat tərəfindən ödənilir.",
    requirements:
      "- Layihə idarəetməsi təcrübəsi\n- Excel/Google Sheets, təqdimat bacarığı\n- Azərbaycan dili (rus dili üstünlük)\n- Sürücülük vəsiqəsi üstünlük",
    status: "published"
  }
];

const SAMPLE_ARTICLES = [
  {
    id: "art-001",
    title: "Azərbaycan mediasında rəqəmsal transformasiya",
    category: "Analitika",
    image:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    excerpt: "Media istehlakı vərdişləri və platforma keçidinin əsas istiqamətləri.",
    content:
      "Son illər xəbər istehlakında mobil üstünlük açıq şəkildə görünür.\n\nBu dəyişiklik redaksiyaların həm format, həm də yayım strategiyasını yenidən qurmasını tələb edir.\n\nAnalitik məqalədə kontent planlama, oxucu davranışı və monetizasiya modellərinə ayrıca baxılır.",
    createdAtMs: Date.now() - 86400000 * 2,
    status: "published"
  }
];

function normalizeNews(record) {
  return {
    id: record.id,
    title: record.title || "",
    category: record.category || "Xəbər",
    image: record.image || "",
    excerpt: record.excerpt || "",
    content: record.content || "",
    createdAtMs: Number(record.createdAtMs || Date.now()),
    views: Number(record.views || 0)
  };
}

export function getFirebaseReady() {
  return isFirebaseConfigured && !!db;
}

export function getSampleNews() {
  return SAMPLE_NEWS;
}

export function getSampleVacancies() {
  return SAMPLE_VACANCIES.map((v) => ({ ...v }));
}

export function getSampleArticles() {
  return SAMPLE_ARTICLES.map((a) => ({ ...a }));
}

function normalizeVacancy(record) {
  const raw = String(record.status || "published").trim() || "published";
  const status = raw.toLowerCase() === "draft" ? "draft" : "published";
  return {
    id: record.id,
    title: record.title || "",
    company: record.company || "",
    location: record.location || "Bakı",
    employment: record.employment || "Tam ştat",
    salary: record.salary != null && String(record.salary).trim() ? String(record.salary).trim() : "—",
    source: record.source || "",
    postedAtMs: Number(record.postedAtMs || Date.now()),
    summary: record.summary || "",
    description: record.description || "",
    requirements: record.requirements || "",
    status
  };
}

export function subscribeVacancies(onData, onError) {
  if (!getFirebaseReady()) {
    onData(getSampleVacancies());
    return () => {};
  }
  const q = query(getVacanciesCollection(), orderBy("postedAtMs", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => normalizeVacancy({ id: d.id, ...d.data() }))
        .filter((v) => v.status !== "draft");
      onData(items);
    },
    onError
  );
}

function normalizeArticle(record) {
  const raw = String(record.status || "published").trim() || "published";
  const status = raw.toLowerCase() === "draft" ? "draft" : "published";
  return {
    id: record.id,
    title: record.title || "",
    category: record.category || "Məqalə",
    image: record.image || "",
    excerpt: record.excerpt || "",
    content: record.content || "",
    createdAtMs: Number(record.createdAtMs || Date.now()),
    status
  };
}

export function subscribeArticles(onData, onError) {
  if (!getFirebaseReady()) {
    onData(getSampleArticles());
    return () => {};
  }
  const q = query(getArticlesCollection(), orderBy("createdAtMs", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => normalizeArticle({ id: d.id, ...d.data() }))
        .filter((a) => a.status !== "draft");
      onData(items);
    },
    onError
  );
}

export function subscribeNews(onData, onError) {
  if (!getFirebaseReady()) {
    onData([...SAMPLE_NEWS]);
    return () => {};
  }
  const q = query(getNewsCollection(), orderBy("createdAtMs", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => normalizeNews({ id: d.id, ...d.data() }));
      onData(items);
    },
    onError
  );
}

export async function upsertNews(newsItem) {
  if (!getFirebaseReady()) throw new Error("Firebase config missing");
  const id = newsItem.id || crypto.randomUUID();
  const payload = normalizeNews({ ...newsItem, id });
  await setDoc(doc(db, "news", id), payload, { merge: true });
}

export async function removeNews(id) {
  if (!getFirebaseReady()) throw new Error("Firebase config missing");
  await deleteDoc(doc(db, "news", id));
}

export async function incrementViews(id) {
  if (!getFirebaseReady()) return;
  await updateDoc(doc(db, "news", id), { views: increment(1) });
}

export async function adminSignIn(email, password) {
  if (!auth) throw new Error("Firebase config missing");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut() {
  if (!auth) return;
  return signOut(auth);
}

export function watchAuthState(cb) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}
