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
  const company = String(payload.company || "").trim();
  const description = String(payload.description || "").trim();
  const summary = String(payload.summary || "").trim();

  if (!title) throw new Error("title is required");
  if (!company) throw new Error("company is required");
  if (!description && !summary) {
    throw new Error("description or summary is required");
  }

  const finalDescription = description || summary;
  const finalSummary = summary || finalDescription.slice(0, 280);

  return {
    id: String(payload.id || randomUUID()).trim(),
    title,
    company,
    location: String(payload.location || "Bakı").trim(),
    employment: String(payload.employment || "Tam ştat").trim(),
    salary: String(payload.salary != null ? payload.salary : "—").trim() || "—",
    source: String(payload.source || "API").trim(),
    postedAtMs: Number(payload.postedAtMs || Date.now()),
    summary: finalSummary,
    description: finalDescription,
    requirements: String(payload.requirements || "").trim(),
    status: String(payload.status || "published").trim() || "published"
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
    await db.collection("vacancies").doc(record.id).set(record, { merge: true });

    return res.status(200).json({ ok: true, id: record.id });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || "Bad request" });
  }
};
