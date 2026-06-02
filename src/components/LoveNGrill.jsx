import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";

// ── Assets (auto-generated — do not edit manually) ──────────────






// ── Sound engine (disabled) ──────────────────────────────────────
const SFX = { click:()=>{}, addCart:()=>{}, tabSwitch:()=>{}, checkout:()=>{}, order:()=>{}, remove:()=>{}, hover:()=>{} };

// ── Data ─────────────────────────────────────────────────────────
// ── Load data from JSON files (edited via CMS) ───────────────────
import _menuJson  from "../data/menu.json";
import _aboutJson from "../data/about.json";

// menu.json uses { categories: [{name, icon, items:[]}] }
// but this component expects { CategoryName: { icon, items } }
// This converter bridges the two formats.
function convertMenuJson(json) {
  const result = {};
  (json.categories || []).forEach(cat => {
    result[cat.name] = { icon: cat.icon, items: cat.items };
  });
  return result;
}

const INITIAL_MENU  = convertMenuJson(_menuJson);
const INITIAL_ABOUT = _aboutJson;

// ── Context ───────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ── SEO meta injector + Schema Markup ────────────────────────────
// DROP-IN REPLACEMENT for the SEO() component in LoveNGrill.jsx (lines ~36-122).
// Keeps your existing structure; strengthens local-SEO for "fast food Haripur",
// "restaurant Haripur", "Love n Grill" searches.
function SEO() {
  useEffect(() => {
    // Front-loaded keywords + location — Google weights leading words heavily
    document.title = "Love n' Grill — Best Fast Food Restaurant in Haripur | Pizza, Burgers & Grill";

    const setMeta = (name, content, prop) => {
      let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        prop ? el.setAttribute("property", name) : el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel, href, extra = {}) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
      Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
    };

    // Core meta
    setMeta("description", "Love n' Grill is Haripur's top fast food restaurant — fire-kissed pizzas, gourmet burgers, grilled specialties and family deals. Dine-in, takeaway & WhatsApp delivery. Safdar Height, Main G.T Road, Haripur.");
    setMeta("keywords", "fast food Haripur, restaurant Haripur, Love n Grill, Love n' Grill Haripur, pizza Haripur, burger Haripur, grill Haripur, best restaurant in Haripur, food delivery Haripur, order food online Haripur, Haripur fast food, Pandak restaurant, G.T Road Haripur food");
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1");
    setMeta("author", "Love n' Grill");
    setMeta("theme-color", "#FF6600");

    // Geo signals for local pack
    setMeta("geo.region", "PK-KP");
    setMeta("geo.placename", "Haripur");
    setMeta("geo.position", "33.9943992;72.9378945");
    setMeta("ICBM", "33.9943992, 72.9378945");

    // Canonical — prevents duplicate-content split between netlify subdomain & lovengrill.pk
    setLink("canonical", "https://lovengrill.pk/");

    // Open Graph
    setMeta("og:title", "Love n' Grill — Best Fast Food Restaurant in Haripur", true);
    setMeta("og:description", "Fire-kissed pizzas, gourmet burgers, grills & deals — Haripur's favorite fast food spot. Order via WhatsApp.", true);
    setMeta("og:type", "restaurant.restaurant", true);
    setMeta("og:site_name", "Love n' Grill", true);
    setMeta("og:locale", "en_PK", true);
    setMeta("og:url", "https://lovengrill.pk/", true);
    setMeta("og:image", "https://lovengrill.pk/og-banner.jpg", true);
    setMeta("og:image:secure_url", "https://lovengrill.pk/og-banner.jpg", true);
    setMeta("og:image:type", "image/jpeg", true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", "Love n' Grill — Fast food restaurant in Haripur", true);

    // Twitter (fixed: was previously pointing to a mismatched URL)
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "Love n' Grill — Best Fast Food Restaurant in Haripur");
    setMeta("twitter:description", "Fire-kissed pizzas, gourmet burgers, grills & deals — Haripur's favorite fast food spot.");
    setMeta("twitter:image", "https://lovengrill.pk/og-banner.jpg");
    setMeta("twitter:image:alt", "Love n' Grill — Fast food restaurant in Haripur");

    // JSON-LD Schema Markup — Restaurant + LocalBusiness (broader local-pack eligibility)
    const schemaId = "lovengrill-schema";
    let existing = document.getElementById(schemaId);
    if (!existing) {
      existing = document.createElement("script");
      existing.type = "application/ld+json";
      existing.id = schemaId;
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["Restaurant", "LocalBusiness", "FoodEstablishment"],
      "@id": "https://lovengrill.pk/#restaurant",
      "name": "Love n' Grill",
      "alternateName": ["LoveNGrill", "Love and Grill", "Love n Grill Haripur"],
      "description": "Haripur's premier destination for fire-kissed pizzas, gourmet burgers, signature deals and fresh grills. Dine-in, takeaway & delivery available.",
      "url": "https://lovengrill.pk",
      "telephone": "+923199921117",
      "email": "lovengrill41@gmail.com",
      "image": [
        "https://lovengrill.pk/og-banner.jpg",
        "https://lovengrill.pk/logo.jpg"
      ],
      "logo": "https://lovengrill.pk/logo.jpg",
      "priceRange": "Rs.290 – Rs.6999",
      "servesCuisine": ["Pakistani", "Fast Food", "Pizza", "Burgers", "Grills", "BBQ"],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Safdar Height, Main G.T Road, opp. Ameer Khan Silkway Plaza, Pandak",
        "addressLocality": "Haripur",
        "addressRegion": "Khyber Pakhtunkhwa",
        "postalCode": "22620",
        "addressCountry": "PK"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 33.9943992,
        "longitude": 72.9378945
      },
      "areaServed": [
        { "@type": "City", "name": "Haripur" },
        { "@type": "AdministrativeArea", "name": "Khyber Pakhtunkhwa" }
      ],
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "10:00", "closes": "01:00" }
      ],
      "sameAs": [
        "https://instagram.com/lovengrill",
        "https://www.tiktok.com/@lovengrill",
        "https://maps.app.goo.gl/8n36zwycKAeojedn8"
      ],
      "hasMap": "https://maps.app.goo.gl/8n36zwycKAeojedn8",
      "menu": "https://lovengrill.pk/#menu",
      "acceptsReservations": "False",
      "currenciesAccepted": "PKR",
      "paymentAccepted": "Cash, Online Transfer",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "120",
        "bestRating": "5"
      }
    });

    // Preconnect + parallel font stylesheet load (unchanged)
    const fontHref = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap";
    [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet",  href: fontHref },
    ].forEach(({ rel, href, crossOrigin }) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = rel; l.href = href;
      if (crossOrigin) l.crossOrigin = crossOrigin;
      document.head.prepend(l);
    });
  }, []);
  return null;
}


// ── Scroll-reveal hook ────────────────────────────────────────────
function useScrollReveal(ref, threshold = 0.12) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref?.current) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

// ╔══════════════════════════════════════════════════╗
// ║  ROOT                                            ║
// ╚══════════════════════════════════════════════════╝
export default function App() {
  const [menuData,  setMenuData]  = useState(INITIAL_MENU);
  const [aboutData, setAboutData] = useState(INITIAL_ABOUT);
  const [waCount,   setWaCount]   = useState(0);
  const [messages,  setMessages]  = useState([]);
  const [newMsgCount, setNewMsgCount] = useState(0);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
    setNewMsgCount(n => n + 1);
  };

  const clearNewMsgs = () => setNewMsgCount(0);

  return (
    <AppCtx.Provider value={{ menuData, setMenuData, aboutData, setAboutData, waCount, setWaCount, messages, addMessage, newMsgCount, clearNewMsgs }}>
      <SEO />
      <CSS />
      <PublicSite />
    </AppCtx.Provider>
  );
}

// ╔══════════════════════════════════════════════════╗
// ║  STYLES                                          ║
// ╚══════════════════════════════════════════════════╝
function CSS() {
  return (
    <style>{`
      /* Fonts loaded via <link> injected in SEO component for parallel download (no @import waterfall) */
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
      :root{--or:#FF6600;--rd:#CC1A00;--card:#161616;--bdr:#2a2a2a}
      body{background:#0a0a0a;color:#f0ece6;overflow-x:hidden}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:#0a0a0a}
      ::-webkit-scrollbar-thumb{background:rgba(255,102,0,.4);border-radius:2px}
      .fd{font-family:'Playfair Display',serif}
      .fc{font-family:'Libre Baskerville',serif}
      .fb{font-family:'Barlow',sans-serif}
      .fi{font-family:'Inter',sans-serif}

      /* Buttons */
      .btn-f{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,#FF6600,#CC1A00);color:#fff;font-family:'Inter',sans-serif;font-size:0.813rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:12px 28px;border:none;cursor:pointer;border-radius:3px;transition:all .22s;transform:scale(1)}
      .btn-f:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 10px 36px rgba(255,102,0,.42);filter:brightness(1.1)}
      .btn-f:active{transform:scale(0.96)!important;box-shadow:0 2px 8px rgba(255,102,0,.3)}
      .btn-o{display:inline-flex;align-items:center;justify-content:center;background:transparent;color:#FF6600;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:11px 24px;border:1.5px solid rgba(255,102,0,.55);cursor:pointer;border-radius:3px;transition:all .22s}
      .btn-o:hover{background:rgba(255,102,0,.12);border-color:#FF6600;transform:translateY(-1px)}
      .btn-o:active{transform:scale(0.96)}
      .btn-g{background:transparent;color:#8a8070;font-family:'Inter',sans-serif;font-size:0.688rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;padding:9px 20px;border:1px solid rgba(255,255,255,.1);cursor:pointer;border-radius:3px;transition:all .22s}
      .btn-g:hover{border-color:rgba(255,102,0,.4);color:#FF6600}

      /* Nav */
      .nl{position:relative;font-family:'Inter',sans-serif;font-size:0.813rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#c0b0a0;cursor:pointer;transition:color .2s,transform .18s;padding:4px 0;display:inline-block}
      .nl::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:#FF6600;transition:width .28s}
      .nl:hover,.nl.on{color:#fff;transform:translateY(-1px)}
      .nl:hover::after,.nl.on::after{width:100%}

      /* Animations */
      @keyframes floatUp{0%{transform:translateY(0) translateX(0) scale(1);opacity:.8}100%{transform:translateY(-130vh) translateX(var(--dx)) scale(0);opacity:0}}
      .ember{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0%,#FF6600 40%,#CC1A00 100%);animation:floatUp var(--dur) ease-in infinite;animation-delay:var(--del);pointer-events:none}
      @keyframes glow{0%,100%{text-shadow:0 0 40px rgba(255,102,0,.35),0 0 80px rgba(204,26,0,.18)}50%{text-shadow:0 0 70px rgba(255,102,0,.65),0 0 130px rgba(204,26,0,.38)}}
      .glow{animation:glow 3s ease-in-out infinite}
      @keyframes slideL{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}
      @keyframes slideU{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
      .al{animation:slideL .85s ease forwards}
      .au{animation:slideU .7s ease forwards}
      .d1{animation-delay:.15s;opacity:0}.d2{animation-delay:.3s;opacity:0}.d3{animation-delay:.5s;opacity:0}
      @keyframes bumpBadge{0%{transform:scale(1)}40%{transform:scale(1.6)}70%{transform:scale(.9)}100%{transform:scale(1)}}
      .bump{animation:bumpBadge .35s cubic-bezier(.36,.07,.19,.97)}
      @keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(18px)}to{opacity:1;transform:none}}
      @keyframes floatBob{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(3deg)}}
      @keyframes popIn{0%{transform:scale(0) translateY(20px);opacity:0}70%{transform:scale(1.15) translateY(-3px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}
      .pop-in{animation:popIn .42s cubic-bezier(.34,1.56,.64,1) forwards}
      @keyframes cUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      .cani{animation:cUp .4s ease forwards}

      /* Scroll reveal */
      .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
      .reveal.visible{opacity:1;transform:none}
      .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
      .reveal-left.visible{opacity:1;transform:none}
      .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
      .reveal-right.visible{opacity:1;transform:none}
      .reveal-d1{transition-delay:.1s}.reveal-d2{transition-delay:.2s}.reveal-d3{transition-delay:.3s}.reveal-d4{transition-delay:.4s}.reveal-d5{transition-delay:.5s}

      /* Spicy / Popular badges */
      .badge-spicy{font-family:'Inter',sans-serif;font-size:0.563rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;background:rgba(220,40,10,.22);border:1px solid rgba(220,40,10,.55);color:#ff6644;display:inline-flex;align-items:center;gap:3px;border-radius:20px}
      .badge-popular{font-family:'Inter',sans-serif;font-size:0.563rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;background:rgba(255,185,0,.18);border:1px solid rgba(255,185,0,.45);color:#ffcc33;display:inline-flex;align-items:center;gap:3px;border-radius:20px}

      /* Universal search bar */
      .search-wrap{position:relative;max-width:580px;margin:0 auto 10px}
      .search-wrap input{background:rgba(8,8,8,.9);border:1.5px solid rgba(255,102,0,.25);color:#f0ece6;padding:17px 52px 17px 58px;font-family:'Libre Baskerville',serif;font-size:0.938rem;width:100%;outline:none;transition:border-color .3s,background .3s,box-shadow .3s;border-radius:60px;letter-spacing:.03em}
      .search-wrap input:focus{border-color:rgba(255,102,0,.75);background:rgba(255,40,0,.04);box-shadow:0 0 0 5px rgba(255,102,0,.08),0 16px 48px rgba(0,0,0,.55)}
      .search-wrap input::placeholder{color:rgba(255,255,255,.18);font-style:italic;letter-spacing:.05em}
      .search-icon{position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:1.25rem;pointer-events:none}
      .search-clear{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:rgba(255,102,0,.14);border:1px solid rgba(255,102,0,.28);color:rgba(255,255,255,.55);cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;transition:all .22s;font-family:'Inter',sans-serif;font-weight:700}
      .search-clear:hover{background:rgba(255,102,0,.3);border-color:#FF6600;color:#fff;transform:translateY(-50%) rotate(90deg) scale(1.1)}
      .search-results-label{text-align:center;margin-bottom:24px;font-family:'Inter',sans-serif;font-size:0.688rem;color:rgba(255,102,0,.55);letter-spacing:.2em;text-transform:uppercase}
      .search-hints{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:16px}
      .search-hint-tag{font-family:'Inter',sans-serif;font-size:0.688rem;color:rgba(255,255,255,.28);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:5px 14px;border-radius:20px;cursor:pointer;transition:all .2s;letter-spacing:.04em;user-select:none}
      .search-hint-tag:hover{color:#FF6600;border-color:rgba(255,102,0,.45);background:rgba(255,102,0,.08)}
      @keyframes cardIn{from{transform:translateY(16px) scale(.97)}to{transform:none}}
      .card-in{animation:cardIn .45s ease forwards}
      @keyframes tabSlide{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
      .tab-in{animation:tabSlide .28s ease forwards}
      @keyframes ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(3);opacity:0}}
      @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
      .shake{animation:shake .35s ease}
      @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,102,0,.5)}70%{box-shadow:0 0 0 10px rgba(255,102,0,0)}}
      .pulse-ring{animation:pulse 2s ease infinite}
      @keyframes newBadge{0%{transform:scale(0) rotate(-10deg)}60%{transform:scale(1.2) rotate(3deg)}100%{transform:scale(1) rotate(0)}}
      .new-badge-in{animation:newBadge .4s cubic-bezier(.34,1.56,.64,1) forwards}
      @keyframes sizzle{0%,100%{letter-spacing:.15em}50%{letter-spacing:.22em}}

      /* Divider */
      .fdiv{display:flex;align-items:center;gap:16px}
      .fdiv::before,.fdiv::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,102,0,.5),transparent)}

      /* Menu card */
      .mcard{border:1px solid var(--bdr);background:var(--card);transition:transform .28s cubic-bezier(.34,1.2,.64,1),box-shadow .28s,border-color .28s;position:relative;overflow:hidden;border-radius:12px;display:flex;flex-direction:column}
      .mcard:hover{border-color:rgba(255,102,0,.5);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.55),0 0 0 1px rgba(255,102,0,.1)}
      .mcard:active{transform:translateY(-1px) scale(0.99)}

      /* Food image */
      .fimg-wrap{position:relative;overflow:hidden;height:160px;background:#1a1212;flex-shrink:0}
      .fimg-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .4s cubic-bezier(.25,.46,.45,.94);display:block}
      .mcard:hover .fimg-wrap img{transform:scale(1.06)}
      .fimg-grad{display:none}

      /* Category nav wrapper */
      .cat-nav-wrap{display:flex;gap:0.563rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.75rem}
      @media(max-width:768px){
        .cat-nav-wrap{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;justify-content:flex-start;padding-bottom:0.5rem;-webkit-overflow-scrolling:touch;scrollbar-width:none}
        .cat-nav-wrap::-webkit-scrollbar{display:none}
        .cat-nav-wrap .ctab{flex-shrink:0;white-space:nowrap}
      }

      /* Category tabs */
      .ctab{font-family:'Inter',sans-serif;font-size:0.813rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;padding:10px 24px;border:1.5px solid rgba(255,255,255,.1);background:transparent;color:#9a8a78;cursor:pointer;transition:all .24s cubic-bezier(.34,1.2,.64,1);border-radius:4px;position:relative;overflow:hidden}
      .ctab::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,.05);transform:scaleX(0);transform-origin:left;transition:transform .22s}
      .ctab:hover::after{transform:scaleX(1)}
      .ctab.on{background:linear-gradient(135deg,#FF6600,#CC1A00);color:#fff;border-color:transparent;box-shadow:0 4px 22px rgba(255,102,0,.35);transform:scale(1.04)}
      .ctab:not(.on):hover{border-color:rgba(255,102,0,.45);color:#fff;background:rgba(255,102,0,.09)}
      .ctab:active{transform:scale(0.97)}
      .vbtn{font-family:'Inter',sans-serif;font-size:0.688rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:6px 14px;border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#c8bab0;cursor:pointer;transition:all .2s cubic-bezier(.34,1.2,.64,1);border-radius:4px}
      .vbtn:hover,.vbtn.on{background:rgba(255,102,0,.2);border-color:#FF6600;color:#FF8844;transform:scale(1.05)}
      .vbtn:active{transform:scale(0.95)}

      /* Badge */
      .badge{font-family:'Inter',sans-serif;font-size:0.563rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;background:rgba(255,102,0,.18);border:1px solid rgba(255,102,0,.4);color:#FF8844;display:inline-block;border-radius:20px}

      /* Qty buttons */
      .qbtn{width:32px;height:32px;border:1.5px solid rgba(255,102,0,.4);background:transparent;color:#FF6600;cursor:pointer;font-size:1.125rem;display:flex;align-items:center;justify-content:center;transition:all .18s cubic-bezier(.34,1.2,.64,1);border-radius:3px;flex-shrink:0}
      .qbtn:hover{background:rgba(255,102,0,.2);border-color:#FF6600;transform:scale(1.15)}
      .qbtn:active{transform:scale(0.9)}

      /* Inputs */
      .idk{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);color:#f0ece6;padding:13px 14px;font-family:'Barlow',sans-serif;font-size:0.938rem;width:100%;outline:none;transition:border-color .2s,background .2s,transform .15s;border-radius:4px}
      .idk:focus{border-color:rgba(255,102,0,.6);background:rgba(255,255,255,.09);transform:scale(1.01)}
      .idk::placeholder{color:#4a4a4a}
      textarea.idk{resize:vertical;min-height:110px}

      /* Cart Drawer */
      .cdrawer{position:fixed;top:0;right:0;width:min(400px,100vw);height:100vh;background:#0e0e0e;border-left:1.5px solid rgba(255,102,0,.22);z-index:500;transform:translateX(100%);transition:transform .42s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column}
      .cdrawer.open{transform:none}

      /* Overlay */
      .ov{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:490;opacity:0;pointer-events:none;transition:opacity .3s}
      .ov.show{opacity:1;pointer-events:auto}

      /* Modal */
      .mwrap{position:fixed;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;padding:20px}
      .mbg{position:absolute;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(12px)}
      .mbox{position:relative;z-index:1;background:#141414;border:1.5px solid rgba(255,102,0,.28);width:100%;max-width:500px;padding:32px;animation:modalIn .32s cubic-bezier(.16,1,.3,1) forwards;max-height:90vh;overflow-y:auto;border-radius:8px}

      /* Order toggle */
      .otog{display:flex;border:1.5px solid rgba(255,102,0,.28);border-radius:4px;overflow:hidden}
      .oopt{flex:1;padding:11px 6px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border:none;background:transparent;color:#7a7065;cursor:pointer;transition:all .22s}
      .oopt:hover{background:rgba(255,102,0,.1);color:#fff}
      .oopt.on{background:linear-gradient(135deg,#FF6600,#CC1A00);color:#fff}

      /* Floating Cart */
      .fcart{position:fixed;bottom:28px;right:28px;z-index:400;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#FF6600,#CC1A00);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(255,102,0,.6),0 2px 8px rgba(0,0,0,.5);cursor:pointer;border:none;animation:floatBob 3s ease-in-out infinite;transition:transform .25s,box-shadow .25s}
      .fcart:hover{transform:scale(1.12)!important;box-shadow:0 14px 44px rgba(255,102,0,.8);animation:none}
      .fcart:active{transform:scale(0.95)!important}
      .fcart-badge{position:absolute;top:-5px;right:-5px;background:#fff;color:#CC1A00;font-family:'Inter',sans-serif;font-weight:800;font-size:0.688rem;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35)}

      /* Mobile nav */
      .mmenu{position:fixed;top:0;right:0;width:270px;height:100vh;background:#0d0d0d;border-left:1.5px solid rgba(255,102,0,.2);z-index:200;transform:translateX(100%);transition:transform .38s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;justify-content:center;padding:44px}
      .mmenu.open{transform:none}

      /* Admin */
      .asi{display:flex;align-items:center;gap:12px;padding:12px 18px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#7a7065;cursor:pointer;transition:all .22s;border-left:2.5px solid transparent;position:relative}
      .asi:hover{color:#f0ece6;background:rgba(255,255,255,.04);transform:translateX(3px)}
      .asi.on{color:#FF6600;border-left-color:#FF6600;background:rgba(255,102,0,.07)}
      .acard{background:#141414;border:1px solid #242424;padding:22px;border-radius:5px}
      .ain{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#f0ece6;padding:10px 13px;font-family:'Barlow',sans-serif;font-size:0.875rem;width:100%;outline:none;transition:border-color .2s;border-radius:3px}
      .ain:focus{border-color:rgba(255,102,0,.55)}
      .ain::placeholder{color:#444}
      .atr{display:grid;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s}
      .atr:hover{background:rgba(255,255,255,.025)}
      .scard{background:linear-gradient(135deg,rgba(255,102,0,.09),rgba(204,26,0,.04));border:1px solid rgba(255,102,0,.22);padding:22px;border-radius:5px;transition:transform .22s,box-shadow .22s}
      .scard:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.4)}

      /* Maps */
      .gmap{width:100%;height:360px;border:none;border-radius:8px;display:block}

      /* Testimonials */
      .tcard{background:#111;border:1px solid rgba(255,255,255,.07);padding:28px;border-radius:10px;transition:border-color .25s,transform .25s;position:relative;display:flex;flex-direction:column;gap:14px}
      .tcard:hover{border-color:rgba(255,102,0,.3);transform:translateY(-4px)}
      .tcard::before{content:'"';position:absolute;top:16px;right:22px;font-family:'Playfair Display',serif;font-size:4.5rem;color:rgba(255,102,0,.1);line-height:1;pointer-events:none}
      .stars{color:#FF6600;font-size:0.813rem;letter-spacing:2px}

      /* Order confirmation modal */
      .confirm-box{position:relative;z-index:1;background:#141414;border:1.5px solid rgba(86,207,86,.3);width:100%;max-width:460px;padding:36px;animation:modalIn .32s cubic-bezier(.16,1,.3,1) forwards;border-radius:10px;text-align:center}

      /* Mobile call button */
      .fcall{position:fixed;bottom:56px;right:16px;z-index:460!important;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#22aa44,#157730);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(34,170,68,.55);cursor:pointer;border:none;transition:transform .25s,box-shadow .25s}
      .fcall:hover{transform:scale(1.1);box-shadow:0 8px 28px rgba(34,170,68,.75)}
      .fcall:active{transform:scale(0.93)}

      /* WhatsApp floating button */
      .fwa{position:fixed;bottom:102px;right:16px;z-index:460!important;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#25d366,#128c3e);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(37,211,102,.55);cursor:pointer;border:none;transition:transform .25s,box-shadow .25s;text-decoration:none}
      .fwa:hover{transform:scale(1.1);box-shadow:0 8px 28px rgba(37,211,102,.75)}
      .fwa:active{transform:scale(0.93)}

      /* Adjust cart bubble on mobile to match column */
      @media(max-width:768px){
        .fcart{bottom:16px;right:16px;width:50px;height:50px}
      }

      /* Share button */
      .share-btn{background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.3);color:#25d366;cursor:pointer;padding:6px 12px;border-radius:4px;font-family:'Inter',sans-serif;font-size:0.688rem;font-weight:600;display:flex;align-items:center;gap:5px;transition:all .2s;flex-shrink:0}
      .share-btn:hover{background:rgba(37,211,102,.2);border-color:#25d366;transform:scale(1.05)}

      /* Message card */
      .msg-card{background:#161616;border:1px solid rgba(255,255,255,.07);padding:20px;border-radius:5px;margin-bottom:12px;transition:all .24s;animation:cardIn .3s ease forwards}
      .msg-card:hover{border-color:rgba(255,102,0,.3);transform:translateY(-2px)}

      /* Ripple effect */
      .ripple-host{position:relative;overflow:hidden}
      .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.25);transform:scale(0);animation:ripple .5s ease-out forwards;pointer-events:none}

      body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:.16;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")}

      /* Larger base font for mobile readability */
      .fb { font-size: 15px; }
      @media(max-width:768px){
        .dko{display:none!important}.mto{display:flex!important}
        .ag,.cg{grid-template-columns:1fr!important}
        .cdrawer{width:100vw}
        .adm{grid-template-columns:1fr!important}
        .fcart{bottom:16px;right:16px;width:50px;height:50px}
        .fb{font-size:0.875rem}
        .idk{font-size:1rem;padding:14px}
        h1,h2,h3{letter-spacing:-.01em}.search-wrap input{font-size:1rem;padding:14px 44px 14px 48px}
        .search-icon{font-size:1.063rem;left:16px}
        /* 2 columns side by side on mobile */
        .menu-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
        .tcard-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
        /* Hide description on mobile for compact cards */
        .mcard-desc{display:none!important}
        /* Compact card text */
        .mcard .fd{font-size:0.813rem!important;margin-bottom:4px!important}
        .mcard{border-radius:6px!important}
        /* Compact variant buttons on mobile */
        .vbtn{font-size:0.563rem!important;padding:4px 7px!important;letter-spacing:.03em!important}
        /* Compact price */
        .mcard-price{font-size:1rem!important}
        .tcard{padding:14px!important}
        .tcard .fb{font-size:0.688rem!important;line-height:1.55!important}
        .tcard::before{font-size:2.75rem!important}
        .stars{font-size:0.688rem!important}
        /* Hero mobile - just clear the navbar */
        .hero-inner{padding-top:16px!important;padding-bottom:20px!important}
        /* Body bottom padding so cart bar doesn't cover content */
        body{padding-bottom:70px}
        /* Cart bar pushes WA/call buttons up */
        .fwa{bottom:72px!important;right:12px!important}
        .fcall{bottom:16px!important;right:12px!important}
      }
      @media(min-width:769px){.mto{display:none!important}.mmenu{display:none!important}}
      
      /* Sticky category nav */
      .cat-sticky-wrap{position:sticky;top:0;z-index:200;background:rgba(8,8,8,.97);backdrop-filter:blur(16px);padding:10px clamp(12px,4vw,80px) 8px;margin:0 calc(-1 * clamp(12px,4vw,80px));border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s}
      .cat-sticky-wrap.stuck{border-bottom-color:rgba(255,102,0,.18);box-shadow:0 4px 24px rgba(0,0,0,.6)}
      .cat-scroll-hint{display:none;position:absolute;right:clamp(12px,4vw,80px);top:50%;transform:translateY(-50%);color:rgba(255,102,0,.55);font-size:0.75rem;pointer-events:none;animation:hintPulse 2s ease-in-out infinite}
      @keyframes hintPulse{0%,100%{opacity:.4;transform:translateY(-50%) translateX(0)}50%{opacity:.9;transform:translateY(-50%) translateX(3px)}}
      @media(max-width:768px){
        .cat-scroll-hint{display:block}
        .cat-sticky-wrap{padding:8px 0 6px;margin:0 -12px}
      }
      /* Category tabs - pill shaped */
      .ctab{font-family:'Inter',sans-serif;font-size:0.813rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;padding:0.625rem 1.5rem;border:1.5px solid rgba(255,255,255,.1);background:transparent;color:#9a8a78;cursor:pointer;transition:all .24s cubic-bezier(.34,1.2,.64,1);border-radius:999px;position:relative;overflow:hidden;white-space:nowrap;flex-shrink:0}
      .ctab::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,.05);transform:scaleX(0);transform-origin:left;transition:transform .22s}
      .ctab:hover::after{transform:scaleX(1)}
      .ctab.on{background:linear-gradient(135deg,#FF6600,#CC1A00);color:#fff;border-color:transparent;box-shadow:0 4px 22px rgba(255,102,0,.35);transform:scale(1.04)}
      .ctab:not(.on):hover{border-color:rgba(255,102,0,.45);color:#fff;background:rgba(255,102,0,.09)}
      .ctab:active{transform:scale(0.97)}

      /* Category container - desktop: wrap, mobile: horizontal scroll */
      .cat-wrap{display:flex;gap:0.4rem;justify-content:center;flex-wrap:wrap;margin-bottom:0.75rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}
      .cat-wrap::-webkit-scrollbar{display:none}
      @media(max-width:768px){
        .cat-wrap{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px;margin-left:-12px;margin-right:-12px;padding-left:12px;padding-right:12px}
        .cat-wrap::-webkit-scrollbar{display:none}
        .ctab{font-size:0.688rem!important;padding:0.438rem 1rem!important;transform:none!important;letter-spacing:.05em!important;border-radius:999px!important}
        .ctab.on{transform:none!important}
      }

      /* Fixed bottom cart bar */
      .cart-bar{position:fixed;bottom:0;left:0;right:0;z-index:450!important;background:linear-gradient(135deg,#FF6600,#CC1A00);padding:14px clamp(16px,4vw,40px);display:flex;align-items:center;justify-content:space-between;box-shadow:0 -4px 24px rgba(255,102,0,.4);transform:translateY(100%);transition:transform .35s cubic-bezier(.16,1,.3,1)}
      .cart-bar.show{transform:none}
      .cart-bar-label{font-family:'Inter',sans-serif;font-size:0.813rem;font-weight:700;color:rgba(255,255,255,.8);letter-spacing:.05em}
      .cart-bar-total{font-family:'Inter',sans-serif;font-size:1.125rem;font-weight:800;color:#fff}
      .cart-bar-btn{font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);color:#fff;padding:9px 20px;border-radius:4px;cursor:pointer;transition:all .2s;white-space:nowrap}
      .cart-bar-btn:hover{background:rgba(255,255,255,.35)}
      @media(max-width:768px){
        .cart-bar-label{font-size:0.688rem}
        .cart-bar-total{font-size:1rem}
        .cart-bar-btn{font-size:0.688rem;padding:8px 14px}
        /* WA and Call always stay at fixed positions, above cart bar */
        .fwa{bottom:142px!important}
        .fcall{bottom:86px!important}
      }
    `}</style>
  );
}

// ── Ripple helper ────────────────────────────────────────────────
function addRipple(e) {
  const el = e.currentTarget;
  const r = document.createElement("span");
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  r.className = "ripple";
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  el.appendChild(r);
  setTimeout(() => r.remove(), 520);
}

// ╔══════════════════════════════════════════════════╗
// ║  PUBLIC SITE                                     ║
// ╚══════════════════════════════════════════════════╝
const NAV = ["Home","Menu","About","Contact"];

function PublicSite() {
  const { menuData, aboutData, setWaCount, addMessage } = useApp();
  const [scrolled,      setScrolled]      = useState(false);
  const [navHidden,     setNavHidden]     = useState(false);
  const [mobileNav,     setMobileNav]     = useState(false);
  const [activeNav,     setActiveNav]     = useState("Home");
  const [activeCat,     setActiveCat]     = useState("Pizzas");
  const [prevCat,       setPrevCat]       = useState("Pizzas");
  const [cart,          setCart]          = useState([]);
  const [cartOpen,      setCartOpen]      = useState(false);
  const [checkoutOpen,  setCheckoutOpen]  = useState(false);
  const [orderType,     setOrderType]     = useState("Dine-In");
  const [bumpCart,      setBumpCart]      = useState(false);
  const [showBubble,    setShowBubble]    = useState(false);
  const [catAnimKey,    setCatAnimKey]    = useState(0);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [catStuck,      setCatStuck]      = useState(false);
  const catStickyRef = useRef(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [lastOrder,      setLastOrder]      = useState(null);
  const secRefs = { Home:useRef(null), Menu:useRef(null), About:useRef(null), Contact:useRef(null) };

  useEffect(() => {
    let lastY = window.scrollY;
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setNavHidden(y > lastY && y > 80);
      lastY = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setShowBubble(cart.length>0); }, [cart]);

  // Scroll-reveal observer
  useEffect(() => {
    const init = () => {
      const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      els.forEach(el => obs.observe(el));
      return obs;
    };
    const timer = setTimeout(() => { const obs = init(); return () => obs.disconnect(); }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sticky category bar detection — scroll-based, reliable in all environments
  useEffect(() => {
    const checkStuck = () => {
      const el = catStickyRef.current;
      const menuEl = secRefs.Menu.current;
      if (!el || !menuEl) return;
      const menuRect = menuEl.getBoundingClientRect();
      // Stick when top of menu section has scrolled past viewport top
      // Unstick when bottom of menu section has scrolled past viewport top
      const isInMenu = menuRect.top <= 0 && menuRect.bottom > 0;
      setCatStuck(isInMenu);
    };
    window.addEventListener("scroll", checkStuck, { passive: true });
    checkStuck();
    return () => window.removeEventListener("scroll", checkStuck);
  }, []);

  const goTo = (s) => {
    SFX.click();
    secRefs[s]?.current?.scrollIntoView({behavior:"smooth"});
    setActiveNav(s); setMobileNav(false);
  };

  const switchCat = (cat) => {
    if (cat === activeCat) return;
    SFX.tabSwitch();
    setPrevCat(activeCat); setActiveCat(cat); setCatAnimKey(k=>k+1);
  };

  const totalQty   = cart.reduce((a,c)=>a+c.qty,0);
  const totalPrice = cart.reduce((a,c)=>a+c.price*c.qty,0);

  const addItem = (item) => {
    SFX.addCart();
    setCart(prev => { const ex=prev.find(c=>c.id===item.id); return ex?prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c):[...prev,{...item,qty:1}]; });
    setBumpCart(true); setTimeout(()=>setBumpCart(false),380);
  };
  const changeQty  = (id,d) => { if(d<0) SFX.remove(); setCart(prev=>prev.map(c=>c.id===id?{...c,qty:Math.max(0,c.qty+d)}:c).filter(c=>c.qty>0)); };
  const removeItem = (id)   => { SFX.remove(); setCart(prev=>prev.filter(c=>c.id!==id)); };

  const placeOrder = (customer = {}) => {
    SFX.order();
    setWaCount(n=>n+1);
    const snapshot = [...cart];
    const lines = snapshot.map(c=>`• ${c.name}${c.variant?` (${c.variant})`:""} ×${c.qty} = Rs.${c.price*c.qty}`).join("\n");
    const addressLine = orderType === "Delivery"
      ? `📍 *Address:* ${customer.address || "Not provided"}`
      : `📍 *${orderType}*`;
    const msg = [
      `🔥 *Love n' Grill Order* 🔥`,
      ``,
      `👤 *Customer:* ${customer.name || "—"}`,
      `📞 *Phone:* ${customer.phone || "—"}`,
      addressLine,
      customer.notes ? `📝 *Notes:* ${customer.notes}` : null,
      ``,
      `🧾 *Order:*`,
      lines,
      ``,
      `💰 *Total: Rs.${totalPrice}*`,
      `🚀 *Order Type:* ${orderType}`,
  
      ``,
      `_Sent from Love n' Grill website_`,
    ].filter(l => l !== null).join("\n");
    window.open(`https://wa.me/${aboutData.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
    setLastOrder({ items: snapshot, total: totalPrice, type: orderType, customer });
    setCheckoutOpen(false);
    setTimeout(() => { setOrderConfirmed(true); setCart([]); }, 400);
  };

  return (
    <div style={{background:"#0a0a0a",color:"#f0ece6",minHeight:"clamp(480px,85vh,100vh)",overflowX:"hidden"}}>

      {/* NAVBAR */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:scrolled?"11px clamp(16px,4vw,40px)":"20px clamp(16px,4vw,40px)",background:scrolled?"rgba(8,8,8,.97)":"transparent",backdropFilter:scrolled?"blur(22px)":"none",borderBottom:scrolled?"1px solid rgba(255,102,0,.12)":"none",transition:"transform .38s cubic-bezier(.16,1,.3,1), background .34s, padding .34s, backdrop-filter .34s, border-color .34s",transform:navHidden?"translateY(-100%)":"translateY(0)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.625rem",cursor:"pointer"}} onClick={()=>{SFX.click();goTo("Home");}}>
          <img src="/logo.webp" alt="Logo" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,102,0,.5)",boxShadow:"0 0 16px rgba(255,102,0,.4)",transition:"transform .25s"}} onMouseEnter={e=>e.target.style.transform="scale(1.1) rotate(5deg)"} onMouseLeave={e=>e.target.style.transform="none"}/>
          <div>
            <div className="fd" style={{fontSize:"1.125rem",fontWeight:900,color:"#fff"}}>LOVE <span style={{color:"#FF6600"}}>n'</span> GRILL</div>
            <div style={{display:"flex",alignItems:"center",gap:"0.375rem"}}>
              <span style={{width:16,height:1,background:"rgba(255,102,0,.5)",display:"inline-block"}}/>
              <div className="fc" style={{fontSize:"0.5rem",letterSpacing:".3em",color:"#7a6a5a",textTransform:"uppercase"}}>Cafe & Fast Food</div>
              <span style={{width:16,height:1,background:"rgba(255,102,0,.5)",display:"inline-block"}}/>
            </div>
          </div>
        </div>
        <div className="dko" style={{display:"flex",gap:"2.125rem",alignItems:"center"}}>
          {NAV.map(l=><span key={l} className={`nl ${activeNav===l?"on":""}`} onClick={()=>goTo(l)} onMouseEnter={()=>SFX.hover()}>{l}</span>)}
        </div>
        <div style={{display:"flex",gap:"0.625rem",alignItems:"center"}}>
          <button onClick={()=>{SFX.click();setCartOpen(true);}} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:"0.313em 0.438em",display:"flex",alignItems:"center",transition:"transform .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <span style={{fontSize:"1.5rem"}}>🛒</span>
            {totalQty>0&&<span className={bumpCart?"bump fcart-badge":""} style={{position:"absolute",top:-4,right:-4,background:"linear-gradient(135deg,#FF6600,#CC1A00)",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:"0.625rem",width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(255,102,0,.6)"}}>{totalQty}</span>}
          </button>
          <button className="btn-f ripple-host dko" onClick={e=>{addRipple(e);SFX.click();goTo("Menu");}} style={{fontSize:"0.75rem",padding:"10px 22px"}}>Order Now</button>
          <button className="mto" onClick={()=>{SFX.click();setMobileNav(!mobileNav);}} style={{background:"none",border:"none",color:"#FF6600",cursor:"pointer",fontSize:"1.5rem",transition:"transform .25s"}} onMouseEnter={e=>e.currentTarget.style.transform="rotate(90deg)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>{mobileNav?"✕":"☰"}</button>
        </div>
      </nav>

      {/* Mobile nav overlay backdrop */}
      {mobileNav&&<div onClick={()=>{SFX.click();setMobileNav(false);}} style={{position:"fixed",inset:0,zIndex:98,background:"rgba(0,0,0,.55)",backdropFilter:"blur(2px)"}}/>}
      {/* Mobile nav */}
      <div className={`mmenu ${mobileNav?"open":""}`}>
        <button onClick={()=>{SFX.click();setMobileNav(false);}} style={{position:"absolute",top:20,right:20,background:"rgba(255,102,0,.12)",border:"1px solid rgba(255,102,0,.3)",color:"#FF6600",cursor:"pointer",width:38,height:38,fontSize:"1.125rem",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,102,0,.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,102,0,.12)"}>✕</button>
        {NAV.map((l,i)=><div key={l} onClick={()=>goTo(l)} className="fd" style={{fontSize:"1.625rem",fontWeight:700,color:activeNav===l?"#FF6600":"#fff",marginBottom:26,cursor:"pointer",transition:"color .2s,transform .2s",transitionDelay:`${i*50}ms`}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(8px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>{l}</div>)}
      </div>

      {/* HERO */}
      <section ref={secRefs.Home} className="hero-section" style={{position:"relative",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 50%, rgba(204,26,0,.2) 0%, rgba(255,102,0,.05) 40%, transparent 70%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,10,10,.12) 0%,rgba(10,10,10,.52) 55%,#0a0a0a 100%)"}}/>
        <div style={{position:"absolute",inset:0,opacity:.018,backgroundImage:"linear-gradient(#FF6600 1px,transparent 1px),linear-gradient(90deg,#FF6600 1px,transparent 1px)",backgroundSize:"80px 80px"}}/>
        {Array.from({length:14}).map((_,i)=><div key={i} className="ember" style={{width:`${2+Math.random()*3.5}px`,height:`${2+Math.random()*3.5}px`,left:`${10+Math.random()*78}%`,bottom:`${Math.random()*25}%`,"--dur":`${4+Math.random()*7}s`,"--del":`${Math.random()*6}s`,"--dx":`${-55+Math.random()*110}px`}}/>)}
        <div className="hero-inner" style={{position:"relative",zIndex:2,padding:"clamp(70px,10vh,90px) clamp(16px,6vw,80px) clamp(20px,3vh,40px)",width:"100%",maxWidth:640,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <img src="/logo.webp" className="al" alt="Love n' Grill" style={{width:"clamp(60px,13vw,100px)",height:"clamp(60px,13vw,100px)",borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,102,0,.55)",boxShadow:"0 0 40px rgba(255,102,0,.5)",marginBottom:14,transition:"transform .3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.08) rotate(-3deg)"} onMouseLeave={e=>e.target.style.transform="none"}/>
          <div className="al" style={{marginBottom:6,display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <span style={{width:20,height:1,background:"rgba(255,102,0,.6)",display:"inline-block"}}/>
            <div className="fc" style={{fontSize:"clamp(9px,2vw,11px)",fontWeight:600,letterSpacing:".34em",color:"#FF6600",textTransform:"uppercase"}}>Cafe & Fast Food</div>
            <span style={{width:20,height:1,background:"rgba(255,102,0,.6)",display:"inline-block"}}/>
          </div>
          <h1 className="glow fd al" style={{fontSize:"clamp(38px,10vw,100px)",fontWeight:900,lineHeight:.88,letterSpacing:"-.02em",color:"#fff",marginBottom:14}}>LOVE <span style={{color:"#FF6600",fontStyle:"italic"}}>n'</span> GRILL</h1>
          <p className="au d2 fb" style={{fontSize:"clamp(14px,1.8vw,17px)",color:"rgba(255,255,255,.65)",lineHeight:1.7,marginBottom:16,fontWeight:400}}>Pizzas, burgers, deals & more — forged over open flame and served with soul.</p>
          <div className="au d3" style={{display:"flex",gap:"0.625rem",justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
            <button className="btn-f ripple-host" onClick={e=>{addRipple(e);SFX.click();goTo("Menu");}} style={{fontSize:"clamp(12px,1.5vw,14px)",padding:"12px 28px"}}>View Menu</button>
            <button className="btn-o" onClick={()=>{SFX.click();goTo("About");}} style={{fontSize:"clamp(11px,1.4vw,13px)",padding:"11px 22px"}}>Our Story</button>
          </div>
          <div style={{display:"flex",gap:"clamp(24px,6vw,52px)",justifyContent:"center",flexWrap:"nowrap"}}>
            
          </div>
        </div>

      </section>

      {/* MENU */}
      <section ref={secRefs.Menu} style={{padding:"clamp(24px,4vw,60px) clamp(12px,4vw,80px) clamp(90px,12vw,100px)",background:"#080808"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <h2 className="fd reveal" style={{fontSize:"clamp(22px,4vw,48px)",fontWeight:900,color:"#fff",letterSpacing:"-.02em"}}>Forged in <span style={{color:"#FF6600",fontStyle:"italic"}}>Flame</span></h2>
        </div>
        <div ref={catStickyRef} className={`cat-sticky-wrap ${catStuck?"stuck":""}`} style={{position:"relative"}}>
          <div className="cat-wrap">
            {Object.keys(menuData).map(cat=>(
              <button key={cat} className={`ctab ripple-host ${activeCat===cat?"on":""}`}
                onClick={e=>{addRipple(e);switchCat(cat);}}>
                {menuData[cat].icon} {cat}
              </button>
            ))}
          </div>
          <span className="cat-scroll-hint">›</span>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔥</span>
          <input
            type="text"
            placeholder="Search pizzas, burgers, deals…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>


        {searchQuery.trim() ? (
          // Universal search results across all categories
          <div style={{maxWidth:1140,margin:"0 auto"}}>
            {(() => {
              const q = searchQuery.toLowerCase();
              const results = Object.entries(menuData).flatMap(([cat, data]) =>
                data.items.filter(item => item.name.toLowerCase().includes(q)).map(item => ({ ...item, _cat: cat, _icon: data.icon }))
              );
              if (results.length === 0) return (
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <div style={{fontSize:"2.625rem",marginBottom:14}}>🔍</div>
                  <div className="fc" style={{fontSize:"0.813rem",letterSpacing:".18em",color:"#4a4035",textTransform:"uppercase"}}>Nothing found for "{searchQuery}"</div>
                  <div className="fb" style={{fontSize:"0.875rem",color:"#3a3530",marginTop:8}}>Try "pizza", "burger", or "deal"</div>
                </div>
              );
              return (
                <>
                  <div className="search-results-label">{results.length} result{results.length!==1?"s":""} across all categories</div>
                  <MenuGrid
                    key="search"
                    category={{ items: results }}
                    cart={cart}
                    onAdd={addItem}
                    onChangeQty={changeQty}
                    searchQuery=""
                    isSearchResult={true}
                  />
                </>
              );
            })()}
          </div>
        ) : (
          // Normal category view
          <div style={{maxWidth:1140,margin:"0 auto"}}>
            {menuData[activeCat]
              ? <MenuGrid key={catAnimKey} category={menuData[activeCat]} cart={cart} onAdd={addItem} onChangeQty={changeQty} searchQuery="" />
              : <p className="fc" style={{textAlign:"center",color:"#3a3530",fontSize:"0.875rem",padding:"40px 0"}}>No items.</p>}
          </div>
        )}
      </section>

      {/* OUR STORY - The Visionary's Journey */}
      <section style={{padding:"clamp(40px,5vw,80px) clamp(12px,4vw,80px)",background:"#060606",position:"relative",overflow:"hidden"}}>
        {/* Ambient background glow */}
        <div style={{position:"absolute",right:"-200px",top:"10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,102,0,.06),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",left:"-150px",bottom:"5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(204,26,0,.05),transparent)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          {/* Section header */}
          <div style={{textAlign:"center",marginBottom:48}}>
            <div className="fc reveal" style={{fontSize:"0.625rem",letterSpacing:".4em",color:"#FF6600",textTransform:"uppercase",marginBottom:10}}>The Founder's Journey</div>
            <h2 className="fd reveal" style={{fontSize:"clamp(22px,4vw,52px)",fontWeight:900,color:"#fff",letterSpacing:"-.02em",lineHeight:1.1}}>The <span style={{color:"#FF6600",fontStyle:"italic"}}>Visionary's</span> Journey</h2>
            <div style={{width:60,height:2,background:"linear-gradient(90deg,transparent,#FF6600,transparent)",margin:"16px auto 0"}}/>
          </div>

          {/* Main story layout */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(2rem,5vw,5rem)",alignItems:"center",marginBottom:48}} className="ag">

            {/* Story text - left side */}
            <div className="reveal-left">
              <p className="fb" style={{color:"rgba(255,255,255,.78)",lineHeight:1.9,fontSize:"clamp(0.875rem,1.5vw,1rem)",marginBottom:20,fontWeight:400}}>
                Every great flavor has a story, and ours began with a dream and a single-minded determination. Before Love n' Grill became a cornerstone of the Haripur culinary scene, it was a vision held by our founder, <span style={{color:"#FF6600",fontWeight:600}}>Ali Akbar Khan</span>.
              </p>
              <p className="fb" style={{color:"rgba(255,255,255,.65)",lineHeight:1.9,fontSize:"clamp(0.813rem,1.4vw,0.938rem)",marginBottom:20}}>
                Ali's journey was not one of ease, but of extraordinary grit. Leaving home to seek a better future, he found himself in <span style={{color:"rgba(255,200,100,.8)",fontWeight:500}}>Cyprus</span>, starting from absolute zero. In a foreign land, he learned that the heart of a great meal isn't just the ingredients — it's the hard work and the sense of belonging it creates. He spent years mastering the craft of hospitality, fueled by a singular ambition: to return to his roots and build something of his own.
              </p>
              {/* Pull quote */}
              <div style={{borderLeft:"3px solid #FF6600",paddingLeft:20,marginBottom:20,background:"rgba(255,102,0,.04)",padding:"14px 20px",borderRadius:"0 6px 6px 0"}}>
                <p className="fd" style={{color:"rgba(255,255,255,.9)",fontSize:"clamp(0.938rem,1.6vw,1.063rem)",fontStyle:"italic",lineHeight:1.7,fontWeight:700}}>
                  "Through struggle comes something beautiful, and through passion comes the perfect meal."
                </p>
              </div>
            </div>

            {/* Owner photo - right side */}
            <div className="reveal-right" style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
              <div style={{position:"relative",display:"inline-block"}}>
                {/* Decorative rings */}
                <div style={{position:"absolute",inset:-16,borderRadius:"50%",border:"1px solid rgba(255,102,0,.15)",animation:"pulse 3s ease-in-out infinite"}}/>
                <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:"1px dashed rgba(255,102,0,.2)"}}/>
                {/* Glow backdrop */}
                <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,102,0,.18) 0%,transparent 70%)",filter:"blur(20px)",transform:"scale(1.3)"}}/>
                {/* Photo frame */}
                <div style={{position:"relative",width:"clamp(200px,28vw,280px)",height:"clamp(200px,28vw,280px)",borderRadius:"50%",overflow:"hidden",border:"3px solid rgba(255,102,0,.6)",boxShadow:"0 0 60px rgba(255,102,0,.25), 0 20px 60px rgba(0,0,0,.7)",userSelect:"none",pointerEvents:"none",WebkitUserDrag:"none"}}>
                  <img
                    src="/owner.webp"
                    alt="Ali Akbar Khan — Founder, Love n' Grill"
                    draggable="false"
                    style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block",pointerEvents:"none",userSelect:"none"}}
                  />
                </div>
                {/* Name badge */}
                <div style={{position:"absolute",bottom:-18,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#FF6600,#CC1A00)",padding:"6px 20px",borderRadius:30,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(255,102,0,.4)"}}>
                  <div className="fc" style={{fontSize:"0.75rem",fontWeight:700,color:"#fff",letterSpacing:".05em"}}>Ali Akbar Khan</div>
                  <div className="fi" style={{fontSize:"0.5rem",letterSpacing:".18em",color:"rgba(255,255,255,.8)",textTransform:"uppercase",textAlign:"center",marginTop:1}}>Founder</div>
                </div>
              </div>
            </div>
          </div>

          {/* Second story block - full width */}
          <div className="reveal" style={{background:"rgba(255,102,0,.04)",border:"1px solid rgba(255,102,0,.15)",borderRadius:12,padding:"clamp(24px,3vw,40px)",marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:18}}>
              <div style={{width:32,height:32,background:"linear-gradient(135deg,#FF6600,#CC1A00)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>✈️</div>
              <h3 className="fd" style={{fontSize:"clamp(1rem,2.5vw,1.375rem)",fontWeight:900,color:"#fff",letterSpacing:"-.01em"}}>From Cyprus to Haripur: <span style={{color:"#FF6600",fontStyle:"italic"}}>A Taste of Home</span></h3>
            </div>
            <p className="fb" style={{color:"rgba(255,255,255,.65)",lineHeight:1.9,fontSize:"clamp(0.813rem,1.4vw,0.938rem)",marginBottom:12}}>
              Love n' Grill is the realization of that lifelong dream. We aren't just a restaurant; we are a <span style={{color:"rgba(255,200,100,.8)"}}>tribute to the community</span> that raised us. We've combined international standards of excellence with the warmth of traditional hospitality.
            </p>
            <p className="fb" style={{color:"rgba(255,255,255,.55)",lineHeight:1.9,fontSize:"clamp(0.813rem,1.4vw,0.938rem)"}}>
              For the people of Haripur, stepping into Love n' Grill feels like coming home. Every grill we fire up and every artisan pizza we bake carries the essence of Ali's journey — a reminder that through struggle comes something beautiful, and through passion comes the perfect meal.
            </p>
          </div>

          {/* Stats row */}
          <div className="reveal" style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",padding:"20px 0",borderTop:"1px solid rgba(255,255,255,.05)",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section ref={secRefs.About} style={{padding:"clamp(24px,4vw,60px) clamp(12px,4vw,80px)",background:"#0a0a0a",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:"-160px",top:"50%",transform:"translateY(-50%)",width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(204,26,0,.07),transparent)",pointerEvents:"none"}}/>
        <div className="ag" style={{maxWidth:1120,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3.75rem",alignItems:"start"}}>
          <div className="reveal-left">
                        <h2 className="fd" style={{fontSize:"clamp(26px,3.6vw,46px)",fontWeight:900,color:"#fff",letterSpacing:"-.02em",marginBottom:12,lineHeight:1.1}}>Haripur's <span style={{color:"#FF6600",fontStyle:"italic"}}>finest</span> flame</h2>
            <p className="fb" style={{color:"rgba(255,255,255,.65)",lineHeight:1.85,fontSize:"0.938rem",fontWeight:400,marginBottom:16}}>{aboutData.description}</p>
            <p className="fb" style={{color:"rgba(255,255,255,.42)",lineHeight:1.85,fontSize:"0.875rem",marginBottom:28}}>Born from a passion for bold flavours and honest ingredients, Love n' Grill has become the heartbeat of Haripur's food scene. Every bite crafted with care, fire-kissed to perfection.</p>
            <div style={{background:"rgba(255,102,0,.07)",border:"1px solid rgba(255,102,0,.25)",padding:"18px 20px",marginBottom:24,borderRadius:6}}>
              <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                <span style={{fontSize:"1.375rem",flexShrink:0}}>📍</span>
                <div>
                  <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".2em",color:"#FF6600",textTransform:"uppercase",marginBottom:5}}>Our Location</div>
                  <div className="fb" style={{color:"#fff",fontSize:"0.938rem",fontWeight:500,lineHeight:1.6}}>{aboutData.location}</div>
                </div>
              </div>
            </div>
            <button className="btn-f ripple-host" onClick={e=>{addRipple(e);SFX.click();goTo("Menu");}}>Explore the Menu</button>
          </div>
          {/* Google Maps */}
          <div className="reveal-right">
            <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".3em",color:"#FF6600",textTransform:"uppercase",marginBottom:14}}>📍 Find Us on Maps</div>
            <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,102,0,.22)",boxShadow:"0 8px 32px rgba(0,0,0,.6)",marginBottom:16,position:"relative"}}>
              <iframe className="gmap" title="Love n Grill Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.1!2d72.9378945!3d33.9943992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38f3b3001b09dfff%3A0x696f08ded8b44787!2sLovenGrill!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>
            <div className="fb" style={{fontSize:"0.875rem",color:"rgba(255,255,255,.55)",marginBottom:12,lineHeight:1.6}}>📍 {aboutData.location}</div>
            <div style={{display:"flex",gap:"0.625rem",flexWrap:"wrap"}}>
              <a href="https://maps.app.goo.gl/8n36zwycKAeojedn8" target="_blank" rel="noreferrer" className="btn-f" onClick={()=>SFX.click()}
                style={{display:"inline-flex",fontSize:"0.75rem",textDecoration:"none",padding:"10px 20px"}}>📍 Open Maps</a>
              <a href="https://search.google.com/local/writereview?placeid=ChIJ_53fCwCz3zgRxWdEuN0ID2k" target="_blank" rel="noreferrer" className="btn-o"
                style={{display:"inline-flex",fontSize:"0.75rem",textDecoration:"none"}}>⭐ Review Us on Maps</a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section ref={secRefs.Contact} style={{padding:"clamp(24px,4vw,60px) clamp(12px,4vw,80px)",background:"#060606"}}>
        <div style={{maxWidth:1120,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <h2 className="fd reveal" style={{fontSize:"clamp(22px,4vw,48px)",fontWeight:900,color:"#fff"}}>Come <span style={{color:"#FF6600",fontStyle:"italic"}}>hungry</span></h2>
          </div>
          <div className="cg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3.25rem",alignItems:"start"}}>
            <div className="reveal-left">
              {[["📍","Location",aboutData.location],["⏰","Hours",aboutData.hours],["📞","Phone",aboutData.phone],["✉️","Email",aboutData.email]].map(([ic,lb,vl])=>(
                <div key={lb} style={{display:"flex",gap:"1rem",marginBottom:26,paddingBottom:26,borderBottom:"1px solid rgba(255,255,255,.06)",transition:"transform .22s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(6px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                  <div style={{fontSize:"1.375rem",flexShrink:0,marginTop:2}}>{ic}</div>
                  <div>
                    <div className="fc" style={{fontSize:"0.563rem",letterSpacing:".24em",color:"#FF6600",textTransform:"uppercase",marginBottom:5}}>{lb}</div>
                    <div className="fb" style={{color:"rgba(255,255,255,.72)",fontSize:"0.938rem",lineHeight:1.6,fontWeight:400}}>{vl}</div>
                  </div>
                </div>
              ))}
            </div>
            <ContactForm className="reveal-right" onSend={(data)=>addMessage({...data,id:Date.now(),time:new Date().toLocaleString()})}/>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"28px clamp(16px,6vw,80px)",borderTop:"1px solid rgba(255,102,0,.1)",background:"#040404"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.875rem",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
            <img src="/logo.webp" alt="logo" style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",border:"1.5px solid rgba(255,102,0,.4)"}}/>
            <div className="fd" style={{fontSize:"0.938rem",fontWeight:900,color:"#fff"}}>LOVE <span style={{color:"#FF6600"}}>n'</span> GRILL</div>
          </div>
          <div style={{display:"flex",gap:"1.25rem",alignItems:"center"}}>
            <a href={aboutData.instagram} target="_blank" rel="noreferrer"
              style={{display:"flex",alignItems:"center",gap:"0.375rem",fontSize:"0.625rem",letterSpacing:".14em",color:"#4a4035",textTransform:"uppercase",transition:"color .2s,transform .2s",textDecoration:"none",fontFamily:"'Libre Baskerville',serif"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#E1306C";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#4a4035";e.currentTarget.style.transform="none";}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a href={aboutData.tiktok} target="_blank" rel="noreferrer"
              style={{display:"flex",alignItems:"center",gap:"0.375rem",fontSize:"0.625rem",letterSpacing:".14em",color:"#4a4035",textTransform:"uppercase",transition:"color .2s,transform .2s",textDecoration:"none",fontFamily:"'Libre Baskerville',serif"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#69C9D0";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#4a4035";e.currentTarget.style.transform="none";}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>
              TikTok
            </a>
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.04)",paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
          <div className="fb" style={{color:"#3a3530",fontSize:"0.75rem"}}>© 2025 Love n' Grill · Haripur · Made with 🔥</div>
          <div style={{display:"flex",gap:"1.25rem",alignItems:"center"}}>
            <div className="fb" style={{color:"#3a3530",fontSize:"0.75rem"}}>
              Made by <span style={{color:"#FF6600",fontWeight:600,cursor:"default"}}>XorByt.dev</span>
            </div>
            <a 
  className="fb"
  href="#"
  onClick={(e) => {
    e.preventDefault(); // Stop standard browser page navigation
    
    // Check if the user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Open their native mail app instantly
      window.location.href = "mailto:xorbyt.dev@gmail.com?subject=Contact%20the%20Developers&body=Hi%20Team,%0A%0A";
    } else {
      // Desktop: Open Gmail Web Compose interface directly in a clean new tab
      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=xorbyt.dev@gmail.com&su=Contact%20the%20Developers&body=Hi%20Team,%0A%0A", "_blank", "noopener,noreferrer");
    }
  }}
  style={{
    color: "#FF6600",
    fontSize: "0.75rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(255,102,0,.3)",
    padding: "4px 10px",
    borderRadius: 4,
    background: "rgba(255,102,0,.07)",
    textDecoration: "none"
  }}
>
  ✉ Contact Developers
</a>
          </div>
        </div>
      </footer>

      {/* Overlays + Drawers */}
      <div className={`ov ${cartOpen||checkoutOpen?"show":""}`} onClick={()=>{SFX.click();setCartOpen(false);setCheckoutOpen(false);}}/>
      <CartDrawer cart={cart} isOpen={cartOpen} totalQty={totalQty} totalPrice={totalPrice}
        onClose={()=>setCartOpen(false)} onChangeQty={changeQty} onRemove={removeItem}
        onCheckout={()=>{SFX.checkout();setCartOpen(false);setTimeout(()=>setCheckoutOpen(true),220);}}/>
      {checkoutOpen&&<CheckoutModal cart={cart} totalPrice={totalPrice} orderType={orderType} setOrderType={setOrderType} onClose={()=>setCheckoutOpen(false)} onPlace={placeOrder}/>}
      {orderConfirmed&&lastOrder&&<OrderConfirmModal order={lastOrder} onClose={()=>{setOrderConfirmed(false);setLastOrder(null);}} onReorder={()=>{SFX.click();setOrderConfirmed(false);goTo("Menu");}}/>}
      {/* Fixed bottom cart bar - replaces floating bubble */}
      <div className={`cart-bar ${totalQty>0&&!cartOpen&&!checkoutOpen?"show":""}`}>
        <div>
          <div className="cart-bar-label">{totalQty} item{totalQty!==1?"s":""}</div>
          <div className="cart-bar-total">Rs.{totalPrice}</div>
        </div>
        <button className="cart-bar-btn" onClick={()=>{SFX.click();setCartOpen(true);}}>View Cart →</button>
      </div>
      {/* Mobile WA + Call buttons */}
      <a className="fwa" href={`https://wa.me/${aboutData.whatsapp}`} target="_blank" rel="noreferrer" title="WhatsApp Us" onClick={()=>SFX.click()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
      <a className="fcall" href={`tel:${aboutData.phone}`} title="Call Us" onClick={()=>SFX.click()}>
        <span style={{fontSize:"1.375rem"}}>📞</span>
      </a>
    </div>
  );
}

// ── Order Confirmation Modal ──────────────────────────────────────
function OrderConfirmModal({ order, onClose, onReorder }) {
  return (
    <div className="mwrap">
      <div className="mbg" onClick={onClose}/>
      <div className="confirm-box">
        <div style={{fontSize:"3.625rem",marginBottom:12,animation:"floatBob 2s ease-in-out infinite"}}>🎉</div>
        <div className="fc" style={{fontSize:"0.688rem",letterSpacing:".3em",color:"#56cf56",textTransform:"uppercase",marginBottom:8}}>Order Sent!</div>
        <h3 className="fd" style={{fontSize:"1.625rem",fontWeight:900,color:"#fff",marginBottom:6}}>We've got it!</h3>
        <p className="fb" style={{fontSize:"0.875rem",color:"rgba(255,255,255,.5)",marginBottom:24,lineHeight:1.7}}>
          Your WhatsApp is open. Send the message and we'll confirm your order shortly. Usually within 5 minutes.
        </p>
        {/* Order summary */}
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.625rem",letterSpacing:".2em",color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:10}}>Order Summary</div>
          {order.items.map(item=>(
            <div key={item.id} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span className="fb" style={{fontSize:"0.813rem",color:"rgba(255,255,255,.6)"}}>{item.name}{item.variant?` (${item.variant})`:""} ×{item.qty}</span>
              <span style={{fontSize:"0.813rem",color:"#FF6600",fontFamily:"'Inter',sans-serif",fontWeight:600}}>Rs.{item.price*item.qty}</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".12em"}}>Total</span>
            <span className="fd" style={{fontSize:"1.25rem",fontWeight:700,color:"#FF6600"}}>Rs.{order.total}</span>
          </div>
          <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".12em"}}>Type</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:"0.75rem",color:"rgba(255,255,255,.55)"}}>{order.type}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:"0.625rem"}}>
          <button className="btn-o" onClick={onReorder} style={{flex:1,fontSize:"0.75rem"}}>Order More</button>
          <button className="btn-f" onClick={onClose} style={{flex:1,fontSize:"0.75rem"}}>Done ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── Menu Grid ────────────────────────────────────────────────────
function MenuGrid({ category, cart, onAdd, onChangeQty, searchQuery = "", isSearchResult = false }) {
  const { aboutData } = useApp();
  const [selVar, setSelVar] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [addonQty, setAddonQty] = useState({});
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  useEffect(() => { setAddonQty({}); setSelectedFlavor(null); }, [detailItem?.item?.id]);

  // Normalize CMS flavours (supports ["Mango"] or [{name:"Mango"}])
  const getFlavors = (item) => {
    const raw = item?.flavors;
    if (!Array.isArray(raw)) return [];
    return raw.map(f => (typeof f === "string" ? f : (f?.name || f?.label || ""))).filter(Boolean);
  };
  const needsFlavor = (item) => !!item?.flavorRequired && getFlavors(item).length > 0;


  const getAddonUnitPrice = (a, selLabel) => {
    if (a.variantPrices && a.variantPrices.length && selLabel) {
      const m = a.variantPrices.find(v => v.label === selLabel);
      if (m) return m.price;
    }
    return a.price ?? 0;
  };
  const computeAddonExtras = (item, sel) => {
    if (!item?.addons?.length) return { extra: 0, summary: "", sig: "" };
    let extra = 0; const lines = []; const sigParts = [];
    item.addons.forEach(a => {
      const q = addonQty[a.label] ?? 0;
      if (q > 0) {
        const u = getAddonUnitPrice(a, sel?.label);
        extra += u * q;
        lines.push(`+${a.label}${q>1?`×${q}`:""}`);
        sigParts.push(`${a.label}:${q}`);
      }
    });
    return { extra, summary: lines.join(", "), sig: sigParts.join("|") };
  };
  const getQty = (id) => cart.find(c=>c.id===id)?.qty??0;

  const filtered = searchQuery.trim()
    ? category.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : category.items;

  if (filtered.length === 0) {
    return (
      <div style={{textAlign:"center",padding:"60px 0"}}>
        <div style={{fontSize:"2.375rem",marginBottom:12}}>🔍</div>
        <div className="fc" style={{fontSize:"0.813rem",letterSpacing:".18em",color:"#4a4035",textTransform:"uppercase"}}>No results for "{searchQuery}"</div>
        <div className="fb" style={{fontSize:"0.875rem",color:"#3a3530",marginTop:6}}>Try a different search term</div>
      </div>
    );
  }

  const shareItem = (item, price) => {
    const text = `🔥 Check out *${item.name}* at Love n' Grill, Haripur!\n💰 Rs.${price}\n📞 Order: wa.me/${aboutData.whatsapp}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const renderCard = (item, idx) => {
    const hasV  = !!item.variants;
    const sel   = selVar[item.id]??(hasV?item.variants[0]:null);
    const price = hasV?sel.price:item.price;
    const cid   = item.id+(sel?`-${sel.label}`:"");
    const qty   = getQty(cid);
    const img   = item.image;

    return (
      <div key={item.id} className="mcard card-in" style={{display:"flex",flexDirection:"column",animationDelay:`${idx*60}ms`,borderRadius:12,overflow:"hidden",background:"#161616",border:"1px solid rgba(255,255,255,.07)"}}>
        {/* Image — tall, like KFC. Click to open details. */}
        <div onClick={()=>{SFX.click();setDetailItem({item,price,sel,img});}} style={{position:"relative",width:"100%",paddingTop:"80%",background:"#1a1212",flexShrink:0,overflow:"hidden",cursor:"pointer"}}>
          <img src={img ? (window.location.hostname === 'localhost' ? img : `/.netlify/images?url=${encodeURIComponent(img)}`) : ''} loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          {/* Badges top-right */}
          <div style={{position:"absolute",top:8,right:8,display:"flex",flexDirection:"column",gap:"0.188rem",alignItems:"flex-end"}}>
            {item.spicy&&<span style={{background:"rgba(200,30,10,.9)",color:"#fff",fontSize:"0.5rem",fontWeight:700,fontFamily:"'Inter',sans-serif",padding:"0.125em 0.375em",borderRadius:20}}>🌶️ Spicy</span>}
            {item.popular&&<span style={{background:"rgba(255,140,0,.9)",color:"#fff",fontSize:"0.5rem",fontWeight:700,fontFamily:"'Inter',sans-serif",padding:"0.125em 0.375em",borderRadius:20}}>⭐ Popular</span>}
          </div>
          {/* "View details" hint */}
          <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,.55)",backdropFilter:"blur(6px)",color:"#fff",fontSize:"0.563rem",fontWeight:600,fontFamily:"'Inter',sans-serif",padding:"4px 8px",borderRadius:20,letterSpacing:".08em",textTransform:"uppercase",pointerEvents:"none"}}>Tap for details</div>
        </div>
        {/* Content */}
        <div style={{padding:"10px 10px 12px",display:"flex",flexDirection:"column",flex:1}}>
          <div onClick={()=>{SFX.click();setDetailItem({item,price,sel,img});}} style={{cursor:"pointer"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"0.875rem",fontWeight:700,color:"#fff",lineHeight:1.25,marginBottom:4}}>{item.name}</div>
            <div style={{fontFamily:"'Barlow',sans-serif",fontSize:"0.688rem",color:"rgba(255,255,255,.4)",lineHeight:1.5,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.desc}</div>
          </div>
          {/* Variants */}
          {hasV&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.188rem",marginBottom:8}}>
              {item.variants.map(v=>(
                <button key={v.label} className={`vbtn ${sel?.label===v.label?"on":""}`}
                  style={{fontSize:"0.5rem",padding:"0.188em 0.375em"}}
                  onClick={()=>{SFX.tabSwitch();setSelVar(p=>({...p,[item.id]:v}));}}>
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <div style={{marginTop:"auto"}}>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:"1.125rem",fontWeight:800,color:"#FF6600",marginBottom:8}}>
              {item.pricePrefix&&<span style={{fontSize:"0.563rem",color:"rgba(255,255,255,.3)",fontWeight:400,marginRight:3}}>{item.pricePrefix} </span>}
              Rs.{price}
            </div>
            {qty>0?(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,102,0,.12)",border:"1.5px solid rgba(255,102,0,.5)",borderRadius:8,padding:"0.313em 0.625em"}}>
                <button className="qbtn" style={{width:26,height:26,fontSize:"1rem",border:"none",background:"none"}} onClick={()=>onChangeQty(cid,-1)}>−</button>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:"0.875rem",fontWeight:800,color:"#fff"}}>{qty}</span>
                <button className="qbtn" style={{width:26,height:26,fontSize:"1rem",border:"none",background:"none"}} onClick={()=>{
                  if (needsFlavor(item)) { SFX.click(); setDetailItem({item,price,sel,img}); return; }
                  onAdd({id:cid,name:item.name,variant:sel?.label||null,price});
                }}>+</button>
              </div>
            ):(
              <button className="btn-f ripple-host" style={{width:"100%",fontSize:"0.688rem",padding:"10px 4px",letterSpacing:".08em",borderRadius:8,display:"block"}} onClick={e=>{
                addRipple(e);
                if (needsFlavor(item)) { SFX.click(); setDetailItem({item,price,sel,img}); return; }
                onAdd({id:cid,name:item.name,variant:sel?.label||null,price});
              }}>+ Add to Cart</button>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="menu-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"1rem"}}>
        {filtered.map((item, idx) => renderCard(item, idx))}
      </div>
      {detailItem && (
        <div
          onClick={()=>setDetailItem(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(6px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",animation:"cardIn .25s ease"}}>
          <div
            onClick={e=>e.stopPropagation()}
            style={{background:"#161616",borderRadius:16,maxWidth:480,width:"100%",maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,102,0,.25)",boxShadow:"0 30px 80px rgba(0,0,0,.6)",position:"relative"}}>
            <button
              onClick={()=>{SFX.click();setDetailItem(null);}}
              style={{position:"absolute",top:12,right:12,zIndex:2,width:34,height:34,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.55)",color:"#fff",fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
              aria-label="Close">✕</button>
            <div style={{position:"relative",width:"100%",paddingTop:"60%",background:"#1a1212",overflow:"hidden",borderRadius:"16px 16px 0 0"}}>
              <img
                src={detailItem.img ? (window.location.hostname === 'localhost' ? detailItem.img : `/.netlify/images?url=${encodeURIComponent(detailItem.img)}`) : ''}
                alt={detailItem.item.name}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",top:12,left:12,display:"flex",gap:"0.375rem"}}>
                {detailItem.item.spicy&&<span style={{background:"rgba(200,30,10,.92)",color:"#fff",fontSize:"0.625rem",fontWeight:700,fontFamily:"'Inter',sans-serif",padding:"4px 8px",borderRadius:20}}>🌶️ Spicy</span>}
                {detailItem.item.popular&&<span style={{background:"rgba(255,140,0,.92)",color:"#fff",fontSize:"0.625rem",fontWeight:700,fontFamily:"'Inter',sans-serif",padding:"4px 8px",borderRadius:20}}>⭐ Popular</span>}
              </div>
            </div>
            <div style={{padding:"20px 22px 22px"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:6}}>{detailItem.item.name}</div>
              {detailItem.sel && (
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",color:"rgba(255,255,255,.55)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{detailItem.sel.label}</div>
              )}
              <div style={{fontFamily:"'Barlow',sans-serif",fontSize:"0.938rem",color:"rgba(255,255,255,.78)",lineHeight:1.6,marginBottom:18,whiteSpace:"pre-wrap"}}>{detailItem.item.desc}</div>
              {(() => {
                const flavors = getFlavors(detailItem.item);
                if (!flavors.length) return null;
                const required = !!detailItem.item.flavorRequired;
                return (
                  <div style={{marginBottom:18,paddingTop:14,borderTop:"1px dashed rgba(255,102,0,.22)"}}>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",fontWeight:800,letterSpacing:".16em",textTransform:"uppercase",color:"#FF8844",marginBottom:10}}>
                      Choose Flavour {required && <span style={{color:"#ff5555"}}>*</span>}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {flavors.map(f => (
                        <button key={f}
                          type="button"
                          onClick={()=>{SFX.tabSwitch();setSelectedFlavor(f);}}
                          style={{
                            fontFamily:"'Inter',sans-serif",fontSize:"0.75rem",fontWeight:600,
                            padding:"6px 12px",borderRadius:20,cursor:"pointer",
                            border: selectedFlavor===f ? "1.5px solid #FF6600" : "1px solid rgba(255,255,255,.18)",
                            background: selectedFlavor===f ? "rgba(255,102,0,.18)" : "transparent",
                            color: selectedFlavor===f ? "#FF6600" : "rgba(255,255,255,.78)"
                          }}>
                          {f}
                        </button>
                      ))}
                    </div>
                    {required && !selectedFlavor && (
                      <div style={{fontFamily:"'Barlow',sans-serif",fontSize:"0.75rem",color:"rgba(255,255,255,.55)",marginTop:8}}>
                        Please select a flavour to continue.
                      </div>
                    )}
                  </div>
                );
              })()}
              {detailItem.item.addons?.length>0 && (() => {

                const hasVariantPriced = detailItem.item.addons.some(a => a.variantPrices?.length);
                return (
                  <div style={{marginBottom:18,paddingTop:14,borderTop:"1px dashed rgba(255,102,0,.22)"}}>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",fontWeight:800,letterSpacing:".16em",textTransform:"uppercase",color:"#FF8844",marginBottom:10}}>Add-ons</div>
                    {hasVariantPriced && !detailItem.sel && (
                      <div style={{fontFamily:"'Barlow',sans-serif",fontSize:"0.75rem",color:"rgba(255,255,255,.55)",marginBottom:8}}>Pick a size first to see add-on prices.</div>
                    )}
                    {detailItem.item.addons.map(a => {
                      const up = getAddonUnitPrice(a, detailItem.sel?.label);
                      const q  = addonQty[a.label] ?? 0;
                      return (
                        <div key={a.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"8px 0"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Barlow',sans-serif",fontSize:"0.938rem",color:"#fff",fontWeight:600}}>{a.label}</div>
                            <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.688rem",color:"rgba(255,255,255,.45)",marginTop:2}}>+ Rs.{up}{a.variantPrices?.length && detailItem.sel?` · ${detailItem.sel.label}`:""}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,102,0,.08)",border:"1px solid rgba(255,102,0,.3)",borderRadius:8,padding:"3px 6px"}}>
                            <button className="qbtn" style={{width:26,height:26,fontSize:"1rem",border:"none",background:"none"}} onClick={()=>{SFX.click();setAddonQty(p=>({...p,[a.label]:Math.max(0,(p[a.label]??0)-1)}));}}>−</button>
                            <span style={{minWidth:18,textAlign:"center",fontFamily:"'Inter',sans-serif",fontSize:"0.875rem",fontWeight:800,color:"#fff"}}>{q}</span>
                            <button className="qbtn" style={{width:26,height:26,fontSize:"1rem",border:"none",background:"none"}} onClick={()=>{SFX.click();setAddonQty(p=>({...p,[a.label]:(p[a.label]??0)+1}));}}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {(() => {
                const extras = computeAddonExtras(detailItem.item, detailItem.sel);
                const totalPrice = detailItem.price + extras.extra;
                return (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.75rem",flexWrap:"wrap"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"1.5rem",fontWeight:800,color:"#FF6600"}}>
                  {detailItem.item.pricePrefix && <span style={{fontSize:"0.688rem",color:"rgba(255,255,255,.4)",fontWeight:400,marginRight:4}}>{detailItem.item.pricePrefix}</span>}
                  Rs.{totalPrice}
                  {extras.extra>0 && <span style={{fontSize:"0.625rem",color:"rgba(255,255,255,.45)",fontWeight:500,marginLeft:6}}>(base Rs.{detailItem.price} + add-ons Rs.{extras.extra})</span>}
                </div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <button
                    className="btn-f ripple-host"
                    onClick={e=>{
                      addRipple(e);
                      const it = detailItem.item;
                      const s = detailItem.sel;
                      if (needsFlavor(it) && !selectedFlavor) {
                        alert(`Please choose a flavour for ${it.name}.`);
                        return;
                      }
                      const flavorKey = selectedFlavor ? `-${selectedFlavor.replace(/[^a-z0-9]/gi,"_")}` : "";
                      const addonKey  = extras.sig ? `-${extras.sig.replace(/[^a-z0-9]/gi,"_")}` : "";
                      const cid = it.id + (s ? `-${s.label}` : "") + flavorKey + addonKey;
                      const variantStr = [s?.label||null, selectedFlavor||null, extras.summary||null].filter(Boolean).join(" · ") || null;
                      onAdd({id:cid,name:it.name,variant:variantStr,price:totalPrice});
                      setDetailItem(null);
                    }}
                    style={{fontSize:"0.75rem",padding:"12px 24px",opacity: (needsFlavor(detailItem.item) && !selectedFlavor) ? 0.55 : 1}}>+ Add to Cart</button>

                  <button
                    onClick={()=>shareItem(detailItem.item, totalPrice)}
                    style={{fontSize:"0.75rem",padding:"12px 18px",borderRadius:4,border:"1px solid rgba(255,255,255,.18)",background:"transparent",color:"#fff",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Share</button>
                </div>
              </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Contact Form ─────────────────────────────────────────────────
function ContactForm({ onSend }) {
  const { aboutData: f_aboutData } = useApp();
  const [form,setSent_,setForm_] = [useState({name:"",email:"",subject:"",message:""})[0],useState(false),useState];
  const [f,setF] = useState({name:"",email:"",subject:"",message:""});
  const [sent,setSent] = useState(false);
  const send = () => {
    if(!f.name.trim()||!f.message.trim()) return;
    SFX.click(); onSend(f);
    // Redirect to WhatsApp with the message details
    const waMsg = [
      "📩 *New Message — Love n' Grill Website*",
      "",
      `👤 *Name:* ${f.name}`,
      f.email ? `✉️ *Email:* ${f.email}` : null,
      f.subject ? `📌 *Subject:* ${f.subject}` : null,
      "",
      `💬 *Message:*`,
      f.message
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/923199921117?text=${encodeURIComponent(waMsg)}`, "_blank");
    setSent(true); setF({name:"",email:"",subject:"",message:""});
    setTimeout(()=>setSent(false),5000);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.813rem"}}>
      {sent&&<div className="fb" style={{fontSize:"0.875rem",color:"#56cf56",padding:"12px 16px",background:"rgba(86,207,86,.09)",border:"1px solid rgba(86,207,86,.28)",borderRadius:4,animation:"cardIn .3s ease"}}>✓ Message sent! We'll get back to you soon.</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.813rem"}}>
        <input className="idk" placeholder="Your Name *" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))}/>
        <input className="idk" placeholder="Your Email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))}/>
      </div>
      <input className="idk" placeholder="Subject" value={f.subject} onChange={e=>setF(p=>({...p,subject:e.target.value}))}/>
      <textarea className="idk" placeholder="Your message…" value={f.message} onChange={e=>setF(p=>({...p,message:e.target.value}))}/>
      <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
        <button className="btn-f ripple-host" onClick={e=>{addRipple(e);send();}} style={{padding:"13px 40px"}}>Send Message</button>
        <a href={f_aboutData.instagram} target="_blank" rel="noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"10px 18px",borderRadius:4,background:"rgba(225,48,108,.12)",border:"1px solid rgba(225,48,108,.3)",color:"#E1306C",fontSize:"0.75rem",fontFamily:"'Inter',sans-serif",fontWeight:700,letterSpacing:".08em",textDecoration:"none",transition:"all .22s",textTransform:"uppercase"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(225,48,108,.22)";e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(225,48,108,.12)";e.currentTarget.style.transform="none";}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          Instagram
        </a>
        <a href={f_aboutData.tiktok} target="_blank" rel="noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"10px 18px",borderRadius:4,background:"rgba(105,201,208,.1)",border:"1px solid rgba(105,201,208,.3)",color:"#69C9D0",fontSize:"0.75rem",fontFamily:"'Inter',sans-serif",fontWeight:700,letterSpacing:".08em",textDecoration:"none",transition:"all .22s",textTransform:"uppercase"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(105,201,208,.2)";e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(105,201,208,.1)";e.currentTarget.style.transform="none";}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>
          TikTok
        </a>
      </div>
    </div>
  );
}

// ── Cart Drawer ──────────────────────────────────────────────────
function CartDrawer({ cart, isOpen, totalQty, totalPrice, onClose, onChangeQty, onRemove, onCheckout }) {
  return (
    <div className={`cdrawer ${isOpen?"open":""}`}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,102,0,.14)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          <div className="fd" style={{fontSize:"1.25rem",fontWeight:700,color:"#fff"}}>Your Order</div>
          <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".2em",color:"#FF6600",textTransform:"uppercase",marginTop:3}}>{totalQty} item{totalQty!==1?"s":""}</div>
        </div>
        <button onClick={()=>{SFX.click();onClose();}} style={{background:"none",border:"1px solid rgba(255,255,255,.12)",color:"#9a8878",cursor:"pointer",width:34,height:34,fontSize:"0.938rem",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="rotate(90deg)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
        {cart.length===0?(
          <div style={{textAlign:"center",paddingTop:60}}>
            <div style={{fontSize:"2.875rem",marginBottom:14,animation:"floatBob 2s ease-in-out infinite"}}>🛒</div>
            <div className="fc" style={{fontSize:"0.75rem",letterSpacing:".15em",color:"#3a3530",textTransform:"uppercase"}}>Cart is empty</div>
            <button className="btn-f" onClick={()=>{SFX.click();onClose();}} style={{marginTop:22,fontSize:"0.688rem",padding:"10px 24px"}}>Browse Menu</button>
          </div>
        ):cart.map((item,i)=>(
          <div key={item.id} className="card-in" style={{display:"flex",alignItems:"center",gap:"0.75rem",paddingBottom:14,marginBottom:14,borderBottom:"1px solid rgba(255,255,255,.05)",animationDelay:`${i*40}ms`}}>
            <div style={{flex:1,minWidth:0}}>
              <div className="fc" style={{fontSize:"0.938rem",fontWeight:700,color:"#fff"}}>{item.name}</div>
              {item.variant&&<div className="fb" style={{fontSize:"0.75rem",color:"rgba(255,255,255,.38)",marginTop:1}}>{item.variant}</div>}
              <div className="fc" style={{fontSize:"0.875rem",color:"#FF6600",marginTop:3,fontWeight:700}}>Rs.{item.price*item.qty}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"0.438rem",flexShrink:0}}>
              <button className="qbtn" onClick={()=>onChangeQty(item.id,-1)}>−</button>
              <span className="fc" style={{fontSize:"0.938rem",fontWeight:800,color:"#fff",minWidth:16,textAlign:"center"}}>{item.qty}</span>
              <button className="qbtn" onClick={()=>onChangeQty(item.id,+1)}>+</button>
            </div>
            <button onClick={()=>onRemove(item.id)} style={{background:"none",border:"none",color:"#6a3020",cursor:"pointer",fontSize:"1rem",padding:"4px",lineHeight:1,flexShrink:0,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.color="#ff4422"} onMouseLeave={e=>e.currentTarget.style.color="#6a3020"}>✕</button>
          </div>
        ))}
      </div>
      {cart.length>0&&(
        <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,102,0,.14)",flexShrink:0,background:"#0d0d0d"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span className="fc" style={{fontSize:"0.688rem",letterSpacing:".18em",color:"rgba(255,255,255,.45)",textTransform:"uppercase"}}>Subtotal</span>
            <span className="fd" style={{fontSize:"1.5rem",fontWeight:700,color:"#FF6600"}}>Rs.{totalPrice}</span>
          </div>
          <button className="btn-f ripple-host" onClick={e=>{addRipple(e);onCheckout();}} style={{width:"100%",padding:"14px",fontSize:"0.813rem",display:"block",borderRadius:4}}>Checkout →</button>
        </div>
      )}
    </div>
  );
}

// ── Checkout Modal (2-step) ───────────────────────────────────────
function CheckoutModal({ cart, totalPrice, orderType, setOrderType, onClose, onPlace }) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ name:"", phone:"", address:"", notes:"" });
  const [errors, setErrors] = useState({});

  const upd = (k, v) => { setCustomer(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!customer.name.trim())  e.name  = "Name is required";
    if (!customer.phone.trim()) e.phone = "Phone number is required";
    if (orderType === "Delivery" && !customer.address.trim()) e.address = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlace = () => {
    if (!validate()) return;
    onPlace(customer);
  };

  const inputStyle = (field) => ({
    background:"rgba(255,255,255,.06)",
    border:`1.5px solid ${errors[field]?"rgba(220,60,40,.65)":"rgba(255,255,255,.1)"}`,
    color:"#f0ece6", padding:"12px 14px", fontFamily:"'Barlow',sans-serif",
    fontSize:"0.938rem", width:"100%", outline:"none", borderRadius:4,
    transition:"border-color .2s"
  });

  return (
    <div className="mwrap">
      <div className="mbg" onClick={()=>{SFX.click();onClose();}}/>
      <div className="mbox">
        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:22}}>
          {[1,2].map(n=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:step>=n?"linear-gradient(135deg,#FF6600,#CC1A00)":"rgba(255,255,255,.08)",fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:"0.813rem",color:step>=n?"#fff":"#6a6055",transition:"all .3s",flexShrink:0}}>{n}</div>
              <span className="fc" style={{fontSize:"0.688rem",letterSpacing:".1em",color:step===n?"#fff":"#5a5045",textTransform:"uppercase"}}>{n===1?"Order":"Details"}</span>
              {n===1&&<div style={{width:24,height:1,background:step>=2?"rgba(255,102,0,.5)":"rgba(255,255,255,.1)",margin:"0 4px"}}/>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{marginBottom:18}}>
              <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".36em",color:"#FF6600",textTransform:"uppercase",marginBottom:6}}>🔥 Almost There</div>
              <h3 className="fd" style={{fontSize:"1.375rem",fontWeight:900,color:"#fff"}}>Your Order</h3>
            </div>
            <div style={{background:"rgba(255,102,0,.06)",border:"1px solid rgba(255,102,0,.18)",padding:"14px 16px",marginBottom:18,borderRadius:5,maxHeight:220,overflowY:"auto"}}>
              {cart.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span className="fb" style={{fontSize:"0.875rem",color:"rgba(255,255,255,.62)"}}>{item.name}{item.variant?` (${item.variant})`:""} × {item.qty}</span>
                  <span className="fc" style={{fontSize:"0.875rem",color:"#FF6600",fontWeight:700}}>Rs.{item.price*item.qty}</span>
                </div>
              ))}
              <div style={{borderTop:"1px solid rgba(255,102,0,.18)",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                <span className="fc" style={{fontSize:"0.688rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.38)"}}>Total</span>
                <span className="fd" style={{fontSize:"1.313rem",fontWeight:700,color:"#FF6600"}}>Rs.{totalPrice}</span>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".22em",color:"rgba(255,255,255,.38)",textTransform:"uppercase",marginBottom:9}}>Order Type</div>
              <div className="otog">
                {["Dine-In","Takeaway","Delivery"].map(t=><button key={t} className={`oopt ${orderType===t?"on":""}`} onClick={()=>{SFX.tabSwitch();setOrderType(t);}}>{t}</button>)}
              </div>
              {orderType==="Delivery"&&<div className="fb" style={{fontSize:"0.813rem",color:"#e07020",marginTop:8}}>ℹ️ Delivery charges vary by location.</div>}
            </div>
            <div style={{display:"flex",gap:"0.625rem"}}>
              <button className="btn-o" onClick={()=>{SFX.click();onClose();}} style={{flex:1}}>← Back</button>
              <button className="btn-f ripple-host" onClick={e=>{addRipple(e);SFX.tabSwitch();setStep(2);}}
                style={{flex:2,padding:"14px",fontSize:"0.813rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",borderRadius:4}}>
                Continue → Customer Details
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{marginBottom:18}}>
              <div className="fc" style={{fontSize:"0.625rem",letterSpacing:".36em",color:"#FF6600",textTransform:"uppercase",marginBottom:6}}>📋 Your Details</div>
              <h3 className="fd" style={{fontSize:"1.375rem",fontWeight:900,color:"#fff"}}>Almost Done!</h3>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"0.813rem",marginBottom:20}}>
              <div>
                <div className="fc" style={{fontSize:"0.563rem",letterSpacing:".2em",color:"rgba(255,255,255,.38)",textTransform:"uppercase",marginBottom:6}}>Your Name *</div>
                <input
                  style={inputStyle("name")}
                  placeholder="e.g. Ahmed Khan"
                  value={customer.name}
                  onChange={e=>upd("name",e.target.value)}
                />
                {errors.name&&<div className="fb" style={{fontSize:"0.75rem",color:"#e04020",marginTop:4}}>⚠ {errors.name}</div>}
              </div>

              <div>
                <div className="fc" style={{fontSize:"0.563rem",letterSpacing:".2em",color:"rgba(255,255,255,.38)",textTransform:"uppercase",marginBottom:6}}>Phone Number *</div>
                <input
                  style={inputStyle("phone")}
                  placeholder="e.g. 0319 9921117"
                  value={customer.phone}
                  onChange={e=>upd("phone",e.target.value)}
                  type="tel"
                />
                {errors.phone&&<div className="fb" style={{fontSize:"0.75rem",color:"#e04020",marginTop:4}}>⚠ {errors.phone}</div>}
              </div>

              {orderType === "Delivery" && (
                <div>
                  <div className="fc" style={{fontSize:"0.563rem",letterSpacing:".2em",color:"rgba(255,255,255,.38)",textTransform:"uppercase",marginBottom:6}}>Delivery Address *</div>
                  <input
                    style={inputStyle("address")}
                    placeholder="Full delivery address…"
                    value={customer.address}
                    onChange={e=>upd("address",e.target.value)}
                  />
                  {errors.address&&<div className="fb" style={{fontSize:"0.75rem",color:"#e04020",marginTop:4}}>⚠ {errors.address}</div>}
                </div>
              )}

              <div>
                <div className="fc" style={{fontSize:"0.563rem",letterSpacing:".2em",color:"rgba(255,255,255,.38)",textTransform:"uppercase",marginBottom:6}}>Special Instructions <span style={{color:"rgba(255,255,255,.22)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></div>
                <textarea
                  style={{...inputStyle("notes"), resize:"vertical", minHeight:80, fontFamily:"'Barlow',sans-serif"}}
                  placeholder="Any allergies, special requests…"
                  value={customer.notes}
                  onChange={e=>upd("notes",e.target.value)}
                />
              </div>
            </div>

            {/* Order summary mini */}
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",padding:"10px 14px",borderRadius:4,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span className="fb" style={{fontSize:"0.813rem",color:"rgba(255,255,255,.45)"}}>{cart.length} item{cart.length!==1?"s":""} · {orderType}</span>
              <span className="fc" style={{fontSize:"1.063rem",fontWeight:700,color:"#FF6600"}}>Rs.{totalPrice}</span>
            </div>

            <div style={{display:"flex",gap:"0.625rem"}}>
              <button className="btn-o" onClick={()=>{SFX.click();setStep(1);}} style={{flex:1}}>← Back</button>
              <button className="btn-f ripple-host" onClick={e=>{addRipple(e);handlePlace();}}
                style={{flex:2,padding:"14px",fontSize:"0.813rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",borderRadius:4}}>
                <span style={{fontSize:"1.063rem"}}>📱</span> Order via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

