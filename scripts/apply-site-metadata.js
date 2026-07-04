const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const siteConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "data", "site.json"), "utf8"));

const siteName = siteConfig.site_name || "CYBERNEWS";
const siteUrl = (process.env.SITE_URL || siteConfig.base_url || "https://cybernews.example").replace(/\/$/, "");
const gaId = process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || siteConfig.ga_measurement_id || "";
const gtmId = process.env.GTM_ID || process.env.NEXT_PUBLIC_GTM_ID || siteConfig.gtm_id || "";
const defaultDescription =
  siteConfig.description || "AI 與金融新聞中文摘要、來源連結與 metadata。";

const pages = [
  {
    file: "index.html",
    path: "",
    title: "CYBERNEWS - AI 與金融新聞中心",
    description: defaultDescription,
    section: "首頁",
  },
  {
    file: "latest.html",
    path: "latest.html",
    title: "最新消息 - CYBERNEWS",
    description: "AI、科技股、加密與政策新聞的最新中文摘要，保留來源連結與可查 metadata。",
    section: "最新消息",
  },
  {
    file: "ai.html",
    path: "ai.html",
    title: "AI 新聞 - CYBERNEWS",
    description: "追蹤模型、agent、算力、監管、企業導入與 AI 人才市場的中文新聞摘要。",
    section: "AI 新聞",
  },
  {
    file: "finance.html",
    path: "finance.html",
    title: "金融 - CYBERNEWS",
    description: "科技股、ETF、加密市場與穩定幣政策新聞摘要，不提供投資建議或買賣訊號。",
    section: "金融",
  },
  {
    file: "stocks.html",
    path: "stocks.html",
    title: "科技股 - CYBERNEWS",
    description: "AI 供應鏈、雲端資本支出與科技公司財報事件的中文摘要與來源索引。",
    section: "科技股",
  },
  {
    file: "crypto.html",
    path: "crypto.html",
    title: "加密與穩定幣 - CYBERNEWS",
    description: "Bitcoin ETF、穩定幣、Solana 與交易所政策的中文摘要與原文追蹤。",
    section: "加密與穩定幣",
  },
  {
    file: "topics.html",
    path: "topics.html",
    title: "專題 - CYBERNEWS",
    description: "依 Nvidia 供應鏈、AI 監管、加密市場與資本支出等主題整理新聞索引。",
    section: "專題",
  },
  {
    file: "archive.html",
    path: "archive.html",
    title: "Archive - CYBERNEWS",
    description: "用日期、來源、分類、公司、股票代號、幣種與關鍵字搜尋 CYBERNEWS 內容。",
    section: "Archive",
  },
  {
    file: "research.html",
    path: "research.html",
    title: "調研 - CYBERNEWS",
    description: "AI 基礎建設、晶片供應鏈與機構資金流的深度調研索引。",
    section: "調研",
  },
  {
    file: "about.html",
    path: "about.html",
    title: "關於我們 - CYBERNEWS",
    description: "CYBERNEWS 是中文 AI 與科技財經新聞索引，保留來源、時間、分類與 metadata。",
    section: "關於我們",
  },
  {
    file: "contact.html",
    path: "contact.html",
    title: "聯絡 - CYBERNEWS",
    description: "聯絡 CYBERNEWS，回報來源、內容修正、合作或新聞提示。",
    section: "聯絡",
  },
  {
    file: "privacy.html",
    path: "privacy.html",
    title: "隱私權政策 - CYBERNEWS",
    description: "CYBERNEWS 關於 analytics、newsletter、cookies 與第三方連結的隱私權說明。",
    section: "隱私權政策",
  },
  {
    file: "newsletter.html",
    path: "newsletter.html",
    title: "Newsletter - CYBERNEWS",
    description: "訂閱 CYBERNEWS Brief，收到 AI、科技股、加密與政策新聞的中文重點摘要。",
    section: "Newsletter",
  },
  {
    file: "404.html",
    path: "404.html",
    title: "找不到頁面 - CYBERNEWS",
    description: "找不到頁面。回到 CYBERNEWS 首頁、最新消息或 Archive 搜尋內容。",
    section: "404",
  },
  {
    file: "topic-ai-regulation.html",
    path: "topic-ai-regulation.html",
    title: "AI 監管專題 - CYBERNEWS",
    description: "追蹤歐盟、美國與亞洲 AI 監管、模型稽核與企業合規新聞。",
    section: "AI 監管專題",
  },
  {
    file: "topic-nvidia-supply-chain.html",
    path: "topic-nvidia-supply-chain.html",
    title: "Nvidia 供應鏈專題 - CYBERNEWS",
    description: "追蹤 Nvidia、HBM、先進封裝、伺服器機櫃與 AI 資料中心供應鏈。",
    section: "Nvidia 供應鏈專題",
  },
];

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

const absoluteUrl = (publicPath = "") => `${siteUrl}/${publicPath.replace(/^\/+/, "")}`;

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

const jsonLd = (page, url) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: `${siteUrl}/`,
      logo: `${siteUrl}/assets/technow-logo.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: `${siteUrl}/`,
      inLanguage: "zh-Hant",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/archive.html?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: page.section,
      inLanguage: "zh-Hant",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: siteName, item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: page.section, item: url },
      ],
    },
  ],
});

const metadataBlock = (page) => {
  const url = absoluteUrl(page.path);
  return `<!-- site-meta:start -->
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <script type="application/ld+json" data-site-jsonld>${escapeScriptJson(jsonLd(page, url))}</script>
    <link rel="preconnect" href="https://www.googletagmanager.com" />
    ${analyticsHead()}
    <!-- site-meta:end -->`;
};

const injectHead = (html, page) => {
  let output = html.replace(/\s*<!-- site-meta:start -->[\s\S]*?<!-- site-meta:end -->/g, "");
  output = output.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "");
  output = output.replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "");
  output = output.replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");
  output = output.replace(/\s*<script\s+type=["']application\/ld\+json["']\s+data-site-jsonld[\s\S]*?<\/script>/gi, "");
  return output.replace(/\s*<\/head>/i, `\n    ${metadataBlock(page)}\n  </head>`);
};

const injectBody = (html) => {
  let output = html.replace(/\s*<!-- site-analytics-body:start -->[\s\S]*?<!-- site-analytics-body:end -->/g, "");
  const bodyBlock = analyticsBody();

  if (!bodyBlock) {
    return output;
  }

  return output.replace(/(<body\b[^>]*>)/i, `$1\n    <!-- site-analytics-body:start -->\n    ${bodyBlock}\n    <!-- site-analytics-body:end -->`);
};

for (const page of pages) {
  const filePath = path.join(rootDir, page.file);

  if (!fs.existsSync(filePath)) {
    continue;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const next = injectBody(injectHead(original, page));
  fs.writeFileSync(filePath, next);
}

console.log(`Applied metadata to ${pages.filter((page) => fs.existsSync(path.join(rootDir, page.file))).length} top-level pages.`);
