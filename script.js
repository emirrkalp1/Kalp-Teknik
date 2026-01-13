/* =========================
   MOBILE MENU (GLOBAL)
========================= */
(() => {
  const header = document.getElementById("siteHeader");
  const btn = document.getElementById("menuBtn");
  const panel = document.getElementById("mobilePanel");

  if (!header || !btn || !panel) return;

  panel.hidden = true;
  btn.setAttribute("aria-expanded", "false");

  const openMenu = () => {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Menüyü kapat");
  };

  const closeMenu = () => {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Menüyü aç");
  };

  const toggleMenu = () => {
    const isOpen = panel.hidden === false;
    isOpen ? closeMenu() : openMenu();
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  panel.querySelectorAll("a[data-close]").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("click", (e) => {
    const clickedInside = header.contains(e.target);
    if (!clickedInside) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const mq = window.matchMedia("(min-width: 981px)");
  mq.addEventListener?.("change", () => {
    if (mq.matches) closeMenu();
  });
})();


/* =========================
   GALLERY LIGHTBOX (ONLY galeri.html)
========================= */
(() => {
  const gallery = document.querySelector('[data-gallery]');
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');

  if (!gallery || !lightbox || !img) return;

  const openLightbox = (src, alt) => {
    img.src = src;
    img.alt = alt || '';
    lightbox.classList.add('isOpen');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('isOpen');
    lightbox.setAttribute('aria-hidden', 'true');
    img.src = '';
    img.alt = '';
    document.body.style.overflow = '';
  };

  gallery.addEventListener('click', (e) => {
    const card = e.target.closest('.photoCard');
    if (!card) return;
    openLightbox(card.dataset.src, card.dataset.alt);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('isOpen')) {
      closeLightbox();
    }
  });
})();


/* =========================
   SERVICE PAGES: ERROR CODE TABLE ENGINE
   Works for:
   - <main data-service="washer">
   - <main data-service="dish">
   - <main data-service="fridge">
========================= */
(() => {
  const main = document.querySelector('main[data-service]');
  if (!main) return;

  const service = (main.getAttribute('data-service') || '').trim(); // washer | dish | fridge
  const tabsRoot = main.querySelector('[data-tabs]');
  const searchInput = main.querySelector('[data-code-search]');
  const tbody = main.querySelector('[data-code-body]');
  const countEl = main.querySelector('[data-code-count]');

  if (!tabsRoot || !searchInput || !tbody || !countEl) return;

  /* ---- DATA ----
     Not: Kodlar marka/model bazında değişebilir.
     Buradaki liste SEO + kullanıcı rehberi için en sık görülen genel set.
  */
  const DATA = {
    washer: {
      brands: [
        { id: "all", label: "Tümü" },
        { id: "beko-arcelik", label: "Beko / Arçelik" },
        { id: "bosch-siemens", label: "Bosch / Siemens" },
        { id: "vestel", label: "Vestel" },
        { id: "general", label: "Genel" },
      ],
      codes: [
        { brand: "general", code: "E01", title: "Kapak kilidi / kapak algılanmıyor", causes: "Kapak tam kapanmıyor, kilit arızası, kablo teması", action: "Kapağı bastırıp deneyin; sürerse kilit kontrolü" },
        { brand: "general", code: "E02", title: "Su alma hatası", causes: "Musluk kapalı, giriş filtresi tıkalı, ventil arızası", action: "Musluk + filtre kontrolü; devam ederse servis" },
        { brand: "general", code: "E03", title: "Tahliye (boşaltma) hatası", causes: "Filtre tıkalı, gider hortumu tıkalı, pompa arızası", action: "Filtre temizliği; sürerse pompa kontrolü" },
        { brand: "general", code: "E04", title: "Su taşma / aşırı su", causes: "Seviye sensörü, ventil takılı kalma, kaçak", action: "Cihazı kapatın; servis çağırın" },
        { brand: "general", code: "E05", title: "Isıtma hatası", causes: "Rezistans, NTC, kart", action: "Uzman tespit önerilir" },

        { brand: "beko-arcelik", code: "E01", title: "Kapak kilidi hatası", causes: "Kilit mekanizması/temas", action: "Kilit kontrolü + tespit" },
        { brand: "beko-arcelik", code: "E02", title: "Su alma sorunu", causes: "Musluk/filtre/ventil", action: "Giriş hattı kontrolü" },
        { brand: "beko-arcelik", code: "E03", title: "Su boşaltma sorunu", causes: "Pompa/filtre/hortum", action: "Filtre temizliği; sürerse servis" },
        { brand: "beko-arcelik", code: "E06", title: "Motor/Devir hatası", causes: "Kömür, motor, kart", action: "Servis tespiti önerilir" },

        { brand: "bosch-siemens", code: "F18", title: "Tahliye pompası / boşaltma hatası", causes: "Filtre tıkalı, pompa arızası, gider tıkanıklığı", action: "Filtre temizliği; sürerse pompa kontrolü" },
        { brand: "bosch-siemens", code: "F21", title: "Motor/Devir sorunu", causes: "Motor, kömür, tacho, kart", action: "Servis tespiti önerilir" },
        { brand: "bosch-siemens", code: "F17", title: "Su alma süresi aşıldı", causes: "Su basıncı düşük, ventil, filtre", action: "Musluk/filtre kontrolü" },
        { brand: "bosch-siemens", code: "F29", title: "Su gelmiyor", causes: "Su kesik, musluk kapalı, giriş hattı", action: "Su hattını kontrol edin" },

        { brand: "vestel", code: "E1", title: "Su alma arızası", causes: "Giriş filtresi/ventil/su basıncı", action: "Giriş hattı kontrolü" },
        { brand: "vestel", code: "E2", title: "Tahliye arızası", causes: "Pompa/filtre/hortum", action: "Filtre temizliği; sürerse servis" },
        { brand: "vestel", code: "E3", title: "Isıtma arızası", causes: "Rezistans/NTC/kart", action: "Servis tespiti önerilir" },
      ]
    },

    dish: {
      brands: [
        { id: "all", label: "Tümü" },
        { id: "electrolux-aeg", label: "Electrolux / AEG" },
        { id: "beko-arcelik", label: "Beko / Arçelik" },
        { id: "bosch-siemens", label: "Bosch / Siemens" },
        { id: "general", label: "Genel" },
      ],
      codes: [
        { brand: "general", code: "E01", title: "Su alma hatası", causes: "Musluk kapalı, giriş filtresi tıkalı, ventil", action: "Musluk/filtre kontrolü; sürerse servis" },
        { brand: "general", code: "E02", title: "Tahliye hatası", causes: "Filtre tıkalı, gider tıkalı, pompa", action: "Filtre + gider kontrolü" },
        { brand: "general", code: "E03", title: "Isıtma problemi", causes: "Rezistans, NTC, kart", action: "Servis tespiti önerilir" },
        { brand: "general", code: "E04", title: "Kaçak / taşma", causes: "Alt taban su, hortum kaçak", action: "Cihazı kapatın; servis" },

        { brand: "electrolux-aeg", code: "i20", title: "Tahliye sorunu", causes: "Filtre/çöp süzgeci tıkalı, pompa, gider tıkalı", action: "Filtreyi temizleyin; devam ederse servis" },
        { brand: "electrolux-aeg", code: "i30", title: "Su kaçağı algılandı", causes: "Alt taban su, hortum/conta kaçak", action: "Cihazı kapatın; kaçak kontrolü" },
        { brand: "electrolux-aeg", code: "i10", title: "Su alma sorunu", causes: "Musluk kapalı, basınç düşük, giriş filtresi", action: "Su hattını kontrol edin" },

        { brand: "beko-arcelik", code: "E01", title: "Su alma arızası", causes: "Ventil/filtre/basınç", action: "Giriş hattını kontrol edin" },
        { brand: "beko-arcelik", code: "E02", title: "Tahliye arızası", causes: "Pompa/filtre/gider", action: "Filtre temizliği; sürerse servis" },
        { brand: "beko-arcelik", code: "E06", title: "Isıtma arızası", causes: "Rezistans/NTC", action: "Servis tespiti önerilir" },

        { brand: "bosch-siemens", code: "E15", title: "Kaçak koruması aktif (taban su)", causes: "Alt tablaya su dolması, kaçak", action: "Cihazı kapatın; kaçak tespiti" },
        { brand: "bosch-siemens", code: "E24", title: "Tahliye hatası", causes: "Gider hortumu tıkalı, pompa, filtre", action: "Gider/filtre kontrolü" },
        { brand: "bosch-siemens", code: "E09", title: "Isıtma devresi arızası", causes: "Isıtıcı/rezistans, kart", action: "Servis tespiti önerilir" },
      ]
    },

    fridge: {
      brands: [
        { id: "all", label: "Tümü" },
        { id: "beko-arcelik", label: "Beko / Arçelik" },
        { id: "bosch-siemens", label: "Bosch / Siemens" },
        { id: "vestel", label: "Vestel" },
        { id: "general", label: "Genel" },
      ],
      codes: [
        // GENEL
        { brand: "general", code: "E1", title: "Sensör (NTC) hatası", causes: "Soğutucu/derin dondurucu sensörü arızası, kablo teması", action: "Uzman tespit önerilir" },
        { brand: "general", code: "E2", title: "Defrost (çözme) hatası", causes: "Defrost rezistansı, defrost sensörü, kart", action: "Buzlanma varsa servis tespiti" },
        { brand: "general", code: "E3", title: "Fan / hava sirkülasyonu hatası", causes: "Fan arızası, buzlanma nedeniyle sıkışma", action: "No-frost kanalları + fan kontrolü" },
        { brand: "general", code: "E4", title: "Kapı açık / kapı sensörü", causes: "Kapı switch/sensör, kapak tam kapanmıyor", action: "Kapak/fitil kontrolü" },

        // BEKO / ARÇELİK (genel karşılıklar)
        { brand: "beko-arcelik", code: "E1", title: "Soğutucu sensör arızası", causes: "NTC sensör, kablo", action: "Servis tespiti önerilir" },
        { brand: "beko-arcelik", code: "E2", title: "Dondurucu sensör arızası", causes: "NTC sensör, kablo", action: "Servis tespiti önerilir" },
        { brand: "beko-arcelik", code: "E5", title: "Defrost arızası", causes: "Rezistans, sensör, kart", action: "Buzlanma/soğutmama varsa servis" },

        // BOSCH / SIEMENS (genel örnek)
        { brand: "bosch-siemens", code: "E01", title: "Sensör/ısı ölçüm hatası", causes: "NTC sensör, bağlantı", action: "Servis tespiti önerilir" },
        { brand: "bosch-siemens", code: "E02", title: "Defrost sistemi arızası", causes: "Defrost ısıtıcı/sensör", action: "Servis tespiti önerilir" },

        // VESTEL (genel set)
        { brand: "vestel", code: "E1", title: "Sensör arızası", causes: "NTC sensör, kablo", action: "Servis tespiti önerilir" },
        { brand: "vestel", code: "E4", title: "Fan arızası", causes: "Fan, buzlanma", action: "Fan + hava kanalı kontrolü" },
      ]
    }
  };

  const state = { brand: "all", query: "" };

  const esc = (s) => String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const getData = () => DATA[service] || null;

  const data = getData();
  if (!data) {
    // service yanlışsa tabloyu boş bırakmak yerine bilgi göster
    tbody.innerHTML = `<tr><td class="mutedRow" colspan="4">Bu sayfa için veri tanımlı değil (data-service="${esc(service)}").</td></tr>`;
    countEl.textContent = `0 kayıt`;
    return;
  }

  const buildTabs = () => {
    tabsRoot.innerHTML = "";
    data.brands.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tabBtn";
      btn.dataset.brand = b.id;
      btn.textContent = b.label;
      if (b.id === state.brand) btn.classList.add("isActive");

      btn.addEventListener("click", () => {
        state.brand = b.id;
        tabsRoot.querySelectorAll(".tabBtn").forEach(x => x.classList.remove("isActive"));
        btn.classList.add("isActive");
        render();
      });

      tabsRoot.appendChild(btn);
    });
  };

  const filterRows = () => {
    const q = state.query.trim().toLowerCase();

    return data.codes.filter((r) => {
      const brandOk = state.brand === "all" ? true : r.brand === state.brand;
      if (!brandOk) return false;
      if (!q) return true;

      const hay = [r.code, r.title, r.causes, r.action].join(" ").toLowerCase();
      return hay.includes(q);
    });
  };

  const render = () => {
    const rows = filterRows();
    countEl.textContent = `${rows.length} kayıt`;

    if (!rows.length) {
      tbody.innerHTML = `<tr><td class="mutedRow" colspan="4">Sonuç bulunamadı. Farklı bir kod/kelime deneyin.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td><b>${esc(r.code)}</b></td>
        <td>${esc(r.title)}</td>
        <td>${esc(r.causes)}</td>
        <td>${esc(r.action)}</td>
      </tr>
    `).join("");
  };

  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value || "";
    render();
  });

  buildTabs();
  render();
})();
