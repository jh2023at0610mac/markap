# Markap - Məqalə yerləşdirmə API

Bu endpoint ilə **Məqalələr** bölməsinə uzun oxular yerləşdirirsiniz.

## Endpoint

- `POST https://markap.vercel.app/api/post-article`
- Auth header: `Authorization: Bearer <POST_SECRET>`
- Content-Type: `application/json`

## Request body

```json
{
  "id": "optional-article-id",
  "title": "Uzun oxu başlığı",
  "category": "Analitika",
  "image": "https://example.com/image.jpg",
  "excerpt": "Qısa xülasə",
  "content": "Uzun məqalə mətni...",
  "createdAtMs": 1775490000000,
  "status": "published"
}
```

### Required fields

- `title`
- `content`

All others are optional.

## cURL example

```bash
curl -X POST "https://markap.vercel.app/api/post-article" \
  -H "Authorization: Bearer YOUR_POST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Media bazarında uzunmüddətli trendlər",
    "category": "Analitika",
    "excerpt": "Rəqəmsal media və auditoriya davranışı haqqında uzun oxu.",
    "content": "Bu məqalədə uzunmüddətli trendləri təhlil edirik...",
    "image": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80"
  }'
```

## Required Vercel env vars

- `POST_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
