# Markap — Vakansiya yerləşdirmə API

Bu endpoint ilə **Vakansiyalar** bölməsinə Firestore `vacancies` kolleksiyasına elan yazırsınız. Sayt avtomatik olaraq dərc olunmuş (`published`) sənədləri oxuyur.

## Endpoint

- `POST https://markap.vercel.app/api/post-vacancy`  
  (Öz domeniniz varsa: `https://<sizin-domain>/api/post-vacancy`)

**Eyni xəbər API-si kimi autentifikasiya:** `Authorization: Bearer <POST_SECRET>`  
**Content-Type:** `application/json`

`POST_SECRET` və `FIREBASE_SERVICE_ACCOUNT_JSON` Vercel-də xəbər API üçün təyin etdiyiniz dəyərlərlə **eynidir** — əlavə sirr lazım deyil.

## Sorğu gövdəsi (JSON)

```json
{
  "id": "isteğe-bagli-unikal-id",
  "title": "Backend developer",
  "company": "Şirkət adı",
  "summary": "Qısa təsvir (kartda görünür).",
  "description": "İşin tam təsviri, məsuliyyətlər.",
  "requirements": "- 3 il təcrübə\n- Node.js",
  "location": "Bakı (hibrid)",
  "employment": "Tam ştat",
  "salary": "2500–3500 ₼",
  "source": "sizin-aggregator.az",
  "postedAtMs": 1775490000000,
  "status": "published"
}
```

### Məcburi sahələr

| Sahə | Qeyd |
|------|------|
| `title` | Vakansiya başlığı |
| `company` | İşəgötürən |
| `description` **və ya** `summary` | Ən azı biri dolu olmalıdır. Yalnız `summary` varsa, o, təsvir kimi də istifadə olunur. |

### İxtiyari sahələr

| Sahə | Standart |
|------|----------|
| `id` | Verilməsə, server təsadüfi UUID yaradır. Eyni `id` ilə yenidən `POST` **yeniləmə** edir (`merge`). |
| `summary` | Kartda qısa mətn; boşdursa `description`-dan qısaldılır. |
| `requirements` | Boş sətir |
| `location` | `Bakı` |
| `employment` | `Tam ştat` |
| `salary` | `—` |
| `source` | `API` |
| `postedAtMs` | Cari vaxt (ms epoch) |
| `status` | `published` — saytda görünür. `draft` yazsanız, elan **saytda göstərilmir** (sonradan `published` ilə yeniləyə bilərsiniz). |

## Uğurlu cavab

```json
{ "ok": true, "id": "document-id" }
```

Xəta: `400` və `{ "ok": false, "error": "..." }`, autentifikasiya xətası: `401`.

## cURL nümunəsi

```bash
curl -X POST "https://markap.vercel.app/api/post-vacancy" \
  -H "Authorization: Bearer YOUR_POST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data analyst",
    "company": "FinTech MMC",
    "summary": "SQL və vizuallaşdırma üzrə analitik.",
    "description": "Gündəlik hesabatlar, dashboard və təhlil.",
    "requirements": "- SQL\n- Python üstünlük",
    "location": "Bakı",
    "employment": "Tam ştat",
    "salary": "2000–3000 ₼",
    "source": "hr-portal.az"
  }'
```

## Firebase

1. Firestore-da **`vacancies`** kolleksiyası yaradılır (ilk uğurlu yazı ilə avtomatik).
2. Oxuma üçün veb tətbiq artıq konfiqurasiya olunub; yazma bu API ilə (Admin SDK) gedir.
3. **Təhlükəsizlik qaydalarına** `vacancies` üçün oxuma icazəsi əlavə edin — bax `FIREBASE_SETUP.md`.

## Sıralama

Sənədlər saytda `postedAtMs` üzrə **azalan** sıra ilə göstərilir (ən yeni üstdə).
