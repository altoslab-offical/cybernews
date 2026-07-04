const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "data", "news.json");
const sitePath = path.join(rootDir, "data", "site.json");
const siteConfig = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const siteName = siteConfig.site_name || "CYBERNEWS";
const siteUrl = (process.env.SITE_URL || siteConfig.base_url || "https://cybernews.example").replace(/\/$/, "");
const siteDescription = siteConfig.description || "AI 與金融新聞中文摘要、來源連結與 metadata。";
const defaultLanguage = siteConfig.default_language || "zh-Hant";
const shareImagePath = siteConfig.og_image || "assets/og-cybernews.jpg";
const gaId = process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || siteConfig.ga_measurement_id || "";
const gtmId = process.env.GTM_ID || process.env.NEXT_PUBLIC_GTM_ID || siteConfig.gtm_id || "";
let buildDate = "";
const assetVersion = "20260704-public-fallback-v1";

const verticalLabels = {
  ai: "AI 新聞",
  finance: "金融",
};

const contentTypeLabels = {
  news: "新聞",
  column: "專欄",
  research: "調研",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const escapeScriptJson = (value) => JSON.stringify(value, null, 2).replace(/</g, "\\u003c");

const analyticsHead = () => {
  const blocks = [];

  if (gtmId) {
    blocks.push(`<script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","${escapeHtml(gtmId)}");
    </script>`);
  }

  if (gaId) {
    blocks.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag("js", new Date());
      gtag("config", "${escapeHtml(gaId)}", { anonymize_ip: true });
    </script>`);
  }

  return blocks.join("\n    ");
};

const analyticsBody = () =>
  gtmId
    ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeHtml(gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    : "";

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-Hant-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const joinList = (values) => (values || []).filter(Boolean).join(" / ");
const getSymbols = (item) => [...(item.tickers || []), ...(item.coins || [])];
const getMetadata = (item) => [...getSymbols(item), ...((item.topics || []).slice(0, 2))].filter(Boolean).slice(0, 4);
const isPlaceholderSourceUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).hostname === "example.com";
  } catch {
    return String(value).includes("example.com");
  }
};
const sourceUrl = (item) => {
  const value = item.canonical_url || item.source_url || "";
  if (item.is_design_fixture || String(value).startsWith("design-fixture://")) {
    return "";
  }
  return isPlaceholderSourceUrl(value) ? "" : value;
};
const byPublishedDesc = (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
const toValidIsoDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};
const resolveBuildDate = (items) => {
  const explicitBuildDate = toValidIsoDate(process.env.BUILD_DATE);

  if (explicitBuildDate) {
    return explicitBuildDate;
  }

  const latestItemDate = items
    .flatMap((item) => [item.fetched_at, item.published_at])
    .map(toValidIsoDate)
    .filter(Boolean)
    .sort()
    .at(-1);

  return latestItemDate || toValidIsoDate(siteConfig.build_date || siteConfig.lastmod) || "2026-07-04T00:00:00.000Z";
};

const getReadingMinutes = (item) => {
  const text = [item.summary_zh, ...(item.body_zh || [])].filter(Boolean).join("");
  return Math.max(1, Math.ceil(text.length / 450));
};

const whyMattersMarkup = (item) =>
  item?.why_matters_zh
    ? `<p class="why-matters"><strong>為什麼重要</strong>${escapeHtml(item.why_matters_zh)}</p>`
    : "";

const publicPathForItem = (item) => `${item.content_type === "research" ? "research" : "articles"}/${encodeURIComponent(item.id)}/`;
const absoluteUrl = (publicPath) => `${siteUrl}/${publicPath.replace(/^\/+/, "")}`;
const toAbsoluteUrl = (value = "") => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return absoluteUrl(value);
};
const shareImageUrl = toAbsoluteUrl(shareImagePath);
const imageUrlForItem = (item) => (item.image_url ? toAbsoluteUrl(item.image_url) : shareImageUrl);
const nestedHref = (publicPath) => `../../${publicPath}`;

const getDetailArchiveHref = (item) => `../../${item.vertical === "ai" ? "ai" : "finance"}.html?type=${encodeURIComponent(item.content_type)}`;

const detailDefinitionMarkup = (label, value) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${value ? escapeHtml(value) : "未提供"}</dd>
            </div>`;

const articleBodyMarkup = (item) => {
  const paragraphs = Array.isArray(item.body_zh) ? item.body_zh.filter(Boolean) : [];
  const body = paragraphs.length
    ? paragraphs
    : [
        `${item.summary_zh} 這篇內容目前只有摘要資料，後續可由編輯補上完整中文整理稿。`,
        "CYBERNEWS 會保留主頻道、內容型態、來源、原文連結與 metadata，方便讀者回到原始來源確認完整脈絡。",
      ];

  return `
        <section class="article-body-copy" aria-label="Article body">
          <span>內文整理</span>
          ${body.map((paragraph, index) => `<p class="${index === 0 ? "article-drop" : ""}">${escapeHtml(paragraph)}</p>`).join("")}
        </section>`;
};

const researchExtraMarkup = (item) => {
  if (item.content_type !== "research") {
    return "";
  }

  const symbols = getMetadata(item).join(" / ");

  return `
        <section class="research-panel" aria-label="Research details">
          <h2>核心問題</h2>
          <p>這份調研聚焦「${escapeHtml(item.subcategory)}」如何影響 ${escapeHtml(verticalLabels[item.vertical] || item.vertical)} 的產業、市場與資料追蹤方式。</p>
          <div class="research-panel-grid">
            <div>
              <span>主要資料來源</span>
              <p>${escapeHtml(item.source_name)}</p>
            </div>
            <div>
              <span>追蹤 metadata</span>
              <p>${escapeHtml(symbols || joinList(item.topics) || item.subcategory)}</p>
            </div>
            <div>
              <span>調研屬性</span>
              <p>${item.is_original_research ? "CYBERNEWS 原創整理" : "多來源摘要整理"}</p>
            </div>
          </div>
        </section>`;
};

const disclaimerMarkup = (item) => {
  if (!item.disclaimer_required && item.content_type !== "research") {
    return "";
  }

  return `
        <section class="article-disclaimer" aria-label="Disclaimer">
          <h2>免責說明</h2>
          <p>本文只整理公開來源、中文摘要與 metadata，不構成投資建議、價格預測、買賣訊號或法律意見。股票代號與幣種代號僅供查找與分類。</p>
        </section>`;
};

const countOverlap = (a, b) => (a || []).filter((value) => (b || []).includes(value)).length;

const scoreRelated = (candidate, currentItem) => {
  let score = 0;

  if (candidate.vertical === currentItem.vertical) score += 1;
  if (candidate.subcategory === currentItem.subcategory) score += 3;
  score += countOverlap(candidate.topics, currentItem.topics) * 2;
  score += countOverlap(candidate.tickers, currentItem.tickers) * 2;
  score += countOverlap(candidate.coins, currentItem.coins) * 2;
  score += countOverlap(candidate.companies, currentItem.companies);
  return score;
};

const getRelatedItems = (items, currentItem, limit = 3) =>
  items
    .filter((item) => item.id !== currentItem.id)
    .map((item) => ({ item, score: scoreRelated(item, currentItem) }))
    .sort((a, b) => b.score - a.score || byPublishedDesc(a.item, b.item))
    .slice(0, limit)
    .map((entry) => entry.item);

const imageStyle = (item) => {
  if (!item.image_url) {
    return "";
  }

  return ` style="background-image: linear-gradient(0deg, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.02)), url('${escapeHtml(imageUrlForItem(item))}')"`;
};

const relatedMarkup = (items, currentItem) => {
  const relatedItems = getRelatedItems(items, currentItem);

  if (!relatedItems.length) {
    return "";
  }

  return `
    <section class="article-related" aria-label="Recommended articles">
      <div class="article-related-head">
        <span>Related</span>
        <h2>延伸閱讀</h2>
      </div>
      <div class="article-related-grid">
        ${relatedItems
          .map(
            (item) => `
              <article class="article-related-card">
                <a href="${nestedHref(publicPathForItem(item))}" aria-label="${escapeHtml(item.title_zh)}">
                  <div class="article-related-image" role="img" aria-label="${escapeHtml(item.title_original)}"${imageStyle(item)}></div>
                  <h3>${escapeHtml(item.title_zh)}</h3>
                  <p>${escapeHtml(item.summary_zh)}</p>
                  <div class="article-related-tags" aria-label="Story metadata">
                    <span>${escapeHtml(item.subcategory)}</span>
                    <span>${escapeHtml(item.source_name).toUpperCase()}</span>
                  </div>
                </a>
              </article>`,
          )
          .join("")}
      </div>
    </section>`;
};

const headerMarkup = () => `
      <header class="masthead">
        <button class="mobile-menu-trigger" type="button" aria-label="開啟選單" aria-controls="mobile-site-menu" aria-expanded="false">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
        <nav class="masthead-links" aria-label="Main sections">
          <a href="../../latest.html">最新消息</a>
          <a href="../../ai.html">AI 新聞</a>
          <a href="../../finance.html">金融</a>
          <a href="../../latest.html?type=column">專欄</a>
          <a href="../../latest.html?type=research">調研</a>
          <a href="../../newsletter.html">Newsletter</a>
        </nav>
        <a class="brand" href="../../index.html" aria-label="CYBERNEWS home"><img src="../../assets/technow-logo.svg" alt="CYBERNEWS" /></a>
        <div class="header-actions header-actions-mobile-only">
          <div class="language-switcher">
            <button class="language-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span class="language-current">繁中</span>
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div class="language-menu" role="listbox" aria-label="Language options">
              <button class="language-option active" type="button" role="option" aria-selected="true" data-lang="zh-Hant">繁中</button>
              <button class="language-option" type="button" role="option" aria-selected="false" data-lang="zh-Hans">简中</button>
              <button class="language-option" type="button" role="option" aria-selected="false" data-lang="en">EN</button>
            </div>
          </div>
          <a class="search-button" href="../../archive.html?focus=query" aria-label="搜尋歷史內容">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </a>
        </div>
      </header>
      <nav class="mobile-channel-tabs" aria-label="Mobile channels">
        <a href="../../latest.html" data-mobile-tab="latest">最新</a>
        <a href="../../ai.html" data-mobile-tab="ai">AI</a>
        <a href="../../finance.html" data-mobile-tab="finance">金融</a>
        <a href="../../topics.html" data-mobile-tab="topics">專題</a>
        <a href="../../latest.html?type=column" data-mobile-tab="column">專欄</a>
        <a href="../../latest.html?type=research" data-mobile-tab="research">調研</a>
        <a href="../../newsletter.html" data-mobile-tab="newsletter">電子報</a>
      </nav>
      <div class="mobile-menu-panel" id="mobile-site-menu" aria-hidden="true">
        <div class="mobile-menu-scrim" data-mobile-menu-close></div>
        <div class="mobile-menu-sheet" role="dialog" aria-modal="true" aria-label="選單">
          <div class="mobile-menu-head">
            <span>CYBERNEWS</span>
            <button class="mobile-menu-close" type="button" aria-label="關閉選單" data-mobile-menu-close>
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
          <nav class="mobile-menu-links" aria-label="Mobile menu">
            <a href="../../latest.html">最新消息</a>
            <a href="../../ai.html">AI 新聞</a>
            <a href="../../finance.html">金融</a>
            <a href="../../topics.html">專題</a>
            <a href="../../latest.html?type=column">專欄</a>
            <a href="../../latest.html?type=research">調研</a>
            <a href="../../archive.html">Archive</a>
            <a href="../../newsletter.html">Newsletter</a>
          </nav>
        </div>
      </div>`;

const footerMarkup = () => `
      <footer class="site-footer">
        <a class="footer-brand" href="../../index.html" aria-label="CYBERNEWS home"><img src="../../assets/technow-logo.svg" alt="CYBERNEWS" /></a>
        <div class="footer-social" aria-label="Social links">
          <span class="footer-social-icon" aria-label="Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></span>
          <span class="footer-social-icon" aria-label="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></span>
          <span class="footer-social-icon" aria-label="Threads"><i class="fa-brands fa-threads" aria-hidden="true"></i></span>
          <span class="footer-social-icon" aria-label="X"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></span>
        </div>
        <nav class="footer-nav">
          <a href="../../about.html">關於我們</a>
          <a href="../../privacy.html">隱私權政策</a>
          <a href="../../newsletter.html">電子報</a>
          <a href="../../contact.html">聯絡</a>
        </nav>
        <p class="footer-copy">© 2026 CYBERNEWS</p>
      </footer>`;

const jsonLdForItem = (item, url) => ({
  "@context": "https://schema.org",
  "@type": item.content_type === "research" ? "Report" : "NewsArticle",
  headline: item.title_zh,
  alternativeHeadline: item.title_original,
  description: item.summary_zh,
  image: [imageUrlForItem(item)],
  datePublished: item.published_at,
  dateModified: item.fetched_at || item.published_at,
  inLanguage: "zh-Hant",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
  author: (item.authors || [item.source_name]).filter(Boolean).map((name) => ({ "@type": "Person", name })),
  publisher: {
    "@type": "Organization",
    name: siteName,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/assets/technow-logo.svg`,
    },
  },
  articleSection: [verticalLabels[item.vertical], contentTypeLabels[item.content_type], item.subcategory].filter(Boolean),
  keywords: [...(item.topics || []), ...getSymbols(item)].filter(Boolean).join(", "),
});

const breadcrumbJsonLd = (item, url) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: siteName, item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: verticalLabels[item.vertical] || item.vertical, item: `${siteUrl}/${item.vertical === "ai" ? "ai.html" : "finance.html"}` },
    { "@type": "ListItem", position: 3, name: contentTypeLabels[item.content_type] || item.content_type, item: url },
  ],
});

const articleHtml = (items, item) => {
  const publicPath = publicPathForItem(item);
  const url = absoluteUrl(publicPath);
  const title = `${item.title_zh} - ${siteName}`;
  const description = item.summary_zh;
  const metadata = getMetadata(item);
  const source = sourceUrl(item);
  const itemShareImage = imageUrlForItem(item);
  const sourceTitleMarkup = source
    ? `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer" data-no-translate>${escapeHtml(item.title_original)}</a>`
    : `<span data-no-translate>${escapeHtml(item.title_original)}</span>`;
  const sourceActionMarkup = source
    ? `<a class="directory-action" href="${escapeHtml(source)}" target="_blank" rel="noreferrer">閱讀原文</a>`
    : `<span class="directory-chip">來源待補</span>`;
  const publishedAt = formatDateTime(item.published_at);
  const readingMinutes = getReadingMinutes(item);

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(item.title_zh)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(itemShareImage)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(itemShareImage)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(item.title_zh)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(item.title_zh)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(itemShareImage)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(item.title_zh)}" />
    <script type="application/ld+json">${escapeScriptJson(jsonLdForItem(item, url))}</script>
    <script type="application/ld+json">${escapeScriptJson(breadcrumbJsonLd(item, url))}</script>
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/fav.png?v=20260704" />
    <link rel="preconnect" href="https://www.googletagmanager.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&amp;family=Noto+Sans+TC:wght@400;500;600;700&amp;family=Roboto+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha384-PPIZEGYM1v8zp5Py7UjFb79S58UeqCL9pYVnVPURKEqvioPROaVAJKKLzvH2rDnI" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="../../design-tokens.css?v=20260704-text-green" />
    <link rel="stylesheet" href="../../styles.css?v=${assetVersion}" />
    ${analyticsHead()}
  </head>
  <body data-title-zh="${escapeHtml(title)}" data-title-en="${escapeHtml(item.title_original)} - ${escapeHtml(siteName)}" data-page="${item.content_type === "research" ? "research" : "article"}" data-vertical="${escapeHtml(item.vertical)}" data-content-type="${escapeHtml(item.content_type)}">
    ${analyticsBody()}
    <div class="site-shell">
${headerMarkup()}

      <main class="article-main" id="content">
        <div class="article-topbar">
          <nav class="article-breadcrumb" aria-label="Article breadcrumb">
            <a href="../../index.html">${escapeHtml(siteName)}</a>
            <span aria-hidden="true">/</span>
            <a href="../../${item.vertical === "ai" ? "ai" : "finance"}.html">${escapeHtml(verticalLabels[item.vertical] || item.vertical)}</a>
            <span aria-hidden="true">/</span>
            <a href="${getDetailArchiveHref(item)}">${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}</a>
            <span aria-hidden="true">/</span>
            <span>${escapeHtml(item.subcategory)}</span>
          </nav>
          <div class="article-share" aria-label="Article actions">
            <button class="article-icon-action" type="button" data-copy-link aria-label="Copy link"><i class="fa-solid fa-link" aria-hidden="true"></i><span data-i18n-zh="複製" data-i18n-en="Copy">複製</span></button>
            ${source ? `<a class="article-icon-action" href="${escapeHtml(source)}" target="_blank" rel="noreferrer" aria-label="Original source"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i><span>原文</span></a>` : ""}
            <a class="article-icon-action" href="../../newsletter.html" aria-label="Subscribe"><i class="fa-regular fa-envelope" aria-hidden="true"></i><span data-i18n-zh="訂閱" data-i18n-en="Subscribe">訂閱</span></a>
          </div>
        </div>

        <article class="article-page">
          <header class="article-hero">
            <div class="article-hero-grid">
              <div class="article-heading">
                <div class="article-meta-line" aria-label="Article metadata">
                  <span>${escapeHtml(verticalLabels[item.vertical] || item.vertical)} / ${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}</span>
                  <span>${escapeHtml(item.subcategory)}</span>
                  <span>${escapeHtml(item.source_name)}</span>
                  ${publishedAt ? `<time datetime="${escapeHtml(item.published_at)}">${escapeHtml(publishedAt)}</time>` : ""}
                  <span>${readingMinutes} 分鐘閱讀</span>
                </div>
                <h1>${escapeHtml(item.title_zh)}</h1>
                <p class="article-dek">${escapeHtml(item.summary_zh)}</p>
                ${whyMattersMarkup(item)}
                <p class="article-original-title">Original: ${escapeHtml(item.title_original)}</p>
              </div>
            </div>
          </header>

          <figure class="article-visual">
            <div class="article-visual-inner">
              ${item.image_url ? `<img class="article-static-image" src="${escapeHtml(imageUrlForItem(item))}" alt="${escapeHtml(item.title_original)}" loading="eager" />` : `<div class="article-hero-image" role="img" aria-label="${escapeHtml(item.title_original)}"></div>`}
              <figcaption>影像用於主題示意；內文為 CYBERNEWS 中文整理稿，完整內容請回到原文來源。</figcaption>
            </div>
          </figure>

          <div class="article-body-shell">
            <div class="article-content">
              <section class="article-keypoints" aria-label="Summary">
                <h2>中文摘要</h2>
                <ul>
                  <li>${escapeHtml(item.summary_zh)}</li>
                  ${item.why_matters_zh ? `<li>為什麼重要：${escapeHtml(item.why_matters_zh)}</li>` : ""}
                  <li>本頁只保存摘要、分類、來源與原文連結，不重刊全文，也不繞過 paywall。</li>
                  <li>${metadata.length ? `${escapeHtml(metadata.join(" / "))} 僅作為 metadata 與查找線索。` : "未附股票或幣種代號。"}</li>
                </ul>
              </section>

${articleBodyMarkup(item)}

${researchExtraMarkup(item)}

              <section class="article-source-card" aria-label="Sources">
                <span class="article-source-label">Sources</span>
                <ul class="article-source-list">
                  <li>
                    <p class="article-source-title">
                      ${sourceTitleMarkup}
                      <span class="article-source-meta">· ${escapeHtml(item.source_name)} · ${escapeHtml(formatDate(item.published_at))}</span>
                    </p>
                    <p class="article-source-desc">${escapeHtml(item.summary_zh)}</p>
                  </li>
                </ul>
                <div class="article-cta-row">
                  ${sourceActionMarkup}
                  <a class="directory-chip" href="../../topics.html">加入專題追蹤</a>
                  <a class="directory-chip" href="${getDetailArchiveHref(item)}">更多同類內容</a>
                  <a class="directory-chip" href="../../newsletter.html">訂閱相關 Brief</a>
                </div>
              </section>

${disclaimerMarkup(item)}

              <footer class="article-info-footer" aria-label="Article metadata">
                <span class="article-info-label">Metadata</span>
                <dl class="article-info-list">
${detailDefinitionMarkup("主頻道", verticalLabels[item.vertical] || item.vertical)}
${detailDefinitionMarkup("內容型態", contentTypeLabels[item.content_type] || item.content_type)}
${detailDefinitionMarkup("子分類", item.subcategory)}
${detailDefinitionMarkup("發布時間", formatDateTime(item.published_at))}
${detailDefinitionMarkup("抓取時間", formatDateTime(item.fetched_at))}
${detailDefinitionMarkup("語言 / 地區", `${item.language} / ${item.region}`)}
${detailDefinitionMarkup("作者", joinList(item.authors))}
${detailDefinitionMarkup("公司", joinList(item.companies))}
${detailDefinitionMarkup("股票代號", joinList(item.tickers))}
${detailDefinitionMarkup("幣種代號", joinList(item.coins))}
${detailDefinitionMarkup("Topics", joinList(item.topics))}
${detailDefinitionMarkup("資料屬性", item.is_original_research ? "原創調研" : "新聞摘要")}
                </dl>
              </footer>
            </div>
          </div>
        </article>

${relatedMarkup(items, item)}
      </main>

${footerMarkup()}
    </div>
    <script src="../../script.js?v=${assetVersion}"></script>
  </body>
</html>`;
};

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const cleanArticlePages = (items) => {
  const expectedPaths = new Set(items.map(publicPathForItem));

  for (const section of ["articles", "research"]) {
    const sectionPath = path.join(rootDir, section);

    if (!fs.existsSync(sectionPath)) {
      continue;
    }

    for (const entry of fs.readdirSync(sectionPath, { withFileTypes: true })) {
      const publicPath = `${section}/${entry.name}/`;

      if (entry.isDirectory() && !expectedPaths.has(publicPath)) {
        fs.rmSync(path.join(sectionPath, entry.name), { recursive: true, force: true });
      }
    }
  }
};

const writeArticlePages = (items) => {
  for (const item of items) {
    writeFile(path.join(rootDir, publicPathForItem(item), "index.html"), articleHtml(items, item));
  }
};

const writeSitemap = (items) => {
  const staticPages = ["", "latest.html", "ai.html", "finance.html", "stocks.html", "crypto.html", "topics.html", "archive.html", "research.html", "newsletter.html", "about.html", "privacy.html", "contact.html"];
  const urls = [
    ...staticPages.map((publicPath) => ({ loc: absoluteUrl(publicPath), lastmod: buildDate })),
    ...items.map((item) => ({ loc: absoluteUrl(publicPathForItem(item)), lastmod: item.fetched_at || item.published_at || buildDate })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeHtml(entry.loc)}</loc>
    <lastmod>${escapeHtml(new Date(entry.lastmod).toISOString())}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  writeFile(path.join(rootDir, "sitemap.xml"), xml);
};

const writeLlms = (items) => {
  const latest = [...items].sort(byPublishedDesc).slice(0, 18);
  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    "## Core pages",
    `- [Home](${siteUrl}/): AI and finance news summaries in Traditional Chinese`,
    `- [Latest](${siteUrl}/latest.html): newest AI, finance, crypto, policy, column, and research items`,
    `- [AI News](${siteUrl}/ai.html): models, agents, infrastructure, regulation, applications, and talent`,
    `- [Finance](${siteUrl}/finance.html): technology stocks, crypto, ETFs, and stablecoin policy summaries`,
    `- [Research](${siteUrl}/research.html): deeper research-style summaries and market structure notes`,
    `- [Archive](${siteUrl}/archive.html): searchable metadata index`,
    `- [RSS](${siteUrl}/rss.xml): latest feed`,
    "",
    "## Content rules",
    "- CYBERNEWS stores metadata, Traditional Chinese summaries, why-it-matters notes, source links, and classification data.",
    "- It does not republish full articles, bypass paywalls, provide investment advice, publish price targets, or issue trading signals.",
    "- Finance and research content should keep disclaimer_required true when market interpretation risk is material.",
    "",
    "## Latest articles",
    ...latest.map((item) => {
      const publicPath = publicPathForItem(item);
      const tags = [item.subcategory, ...(item.topics || []), ...getSymbols(item)].filter(Boolean).slice(0, 6).join(", ");
      return `- [${item.title_zh}](${absoluteUrl(publicPath)}): ${item.summary_zh} Tags: ${tags}`;
    }),
  ];

  const fullLines = [
    `# ${siteName} full LLM context`,
    "",
    `${siteName} is a static Traditional Chinese AI and technology-finance news index. It is designed for readers who need concise source-backed context and for article-generation agents that must preserve source links, metadata, and review gates.`,
    "",
    "## Canonical resources",
    `- Website: ${siteUrl}/`,
    `- Latest: ${siteUrl}/latest.html`,
    `- Archive: ${siteUrl}/archive.html`,
    `- RSS: ${siteUrl}/rss.xml`,
    "",
    "## Article schema summary",
    "Each item in data/news.json must use vertical ai or finance; content_type news, column, or research; and one of the seven allowed subcategories. news routes to articles/<id>/, column routes to articles/<id>/, and research routes to research/<id>/.",
    "",
    "## Published inventory",
    ...[...items].sort(byPublishedDesc).map((item) => {
      const source = sourceUrl(item);
      return [
        `### ${item.title_zh}`,
        `URL: ${absoluteUrl(publicPathForItem(item))}`,
        `Type: ${item.vertical} / ${item.content_type} / ${item.subcategory}`,
        `Source: ${item.source_name}${source ? ` - ${source}` : ""}`,
        `Summary: ${item.summary_zh}`,
        `Why it matters: ${item.why_matters_zh}`,
        `Topics: ${(item.topics || []).join(", ") || "none"}`,
        `Symbols: ${getSymbols(item).join(", ") || "none"}`,
        `Disclaimer required: ${Boolean(item.disclaimer_required)}`,
        `Body: ${(item.body_zh || []).join(" ")}`,
      ].join("\n");
    }),
  ];

  writeFile(path.join(rootDir, "llms.txt"), `${lines.join("\n")}\n`);
  writeFile(path.join(rootDir, "llms-full.txt"), `${fullLines.join("\n\n")}\n`);
};

const writeRobots = () => {
  writeFile(
    path.join(rootDir, "robots.txt"),
    `User-agent: *
Allow: /
Disallow: /*?preview=design
Disallow: /*&preview=design

Sitemap: ${siteUrl}/sitemap.xml
`,
  );
};

const writeRss = (items) => {
  const latest = [...items].sort(byPublishedDesc).slice(0, 20);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(siteName)}</title>
    <link>${siteUrl}/</link>
    <description>${escapeHtml(siteDescription)}</description>
    <language>${escapeHtml(defaultLanguage)}</language>
    <lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${latest
  .map((item) => {
    const loc = absoluteUrl(publicPathForItem(item));
    return `    <item>
      <title>${escapeHtml(item.title_zh)}</title>
      <link>${escapeHtml(loc)}</link>
      <guid isPermaLink="true">${escapeHtml(loc)}</guid>
      <description>${escapeHtml(item.summary_zh)}</description>
      <pubDate>${new Date(item.published_at).toUTCString()}</pubDate>
      <category>${escapeHtml(verticalLabels[item.vertical] || item.vertical)}</category>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;
  writeFile(path.join(rootDir, "rss.xml"), rss);
};

const main = () => {
  const items = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  buildDate = resolveBuildDate(items);
  cleanArticlePages(items);
  writeArticlePages(items);
  writeSitemap(items);
  writeRobots();
  writeRss(items);
  writeLlms(items);
  console.log(`Generated ${items.length} static article pages, sitemap.xml, robots.txt, rss.xml, llms.txt, and llms-full.txt`);
};

main();
