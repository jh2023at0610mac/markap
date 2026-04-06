const MarkapStore = (() => {
  const STORAGE_KEY = "az-news-items-v1";

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
      title:
        "\"Crocus\"dakı terror aktına görə ömürlük həbs edilmiş şəxs intihar edib - FOTO",
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

  function load() {
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

  function save(news) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
  }

  return { STORAGE_KEY, load, save };
})();
