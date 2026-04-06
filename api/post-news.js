const admin = require("firebase-admin");
const { randomUUID } = require("crypto");

function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice("Bearer ".length).trim();
}

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  }
  return JSON.parse(raw);
}

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceAccount())
    });
  }
  return admin.firestore();
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid JSON body");
  }

  const title = String(payload.title || "").trim();
  const category = String(payload.category || "Xəbər").trim();
  const image = String(payload.image || "").trim();
  const excerpt = String(payload.excerpt || "").trim();
  const content = String(payload.content || "").trim();

  if (!title) throw new Error("title is required");
  if (!content) throw new Error("content is required");

  return {
    id: String(payload.id || randomUUID()).trim(),
    title,
    category,
    image,
    excerpt,
    content,
    createdAtMs: Number(payload.createdAtMs || Date.now()),
    views: Number(payload.views || 0),
    status: String(payload.status || "published")
  };
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const expectedSecret = process.env.POST_SECRET || "";
    const provided = getBearerToken(req);
    if (!expectedSecret || provided !== expectedSecret) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const record = normalizePayload(req.body);
    const db = getDb();
    await db.collection("news").doc(record.id).set(record, { merge: true });

    return res.status(200).json({ ok: true, id: record.id });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || "Bad request" });
  }
};
