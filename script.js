const languageSwitcher = document.querySelector(".language-switcher");
const languageTrigger = document.querySelector(".language-trigger");
const languageCurrent = document.querySelector(".language-current");
const languageOptions = document.querySelectorAll(".language-option");
const mobileMenuTrigger = document.querySelector(".mobile-menu-trigger");
const mobileMenuPanel = document.querySelector(".mobile-menu-panel");
const mobileMenuClose = document.querySelector(".mobile-menu-close");
const columnTrack = document.querySelector(".column-track");
const scriptBaseUrl = (() => {
  const script = document.currentScript || Array.from(document.scripts).find((element) => element.src.includes("script.js"));
  return script?.src ? new URL(".", script.src) : new URL("./", window.location.href);
})();
const dataAssetUrl = (filename) => new URL(`data/${filename}`, scriptBaseUrl).href;
const rootAssetUrl = (filename) => new URL(filename, scriptBaseUrl).href;
const previewParams = () => new URLSearchParams(window.location.search);
const isLocalPreviewHost = () => ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) || window.location.protocol === "file:";
const isDesignPreviewMode = () => isLocalPreviewHost() && previewParams().get("preview") === "design";
const getNewsDataFilename = () => (isDesignPreviewMode() ? "design-preview-news.json" : "news.json");
let activeNewsDataMode = isDesignPreviewMode() ? "design-preview" : "production";
const isUsingDesignFixtures = () => activeNewsDataMode === "design-preview" || activeNewsDataMode === "design-fallback";
const isExplicitDesignPreview = () => activeNewsDataMode === "design-preview";
const isDesignFixtureItem = (item) => Boolean(item?.is_design_fixture);
const isPlaceholderSourceUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    return new URL(value, window.location.href).hostname === "example.com";
  } catch {
    return String(value).includes("example.com");
  }
};
const getSourceUrl = (item) => {
  const source = typeof getLocalizedSourceProfile === "function" ? getLocalizedSourceProfile(item) : {};
  const value = source.canonical_url || source.source_url || item?.canonical_url || item?.source_url || "";
  if (item?.is_design_fixture || String(value).startsWith("design-fixture://")) {
    return "";
  }
  return isPlaceholderSourceUrl(value) ? "" : value;
};
const columnFilterOptions = [
  { label: "全部", value: "all" },
  { label: "AI", value: "ai" },
  { label: "金融", value: "finance" },
  { label: "調研", value: "research" },
];
const languageStorageKey = "cybernews-language";
const supportedLocales = ["zh-Hant", "zh-Hans", "en"];
const localeLabels = {
  "zh-Hant": "繁中",
  "zh-Hans": "简中",
  en: "EN",
};
const countryLocaleMap = {
  CN: "zh-Hans",
  TW: "zh-Hant",
};
const localeIntlMap = {
  "zh-Hant": "zh-Hant-TW",
  "zh-Hans": "zh-Hans-CN",
  en: "en-US",
};
const localeFieldSuffixes = {
  "zh-Hant": ["zh_hant", "zh"],
  "zh-Hans": ["zh_hans", "zh_cn", "zh"],
  en: ["en"],
};
let currentNewsItems = [];
let currentTopics = [];

const simplifiedCharacterMap = {
  "與": "与",
  "專": "专",
  "欄": "栏",
  "調": "调",
  "研": "研",
  "訊": "讯",
  "聞": "闻",
  "報": "报",
  "體": "体",
  "據": "据",
  "雲": "云",
  "端": "端",
  "產": "产",
  "業": "业",
  "資": "资",
  "料": "料",
  "導": "导",
  "覽": "览",
  "連": "连",
  "結": "结",
  "讀": "读",
  "檢": "检",
  "查": "查",
  "顯": "显",
  "示": "示",
  "測": "测",
  "試": "试",
  "標": "标",
  "題": "题",
  "關": "关",
  "鍵": "键",
  "篩": "筛",
  "選": "选",
  "歷": "历",
  "史": "史",
  "內": "内",
  "容": "容",
  "態": "态",
  "頻": "频",
  "錄": "录",
  "議": "议",
  "構": "构",
  "機": "机",
  "應": "应",
  "用": "用",
  "監": "监",
  "管": "管",
  "策": "策",
  "說": "说",
  "明": "明",
  "發": "发",
  "佈": "布",
  "布": "布",
  "風": "风",
  "險": "险",
  "雜": "杂",
  "誌": "志",
  "證": "证",
  "權": "权",
  "點": "点",
  "雖": "虽",
  "續": "续",
  "經": "经",
  "濟": "济",
  "幣": "币",
  "穩": "稳",
  "幫": "帮",
  "號": "号",
  "別": "别",
  "補": "补",
  "單": "单",
  "雙": "双",
  "軌": "轨",
  "觀": "观",
  "察": "察",
  "資": "资",
  "臺": "台",
  "灣": "湾",
  "實": "实",
  "線": "线",
  "現": "现",
  "場": "场",
  "間": "间",
  "後": "后",
  "這": "这",
  "裡": "里",
  "則": "则",
  "來": "来",
  "時": "时",
  "兩": "两",
  "圖": "图",
  "儀": "仪",
  "寶": "宝",
  "貝": "贝",
  "參": "参",
  "壓": "压",
  "歲": "岁",
  "黃": "黄",
  "國": "国",
  "團": "团",
  "園": "园",
  "處": "处",
  "據": "据",
  "礎": "础",
  "設": "设",
  "簡": "简",
  "讓": "让",
  "進": "进",
  "與": "与",
  "獻": "献",
  "圍": "围",
  "幾": "几",
  "萬": "万",
  "買": "买",
  "賣": "卖",
  "轉": "转",
  "開": "开",
  "轉": "转",
  "換": "换",
  "縮": "缩",
  "寫": "写",
  "復": "复",
  "雜": "杂",
  "層": "层",
  "長": "长",
  "嚴": "严",
  "質": "质",
  "佔": "占",
  "併": "并",
  "啟": "启",
  "動": "动",
  "劃": "划",
  "輯": "辑",
  "號": "号",
  "據": "据",
  "獨": "独",
  "廣": "广",
  "告": "告",
  "響": "响",
  "適": "适",
  "隱": "隐",
  "私": "私",
  "絡": "络",
  "複": "复",
  "製": "制",
  "敗": "败",
  "頁": "页",
  "總": "总",
  "題": "题",
  "種": "种",
  "顧": "顾",
  "識": "识",
  "識": "识",
  "繫": "系",
  "網": "网",
  "頁": "页",
  "級": "级",
  "對": "对",
  "變": "变",
  "從": "从",
  "為": "为",
  "務": "务",
  "態": "态",
  "軟": "软",
  "體": "体",
  "電": "电",
  "腦": "脑",
  "壓": "压",
  "採": "采",
  "購": "购",
  "於": "于",
  "們": "们",
  "聯": "联",
  "絡": "络",
  "審": "审",
  "批": "批",
  "稽": "稽",
  "核": "核",
  "訓": "训",
  "練": "练",
  "釋": "释",
  "放": "放",
  "儲": "储",
  "備": "备",
  "區": "区",
  "塊": "块",
  "鏈": "链",
  "錢": "钱",
  "包": "包",
  "價": "价",
  "預": "预",
  "測": "测",
  "買": "买",
  "賣": "卖",
  "雜": "杂",
};
const toSimplifiedChinese = (value) =>
  String(value ?? "").replace(/[\s\S]/g, (character) => simplifiedCharacterMap[character] || character);
const normalizeLanguage = (lang) => {
  const value = String(lang || "").trim();
  if (["zh-Hans", "zh-CN", "zh_CN", "zh-hans", "cn", "zh-sg"].includes(value)) {
    return "zh-Hans";
  }
  if (["en", "en-US", "en_GB", "en-us"].includes(value)) {
    return "en";
  }
  return "zh-Hant";
};
const getCookieValue = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};
const getLocaleFromCountry = (country) => countryLocaleMap[String(country || "").toUpperCase()] || "en";
const setLocaleCookie = (locale) => {
  try {
    document.cookie = `cybernews-locale=${encodeURIComponent(normalizeLanguage(locale))}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // Locale cookie only helps CloudFront preserve the user's preference.
  }
};
const getStoredLanguage = () => {
  try {
    const stored = window.localStorage?.getItem(languageStorageKey);
    return stored ? normalizeLanguage(stored) : "";
  } catch {
    return "";
  }
};
const storeLanguage = (lang) => {
  try {
    window.localStorage?.setItem(languageStorageKey, normalizeLanguage(lang));
  } catch {
    // Language preference is a convenience; ignore storage failures.
  }
};
const detectDefaultLanguage = () => {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage) {
    return normalizeLanguage(urlLanguage);
  }

  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }

  const cookieLocale = getCookieValue("cybernews-locale");
  if (cookieLocale) {
    return normalizeLanguage(cookieLocale);
  }

  const country = getCookieValue("cybernews-country");
  if (country) {
    return getLocaleFromCountry(country);
  }

  const browserLanguages = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  const browserLanguage = browserLanguages.find((language) => /^zh/i.test(language)) || browserLanguages[0] || "";
  if (/zh-(cn|sg)|hans/i.test(browserLanguage)) {
    return "zh-Hans";
  }
  if (/zh-(tw|hk|mo)|hant/i.test(browserLanguage)) {
    return "zh-Hant";
  }
  return "en";
};

const translations = [
  ["CYBERNEWS - Global Technology Signals", "CYBERNEWS - 全球科技訊號"],
  ["About", "關於"],
  ["Latest", "最新"],
  ["Newsletter", "電子報"],
  ["Latest Stories", "最新消息"],
  ["Explore latest stories", "探索最新消息"],
  ["Global AI", "全球 AI"],
  ["AI Policy", "AI 政策"],
  ["A world of tech in your inbox", "全球科技新聞寄到你的信箱"],
  ["CYBERNEWS Briefing", "CYBERNEWS 簡報"],
  ["內容載入中", "Loading content"],
  ["正在載入文章資料與分類版位。", "Loading stories and section layouts."],
  ["每日最新消息與每週專欄，把全球科技新聞整理成中文可讀脈絡。", "Daily updates and weekly columns that turn global tech news into readable context."],
  ["Advertisement", "廣告"],
  ["Responsive display placement", "響應式廣告版位"],
  ["970 x 250 / fluid", "970 x 250 / 自適應"],
  ["深入專欄", "In-depth Columns"],
  ["資料邊境", "Data Borders"],
  ["衛星網路、資料中心與主權雲如何重畫科技地緣政治。", "How satellite networks, data centers, and sovereign clouds redraw tech geopolitics."],
  ["平台語言", "Platform Languages"],
  ["非英語市場正在用自己的方式改寫 AI 產品設計。", "Non-English markets are rewriting AI product design on their own terms."],
  ["數位神明", "Digital Divinity"],
  ["古老信仰如何遇上演算法、支付系統與內容平台。", "Where old beliefs meet algorithms, payment systems, and content platforms."],
  ["外包的 AI", "Outsourced AI"],
  ["看不見的標註、審核與測試工作如何支撐模型競賽。", "The invisible labeling, moderation, and testing work behind the model race."],
  ["科技反作用力", "Tech Backlash"],
  ["平台、監管者與創作者正在重新談判權力邊界。", "Platforms, regulators, and creators are renegotiating the boundaries of power."],
  ["出海工廠", "Factories Abroad"],
  ["中國 EV 與清潔科技供應鏈在海外遇到的新現實。", "The new realities facing Chinese EV and clean-tech supply chains overseas."],
  ["Charts", "圖表"],
  ["A view of global tech through data and graphics.", "用資料與圖像觀看全球科技。"],
  ["Explore charts", "探索圖表"],
  ["Regions", "地區"],
  ["Topics", "主題"],
  ["Contact", "聯絡"],
  ["About us", "關於我們"],
  ["Privacy policy", "隱私權政策"],
  ["Platforms", "平台"],
  ["Donate", "贊助"],
  ["最新消息", "Latest"],
  ["AI 新聞", "AI News"],
  ["金融", "Finance"],
  ["專題", "Topics"],
  ["專題追蹤", "Topic Tracking"],
  ["把多篇相關新聞收進同一個主題，方便追蹤事件脈絡。先保留已整理好的專題頁，其他查詢入口之後再開。", "Related stories are grouped into topics so readers can follow the context. Curated topic pages stay available first; more discovery paths will open later."],
  ["追蹤模型、平台、監管、基礎建設與應用落地。這一區把原文新聞整理成中文摘要，保留來源與分類。", "Track models, platforms, regulation, infrastructure, and real-world adoption. This section turns original reporting into concise summaries with sources and categories."],
  ["聚焦市場、公司、資產、政策與資金流向。科技股與加密資產在這裡作為金融子分類與 metadata，不再拆成獨立主頻道。", "Focus on markets, companies, assets, policy, and capital flows. Tech stocks and crypto are finance subcategories and metadata here, not separate main channels."],
  ["子分類", "Subcategories"],
  ["專欄", "Columns"],
  ["調研", "Research"],
  ["搜尋", "Search"],
  ["選單", "Menu"],
  ["歷史內容", "Archive"],
  ["查看全部歷史內容", "View full Archive"],
  ["今日主線 / AI", "Top Story / AI"],
  ["每天整理 AI 與金融新聞摘要。", "Daily summaries of AI and finance news."],
  ["訂閱", "Subscribe"],
  ["為什麼重要", "Why it matters"],
  ["AI 監管", "AI Regulation"],
  ["金融 / 科技股 - CYBERNEWS", "Finance / Tech Stocks - CYBERNEWS"],
  ["金融 / 加密與穩定幣 - CYBERNEWS", "Finance / Crypto and Stablecoins - CYBERNEWS"],
  ["Finance / Tech Stocks", "金融 / 科技股"],
  ["Finance / Crypto and Stablecoins", "金融 / 加密與穩定幣"],
  ["算力與晶片", "Chips and Compute"],
  ["AI 資本與雲端", "AI Capital and Cloud"],
  ["AI 公司與產品", "AI Companies and Products"],
  ["科技股", "Tech Stocks"],
  ["加密", "Crypto"],
  ["加密與穩定幣", "Crypto and Stablecoins"],
  ["科技股與加密摘要", "Tech stocks and crypto summary"],
  ["監管與政策", "Regulation and Policy"],
  ["AI 應用與人才", "AI Adoption and Talent"],
  ["全部", "All"],
  ["全球資料中心與能源壓力如何變成同一個問題。", "How global data centers and energy pressure became the same problem."],
  ["AI 監管進展", "AI Regulation Tracker"],
  ["歐盟、美國與亞洲政策如何改變模型發布節奏。", "How EU, U.S., and Asian policy is changing model release cycles."],
  ["Nvidia 供應鏈", "Nvidia Supply Chain"],
  ["從 HBM 到先進封裝，追蹤 AI 伺服器瓶頸。", "Tracking AI server bottlenecks from HBM to advanced packaging."],
  ["科技巨頭財報", "Tech Giants Earnings"],
  ["AI 成本、雲端營收與裝置週期如何被市場閱讀。", "How AI costs, cloud revenue, and device cycles are being read by the market."],
  ["追蹤 ETF 資金流、上市公司持倉與監管變化。", "Tracking ETF flows, public-company holdings, and regulatory changes."],
  ["支付公司、交易所與發行人面對新的合規成本。", "Payment firms, exchanges, and issuers face new compliance costs."],
  ["AI 與金融新聞寄到你的信箱", "AI and finance news in your inbox"],
  ["每日精選 5 到 8 則重要新聞摘要，保留來源、主頻道、內容型態、代號與原文連結。", "A daily selection of 5 to 8 important summaries with sources, verticals, content types, symbols, and original links."],
  ["每天整理 AI 與金融新聞摘要。", "Daily AI and finance news summaries."],
  ["每日精選 5 到 8 則重要內容，保留來源、主頻道、內容型態、代號與原文連結。", "A daily selection of 5 to 8 important items with sources, verticals, content types, symbols, and original links."],
  ["訂閱調研摘要。", "Subscribe to research summaries."],
  ["每週整理 AI、金融與調研內容，保留來源、metadata 與免責說明。", "Weekly AI, finance, and research summaries with sources, metadata, and disclaimers."],
  ["請到信箱點確認連結完成訂閱", "Check your inbox and click the confirmation link to finish subscribing."],
  ["每日 Brief 範例", "Daily Brief Sample"],
  ["載入最新摘要中", "Loading latest summaries"],
  ["系統正在讀取文章資料。", "Reading article data."],
  ["閱讀所有最新內容", "Read all latest stories"],
  ["訂閱前常見問題", "Questions before subscribing"],
  ["這是投資建議嗎？", "Is this investment advice?"],
  ["不是。CYBERNEWS Brief 只整理公開新聞、來源與 metadata，不提供價格預測、買賣訊號或個別投資建議。", "No. CYBERNEWS Brief organizes public news, sources, and metadata only. It does not provide price forecasts, trading signals, or individual investment advice."],
  ["會重刊付費全文嗎？", "Will it republish paid full articles?"],
  ["不會。每篇內容只保留中文摘要、脈絡、分類與原始來源連結，讀者需要完整內容時應回到原文。", "No. Each item keeps only a summary, context, taxonomy, and original source link. Readers should return to the original source for the full article."],
  ["多久會收到一次？", "How often will it arrive?"],
  ["以每日一封為目標；如果當天沒有足夠重要且可追溯來源的內容，CYBERNEWS 會降低頻率。", "The target is once per day. If there are not enough important, traceable stories that day, CYBERNEWS will reduce frequency."],
  ["只追蹤可回到來源的重點。", "Only track signals that lead back to sources."],
  ["隱私權政策", "privacy policy"],
  ["公開資訊", "Public info"],
  ["只整理公開資訊，不做投資建議。", "Public information only, not investment advice."],
  ["常見問題", "FAQ"],
  ["為什麼重要：", "Why it matters:"],
  ["原文 ↗", "Original ↗"],
  ["每日精選 5 到 8 則重要新聞摘要，保留來源、主頻道、內容型態、代號與原文連結。", "A daily selection of 5 to 8 important summaries with sources, verticals, content types, symbols, and original links."],
  ["把新聞摘要存成可查找的資料庫，不重刊全文、不做買賣建議。", "News summaries are stored as a searchable database without republishing full text or giving trading advice."],
  ["瀏覽資料欄位", "Browse data fields"],
  ["每篇內容保留來源、原文連結、主頻道、內容型態與發布時間", "Each item keeps its source, original link, vertical, content type, and publication time"],
  ["股票代號與幣種代號只作為 metadata，不延伸成交易訊號", "Stock tickers and coin symbols are metadata only, not trading signals"],
  ["日期", "Date"],
  ["2026 年 7 月 1 日", "July 1, 2026"],
  ["2026 年 6 月 30 日", "June 30, 2026"],
  ["2026 年 6 月 22 日", "June 22, 2026"],
  ["主分類", "Main Category"],
  ["來源", "Source"],
  ["代號", "Symbols"],
  ["NVDA / MSFT / AAPL", "NVDA / MSFT / AAPL"],
  ["BTC / SOL / USDC", "BTC / SOL / USDC"],
  ["AI infrastructure / regulation", "AI infrastructure / regulation"],
  ["延伸閱讀", "Related Reads"],
  ["追蹤專題", "Follow Topics"],
  ["相關內容", "More Stories"],
  ["加入專題追蹤", "Follow this topic"],
  ["閱讀原文", "Read original"],
  ["回到歷史內容", "Back to Archive"],
  ["訂閱相關 Brief", "Subscribe to Briefs"],
  ["中文摘要", "Summary"],
  ["內文整理", "Article Digest"],
  ["原文來源", "Original Source"],
  ["免責說明", "Disclaimer"],
  ["核心問題", "Core Question"],
  ["主要資料來源", "Primary Sources"],
  ["調研屬性", "Research Type"],
  ["找不到內容", "Content not found"],
  ["請回到上一頁重新選擇一篇內容。", "Please go back and pick another story."],
  ["已收到訂閱申請，之後簡報會寄到你的信箱。", "Subscription received. Briefs will arrive in your inbox."],
  ["歷史內容", "Archive"],
  ["搜尋", "Search"],
  ["搜尋 - CYBERNEWS", "Search - CYBERNEWS"],
  ["全站搜尋", "Site Search"],
  ["更多同類內容", "More like this"],
  ["查看更多最新消息", "More latest stories"],
  ["全站內容總覽", "All Content Index"],
  ["更多內容", "More Coverage"],
  ["內容型態", "Content Types"],
  ["金融子分類", "Finance Subcategories"],
  ["快速入口", "Quick Links"],
  ["專欄 - CYBERNEWS", "Columns - CYBERNEWS"],
  ["調研 - CYBERNEWS", "Research - CYBERNEWS"],
  ["專欄", "Columns"],
  ["調研", "Research"],
  ["收錄 CYBERNEWS 的觀點專欄、週報與市場脈絡整理，協助讀者理解 AI 與金融訊號背後的判斷框架。", "CYBERNEWS columns, weekly notes, and market context for understanding the reasoning behind AI and finance signals."],
  ["整理較長篇的調研摘要、資料線索與可回溯來源，讓正式研究內容接入後能被讀者快速追蹤。", "Longer research briefs, data trails, and traceable sources so readers can follow production research once it is connected."],
  ["正式內容資料尚未接入", "Production content is not connected yet"],
  ["這個版位會在文章 API 提供正式資料後自動顯示內容；目前不顯示測試文章。", "This surface will populate automatically when the article API provides production data. Test stories are not shown."],
  ["待接入", "Pending API"],
  ["沒有符合條件的內容", "No matching content"],
  ["請換一個內容型態，或稍後再查看更多內容。", "Try another content type, or check back later for more coverage."],
  ["以上就是目前符合條件的全部內容。", "That's all the matching content for now."],
  ["關鍵字 / 公司 / 代號", "Keyword / company / ticker"],
  ["輸入關鍵字、公司、股票代號或幣種代號，快速找回 CYBERNEWS 的新聞與調研摘要。", "Search CYBERNEWS news and research summaries by keyword, company, ticker, or crypto symbol."],
  ["全站所有新聞與調研摘要都收在這裡。輸入關鍵字、公司、股票代號或幣種代號，找回任何一篇內容與它的原文連結。", "Every news and research summary lives here. Search by keyword, company, stock ticker, or crypto symbol to find any story and its original link."],
  ["全站所有新聞與調研摘要都收在這裡。用日期、主頻道、內容型態、子分類、來源、語言或關鍵字，找回任何一篇內容與它的原文連結。", "Every news and research summary lives here. Use date, vertical, content type, subcategory, source, language, or keywords to find any story and its original link."]
];

const hasCjk = (value) => /[\u3400-\u9fff]/.test(value);

const normalizedTranslations = translations.map(([first, second]) => {
  if (hasCjk(first) && !hasCjk(second)) {
    return { zh: first, en: second };
  }

  if (!hasCjk(first) && hasCjk(second)) {
    return { zh: second, en: first };
  }

  return { zh: second, en: first };
});

const textMaps = {
  "zh-Hant": new Map(
    normalizedTranslations.flatMap(({ zh, en }) => [
      [en, zh],
      [toSimplifiedChinese(zh), zh],
    ]),
  ),
  "zh-Hans": new Map(
    normalizedTranslations.flatMap(({ zh, en }) => {
      const zhHans = toSimplifiedChinese(zh);
      return [
        [en, zhHans],
        [zh, zhHans],
      ];
    }),
  ),
  en: new Map(
    normalizedTranslations.flatMap(({ zh, en }) => [
      [zh, en],
      [toSimplifiedChinese(zh), en],
    ]),
  ),
};

const getColumnFilterValues = (item) => {
  const values = new Set(["all"]);

  if (item.vertical) {
    values.add(item.vertical);
  }

  if (item.content_type) {
    values.add(item.content_type);
  }

  return Array.from(values).join(" ");
};

const applyColumnFilter = (filter = "all") => {
  document.querySelectorAll(".popular-strip .column-years button").forEach((button) => {
    const isActive = (button.dataset.columnFilter || "all") === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (!columnTrack) {
    return;
  }

  columnTrack.querySelectorAll(".column-card").forEach((card) => {
    const values = (card.dataset.columnFilterValues || "all").split(/\s+/);
    const isMatch = filter === "all" || values.includes(filter);

    card.classList.toggle("is-column-match", isMatch);
    card.classList.toggle("is-column-dimmed", !isMatch);
  });
};

const placeholders = {
  "zh-Hant": {
    "you@example.com": "you@example.com",
  },
  "zh-Hans": {
    "you@example.com": "you@example.com",
  },
  en: {
    "you@example.com": "you@example.com",
  },
};

const syncColumnCaptionVisibility = () => {
  if (!columnTrack) {
    return;
  }

  const cards = Array.from(columnTrack.querySelectorAll(".column-card"));

  if (!cards.length) {
    return;
  }

  let animationFrame = 0;

  const updateVisibleCaptions = () => {
    animationFrame = 0;
    const trackRect = columnTrack.getBoundingClientRect();

    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const visibleWidth = Math.max(
        0,
        Math.min(cardRect.right, trackRect.right) - Math.max(cardRect.left, trackRect.left),
      );
      const visibleRatio = visibleWidth / cardRect.width;

      card.classList.toggle("is-caption-visible", visibleRatio >= 0.82);
    });
  };

  const requestUpdate = () => {
    if (animationFrame) {
      return;
    }

    animationFrame = window.requestAnimationFrame(updateVisibleCaptions);
  };

  updateVisibleCaptions();
  columnTrack.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
};

const contentTypeLabels = {
  news: "新聞",
  column: "專欄",
  research: "調研",
};

const verticalLabels = {
  ai: "AI 新聞",
  finance: "金融",
};

const contentTypeLocaleLabels = {
  news: { "zh-Hant": "新聞", "zh-Hans": "新闻", en: "News" },
  column: { "zh-Hant": "專欄", "zh-Hans": "专栏", en: "Column" },
  research: { "zh-Hant": "調研", "zh-Hans": "调研", en: "Research" },
};

const verticalLocaleLabels = {
  ai: { "zh-Hant": "AI 新聞", "zh-Hans": "AI 新闻", en: "AI News" },
  finance: { "zh-Hant": "金融", "zh-Hans": "金融", en: "Finance" },
};

const defaultSourceNames = {
  "zh-Hant": "CYBERNEWS 台灣",
  "zh-Hans": "CYBERNEWS 简中",
  en: "CYBERNEWS Global",
};

const emptyContentCopy = {
  "zh-Hant": {
    title: "正式內容資料尚未接入",
    description: "這個版位會在文章 API 提供正式資料後自動顯示內容；目前不顯示測試文章。",
    meta: "待接入",
  },
  "zh-Hans": {
    title: "正式内容资料尚未接入",
    description: "这个版位会在文章 API 提供正式资料后自动显示内容；目前不显示测试文章。",
    meta: "待接入",
  },
  en: {
    title: "Production content is not connected yet",
    description: "This surface will populate automatically when the article API provides production data. Test stories are not shown.",
    meta: "Pending API",
  },
};

const latestPageProfiles = {
  all: {
    kicker: { "zh-Hant": "CYBERNEWS Latest", "zh-Hans": "CYBERNEWS Latest", en: "CYBERNEWS Latest" },
    title: { "zh-Hant": "最新消息", "zh-Hans": "最新消息", en: "Latest" },
    description: {
      "zh-Hant": "跨 AI 新聞與金融兩大主頻道整理最新摘要。每則保留來源、內容型態、時間與可追溯原文，不做投資建議。",
      "zh-Hans": "跨 AI 新闻与金融两大主频道整理最新摘要。每则保留来源、内容型态、时间与可追溯原文，不做投资建议。",
      en: "Latest AI and finance summaries with source links, content type, timestamps, and traceable originals. No investment advice.",
    },
    titleTag: { "zh-Hant": "最新消息 - CYBERNEWS", "zh-Hans": "最新消息 - CYBERNEWS", en: "Latest - CYBERNEWS" },
  },
  column: {
    kicker: { "zh-Hant": "CYBERNEWS Columns", "zh-Hans": "CYBERNEWS Columns", en: "CYBERNEWS Columns" },
    title: { "zh-Hant": "專欄", "zh-Hans": "专栏", en: "Columns" },
    description: {
      "zh-Hant": "收錄 CYBERNEWS 的觀點專欄、週報與市場脈絡整理，協助讀者理解 AI 與金融訊號背後的判斷框架。",
      "zh-Hans": "收录 CYBERNEWS 的观点专栏、周报与市场脉络整理，协助读者理解 AI 与金融讯号背后的判断框架。",
      en: "CYBERNEWS columns, weekly notes, and market context for understanding the reasoning behind AI and finance signals.",
    },
    titleTag: { "zh-Hant": "專欄 - CYBERNEWS", "zh-Hans": "专栏 - CYBERNEWS", en: "Columns - CYBERNEWS" },
  },
  research: {
    kicker: { "zh-Hant": "CYBERNEWS Research", "zh-Hans": "CYBERNEWS Research", en: "CYBERNEWS Research" },
    title: { "zh-Hant": "調研", "zh-Hans": "调研", en: "Research" },
    description: {
      "zh-Hant": "整理較長篇的調研摘要、資料線索與可回溯來源，讓正式研究內容接入後能被讀者快速追蹤。",
      "zh-Hans": "整理较长篇的调研摘要、资料线索与可回溯来源，让正式研究内容接入后能被读者快速追踪。",
      en: "Longer research briefs, data trails, and traceable sources so readers can follow production research once it is connected.",
    },
    titleTag: { "zh-Hant": "調研 - CYBERNEWS", "zh-Hans": "调研 - CYBERNEWS", en: "Research - CYBERNEWS" },
  },
};

const archiveSummaryLabels = {
  date_from: "日期起",
  date_to: "日期迄",
  vertical: "主頻道",
  content_type: "內容型態",
  subcategory: "子分類",
  source_name: "來源",
  language: "語言",
  query: "關鍵字",
};

const archiveUrlAliases = {
  content_type: "type",
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

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(localeIntlMap[getActiveLanguage()] || "en-US", {
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

  return new Intl.DateTimeFormat(localeIntlMap[getActiveLanguage()] || "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getSelectedOptionText = (field) => field?.selectedOptions?.[0]?.textContent?.trim() || "";

const byPublishedDesc = (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime();

const getLocaleCopy = (copy, locale = getActiveLanguage()) => {
  if (!copy || typeof copy !== "object") {
    return copy || "";
  }

  const normalized = normalizeLanguage(locale);
  if (copy[normalized]) {
    return copy[normalized];
  }

  if (normalized === "zh-Hans") {
    return toSimplifiedChinese(copy["zh-Hant"] || copy.zh || copy.en || "");
  }

  if (normalized === "zh-Hant") {
    return copy["zh-Hant"] || copy.zh || copy.en || "";
  }

  return copy.en || copy["zh-Hant"] || copy.zh || "";
};

const getNestedLocaleValue = (item, key, locale = getActiveLanguage()) => {
  const normalized = normalizeLanguage(locale);
  const locales = item?.locales || item?.translations || {};
  const localeData = locales[normalized] || (normalized === "zh-Hant" ? locales.zh : null) || {};
  const directValue = localeData?.[key];

  if (directValue !== undefined && directValue !== null && directValue !== "") {
    return directValue;
  }

  for (const suffix of localeFieldSuffixes[normalized] || []) {
    const field = `${key}_${suffix}`;
    if (item?.[field] !== undefined && item?.[field] !== null && item?.[field] !== "") {
      return normalized === "zh-Hans" && suffix === "zh" ? toSimplifiedChinese(item[field]) : item[field];
    }
  }

  if (normalized === "en" && key === "title" && item?.title_original) {
    return item.title_original;
  }

  const legacyFieldMap = {
    title: "title_zh",
    summary: "summary_zh",
    why_matters: "why_matters_zh",
    body: "body_zh",
    subcategory: "subcategory",
  };
  const legacyValue = item?.[legacyFieldMap[key]];

  if (normalized === "zh-Hans") {
    return Array.isArray(legacyValue) ? legacyValue.map(toSimplifiedChinese) : toSimplifiedChinese(legacyValue || "");
  }

  return legacyValue || "";
};

const getArticleTitle = (item, locale = getActiveLanguage()) => getNestedLocaleValue(item, "title", locale) || item?.title_original || item?.id || "";
const getArticleSummary = (item, locale = getActiveLanguage()) => getNestedLocaleValue(item, "summary", locale);
const getArticleWhy = (item, locale = getActiveLanguage()) => getNestedLocaleValue(item, "why_matters", locale);
const getArticleBody = (item, locale = getActiveLanguage()) => {
  const value = getNestedLocaleValue(item, "body", locale);
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
};
const getArticleSubcategory = (item, locale = getActiveLanguage()) => getNestedLocaleValue(item, "subcategory", locale) || item?.subcategory || "";
const getImageAlt = (item, locale = getActiveLanguage()) => getNestedLocaleValue(item, "image_alt", locale) || getArticleTitle(item, locale);
const getVerticalLabel = (vertical, locale = getActiveLanguage()) => getLocaleCopy(verticalLocaleLabels[vertical], locale) || vertical;
const getContentTypeLabel = (type, locale = getActiveLanguage()) => getLocaleCopy(contentTypeLocaleLabels[type], locale) || type;

const getLocalizedSourceProfile = (item, locale = getActiveLanguage()) => {
  const normalized = normalizeLanguage(locale);
  const sources = item?.sources_by_locale || item?.source_profiles || {};
  const localeSource = sources[normalized] || (normalized === "zh-Hant" ? sources.zh : null) || {};

  return {
    name:
      localeSource.source_name ||
      localeSource.name ||
      item?.locales?.[normalized]?.source_name ||
      (!isExplicitDesignPreview() && isDesignFixtureItem(item) ? defaultSourceNames[normalized] : item?.source_name) ||
      defaultSourceNames[normalized] ||
      "CYBERNEWS",
    source_url: localeSource.source_url || localeSource.url || item?.source_url || "",
    canonical_url: localeSource.canonical_url || localeSource.canonical || item?.canonical_url || "",
    region: localeSource.region || item?.locales?.[normalized]?.region || item?.region || "",
  };
};

const getImageStyle = (item) => {
  const imageUrl = !isExplicitDesignPreview() && isDesignFixtureItem(item) ? "./assets/og-cybernews.jpg" : item?.image_url;

  if (!imageUrl) {
    return "";
  }

  return ` style="background-image: linear-gradient(0deg, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.02)), url('${escapeHtml(imageUrl)}')"`;
};

const getStoryHref = (item) => {
  if (isUsingDesignFixtures() && isDesignFixtureItem(item)) {
    const params = new URLSearchParams({ id: item?.id || "" });

    if (isExplicitDesignPreview()) {
      params.set("preview", "design");
    }

    return `./research.html?${params.toString()}`;
  }

  const folder = item?.content_type === "research" ? "research" : "articles";
  return `./${folder}/${encodeURIComponent(item?.id || "")}/`;
};

const designFixtureBadgeMarkup = (item) =>
  isExplicitDesignPreview() && isDesignFixtureItem(item)
    ? `<span class="design-fixture-badge" data-i18n-zh="設計檢查假資料" data-i18n-en="Design fixture">設計檢查假資料</span>`
    : "";

const designFixtureNoticeMarkup = (item) =>
  isExplicitDesignPreview() && isDesignFixtureItem(item)
    ? `<p class="design-fixture-note" data-i18n-zh="${escapeHtml(item.preview_note_zh || "設計師檢查用假資料，非正式新聞。")}" data-i18n-en="${escapeHtml(item.preview_note_en || "Design-review fixture only. Not production news.")}">${escapeHtml(item.preview_note_zh || "設計師檢查用假資料，非正式新聞。")}</p>`
    : "";

const designFixtureKeypointMarkup = (item) =>
  isExplicitDesignPreview() && isDesignFixtureItem(item)
    ? `<li data-i18n-zh="${escapeHtml(item.preview_note_zh || "設計師檢查用假資料，非正式新聞。")}" data-i18n-en="${escapeHtml(item.preview_note_en || "Design-review fixture only. Not production news.")}">${escapeHtml(item.preview_note_zh || "設計師檢查用假資料，非正式新聞。")}</li>`
    : "";

const applyDesignPreviewMeta = () => {
  if (!isUsingDesignFixtures()) {
    return;
  }

  document.documentElement.dataset.preview = activeNewsDataMode;
  document.body?.setAttribute("data-preview-mode", activeNewsDataMode);

  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement("meta");
    robotsMeta.setAttribute("name", "robots");
    document.head.append(robotsMeta);
  }
  robotsMeta.setAttribute("content", "noindex,nofollow,noarchive");
};

const injectDesignPreviewNotice = () => {
  if (!isExplicitDesignPreview() || document.querySelector(".design-preview-notice")) {
    return;
  }

  const notice = document.createElement("aside");
  notice.className = "design-preview-notice";
  notice.setAttribute("aria-label", "Design preview notice");
  notice.innerHTML = `
    <strong data-i18n-zh="設計檢查模式" data-i18n-en="Design preview mode">設計檢查模式</strong>
    <span data-i18n-zh="目前顯示的是假資料文章，只供設計師檢查版面與資訊密度。正式站仍由文章 API 提供資料。" data-i18n-en="This page is using fake fixture stories for designer layout review. Production content still comes from the article API.">目前顯示的是假資料文章，只供設計師檢查版面與資訊密度。正式站仍由文章 API 提供資料。</span>
  `;

  (document.querySelector(".site-shell") || document.body).prepend(notice);
};

const preserveDesignPreviewNavigation = () => {
  if (!isDesignPreviewMode()) {
    return;
  }

  document.querySelectorAll("a[href]").forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }

    const target = new URL(rawHref, window.location.href);
    if (target.origin !== window.location.origin || !target.pathname.endsWith(".html")) {
      return;
    }

    target.searchParams.set("preview", "design");
    link.setAttribute("href", target.href);
  });
};

const getSymbols = (item) => [...(item?.tickers || []), ...(item?.coins || [])];

const getMetadata = (item) => {
  const symbols = getSymbols(item);
  const fallback = item?.topics?.slice(0, 2) || [];
  return [...symbols, ...fallback].slice(0, 4);
};

const getMetaLine = (item) =>
  `${getVerticalLabel(item.vertical)} / ${getContentTypeLabel(item.content_type)} / ${getArticleSubcategory(item)}`;

const getDisplaySourceName = (item) =>
  getLocalizedSourceProfile(item).name;

const getReadingMinutes = (item) => {
  const text = [getArticleSummary(item), ...getArticleBody(item)].filter(Boolean).join(" ");
  if (getActiveLanguage() === "en") {
    return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));
  }
  return Math.max(1, Math.round(text.length / 400));
};

const whyMattersMarkup = (item) =>
  getArticleWhy(item)
    ? `<p class="why-matters"><strong>${escapeHtml(getLocaleCopy({ "zh-Hant": "為什麼重要", "zh-Hans": "为什么重要", en: "Why it matters" }))}</strong>${escapeHtml(getArticleWhy(item))}</p>`
    : "";

const storyCardMarkup = (item) => `
  <article class="directory-card">
    <a href="${getStoryHref(item)}">
      <div class="directory-card-image"${getImageStyle(item)}></div>
      ${designFixtureBadgeMarkup(item)}
      <h2>${escapeHtml(getArticleTitle(item))}</h2>
      <p>${escapeHtml(getArticleSummary(item))}</p>
    </a>
    <div class="directory-card-foot">
      <span class="directory-mini-tag">${escapeHtml(getContentTypeLabel(item.content_type))}</span>
      <span class="directory-mini-tag">${escapeHtml(getArticleSubcategory(item))}</span>
      <span class="directory-mini-tag">${escapeHtml(getDisplaySourceName(item))}</span>
    </div>
  </article>
`;

const feedItemMarkup = (item) => {
  const metadata = getMetadata(item);

  return `
    <article class="directory-feed-item">
      <div class="directory-feed-meta">${escapeHtml(formatDateTime(item.published_at))} / ${getReadingMinutes(item)} ${escapeHtml(getLocaleCopy({ "zh-Hant": "分鐘", "zh-Hans": "分钟", en: "min read" }))}<br />${escapeHtml(getMetaLine(item))}</div>
      <div>
        ${designFixtureBadgeMarkup(item)}
        <h2><a href="${getStoryHref(item)}">${escapeHtml(getArticleTitle(item))}</a></h2>
        <p>${escapeHtml(getArticleSummary(item))}</p>
      </div>
      <div class="directory-feed-tags">
        <span>${escapeHtml(getDisplaySourceName(item))}</span>
        ${metadata.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
      </div>
    </article>
  `;
};

const emptyContentMarkup = (headingTag = "h2") => {
  const copy = emptyContentCopy[getActiveLanguage()];

  return `
    <div class="channel-empty">
      <${headingTag}>${escapeHtml(copy.title)}</${headingTag}>
      <p>${escapeHtml(copy.description)}</p>
    </div>
  `;
};

const renderDirectoryCards = (items, selector) => {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.innerHTML = items.slice(0, 6).map(storyCardMarkup).join("");
};

const renderDirectoryFeed = (items, selector = ".directory-feed") => {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML = emptyContentMarkup();
    return;
  }

  container.innerHTML = items.map(feedItemMarkup).join("");
};

const renderHomeRail = (items) => {
  const rail = document.querySelector("#breaking");

  if (!rail) {
    return;
  }

  if (!items.length) {
    rail.innerHTML = `
      <div class="rail-tab">
        <span>最新消息</span>
        <a class="rail-more" href="./latest.html">查看更多</a>
      </div>
      <div class="home-latest-feed">
        ${emptyContentMarkup()}
      </div>
    `;
    return;
  }

  rail.innerHTML = `
    <div class="rail-tab">
      <span>最新消息</span>
      <a class="rail-more" href="./latest.html">查看更多</a>
    </div>
    <div class="home-latest-feed">
      ${items
        .slice(0, 4)
        .map(
          (item) => `
            <article class="pick-item">
              <h3><a href="${getStoryHref(item)}">${escapeHtml(getArticleTitle(item))}</a></h3>
              <p>${escapeHtml(formatDateTime(item.published_at))} / ${escapeHtml(getMetaLine(item))}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderLeadStory = (item) => {
  const lead = document.querySelector(".lead-card");

  if (!lead) {
    return;
  }

  if (!item) {
    lead.innerHTML = emptyContentMarkup("h1");
    return;
  }

  lead.innerHTML = `
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(getArticleTitle(item))}">
      <div class="lead-image" role="img" aria-label="${escapeHtml(getImageAlt(item))}"${getImageStyle(item)}></div>
      <div class="story-meta">${escapeHtml(getLocaleCopy({ "zh-Hant": "今日主線", "zh-Hans": "今日主线", en: "Top Story" }))} / ${escapeHtml(getMetaLine(item))}</div>
      ${designFixtureBadgeMarkup(item)}
      <h1>${escapeHtml(getArticleTitle(item))}</h1>
      <p>${escapeHtml(getArticleSummary(item))}</p>
      ${designFixtureNoticeMarkup(item)}
      ${whyMattersMarkup(item)}
      <div class="byline">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}：${escapeHtml(getDisplaySourceName(item))} / ${escapeHtml(formatDateTime(item.published_at))}</div>
    </a>
  `;
};

const renderHeroStory = (element, item) => {
  if (!element) {
    return;
  }

  if (!item) {
    element.hidden = true;
    return;
  }

  element.hidden = false;
  element.innerHTML = `
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(getArticleTitle(item))}">
      <div class="${element.classList.contains("side-feature") ? "side-image" : "grid-image"}"${getImageStyle(item)}></div>
      <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
      ${designFixtureBadgeMarkup(item)}
      <h2>${escapeHtml(getArticleTitle(item))}</h2>
      <p>${escapeHtml(getArticleSummary(item))}</p>
      ${whyMattersMarkup(item)}
      <div class="byline">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}：${escapeHtml(getDisplaySourceName(item))}</div>
    </a>
  `;
};

const homeRowMarkup = (title, href, items) => `
  <section class="region-story-row">
    <a class="region-row-heading" href="${href}">${escapeHtml(title)} <span aria-hidden="true">&gt;</span></a>
    <div class="region-article-grid">
      ${items
        .slice(0, 3)
        .map(
          (item) => `
            <article class="region-article">
              <a href="${getStoryHref(item)}">
                <div class="region-article-image"${getImageStyle(item)}></div>
                ${designFixtureBadgeMarkup(item)}
                <h3>${escapeHtml(getArticleTitle(item))}</h3>
                <p>${escapeHtml(getMetaLine(item))} / ${escapeHtml(getDisplaySourceName(item))}</p>
              </a>
            </article>
          `,
        )
        .join("")}
    </div>
  </section>
`;

const renderHomeRows = (items) => {
  const list = document.querySelector(".region-story-list");

  if (!list) {
    return;
  }

  const aiItems = items.filter((item) => item.vertical === "ai");
  const financeItems = items.filter((item) => item.vertical === "finance");
  const columnItems = items.filter((item) => item.content_type === "column");
  const researchItems = items.filter((item) => item.content_type === "research");

  const rows = [
    [getVerticalLabel("ai"), "./ai.html", aiItems],
    [getVerticalLabel("finance"), "./finance.html", financeItems],
    [getContentTypeLabel("column"), "./latest.html?type=column", columnItems],
    [getContentTypeLabel("research"), "./latest.html?type=research", researchItems],
  ].filter(([, , rowItems]) => rowItems.length);

  list.innerHTML = rows.length
    ? rows.map(([title, href, rowItems]) => homeRowMarkup(title, href, rowItems)).join("")
    : emptyContentMarkup();
};

const renderColumnStrip = (items) => {
  const title = document.querySelector(".popular-strip .column-strip-head h2");
  const controls = document.querySelectorAll(".popular-strip .column-years button");
  const track = document.querySelector(".column-track");
  const featuredItems = items.filter((item) => ["column", "research"].includes(item.content_type));

  if (title) {
    title.textContent = getLocaleCopy({ "zh-Hant": "專欄與調研", "zh-Hans": "专栏与调研", en: "Columns and Research" });
  }

  columnFilterOptions.forEach(({ label, value }, index) => {
    if (controls[index]) {
      controls[index].textContent =
        value === "all"
          ? getLocaleCopy({ "zh-Hant": "全部", "zh-Hans": "全部", en: "All" })
          : value === "research"
            ? getContentTypeLabel("research")
            : value === "finance"
              ? getVerticalLabel("finance")
              : label;
      controls[index].dataset.columnFilter = value;
    }
  });

  if (!track) {
    return;
  }

  if (!featuredItems.length) {
    track.innerHTML = emptyContentMarkup();
    return;
  }

  track.innerHTML = featuredItems
    .map(
      (item, index) => `
        <article class="column-card${index === 2 ? " column-card-featured" : ""}" data-column-filter-values="${escapeHtml(getColumnFilterValues(item))}">
          <a href="${getStoryHref(item)}" aria-label="${escapeHtml(getArticleTitle(item))}">
            <div class="column-card-image"${getImageStyle(item)}></div>
            <div class="column-card-caption">
              ${designFixtureBadgeMarkup(item)}
              <h3>${escapeHtml(getArticleSubcategory(item))}</h3>
              <p>${escapeHtml(getArticleTitle(item))}</p>
              <span>${escapeHtml(getContentTypeLabel(item.content_type))}</span>
            </div>
          </a>
        </article>
      `,
    )
    .join("");

  applyColumnFilter(document.querySelector(".popular-strip .column-years button.active")?.dataset.columnFilter || "all");
};

const renderHomePage = (items) => {
  if (!document.querySelector(".hero-grid")) {
    return;
  }

  const sorted = [...items].sort(byPublishedDesc);
  const lead = sorted.find((item) => item.content_type === "research") || sorted[0];
  const heroItems = sorted.filter((item) => item.id !== lead?.id);
  const gridItems = heroItems.slice(1, 4);

  renderHomeRail(heroItems);
  renderLeadStory(lead);
  renderHeroStory(document.querySelector(".side-feature"), heroItems[0]);
  document
    .querySelector(".signup-card h2")
    ?.replaceChildren(document.createTextNode(getLocaleCopy({ "zh-Hant": "每天整理 AI 與金融新聞摘要。", "zh-Hans": "每天整理 AI 与金融新闻摘要。", en: "Daily AI and finance news summaries." })));
  document.querySelectorAll(".grid-story").forEach((element, index) => {
    renderHeroStory(element, gridItems[index]);
  });
  renderColumnStrip(sorted);
  renderHomeRows(sorted);
};

const getCurrentPage = () => {
  const explicitPage = document.body?.dataset.page;

  if (explicitPage) {
    return explicitPage;
  }

  const filename = window.location.pathname.split("/").pop() || "index.html";
  return filename.replace(".html", "") || "index";
};

const getActiveLanguage = () => normalizeLanguage(document.documentElement.lang || detectDefaultLanguage());

const getLatestProfile = () => {
  const type = new URLSearchParams(window.location.search).get("type");
  return latestPageProfiles[type] || latestPageProfiles.all;
};

const setMetaContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value) {
    element.setAttribute("content", value);
  }
};

const currentShareUrlWithoutPreview = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("preview");
  url.searchParams.delete("lang");
  return url.href;
};

const removeLocaleQueryParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("lang") || !window.history?.replaceState) {
    return;
  }

  url.searchParams.delete("lang");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
};

const applyLatestProfile = (lang = getActiveLanguage()) => {
  if (getCurrentPage() !== "latest") {
    return;
  }

  const profile = getLatestProfile();
  const kicker = document.querySelector(".channel-hero .directory-kicker");
  const title = document.querySelector("#latest-title");
  const description = document.querySelector(".channel-hero-grid > p");

  if (kicker) {
    kicker.textContent = getLocaleCopy(profile.kicker, lang);
  }

  if (title) {
    title.textContent = getLocaleCopy(profile.title, lang);
  }

  if (description) {
    description.textContent = getLocaleCopy(profile.description, lang);
  }

  if (document.body) {
    document.body.dataset.titleZh = getLocaleCopy(profile.titleTag, "zh-Hant");
    document.body.dataset.titleZhHans = getLocaleCopy(profile.titleTag, "zh-Hans");
    document.body.dataset.titleEn = getLocaleCopy(profile.titleTag, "en");
  }

  const titleTag = getLocaleCopy(profile.titleTag, lang);
  const descriptionCopy = getLocaleCopy(profile.description, lang);
  document.title = titleTag;
  setMetaContent('meta[name="description"]', descriptionCopy);
  setMetaContent('meta[property="og:title"]', titleTag);
  setMetaContent('meta[property="og:description"]', descriptionCopy);
  setMetaContent('meta[property="og:url"]', currentShareUrlWithoutPreview());
  setMetaContent('meta[name="twitter:title"]', titleTag);
  setMetaContent('meta[name="twitter:description"]', descriptionCopy);
};

const isChannelFiltered = () => {
  const params = new URLSearchParams(window.location.search);
  const typeFilter = params.get("type");

  return Boolean((typeFilter && contentTypeLabels[typeFilter]) || params.get("subcategory"));
};

const getChannelItems = (items, page) => {
  if (page === "latest") {
    return [...items].sort(byPublishedDesc);
  }

  if (page === "ai") {
    return items.filter((item) => item.vertical === "ai").sort(byPublishedDesc);
  }

  if (page === "finance") {
    return items.filter((item) => item.vertical === "finance").sort(byPublishedDesc);
  }

  if (page === "stocks") {
    return items
      .filter((item) => item.vertical === "finance" && (item.subcategory === "科技股" || (item.tickers?.length && !item.coins?.length)))
      .sort(byPublishedDesc);
  }

  if (page === "crypto") {
    return items.filter((item) => item.vertical === "finance" && (item.subcategory === "加密與穩定幣" || item.coins?.length)).sort(byPublishedDesc);
  }

  return [];
};

const getPageItems = (items, page) => {
  const params = new URLSearchParams(window.location.search);
  const typeFilter = params.get("type");
  const subcategoryFilter = params.get("subcategory");

  return getChannelItems(items, page).filter((item) => {
    if (typeFilter && contentTypeLabels[typeFilter] && item.content_type !== typeFilter) {
      return false;
    }

    if (subcategoryFilter && item.subcategory !== subcategoryFilter) {
      return false;
    }

    return true;
  });
};

const renderChannelLead = (items, hasAnyItems = true) => {
  const container = document.querySelector("[data-channel-lead]");

  if (!container) {
    return false;
  }

  if (!items.length) {
    container.innerHTML = hasAnyItems
      ? `
        <div class="channel-empty">
          <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "沒有符合條件的內容", "zh-Hans": "没有符合条件的内容", en: "No matching content" }))}</h2>
          <p>${escapeHtml(getLocaleCopy({ "zh-Hant": "請換一個子分類或內容型態，或稍後再查看更多內容。", "zh-Hans": "请换一个子分类或内容型态，或稍后再查看更多内容。", en: "Try another subcategory or content type, or check back later." }))}</p>
        </div>
      `
      : emptyContentMarkup();
    return true;
  }

  const lead = items[0];
  const side = items.slice(1, 4);

  container.innerHTML = `
    <article class="channel-lead-main">
      <a href="${getStoryHref(lead)}" aria-label="${escapeHtml(getArticleTitle(lead))}">
        <div class="channel-lead-image" role="img" aria-label="${escapeHtml(getImageAlt(lead))}"${getImageStyle(lead)}></div>
        <div class="story-meta">${escapeHtml(getMetaLine(lead))}</div>
        ${designFixtureBadgeMarkup(lead)}
        <h2>${escapeHtml(getArticleTitle(lead))}</h2>
        <p>${escapeHtml(getArticleSummary(lead))}</p>
        ${designFixtureNoticeMarkup(lead)}
        ${whyMattersMarkup(lead)}
        <div class="byline">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}：${escapeHtml(getDisplaySourceName(lead))} / ${escapeHtml(formatDateTime(lead.published_at))} / ${getReadingMinutes(lead)} ${escapeHtml(getLocaleCopy({ "zh-Hant": "分鐘", "zh-Hans": "分钟", en: "min read" }))}</div>
      </a>
    </article>
    <div class="channel-lead-side">
      ${side
        .map(
          (item) => `
            <article class="channel-lead-side-item">
              <a href="${getStoryHref(item)}">
                <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
                ${designFixtureBadgeMarkup(item)}
                <h3>${escapeHtml(getArticleTitle(item))}</h3>
                <div class="byline">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}：${escapeHtml(getDisplaySourceName(item))} / ${escapeHtml(formatDateTime(item.published_at))}</div>
              </a>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
  return true;
};

const renderChannelRows = (channelItems, page) => {
  const container = document.querySelector("[data-channel-rows]");

  if (!container) {
    return false;
  }

  let rows;

  if (page === "latest") {
    rows = [
      [getVerticalLabel("ai"), "./ai.html", channelItems.filter((item) => item.vertical === "ai")],
      [getVerticalLabel("finance"), "./finance.html", channelItems.filter((item) => item.vertical === "finance")],
    ];
  } else {
    rows = ["news", "column", "research"].map((type) => [
      getContentTypeLabel(type),
      `./${page}.html?type=${type}`,
      channelItems.filter((item) => item.content_type === type),
    ]);
  }

  const markup = rows
    .filter(([, , rowItems]) => rowItems.length)
    .map(([title, href, rowItems]) => homeRowMarkup(title, href, rowItems))
    .join("");

  container.innerHTML = markup ? `<div class="region-story-list">${markup}</div>` : "";
  return Boolean(markup);
};

const channelLedgerMarkup = (item) => `
  <article class="channel-ledger-item">
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(getArticleTitle(item))}">
      <div class="channel-ledger-thumb"${getImageStyle(item)}></div>
      <div class="channel-ledger-body">
        <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
        ${designFixtureBadgeMarkup(item)}
        <h3>${escapeHtml(getArticleTitle(item))}</h3>
        <p>${escapeHtml(getArticleSummary(item))}</p>
        <div class="byline">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}：${escapeHtml(getDisplaySourceName(item))} / ${escapeHtml(formatDateTime(item.published_at))} / ${getReadingMinutes(item)} ${escapeHtml(getLocaleCopy({ "zh-Hant": "分鐘", "zh-Hans": "分钟", en: "min read" }))}</div>
      </div>
    </a>
  </article>
`;

const syncDirectoryChips = () => {
  const params = new URLSearchParams(window.location.search);
  const typeFilter = params.get("type") || "";
  const subcategoryFilter = params.get("subcategory") || "";
  const chips = document.querySelectorAll(".directory-hero .directory-actions a, .channel-hero .directory-actions a");

  chips.forEach((chip) => {
    const target = new URL(chip.getAttribute("href"), window.location.href);
    const samePage = target.pathname === window.location.pathname;
    const chipType = target.searchParams.get("type") || "";
    const chipSubcategory = target.searchParams.get("subcategory") || "";
    chip.classList.toggle("active", samePage && chipType === typeFilter && chipSubcategory === subcategoryFilter);
  });
};

const renderDirectoryPage = (items) => {
  const page = getCurrentPage();

  if (!["latest", "ai", "finance", "stocks", "crypto"].includes(page)) {
    return;
  }

  const pageItems = getPageItems(items, page);

  syncDirectoryChips();
  applyLatestProfile();

  if (renderChannelLead(pageItems, items.length > 0)) {
    const rowsShown = !isChannelFiltered() && renderChannelRows(getChannelItems(items, page), page);
    const moreSection = document.querySelector("[data-channel-more]");
    const feed = document.querySelector(".directory-feed");
    const feedItems = pageItems.slice(4);

    if (!items.length) {
      if (moreSection) {
        moreSection.hidden = true;
      }
      return;
    }

    if (moreSection) {
      moreSection.hidden = Boolean(rowsShown);
    }

    if (feed && !rowsShown) {
      feed.innerHTML = feedItems.length
        ? feedItems.map(channelLedgerMarkup).join("")
        : items.length
          ? `<p class="directory-feed-note">${escapeHtml(getLocaleCopy({ "zh-Hant": "以上就是目前符合條件的全部內容。", "zh-Hans": "以上就是目前符合条件的全部内容。", en: "That's all the matching content for now." }))}</p>`
          : emptyContentMarkup();
    }
    return;
  }

  renderDirectoryCards(pageItems, ".directory-grid");
  renderDirectoryFeed(pageItems);
};

const normalizeForSearch = (value) => String(value ?? "").toLocaleLowerCase();

const itemMatchesQuery = (item, query) => {
  if (!query) {
    return true;
  }

  const haystack = [
    getArticleTitle(item, "zh-Hant"),
    getArticleTitle(item, "zh-Hans"),
    getArticleTitle(item, "en"),
    item.title_original,
    getArticleSummary(item, "zh-Hant"),
    getArticleSummary(item, "zh-Hans"),
    getArticleSummary(item, "en"),
    item.vertical,
    item.content_type,
    item.subcategory,
    getArticleSubcategory(item, "zh-Hant"),
    getArticleSubcategory(item, "zh-Hans"),
    getArticleSubcategory(item, "en"),
    getDisplaySourceName(item),
    item.language,
    item.region,
    ...(item.companies || []),
    ...(item.tickers || []),
    ...(item.coins || []),
    ...(item.topics || []),
    ...(item.authors || []),
  ]
    .map(normalizeForSearch)
    .join(" ");

  return haystack.includes(normalizeForSearch(query));
};

const getArchiveFilteredItems = (items, form) => {
  const data = new FormData(form);
  const dateFrom = data.get("date_from");
  const dateTo = data.get("date_to");
  const vertical = data.get("vertical");
  const contentType = data.get("content_type");
  const subcategory = data.get("subcategory");
  const sourceName = data.get("source_name");
  const language = data.get("language");
  const query = data.get("query");

  return items
    .filter((item) => {
      const itemDate = item.published_at.slice(0, 10);

      if (dateFrom && itemDate < dateFrom) {
        return false;
      }

      if (dateTo && itemDate > dateTo) {
        return false;
      }

      if (vertical && item.vertical !== vertical) {
        return false;
      }

      if (contentType && item.content_type !== contentType) {
        return false;
      }

      if (subcategory && item.subcategory !== subcategory) {
        return false;
      }

      if (sourceName && getDisplaySourceName(item) !== sourceName) {
        return false;
      }

      if (language && item.language !== language) {
        return false;
      }

      return itemMatchesQuery(item, query);
    })
    .sort(byPublishedDesc);
};

const getArchiveActiveFilters = (form) =>
  ["date_from", "date_to", "vertical", "content_type", "subcategory", "source_name", "language", "query"]
    .map((fieldName) => {
      const field = form.elements[fieldName];
      if (!field || !field.value) {
        return null;
      }

      const value = field.tagName === "SELECT" ? getSelectedOptionText(field) : field.value;
      return {
        label: getLocaleCopy({ "zh-Hant": archiveSummaryLabels[fieldName] || fieldName, "zh-Hans": toSimplifiedChinese(archiveSummaryLabels[fieldName] || fieldName), en: fieldName.replace("_", " ") }),
        value,
      };
    })
    .filter(Boolean);

const ensureArchiveSummary = (results) => {
  let summary = document.querySelector("[data-archive-summary]");

  if (!summary) {
    summary = document.createElement("div");
    summary.className = "archive-summary";
    summary.dataset.archiveSummary = "";
    results.before(summary);
  }

  return summary;
};

const renderArchiveSummary = (items, form, results) => {
  const summary = ensureArchiveSummary(results);
  const activeFilters = getArchiveActiveFilters(form);
  const filterMarkup = activeFilters.length
    ? `<div class="archive-summary-chips">${activeFilters
        .map((filter) => `<span class="archive-summary-chip">${escapeHtml(filter.label)}：${escapeHtml(filter.value)}</span>`)
        .join("")}</div>`
    : `<p class="archive-summary-empty">${escapeHtml(getLocaleCopy({ "zh-Hant": "目前顯示全部內容。", "zh-Hans": "目前显示全部内容。", en: "Showing all content." }))}</p>`;

  summary.innerHTML = `
    <div class="archive-summary-count">${items.length} ${escapeHtml(getLocaleCopy({ "zh-Hant": "筆結果", "zh-Hans": "笔结果", en: "results" }))}</div>
    ${filterMarkup}
  `;
};

const ensureArchiveFilterToggle = (form) => {
  let toggle = document.querySelector("[data-archive-filter-toggle]");

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.className = "archive-filter-toggle";
    toggle.type = "button";
    toggle.dataset.archiveFilterToggle = "";
    form.before(toggle);
  }

  return toggle;
};

const updateArchiveFilterToggle = (form) => {
  const toggle = document.querySelector("[data-archive-filter-toggle]");

  if (!toggle) {
    return;
  }

  const activeCount = getArchiveActiveFilters(form).length;
  const isExpanded = form.classList.contains("is-expanded");

  toggle.setAttribute("aria-expanded", String(isExpanded));
  toggle.innerHTML = `<span>${escapeHtml(getLocaleCopy({ "zh-Hant": "篩選", "zh-Hans": "筛选", en: "Filters" }))}${activeCount ? ` (${activeCount})` : ""}</span><span aria-hidden="true">${escapeHtml(isExpanded ? getLocaleCopy({ "zh-Hant": "收合", "zh-Hans": "收合", en: "Collapse" }) : getLocaleCopy({ "zh-Hant": "展開", "zh-Hans": "展开", en: "Expand" }))}</span>`;
};

const syncArchiveUrl = (form) => {
  if (!window.history?.replaceState) {
    return;
  }

  const params = new URLSearchParams();

  ["date_from", "date_to", "vertical", "content_type", "subcategory", "source_name", "language", "query"].forEach((fieldName) => {
    const field = form.elements[fieldName];

    if (!field?.value) {
      return;
    }

    params.set(archiveUrlAliases[fieldName] || fieldName, field.value);
  });

  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
};

const populateArchiveOptions = (form, items) => {
  form.querySelectorAll("[data-archive-options]").forEach((select) => {
    const field = select.dataset.archiveOptions;
    const valueToLabel = (item) => {
      if (field === "source_name") {
        return [getDisplaySourceName(item), getDisplaySourceName(item)];
      }
      if (field === "vertical") {
        return [item.vertical, getVerticalLabel(item.vertical)];
      }
      if (field === "content_type") {
        return [item.content_type, getContentTypeLabel(item.content_type)];
      }
      if (field === "subcategory") {
        return [item.subcategory, getArticleSubcategory(item)];
      }
      return [item[field], item[field]];
    };
    const values = [...new Map(items.map(valueToLabel).filter(([value]) => Boolean(value))).entries()].sort((a, b) =>
      String(a[1]).localeCompare(String(b[1]), localeIntlMap[getActiveLanguage()] || "en-US"),
    );

    select.innerHTML = `<option value="">${escapeHtml(getLocaleCopy({ "zh-Hant": "全部", "zh-Hans": "全部", en: "All" }))}</option>${values
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("")}`;
  });
};

const renderArchiveRows = (items, container) => {
  const header = `
    <div class="directory-table-row header">
      <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "標題", "zh-Hans": "标题", en: "Title" }))}</span>
      <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "主頻道 / 型態", "zh-Hans": "主频道 / 型态", en: "Vertical / Type" }))}</span>
      <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" }))}</span>
      <span>Metadata</span>
    </div>
  `;

  if (!items.length) {
    container.innerHTML = `${header}<article class="directory-table-row"><div><h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "沒有符合條件的內容", "zh-Hans": "没有符合条件的内容", en: "No matching content" }))}</h2><p>${escapeHtml(getLocaleCopy({ "zh-Hant": "請放寬日期、分類或關鍵字。", "zh-Hans": "请放宽日期、分类或关键字。", en: "Loosen the date, category, or keyword filter." }))}</p></div><p></p><p></p><p></p></article>`;
    return;
  }

  container.innerHTML = `${header}${items
    .map(
      (item) => `
        <article class="directory-table-row">
          <div>
            <h2><a href="${getStoryHref(item)}">${escapeHtml(getArticleTitle(item))}</a></h2>
            <p>${escapeHtml(formatDate(item.published_at))} / ${escapeHtml(formatDateTime(item.published_at))}</p>
          </div>
          <p>${escapeHtml(getVerticalLabel(item.vertical))} / ${escapeHtml(getContentTypeLabel(item.content_type))}<br />${escapeHtml(getArticleSubcategory(item))}</p>
          <p>${escapeHtml(getDisplaySourceName(item))}<br />${escapeHtml(item.language)} / ${escapeHtml(getLocalizedSourceProfile(item).region || item.region)}</p>
          <p>${escapeHtml(getMetadata(item).join(" / ") || "No symbols")}</p>
        </article>
      `,
    )
    .join("")}`;
};

const applyArchiveQueryParams = (form) => {
  const params = new URLSearchParams(window.location.search);
  const aliases = {
    type: "content_type",
  };

  params.forEach((value, key) => {
    const fieldName = aliases[key] || key;
    const field = form.elements[fieldName];

    if (field) {
      field.value = value;
    }
  });
};

const renderArchivePage = (items) => {
  const form = document.querySelector("[data-archive-controls]");
  const results = document.querySelector("[data-archive-results]");
  const params = new URLSearchParams(window.location.search);
  const shouldFocusSearch = params.get("focus") === "query";

  if (!form || !results) {
    return;
  }

  const syncResults = () => {
    const filteredItems = getArchiveFilteredItems(items, form);
    renderArchiveRows(filteredItems, results);
    renderArchiveSummary(filteredItems, form, results);
    updateArchiveFilterToggle(form);
    syncArchiveUrl(form);
  };

  populateArchiveOptions(form, items);
  applyArchiveQueryParams(form);

  const activeFilters = getArchiveActiveFilters(form);
  const hasExpandedFilter = activeFilters.some((filter) => filter.label !== archiveSummaryLabels.query);
  form.classList.toggle("is-expanded", hasExpandedFilter);

  if (new URLSearchParams(window.location.search).get("focus") === "query") {
    form.elements.query?.focus();
  }
  syncResults();
  form.addEventListener("input", syncResults);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncResults();
  });
  form.addEventListener("reset", () => {
    window.setTimeout(syncResults, 0);
  });

  if (shouldFocusSearch) {
    const queryField = form.elements.query;
    window.setTimeout(() => {
      queryField?.scrollIntoView({ block: "center" });
      queryField?.focus();
    }, 80);
  }
};

const getReadableUrlHost = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value || "source";
  }
};

const joinList = (values) => (values || []).filter(Boolean).join(" / ");

const getDetailArchiveHref = (item) => `./${item.vertical === "ai" ? "ai" : "finance"}.html?type=${encodeURIComponent(item.content_type)}`;

const detailDefinitionMarkup = (label, value) => `
  <div>
    <dt>${escapeHtml(label)}</dt>
    <dd>${value ? escapeHtml(value) : escapeHtml(getLocaleCopy({ "zh-Hant": "未提供", "zh-Hans": "未提供", en: "Not provided" }))}</dd>
  </div>
`;

const countOverlap = (a, b) => (a || []).filter((value) => (b || []).includes(value)).length;

const countTopicOverlap = (a, b) => {
  const normalized = new Set((b || []).map((value) => String(value).toLocaleLowerCase()));
  return (a || []).filter((value) => normalized.has(String(value).toLocaleLowerCase())).length;
};

const scoreRelated = (candidate, currentItem) => {
  let score = 0;

  if (candidate.vertical === currentItem.vertical) {
    score += 1;
  }

  if (candidate.subcategory === currentItem.subcategory) {
    score += 3;
  }

  score += countOverlap(candidate.topics, currentItem.topics) * 2;
  score += countOverlap(candidate.tickers, currentItem.tickers) * 2;
  score += countOverlap(candidate.coins, currentItem.coins) * 2;
  score += countOverlap(candidate.companies, currentItem.companies);

  return score;
};

const getRelatedItems = (items, currentItem, limit = 3) => {
  return items
    .filter((item) => item.id !== currentItem.id)
    .map((item) => ({ item, score: scoreRelated(item, currentItem) }))
    .sort((a, b) => b.score - a.score || byPublishedDesc(a.item, b.item))
    .slice(0, limit)
    .map((entry) => entry.item);
};

const getTopicMatches = (items, topic) => {
  const match = topic.match || {};

  return [...items]
    .filter(
      (item) =>
        (match.subcategories || []).includes(item.subcategory) ||
        countOverlap(match.tickers, item.tickers) ||
        countOverlap(match.coins, item.coins) ||
        countTopicOverlap(match.topics, item.topics),
    )
    .sort(byPublishedDesc);
};

const renderTopicsPage = (items, topics = []) => {
  const container = document.querySelector("[data-topics-grid]");

  if (!container || !topics.length) {
    return;
  }

  container.innerHTML = topics
    .map((topic) => {
      const matches = getTopicMatches(items, topic);
      const latest = matches[0];
      const updated = latest ? formatDate(latest.published_at) : getLocaleCopy({ "zh-Hant": "尚未更新", "zh-Hans": "尚未更新", en: "Not updated" });
      const tags = topic.tags?.length ? topic.tags : [topic.slug];
      const title = getLocaleCopy({
        "zh-Hant": topic.title_zh,
        "zh-Hans": topic.title_zh_hans || toSimplifiedChinese(topic.title_zh),
        en: topic.title_en || topic.title_zh,
      });
      const description = getLocaleCopy({
        "zh-Hant": topic.description_zh,
        "zh-Hans": topic.description_zh_hans || toSimplifiedChinese(topic.description_zh),
        en: topic.description_en || topic.description_zh,
      });

      return `
        <article class="directory-card">
          <a href="${escapeHtml(topic.href || "./topics.html")}" aria-label="${escapeHtml(title)}">
            <div class="directory-card-image ${escapeHtml(topic.image_class || "column-image-one")}"></div>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
            <p class="directory-card-note">${matches.length} ${escapeHtml(getLocaleCopy({ "zh-Hant": "則追蹤", "zh-Hans": "则追踪", en: "tracked items" }))} · ${escapeHtml(getLocaleCopy({ "zh-Hant": "最後更新", "zh-Hans": "最后更新", en: "Last updated" }))} ${escapeHtml(updated)}</p>
          </a>
          <div class="directory-card-foot">
            ${tags.map((tag) => `<span class="directory-mini-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
};

const renderNewsletterPage = (items) => {
  const container = document.querySelector("[data-newsletter-sample]");

  if (!container) {
    return;
  }

  const sampleItems = [...items]
    .sort((a, b) => Number(Boolean(getArticleWhy(b))) - Number(Boolean(getArticleWhy(a))) || byPublishedDesc(a, b))
    .slice(0, 3);

  if (!sampleItems.length) {
    container.innerHTML = `
      <article class="directory-feed-item newsletter-sample-empty">
        <div class="directory-feed-meta">Empty</div>
        <div>
          <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "目前沒有可顯示的簡報範例。", "zh-Hans": "目前没有可显示的简报范例。", en: "No briefing samples are available yet." }))}</h2>
        </div>
        <div class="directory-feed-tags"></div>
      </article>
    `;
    return;
  }

  container.innerHTML = `
    ${sampleItems
      .map((item, index) => {
        const sourceUrl = getSourceUrl(item);
        const symbols = getSymbols(item);
        const symbolLabel = symbols.length ? symbols.slice(0, 3).join(" / ") : getDisplaySourceName(item);
        const itemDate = formatDate(item.published_at);
        const whySeparator = getActiveLanguage() === "en" ? ": " : "：";

        return `
          <article class="directory-feed-item newsletter-sample-item">
            <div class="directory-feed-meta">
              ${index === 0 ? "CYBERNEWS Brief" : `Brief ${String(index + 1).padStart(2, "0")}`}
              ${itemDate ? `<time datetime="${escapeHtml(item.published_at)}">${escapeHtml(itemDate)}</time>` : ""}
            </div>
            <div>
              ${designFixtureBadgeMarkup(item)}
              <h2><a href="${getStoryHref(item)}">${escapeHtml(getArticleTitle(item))}</a></h2>
              <p><strong>${escapeHtml(getLocaleCopy({ "zh-Hant": "為什麼重要", "zh-Hans": "为什么重要", en: "Why it matters" }))}${whySeparator}</strong>${escapeHtml(getArticleWhy(item) || getArticleSummary(item))}</p>
            </div>
            <div class="directory-feed-tags">
              <span>${escapeHtml(getArticleSubcategory(item))}</span>
              <span>${escapeHtml(symbolLabel)}</span>
              ${sourceUrl ? `<a class="directory-mini-tag newsletter-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(getLocaleCopy({ "zh-Hant": "原文 ↗", "zh-Hans": "原文 ↗", en: "Original ↗" }))}</a>` : ""}
            </div>
          </article>
        `;
      })
      .join("")}
  `;
};

const articleRelatedMarkup = (items, currentItem) => {
  const relatedItems = getRelatedItems(items, currentItem);

  if (!relatedItems.length) {
    return "";
  }

  return `
    <section class="article-related" aria-label="Recommended articles">
      <div class="article-related-head">
        <span>Related</span>
        <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "延伸閱讀", "zh-Hans": "延伸阅读", en: "Related Reads" }))}</h2>
      </div>
      <div class="article-related-grid">
        ${relatedItems
          .map(
            (item) => `
              <article class="article-related-card">
                <a href="${getStoryHref(item)}" aria-label="${escapeHtml(getArticleTitle(item))}">
                  <div class="article-related-image" role="img" aria-label="${escapeHtml(getImageAlt(item))}"${getImageStyle(item)}></div>
                  <h3>${escapeHtml(getArticleTitle(item))}</h3>
                  <p>${escapeHtml(getArticleSummary(item))}</p>
                  <div class="article-related-tags" aria-label="Story metadata">
                    <span>${escapeHtml(getArticleSubcategory(item))}</span>
                    <span>${escapeHtml(getDisplaySourceName(item)).toUpperCase()}</span>
                  </div>
                </a>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
};

const articleBodyMarkup = (item) => {
  const paragraphs = getArticleBody(item);
  const body = paragraphs.length
    ? paragraphs
    : [
        getLocaleCopy({
          "zh-Hant": `${getArticleSummary(item)} 這篇內容目前只有摘要資料，後續可由編輯補上完整整理稿。`,
          "zh-Hans": `${getArticleSummary(item)} 这篇内容目前只有摘要资料，后续可由编辑补上完整整理稿。`,
          en: `${getArticleSummary(item)} This item currently has summary data only; editors can add the full digest later.`,
        }),
        getLocaleCopy({
          "zh-Hant": "CYBERNEWS 會保留主頻道、內容型態、來源、原文連結與 metadata，方便讀者回到原始來源確認完整脈絡。",
          "zh-Hans": "CYBERNEWS 会保留主频道、内容型态、来源、原文链接与 metadata，方便读者回到原始来源确认完整脉络。",
          en: "CYBERNEWS keeps the vertical, content type, source, original link, and metadata so readers can verify the full context at the original source.",
        }),
      ];

  return `
    <section class="article-body-copy" aria-label="Article body">
      <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "內文整理", "zh-Hans": "内文整理", en: "Article Digest" }))}</span>
      ${body.map((paragraph, index) => `<p class="${index === 0 ? "article-drop" : ""}">${escapeHtml(paragraph)}</p>`).join("")}
    </section>
  `;
};

const researchExtraMarkup = (item) => {
  if (item.content_type !== "research") {
    return "";
  }

  const symbols = getMetadata(item).join(" / ");
  const sourceUrl = getSourceUrl(item);

  return `
    <section class="research-panel" aria-label="Research details">
      <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "核心問題", "zh-Hans": "核心问题", en: "Core Question" }))}</h2>
      <p>${escapeHtml(getLocaleCopy({
        "zh-Hant": `這份調研聚焦「${getArticleSubcategory(item)}」如何影響 ${getVerticalLabel(item.vertical)} 的產業、市場與資料追蹤方式。`,
        "zh-Hans": `这份调研聚焦「${getArticleSubcategory(item)}」如何影响 ${getVerticalLabel(item.vertical)} 的产业、市场与资料追踪方式。`,
        en: `This research focuses on how ${getArticleSubcategory(item)} changes the industry, market, and data-tracking context for ${getVerticalLabel(item.vertical)}.`,
      }))}</p>
      <div class="research-panel-grid">
        <div>
          <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "主要資料來源", "zh-Hans": "主要资料来源", en: "Primary Sources" }))}</span>
          <p>${escapeHtml(getDisplaySourceName(item))}${sourceUrl ? ` / ${escapeHtml(getReadableUrlHost(sourceUrl))}` : ""}</p>
        </div>
        <div>
          <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "追蹤 metadata", "zh-Hans": "追踪 metadata", en: "Tracking metadata" }))}</span>
          <p>${escapeHtml(symbols || joinList(item.topics) || getArticleSubcategory(item))}</p>
        </div>
        <div>
          <span>${escapeHtml(getLocaleCopy({ "zh-Hant": "調研屬性", "zh-Hans": "调研属性", en: "Research Type" }))}</span>
          <p>${escapeHtml(item.is_original_research ? getLocaleCopy({ "zh-Hant": "CYBERNEWS 原創整理", "zh-Hans": "CYBERNEWS 原创整理", en: "CYBERNEWS original synthesis" }) : getLocaleCopy({ "zh-Hant": "多來源摘要整理", "zh-Hans": "多来源摘要整理", en: "Multi-source summary" }))}</p>
        </div>
      </div>
    </section>
  `;
};

const disclaimerMarkup = (item) => {
  if (!item.disclaimer_required && item.content_type !== "research") {
    return "";
  }

  return `
    <section class="article-disclaimer" aria-label="Disclaimer">
      <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "免責說明", "zh-Hans": "免责声明", en: "Disclaimer" }))}</h2>
      <p>${escapeHtml(getLocaleCopy({
        "zh-Hant": "本文只整理公開來源、摘要與 metadata，不構成投資建議、價格預測、買賣訊號或法律意見。股票代號與幣種代號僅供查找與分類。",
        "zh-Hans": "本文只整理公开来源、摘要与 metadata，不构成投资建议、价格预测、买卖信号或法律意见。股票代号与币种代号仅供查找与分类。",
        en: "This page summarizes public sources and metadata only. It is not investment advice, price prediction, trading signal, or legal advice. Tickers and crypto symbols are for lookup and categorization.",
      }))}</p>
    </section>
  `;
};

const renderDetailPage = (items) => {
  const shell = document.querySelector("[data-detail-shell]");
  const detailPage = document.querySelector("[data-detail-page]");

  if (!shell || !detailPage) {
    return;
  }

  const pageType = detailPage.dataset.detailPage;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const preferredItems = pageType === "research" ? items.filter((item) => item.content_type === "research") : items.filter((item) => item.content_type !== "research");
  const requestedItem = requestedId ? items.find((entry) => entry.id === requestedId) : null;

  if (!isUsingDesignFixtures() && requestedItem && (requestedItem.content_type === "research") !== (pageType === "research")) {
    window.location.replace(getStoryHref(requestedItem));
    return;
  }

  const item = requestedItem || (!requestedId && (preferredItems[0] || items[0])) || null;

  if (!item) {
    shell.innerHTML = `
      <header class="article-hero">
        <div class="article-heading">
          <h1>${escapeHtml(getLocaleCopy({ "zh-Hant": "找不到內容", "zh-Hans": "找不到内容", en: "Content not found" }))}</h1>
          <p class="article-dek">${escapeHtml(getLocaleCopy({ "zh-Hant": "請回到首頁重新選擇一篇內容。", "zh-Hans": "请回到首页重新选择一篇内容。", en: "Please return home and pick another story." }))}</p>
          <div class="article-cta-row">
            <a class="directory-action" href="./index.html">${escapeHtml(getLocaleCopy({ "zh-Hant": "回到首頁", "zh-Hans": "回到首页", en: "Back Home" }))}</a>
          </div>
        </div>
      </header>
    `;
    return;
  }

  const sourceUrl = getSourceUrl(item);
  const articleTitle = getArticleTitle(item);
  const articleSummary = getArticleSummary(item);
  const detailLabelSeparator = getActiveLanguage() === "en" ? ": " : "：";
  const originalTitle = item.title_original || articleTitle;
  const sourceTitleMarkup = sourceUrl
    ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer" data-no-translate>${escapeHtml(originalTitle)}</a>`
    : `<span data-no-translate>${escapeHtml(originalTitle)}</span>`;
  const sourceActionMarkup = sourceUrl
    ? `<a class="directory-action" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(getLocaleCopy({ "zh-Hant": "閱讀原文", "zh-Hans": "阅读原文", en: "Read original" }))}</a>`
    : `<span class="directory-chip">${escapeHtml(getLocaleCopy({ "zh-Hant": "來源待補", "zh-Hans": "来源待补", en: "Source pending" }))}</span>`;
  const metadata = getMetadata(item);
  const publishedAt = formatDateTime(item.published_at);
  const readingMinutes = getReadingMinutes(item);
  const breadcrumb = document.querySelector(".article-breadcrumb");
  const metaDescription = document.querySelector('meta[name="description"]');

  document.body.dataset.titleZh = `${getArticleTitle(item, "zh-Hant")} - CYBERNEWS`;
  document.body.dataset.titleZhHans = `${getArticleTitle(item, "zh-Hans")} - CYBERNEWS`;
  document.body.dataset.titleEn = `${getArticleTitle(item, "en")} - CYBERNEWS`;
  document.title = `${articleTitle} - CYBERNEWS`;

  if (metaDescription) {
    metaDescription.setAttribute("content", articleSummary);
  }
  setMetaContent('meta[property="og:title"]', articleTitle);
  setMetaContent('meta[property="og:description"]', articleSummary);
  setMetaContent('meta[name="twitter:title"]', articleTitle);
  setMetaContent('meta[name="twitter:description"]', articleSummary);

  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="./index.html">CYBERNEWS</a>
      <span aria-hidden="true">/</span>
      <a href="${item.vertical === "ai" ? "./ai.html" : "./finance.html"}">${escapeHtml(getVerticalLabel(item.vertical))}</a>
      <span aria-hidden="true">/</span>
      <a href="${getDetailArchiveHref(item)}">${escapeHtml(getContentTypeLabel(item.content_type))}</a>
      <span aria-hidden="true">/</span>
      <span>${escapeHtml(getArticleSubcategory(item))}</span>
    `;
  }

  shell.innerHTML = `
    <header class="article-hero">
      <div class="article-hero-grid">
        <div class="article-heading">
          <div class="article-meta-line" aria-label="Article metadata">
            <span>${escapeHtml(getVerticalLabel(item.vertical))} / ${escapeHtml(getContentTypeLabel(item.content_type))}</span>
            <span>${escapeHtml(getArticleSubcategory(item))}</span>
            <span>${escapeHtml(getDisplaySourceName(item))}</span>
            ${publishedAt ? `<time datetime="${escapeHtml(item.published_at)}">${escapeHtml(publishedAt)}</time>` : ""}
            <span>${readingMinutes} ${escapeHtml(getLocaleCopy({ "zh-Hant": "分鐘閱讀", "zh-Hans": "分钟阅读", en: "min read" }))}</span>
          </div>
          ${designFixtureBadgeMarkup(item)}
          <h1>${escapeHtml(articleTitle)}</h1>
          <p class="article-dek">${escapeHtml(articleSummary)}</p>
          ${designFixtureNoticeMarkup(item)}
          ${whyMattersMarkup(item)}
          <p class="article-original-title">${escapeHtml(getLocaleCopy({ "zh-Hant": "原文標題", "zh-Hans": "原文标题", en: "Original" }))}: ${escapeHtml(originalTitle)}</p>
        </div>
      </div>
    </header>

    <figure class="article-visual">
      <div class="article-visual-inner">
        <div class="article-hero-image" role="img" aria-label="${escapeHtml(getImageAlt(item))}"${getImageStyle(item)}></div>
        <figcaption>${escapeHtml(getLocaleCopy({
          "zh-Hant": "影像用於主題示意；內文為 CYBERNEWS 整理稿，完整內容請回到原文來源。",
          "zh-Hans": "影像用于主题示意；内文为 CYBERNEWS 整理稿，完整内容请回到原文来源。",
          en: "Image for topic context. CYBERNEWS provides a digest; read the original source for full context.",
        }))}</figcaption>
      </div>
    </figure>

    <div class="article-body-shell">
      <div class="article-content">
        <section class="article-keypoints" aria-label="Summary">
          <h2>${escapeHtml(getLocaleCopy({ "zh-Hant": "摘要", "zh-Hans": "摘要", en: "Summary" }))}</h2>
          <ul>
            <li>${escapeHtml(articleSummary)}</li>
            ${getArticleWhy(item) ? `<li>${escapeHtml(getLocaleCopy({ "zh-Hant": "為什麼重要", "zh-Hans": "为什么重要", en: "Why it matters" }))}${detailLabelSeparator}${escapeHtml(getArticleWhy(item))}</li>` : ""}
            ${designFixtureKeypointMarkup(item)}
            <li>${escapeHtml(getLocaleCopy({
              "zh-Hant": "本頁只保存摘要、分類、來源與原文連結，不重刊全文，也不繞過 paywall。",
              "zh-Hans": "本页只保存摘要、分类、来源与原文链接，不重刊全文，也不绕过 paywall。",
              en: "This page keeps the summary, taxonomy, source, and original link only. It does not republish the full article or bypass paywalls.",
            }))}</li>
            <li>${metadata.length ? `${escapeHtml(metadata.join(" / "))} ${escapeHtml(getLocaleCopy({ "zh-Hant": "僅作為 metadata 與查找線索。", "zh-Hans": "仅作为 metadata 与查找线索。", en: "is metadata for lookup only." }))}` : escapeHtml(getLocaleCopy({ "zh-Hant": "未附股票或幣種代號。", "zh-Hans": "未附股票或币种代号。", en: "No ticker or crypto symbol attached." }))}</li>
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
                <span class="article-source-meta">· ${escapeHtml(getDisplaySourceName(item))} · ${escapeHtml(formatDate(item.published_at))}</span>
              </p>
              <p class="article-source-desc">${escapeHtml(articleSummary)}</p>
            </li>
          </ul>
          <div class="article-cta-row">
            ${sourceActionMarkup}
            <a class="directory-chip" href="./topics.html">${escapeHtml(getLocaleCopy({ "zh-Hant": "加入專題追蹤", "zh-Hans": "加入专题追踪", en: "Follow this topic" }))}</a>
            <a class="directory-chip" href="${getDetailArchiveHref(item)}">${escapeHtml(getLocaleCopy({ "zh-Hant": "更多同類內容", "zh-Hans": "更多同类内容", en: "More like this" }))}</a>
          </div>
        </section>

        ${disclaimerMarkup(item)}

        <footer class="article-info-footer" aria-label="Article metadata">
          <span class="article-info-label">Metadata</span>
          <dl class="article-info-list">
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "主頻道", "zh-Hans": "主频道", en: "Vertical" }), getVerticalLabel(item.vertical))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "內容型態", "zh-Hans": "内容型态", en: "Content Type" }), getContentTypeLabel(item.content_type))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "子分類", "zh-Hans": "子分类", en: "Subcategory" }), getArticleSubcategory(item))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "發布時間", "zh-Hans": "发布时间", en: "Published" }), formatDateTime(item.published_at))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "抓取時間", "zh-Hans": "抓取时间", en: "Fetched" }), formatDateTime(item.fetched_at))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "語言 / 地區", "zh-Hans": "语言 / 地区", en: "Language / Region" }), `${item.language} / ${getLocalizedSourceProfile(item).region || item.region}`)}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "作者", "zh-Hans": "作者", en: "Authors" }), joinList(item.authors))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "公司", "zh-Hans": "公司", en: "Companies" }), joinList(item.companies))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "股票代號", "zh-Hans": "股票代号", en: "Tickers" }), joinList(item.tickers))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "幣種代號", "zh-Hans": "币种代号", en: "Coins" }), joinList(item.coins))}
            ${detailDefinitionMarkup("Topics", joinList(item.topics))}
            ${detailDefinitionMarkup(getLocaleCopy({ "zh-Hant": "資料屬性", "zh-Hans": "资料属性", en: "Data Type" }), item.is_original_research ? getLocaleCopy({ "zh-Hant": "原創調研", "zh-Hans": "原创调研", en: "Original research" }) : getLocaleCopy({ "zh-Hant": "新聞摘要", "zh-Hans": "新闻摘要", en: "News summary" }))}
          </dl>
        </footer>
      </div>
    </div>

    ${articleRelatedMarkup(items, item)}
  `;
};

const initializeNewsData = async () => {
  try {
    activeNewsDataMode = isDesignPreviewMode() ? "design-preview" : "production";
    applyDesignPreviewMeta();
    injectDesignPreviewNotice();

    const loadNewsItems = async (filename) => {
      const response = await fetch(dataAssetUrl(filename), { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Unable to load ${filename}: ${response.status}`);
      }

      return response.json();
    };

    let items;

    if (isDesignPreviewMode()) {
      items = await loadNewsItems("design-preview-news.json");
    } else {
      const [productionItems, fixtureItems] = await Promise.all([
        loadNewsItems("news.json"),
        loadNewsItems("design-preview-news.json").catch(() => []),
      ]);

      items = productionItems;

      if (Array.isArray(productionItems) && productionItems.length === 0 && Array.isArray(fixtureItems) && fixtureItems.length) {
        activeNewsDataMode = "design-fallback";
        items = fixtureItems;
        applyDesignPreviewMeta();
        injectDesignPreviewNotice();
      }
    }

    const topicsResponse = await fetch(dataAssetUrl("topics.json"), { cache: "no-store" }).catch(() => null);
    const topics = topicsResponse?.ok ? await topicsResponse.json() : [];

    currentNewsItems = Array.isArray(items) ? items : [];
    currentTopics = Array.isArray(topics) ? topics : [];
    renderSiteContent();
    preserveDesignPreviewNavigation();
    syncCurrentNavigation();
  } catch (error) {
    console.warn(error);
  }
};

const renderSiteContent = () => {
  renderHomePage(currentNewsItems);
  renderDirectoryPage(currentNewsItems);
  renderArchivePage(currentNewsItems);
  renderTopicsPage(currentNewsItems, currentTopics);
  renderDetailPage(currentNewsItems);
  renderNewsletterPage(currentNewsItems);
};

const getTranslatedText = (text, lang) => textMaps[lang]?.get(text) || text;

function translateTextNode(node, lang) {
  const value = node.nodeValue;
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  const translated = getTranslatedText(trimmed, lang);
  if (translated !== trimmed) {
    node.nodeValue = value.replace(trimmed, translated);
  }
}

function translateAnnotatedContent(lang) {
  const isEnglish = lang === "en";
  const textKey = isEnglish ? "i18nEn" : "i18nZh";
  const placeholderKey = isEnglish ? "placeholderEn" : "placeholderZh";

  document.querySelectorAll("[data-i18n-zh][data-i18n-en]").forEach((element) => {
    const translated = lang === "zh-Hans" ? toSimplifiedChinese(element.dataset[textKey]) : element.dataset[textKey];
    if (translated) {
      element.textContent = translated;
    }
  });

  document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach((element) => {
    const translated = lang === "zh-Hans" ? toSimplifiedChinese(element.dataset[placeholderKey]) : element.dataset[placeholderKey];
    if (translated) {
      element.setAttribute("placeholder", translated);
    }
  });
}

function translatePage(lang, { persist = true, rerender = true } = {}) {
  lang = normalizeLanguage(lang);
  if (persist) {
    storeLanguage(lang);
  }
  setLocaleCookie(lang);
  document.documentElement.lang = lang;
  document.body?.setAttribute("data-locale", lang);
  if (rerender) {
    renderSiteContent();
  }
  applyLatestProfile(lang);

  const titleKey = lang === "zh-Hans" ? "titleZhHans" : lang === "en" ? "titleEn" : "titleZh";
  const annotatedTitle = document.body?.dataset[titleKey];
  document.title = annotatedTitle || getTranslatedText("CYBERNEWS - Global Technology Signals", lang) || "CYBERNEWS - Global Technology Signals";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "SVG"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest(".language-switcher") || parent.closest("[data-no-translate]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  nodes.forEach((node) => translateTextNode(node, lang));
  translateAnnotatedContent(lang);

  document.querySelectorAll("input[placeholder]").forEach((input) => {
    const current = input.getAttribute("placeholder");
    input.setAttribute("placeholder", placeholders[lang]?.[current] || current);
  });

  languageOptions.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (languageCurrent) {
    languageCurrent.textContent = localeLabels[lang] || "EN";
  }

  if (languageSwitcher && languageTrigger) {
    languageSwitcher.classList.remove("open");
    languageTrigger.setAttribute("aria-expanded", "false");
  }
  removeLocaleQueryParam();
}

languageTrigger?.addEventListener("click", () => {
  const isOpen = languageSwitcher?.classList.toggle("open");
  languageTrigger.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    translatePage(button.dataset.lang || "zh-Hant", { persist: true, rerender: true });
  });
});

const setMobileMenuOpen = (open) => {
  if (!mobileMenuTrigger || !mobileMenuPanel) {
    return;
  }

  if (open) {
    document.body.classList.remove("mobile-header-hidden");
  }

  document.body.classList.toggle("mobile-menu-open", open);
  mobileMenuTrigger.setAttribute("aria-expanded", String(open));
  mobileMenuPanel.setAttribute("aria-hidden", String(!open));

  if (open) {
    mobileMenuClose?.focus();
  } else {
    mobileMenuTrigger.focus();
  }
};

mobileMenuTrigger?.addEventListener("click", () => {
  setMobileMenuOpen(!document.body.classList.contains("mobile-menu-open"));
});

mobileMenuPanel?.addEventListener("click", (event) => {
  const closeTarget = event.target.closest("[data-mobile-menu-close], .mobile-menu-links a");

  if (closeTarget) {
    setMobileMenuOpen(false);
  }
});

mobileMenuClose?.addEventListener("click", () => {
  setMobileMenuOpen(false);
});

const setupMobileHeaderAutoHide = () => {
  const masthead = document.querySelector(".masthead");
  const mobileTabs = document.querySelector(".mobile-channel-tabs");

  if (!masthead || !mobileTabs) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let lastScrollY = window.scrollY;
  let ticking = false;

  const syncMobileHeader = () => {
    ticking = false;

    if (!mobileQuery.matches) {
      document.body.classList.remove("mobile-header-hidden");
      lastScrollY = window.scrollY;
      return;
    }

    if (document.body.classList.contains("mobile-menu-open")) {
      document.body.classList.remove("mobile-header-hidden");
      lastScrollY = window.scrollY;
      return;
    }

    const currentScrollY = Math.max(0, window.scrollY);
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 24 || delta < -6) {
      document.body.classList.remove("mobile-header-hidden");
    } else if (currentScrollY > 118 && delta > 8) {
      document.body.classList.add("mobile-header-hidden");
    }

    lastScrollY = currentScrollY;
  };

  const requestSync = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(syncMobileHeader);
  };

  window.addEventListener("scroll", requestSync, { passive: true });
  mobileQuery.addEventListener?.("change", syncMobileHeader);
  syncMobileHeader();
};

const setupFloatingHeader = () => {
  const masthead = document.querySelector(".masthead");

  if (!masthead || document.querySelector(".floating-header")) {
    return;
  }

  const floatingHeader = document.createElement("header");
  floatingHeader.className = "floating-header";
  floatingHeader.setAttribute("aria-label", "快速導覽");
  floatingHeader.innerHTML = `
    <a class="floating-brand" href="${rootAssetUrl("index.html")}" aria-label="CYBERNEWS home">
      <img src="${rootAssetUrl("assets/technow-logo.svg")}" alt="CYBERNEWS" />
    </a>
    <nav class="floating-nav" aria-label="快速導覽連結">
      <a href="${rootAssetUrl("latest.html")}">最新消息</a>
      <a href="${rootAssetUrl("ai.html")}">AI 新聞</a>
      <a href="${rootAssetUrl("finance.html")}">金融</a>
      <a href="${rootAssetUrl("latest.html?type=column")}">專欄</a>
      <a href="${rootAssetUrl("latest.html?type=research")}">調研</a>
      <a href="${rootAssetUrl("newsletter.html")}">電子報</a>
    </nav>
    <div class="floating-actions">
      <a class="floating-search" href="${rootAssetUrl("archive.html?focus=query")}" aria-label="搜尋">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      </a>
    </div>
  `;

  masthead.after(floatingHeader);

  const setFloatingHeaderVisible = (visible) => {
    floatingHeader.classList.toggle("is-visible", visible);
    document.body.classList.toggle("floating-header-active", visible);
  };

  if (!("IntersectionObserver" in window)) {
    setFloatingHeaderVisible(true);
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      setFloatingHeaderVisible(!entry.isIntersecting);
    },
    {
      rootMargin: "-1px 0px 0px 0px",
      threshold: 0,
    }
  );

  observer.observe(masthead);
};

const normalizePathname = (value) => {
  const pathname = new URL(value, window.location.href).pathname;
  return pathname.endsWith("/index.html") ? pathname.slice(0, -"index.html".length) : pathname;
};

const getActiveMobileTab = () => {
  const page = document.body?.dataset.page || getCurrentPage();
  const vertical = document.body?.dataset.vertical || "";
  const contentType = document.body?.dataset.contentType || "";
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;
  const filename = path.split("/").pop() || "index.html";

  if (page === "newsletter" || filename === "newsletter.html") {
    return "newsletter";
  }

  if (params.get("type") === "research" || contentType === "research" || page === "research") {
    return "research";
  }

  if (params.get("type") === "column" || contentType === "column") {
    return "column";
  }

  if (page === "topics" || filename === "topics.html" || filename.startsWith("topic-")) {
    return "topics";
  }

  if (page === "ai" || vertical === "ai") {
    return "ai";
  }

  if (["finance", "stocks", "crypto"].includes(page) || vertical === "finance") {
    return "finance";
  }

  if (["index", "latest"].includes(page) || filename === "latest.html") {
    return "latest";
  }

  return "";
};

const syncCurrentNavigation = () => {
  const currentPath = normalizePathname(window.location.href);
  const currentParams = new URLSearchParams(window.location.search);
  const activeMobileTab = getActiveMobileTab();

  document.querySelectorAll(".masthead-links a, .mobile-menu-links a, .floating-nav a").forEach((link) => {
    const linkUrl = new URL(link.href, window.location.href);
    const linkPath = normalizePathname(linkUrl.href);
    let isCurrent = linkPath === currentPath;

    if (isCurrent) {
      const linkType = linkUrl.searchParams.get("type") || "";
      const currentType = currentParams.get("type") || "";
      isCurrent = linkType === currentType;
    }

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll(".mobile-channel-tabs a").forEach((link) => {
    const isCurrent = link.dataset.mobileTab === activeMobileTab;
    link.classList.toggle("is-active", isCurrent);

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

document.addEventListener("click", (event) => {
  if (!languageSwitcher || !languageTrigger || languageSwitcher.contains(event.target)) {
    return;
  }

  languageSwitcher.classList.remove("open");
  languageTrigger.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (document.body.classList.contains("mobile-menu-open")) {
    setMobileMenuOpen(false);
    return;
  }

  if (languageSwitcher && languageTrigger) {
    languageSwitcher.classList.remove("open");
    languageTrigger.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".newsletter-band form, .newsletter-signup-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');

    if (!input || !input.value.trim() || !input.checkValidity()) {
      input?.reportValidity();
      return;
    }

    const successMessage = getLocaleCopy({
      "zh-Hant": "請到信箱點確認連結完成訂閱",
      "zh-Hans": "请到信箱点击确认链接完成订阅",
      en: "Check your inbox and click the confirmation link to finish subscribing.",
    });

    form.innerHTML = `<p class="newsletter-thanks">${escapeHtml(successMessage)}</p>`;
  });
});

setupMobileHeaderAutoHide();
setupFloatingHeader();
preserveDesignPreviewNavigation();
syncCurrentNavigation();

const copyLinkLabels = {
  "zh-Hant": { idle: "複製", success: "已複製", failed: "複製失敗", aria: "複製連結" },
  "zh-Hans": { idle: "复制", success: "已复制", failed: "复制失败", aria: "复制链接" },
  en: { idle: "Copy", success: "Copied", failed: "Copy failed", aria: "Copy link" },
};

const writeClipboardText = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.append(helper);
  helper.select();
  const didCopy = document.execCommand("copy");
  helper.remove();
  return didCopy;
};

document.querySelectorAll("[data-copy-link]").forEach((button) => {
  const label = button.querySelector("span");
  const icon = button.querySelector("i");

  button.addEventListener("click", async () => {
    const lang = getActiveLanguage();
    const labels = copyLinkLabels[lang] || copyLinkLabels["zh-Hant"];
    let copied = false;

    try {
      copied = await writeClipboardText(window.location.href);
    } catch {
      copied = false;
    }

    if (label) {
      label.textContent = copied ? labels.success : labels.failed;
    }

    button.setAttribute("aria-label", copied ? labels.success : labels.failed);
    icon?.classList.replace("fa-link", copied ? "fa-check" : "fa-triangle-exclamation");

    window.setTimeout(() => {
      const restoreLabels = copyLinkLabels[getActiveLanguage()] || copyLinkLabels["zh-Hant"];
      if (label) {
        label.textContent = restoreLabels.idle;
      }
      button.setAttribute("aria-label", restoreLabels.aria);
      icon?.classList.replace("fa-check", "fa-link");
      icon?.classList.replace("fa-triangle-exclamation", "fa-link");
    }, 1600);
  });
});

document.querySelectorAll("[data-column-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!columnTrack) {
      return;
    }

    const direction = Number(button.dataset.columnScroll || 1);
    const card = columnTrack.querySelector(".column-card");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    columnTrack.scrollBy({
      left: direction * (cardWidth + 30),
      behavior: "smooth",
    });
  });
});

document.querySelectorAll(".popular-strip .column-years button").forEach((button) => {
  button.addEventListener("click", () => {
    applyColumnFilter(button.dataset.columnFilter || "all");
  });
});

const initialLanguage = detectDefaultLanguage();
const initialLanguageFromUrl = new URLSearchParams(window.location.search).has("lang");
document.documentElement.lang = initialLanguage;
document.body?.setAttribute("data-locale", initialLanguage);

initializeNewsData().finally(() => {
  applyColumnFilter(document.querySelector(".popular-strip .column-years button.active")?.dataset.columnFilter || "all");
  syncColumnCaptionVisibility();
  translatePage(initialLanguage, { persist: initialLanguageFromUrl, rerender: false });
});
