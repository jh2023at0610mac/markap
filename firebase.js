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
