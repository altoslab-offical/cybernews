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
  const value = item?.canonical_url || item?.source_url || "";
  return isPlaceholderSourceUrl(value) ? "" : value;
};
const columnFilterOptions = [
  { label: "全部", value: "all" },
  { label: "AI", value: "ai" },
  { label: "金融", value: "finance" },
  { label: "調研", value: "research" },
];

const translations = [
  ["CYBERNEWS - Global Technology Signals", "CYBERNEWS - 全球科技訊號"],
  ["About", "關於"],
  ["Latest", "最新"],
  ["Newsletter", "電子報"],
  ["Tech Giants", "科技巨頭"],
  ["EV Revolution", "電動車革命"],
  ["China Outside China", "中國出海"],
  ["Innovation", "創新"],
  ["Latest Stories", "最新消息"],
  ["Explore latest stories", "探索最新消息"],
  ["Global AI", "全球 AI"],
  ["By CYBERNEWS Desk", "CYBERNEWS 編輯部"],
  ["Global Dispatch", "全球現場"],
  ["中東主權基金正在改寫 AI 雲端部署規則", "Middle Eastern sovereign funds are rewriting the rules for AI cloud deployment"],
  ["大型雲端公司用本地合作、資料落地與能源協議換取更大的政府採購。", "Large cloud providers are trading local partnerships, data residency, and energy agreements for larger government contracts."],
  ["By MENA Desk", "MENA 編輯部"],
  ["Become a member", "成為會員"],
  ["Support independent reporting on global technology.", "支持全球科技獨立報導。"],
  ["Sign up", "註冊"],
  ["中國 EV 供應鏈移往海外，電池材料成為新瓶頸", "China's EV supply chain is moving overseas, and battery materials are the new bottleneck"],
  ["三張圖看中國廠商承諾的海外產能如何遇上政策、關稅與在地供應鏈挑戰。", "Three charts show how Chinese manufacturers' promised overseas capacity is running into policy, tariff, and local supply-chain challenges."],
  ["By Supply Chain Desk", "供應鏈編輯部"],
  ["AI Policy", "AI 政策"],
  ["AI 監管從原則走向稽核，模型供應商開始調整發布節奏", "AI regulation is moving from principles to audits, forcing model providers to adjust release schedules"],
  ["歐洲規則、英國安全測試與多國資料治理要求，正在改變模型上市流程。", "European rules, U.K. safety testing, and data-governance requirements are changing how models reach the market."],
  ["By Policy Watch", "政策觀察"],
  ["Digital Labor", "數位勞動"],
  ["AI 標註與內容審核工作外包，正在重畫全球科技勞動地圖", "AI annotation and moderation outsourcing is redrawing the global tech labor map"],
  ["從巴西、柬埔寨到菲律賓，人工標註員正在追蹤模型、平台與內容安全系統背後的每個微小決策。", "From Brazil and Cambodia to the Philippines, human annotators are tracking the tiny decisions behind models, platforms, and content-safety systems."],
  ["By Labor Desk", "勞動編輯部"],
  ["A world of tech in your inbox", "全球科技新聞寄到你的信箱"],
  ["CYBERNEWS Briefing", "CYBERNEWS 簡報"],
  ["每日最新消息與每週專欄，把全球科技新聞整理成中文可讀脈絡。", "Daily updates and weekly columns that turn global tech news into readable context."],
  ["Advertisement", "廣告"],
  ["Responsive display placement", "響應式廣告版位"],
  ["970 x 250 / fluid", "970 x 250 / 自適應"],
  ["Gulf War", "海灣科技戰"],
  ["Big Tech 正在用海底光纜與能源協議重畫中東雲端版圖", "Big Tech is redrawing the Middle East cloud map through subsea cables and energy deals"],
  ["AI 算力投資與能源政策開始綁在同一張路線圖", "AI compute investment and energy policy are moving onto the same roadmap"],
  ["資料中心城市正在成為海灣國家新基建名片", "Data-center cities are becoming the Gulf's new infrastructure calling card"],
  ["By Infrastructure Desk", "基礎設施編輯部"],
  ["By City Tech Ledger", "城市科技帳本"],
  ["Big Tech pushback", "科技巨頭反作用力"],
  ["Meta 的內容治理機制追不上生成式 AI 的發文速度", "Meta's governance system is struggling to keep up with generative AI posts"],
  ["多國監管機構開始要求平台揭露演算法分配規則", "Regulators are asking platforms to disclose algorithmic distribution rules"],
  ["創作者與平台在 AI 內容收益分配上出現新衝突", "Creators and platforms are clashing over AI content revenue sharing"],
  ["By Platform Watch", "平台觀察"],
  ["By Creator Economy", "創作者經濟"],
  ["The AI Race", "AI 競賽"],
  ["美國企業開始選用中國開源模型來降低推理成本", "U.S. companies are using Chinese open-source models to lower inference costs"],
  ["Spotify 的非英語 AI 策略，正在改變全球音訊平台競爭", "Spotify's non-English AI strategy is changing competition among global audio platforms"],
  ["By Education Desk", "教育編輯部"],
  ["By Enterprise AI Brief", "企業 AI 簡報"],
  ["By Apps Desk", "應用編輯部"],
  ["Features", "深度報導"],
  ["一套你從沒聽過的城市監控系統，正在更多國家輸出", "A city surveillance system you've never heard of is being exported to more countries"],
  ["深入報導科技基礎設施如何穿過政府採購、地方治理與供應商網絡。", "Deep reporting on how tech infrastructure moves through public procurement, local governance, and supplier networks."],
  ["By Global Tech Lens", "全球科技視角"],
  ["AI 監管不只是法規，也是產品發布節奏的限制器", "AI regulation is not just law. It is a limiter on product release cycles"],
  ["科技工作者的跨國遷移路線正在改變", "The migration routes of tech workers are changing"],
  ["Most Popular", "熱門閱讀"],
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
  ["JULY 2026", "2026 年 7 月"],
  ["JUNE 2026", "2026 年 6 月"],
  ["MAY 2026", "2026 年 5 月"],
  ["APRIL 2026", "2026 年 4 月"],
  ["MARCH 2026", "2026 年 3 月"],
  ["FEBRUARY 2026", "2026 年 2 月"],
  ["AI-powered World Cup runs on thousands of data workers", "AI 世足賽背後有數千名資料工作者"],
  ["中國與西方正在走向不同的 EV 電池回收路線", "China and the West are taking different paths on EV battery recycling"],
  ["智利轉向中國建海底光纜，美國說不", "Chile turned to China for an undersea cable. The U.S. said no"],
  ["中國 EV 工廠海外擴張為何突然慢下來", "Why China's overseas EV factory expansion suddenly slowed"],
  ["中國 EV 海外工廠熱潮為何降溫？", "What happened to China's overseas EV factory boom?"],
  ["中國與西方在電池回收上走出兩條路線", "China and the West are taking two paths on battery recycling"],
  ["美國電動車新規讓亞洲供應鏈重新配置", "New U.S. EV rules are forcing Asian supply chains to reconfigure"],
  ["By EV Desk", "EV 編輯部"],
  ["By Climate Tech", "氣候科技"],
  ["The India Story", "印度故事"],
  ["矽谷對印度科技人才的吸引力正在下降", "Silicon Valley's lure is fading for Indian tech talent"],
  ["美國企業如何把 AI 生產流程外包到印度", "How U.S. companies are outsourcing AI production workflows to India"],
  ["印度 VC 正在加碼美國企業 AI 新創", "Indian VCs are backing U.S. enterprise AI startups"],
  ["By India Desk", "印度編輯部"],
  ["By Startup Ledger", "新創帳本"],
  ["中國打造 SpaceX 之外的新衛星網路競爭者", "China is building a satellite-network rival to SpaceX"],
  ["AI 資料與內容安全公司在海外市場遇到新挑戰", "AI data and content-safety companies are facing new challenges abroad"],
  ["中國雲端廠商低價推理 API 開始外溢到東南亞", "Chinese cloud vendors' low-cost inference APIs are spreading into Southeast Asia"],
  ["By China Outside China", "中國出海編輯部"],
  ["By Security Desk", "安全編輯部"],
  ["By Cloud Ledger", "雲端帳本"],
  ["Editor's picks", "編輯精選"],
  ["After AI policy shifts, countries roll out new rules for global platforms", "AI 政策轉向後，各國推出全球平台新規"],
  ["The global backlash against data centers is spreading", "全球對資料中心的反彈正在擴散"],
  ["How language models changed software outsourcing", "語言模型如何改變軟體外包"],
  ["Platform workers are building new kinds of collective leverage", "平台工作者正在建立新的集體談判力量"],
  ["iPhone 在中國市場已經失速，關稅讓局勢更複雜", "The iPhone has already lost momentum in China, and tariffs make it more complicated"],
  ["馬來西亞收緊平台內容規則，科技公司面臨新成本", "Malaysia is tightening platform rules, adding new costs for tech companies"],
  ["平台經濟在印度與東南亞進入合規壓力期", "The platform economy is entering a compliance pressure cycle in India and Southeast Asia"],
  ["By Tech Giants", "科技巨頭編輯部"],
  ["By Asia Desk", "亞洲編輯部"],
  ["全球智慧型手機市場正在找下一個 AI 硬體入口", "The global smartphone market is looking for the next AI hardware entry point"],
  ["AI 生成內容把新聞出版流程推向新工作分工", "AI-generated content is pushing newsrooms toward new divisions of labor"],
  ["年輕用戶在中國用 AI 重新設計日常社交", "Young users in China are using AI to redesign everyday social life"],
  ["By Devices Desk", "裝置編輯部"],
  ["By Media Lab", "媒體實驗室"],
  ["By Culture Desk", "文化編輯部"],
  ["Charts", "圖表"],
  ["A view of global tech through data and graphics.", "用資料與圖像觀看全球科技。"],
  ["Explore charts", "探索圖表"],
  ["Far more Chinese clean tech outbound FDI has been announced than actually completed", "中國清潔科技出海投資的宣布規模，遠高於實際完成規模"],
  ["South Asia", "南亞"],
  ["Spotify's post-English AI future", "Spotify 的後英語 AI 未來"],
  ["Big Tech says AI hiring tools are moving into routine HR decisions", "科技巨頭說，AI 招募工具正進入日常人資決策"],
  ["China", "中國"],
  ["What happened to China's overseas EV factory boom?", "中國海外 EV 工廠熱潮發生了什麼？"],
  ["China and the West are taking opposite paths on EV battery recycling", "中國與西方在 EV 電池回收上走向相反路線"],
  ["Chinese universities are cutting language majors", "中國大學正在削減語言科系"],
  ["Africa", "非洲"],
  ["What to read: A summer book list", "夏季科技書單"],
  ["Security is driving AI innovation outside Silicon Valley", "安全需求正在推動矽谷之外的 AI 創新"],
  ["AI is training new billionaires, and workers want their share", "AI 正在訓練新的億萬富豪，工作者也想分一杯羹"],
  ["Latin America", "拉丁美洲"],
  ["Chile turned to China for an undersea cable", "智利轉向中國建設海底光纜"],
  ["How the vinyl revival fills the gaps streaming left behind", "黑膠復興如何填補串流留下的空白"],
  ["The Mexican security company with a surveillance empire", "一家墨西哥安全公司與它的監控帝國"],
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
  ["專欄", "Columns"],
  ["調研", "Research"],
  ["搜尋", "Search"],
  ["選單", "Menu"],
  ["歷史內容", "Archive"],
  ["查看全部歷史內容", "View full Archive"],
  ["21 分鐘前 / 監管與政策", "21 minutes ago / Regulation and policy"],
  ["32 分鐘前 / NVDA", "32 minutes ago / NVDA"],
  ["1 小時前 / BTC", "1 hour ago / BTC"],
  ["2 小時前 / MSFT", "2 hours ago / MSFT"],
  ["3 小時前 / 金融 / 加密與穩定幣", "3 hours ago / Finance / Crypto and stablecoins"],
  ["4 小時前 / SOL", "4 hours ago / SOL"],
  ["6 月 22 日 / 教育", "Jun. 22 / Education"],
  ["今日主線 / AI", "Top Story / AI"],
  ["來源：CYBERNEWS Desk", "Source: CYBERNEWS Desk"],
  ["金融 / 新聞 / NVDA", "Finance / News / NVDA"],
  ["市場焦點轉向先進封裝、HBM、伺服器機櫃與能源配置，但這不是買賣建議。", "Market focus is shifting to advanced packaging, HBM, server racks, and energy allocation, but this is not trading advice."],
  ["來源：Market Tech Brief", "Source: Market Tech Brief"],
  ["每天整理 AI 與金融新聞摘要。", "Daily summaries of AI and finance news."],
  ["訂閱", "Subscribe"],
  ["為什麼重要", "Why it matters"],
  ["AI 新聞 / 新聞 / MSFT", "AI News / News / MSFT"],
  ["談判重點包括模型部署、雲端成本、企業客戶收入分成與未來算力採購。", "Talks center on model deployment, cloud costs, enterprise revenue sharing, and future compute purchases."],
  ["來源：Enterprise AI Brief", "Source: Enterprise AI Brief"],
  ["AI 監管", "AI Regulation"],
  ["大型模型供應商被要求補交訓練資料、風險測試與部署流程說明。", "Large model providers are being asked to submit training-data, risk-testing, and deployment-process details."],
  ["來源：Policy Watch", "Source: Policy Watch"],
  ["金融 / 新聞 / ETF", "Finance / News / ETF"],
  ["資產管理公司與上市公司持倉變化受到追蹤，但本文只整理新聞脈絡，不做價格方向判斷。", "Asset-manager and public-company holdings are being tracked, but this article only summarizes news context and does not forecast price direction."],
  ["來源：Crypto Market Brief", "Source: Crypto Market Brief"],
  ["金融 / 科技股 - CYBERNEWS", "Finance / Tech Stocks - CYBERNEWS"],
  ["金融 / 加密與穩定幣 - CYBERNEWS", "Finance / Crypto and Stablecoins - CYBERNEWS"],
  ["Finance / Tech Stocks", "金融 / 科技股"],
  ["Finance / Crypto and Stablecoins", "金融 / 加密與穩定幣"],
  ["算力與晶片", "Chips and Compute"],
  ["AI 資本與雲端", "AI Capital and Cloud"],
  ["AI 公司與產品", "AI Companies and Products"],
  ["科技股", "Tech Stocks"],
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
  ["監管與政策 / Policy Watch", "Regulation and policy / Policy Watch"],
  ["AI 應用與人才 / Rest of World", "AI adoption and talent / Rest of World"],
  ["算力與晶片 / CYBERNEWS Desk", "Chips and compute / CYBERNEWS Desk"],
  ["NVDA / Market Tech Brief", "NVDA / Market Tech Brief"],
  ["MSFT / Enterprise AI Brief", "MSFT / Enterprise AI Brief"],
  ["AAPL / Tech Giants Desk", "AAPL / Tech Giants Desk"],
  ["BTC / Crypto Market Brief", "BTC / Crypto Market Brief"],
  ["USDC / Crypto Policy Watch", "USDC / Crypto Policy Watch"],
  ["SOL / Onchain Apps Desk", "SOL / Onchain Apps Desk"],
  ["AI 與金融新聞寄到你的信箱", "AI and finance news in your inbox"],
  ["每日精選 5 到 8 則重要新聞摘要，保留來源、主頻道、內容型態、代號與原文連結。", "A daily selection of 5 to 8 important summaries with sources, verticals, content types, symbols, and original links."],
  ["每天整理 AI 與金融新聞摘要。", "Daily AI and finance news summaries."],
  ["每日精選 5 到 8 則重要內容，保留來源、主頻道、內容型態、代號與原文連結。", "A daily selection of 5 to 8 important items with sources, verticals, content types, symbols, and original links."],
  ["訂閱調研摘要。", "Subscribe to research summaries."],
  ["每週整理 AI、金融與調研內容，保留來源、metadata 與免責說明。", "Weekly AI, finance, and research summaries with sources, metadata, and disclaimers."],
  ["請到信箱點確認連結完成訂閱", "Check your inbox and click the confirmation link to finish subscribing."],
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
  zh: new Map(normalizedTranslations.map(({ zh, en }) => [en, zh])),
  en: new Map(normalizedTranslations.map(({ zh, en }) => [zh, en])),
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
  zh: {
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

const emptyContentCopy = {
  zh: {
    title: "正式內容資料尚未接入",
    description: "這個版位會在文章 API 提供正式資料後自動顯示內容；目前不顯示測試文章。",
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
    kicker: { zh: "CYBERNEWS Latest", en: "CYBERNEWS Latest" },
    title: { zh: "最新消息", en: "Latest" },
    description: {
      zh: "跨 AI 新聞與金融兩大主頻道整理最新摘要。每則保留來源、內容型態、時間與可追溯原文，不做投資建議。",
      en: "Latest AI and finance summaries with source links, content type, timestamps, and traceable originals. No investment advice.",
    },
    titleTag: { zh: "最新消息 - CYBERNEWS", en: "Latest - CYBERNEWS" },
  },
  column: {
    kicker: { zh: "CYBERNEWS Columns", en: "CYBERNEWS Columns" },
    title: { zh: "專欄", en: "Columns" },
    description: {
      zh: "收錄 CYBERNEWS 的觀點專欄、週報與市場脈絡整理，協助讀者理解 AI 與金融訊號背後的判斷框架。",
      en: "CYBERNEWS columns, weekly notes, and market context for understanding the reasoning behind AI and finance signals.",
    },
    titleTag: { zh: "專欄 - CYBERNEWS", en: "Columns - CYBERNEWS" },
  },
  research: {
    kicker: { zh: "CYBERNEWS Research", en: "CYBERNEWS Research" },
    title: { zh: "調研", en: "Research" },
    description: {
      zh: "整理較長篇的調研摘要、資料線索與可回溯來源，讓正式研究內容接入後能被讀者快速追蹤。",
      en: "Longer research briefs, data trails, and traceable sources so readers can follow production research once it is connected.",
    },
    titleTag: { zh: "調研 - CYBERNEWS", en: "Research - CYBERNEWS" },
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

const getSelectedOptionText = (field) => field?.selectedOptions?.[0]?.textContent?.trim() || "";

const byPublishedDesc = (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime();

const getImageStyle = (item) => {
  if (!item?.image_url) {
    return "";
  }

  return ` style="background-image: linear-gradient(0deg, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.02)), url('${escapeHtml(item.image_url)}')"`;
};

const getStoryHref = (item) => {
  const folder = item?.content_type === "research" ? "research" : "articles";
  return `./${folder}/${encodeURIComponent(item?.id || "")}/`;
};

const getSymbols = (item) => [...(item?.tickers || []), ...(item?.coins || [])];

const getMetadata = (item) => {
  const symbols = getSymbols(item);
  const fallback = item?.topics?.slice(0, 2) || [];
  return [...symbols, ...fallback].slice(0, 4);
};

const getMetaLine = (item) =>
  `${verticalLabels[item.vertical] || item.vertical} / ${contentTypeLabels[item.content_type] || item.content_type} / ${item.subcategory}`;

const getReadingMinutes = (item) => {
  const text = [item.summary_zh, ...(Array.isArray(item.body_zh) ? item.body_zh : [])].filter(Boolean).join("");
  return Math.max(1, Math.round(text.length / 400));
};

const whyMattersMarkup = (item) =>
  item?.why_matters_zh
    ? `<p class="why-matters"><strong>為什麼重要</strong>${escapeHtml(item.why_matters_zh)}</p>`
    : "";

const storyCardMarkup = (item) => `
  <article class="directory-card">
    <a href="${getStoryHref(item)}">
      <div class="directory-card-image"${getImageStyle(item)}></div>
      <h2>${escapeHtml(item.title_zh)}</h2>
      <p>${escapeHtml(item.summary_zh)}</p>
    </a>
    <div class="directory-card-foot">
      <span class="directory-mini-tag">${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}</span>
      <span class="directory-mini-tag">${escapeHtml(item.subcategory)}</span>
      <span class="directory-mini-tag">${escapeHtml(item.source_name)}</span>
    </div>
  </article>
`;

const feedItemMarkup = (item) => {
  const metadata = getMetadata(item);

  return `
    <article class="directory-feed-item">
      <div class="directory-feed-meta">${escapeHtml(formatDateTime(item.published_at))} / ${getReadingMinutes(item)} 分鐘<br />${escapeHtml(getMetaLine(item))}</div>
      <div>
        <h2><a href="${getStoryHref(item)}">${escapeHtml(item.title_zh)}</a></h2>
        <p>${escapeHtml(item.summary_zh)}</p>
      </div>
      <div class="directory-feed-tags">
        <span>${escapeHtml(item.source_name)}</span>
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
              <h3><a href="${getStoryHref(item)}">${escapeHtml(item.title_zh)}</a></h3>
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
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(item.title_zh)}">
      <div class="lead-image" role="img" aria-label="${escapeHtml(item.title_original)}"${getImageStyle(item)}></div>
      <div class="story-meta">今日主線 / ${escapeHtml(getMetaLine(item))}</div>
      <h1>${escapeHtml(item.title_zh)}</h1>
      <p>${escapeHtml(item.summary_zh)}</p>
      ${whyMattersMarkup(item)}
      <div class="byline">來源：${escapeHtml(item.source_name)} / ${escapeHtml(formatDateTime(item.published_at))}</div>
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
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(item.title_zh)}">
      <div class="${element.classList.contains("side-feature") ? "side-image" : "grid-image"}"${getImageStyle(item)}></div>
      <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
      <h2>${escapeHtml(item.title_zh)}</h2>
      <p>${escapeHtml(item.summary_zh)}</p>
      ${whyMattersMarkup(item)}
      <div class="byline">來源：${escapeHtml(item.source_name)}</div>
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
                <h3>${escapeHtml(item.title_zh)}</h3>
                <p>${escapeHtml(getMetaLine(item))} / ${escapeHtml(item.source_name)}</p>
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
    ["AI 新聞", "./ai.html", aiItems],
    ["金融", "./finance.html", financeItems],
    ["專欄", "./latest.html?type=column", columnItems],
    ["調研", "./latest.html?type=research", researchItems],
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
    title.textContent = "專欄與調研";
  }

  columnFilterOptions.forEach(({ label, value }, index) => {
    if (controls[index]) {
      controls[index].textContent = label;
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
          <a href="${getStoryHref(item)}" aria-label="${escapeHtml(item.title_zh)}">
            <div class="column-card-image"${getImageStyle(item)}></div>
            <div class="column-card-caption">
              <h3>${escapeHtml(item.subcategory)}</h3>
              <p>${escapeHtml(item.title_zh)}</p>
              <span>${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}</span>
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
  document.querySelector(".signup-card h2")?.replaceChildren(document.createTextNode("每天整理 AI 與金融新聞摘要。"));
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

const getActiveLanguage = () => (document.documentElement.lang === "en" ? "en" : "zh");

const getLatestProfile = () => {
  const type = new URLSearchParams(window.location.search).get("type");
  return latestPageProfiles[type] || latestPageProfiles.all;
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
    kicker.textContent = profile.kicker[lang];
  }

  if (title) {
    title.textContent = profile.title[lang];
  }

  if (description) {
    description.textContent = profile.description[lang];
  }

  if (document.body) {
    document.body.dataset.titleZh = profile.titleTag.zh;
    document.body.dataset.titleEn = profile.titleTag.en;
  }

  document.title = profile.titleTag[lang];
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
          <h2>沒有符合條件的內容</h2>
          <p>請換一個子分類或內容型態，或稍後再查看更多內容。</p>
        </div>
      `
      : emptyContentMarkup();
    return true;
  }

  const lead = items[0];
  const side = items.slice(1, 4);

  container.innerHTML = `
    <article class="channel-lead-main">
      <a href="${getStoryHref(lead)}" aria-label="${escapeHtml(lead.title_zh)}">
        <div class="channel-lead-image" role="img" aria-label="${escapeHtml(lead.title_original)}"${getImageStyle(lead)}></div>
        <div class="story-meta">${escapeHtml(getMetaLine(lead))}</div>
        <h2>${escapeHtml(lead.title_zh)}</h2>
        <p>${escapeHtml(lead.summary_zh)}</p>
        ${whyMattersMarkup(lead)}
        <div class="byline">來源：${escapeHtml(lead.source_name)} / ${escapeHtml(formatDateTime(lead.published_at))} / ${getReadingMinutes(lead)} 分鐘</div>
      </a>
    </article>
    <div class="channel-lead-side">
      ${side
        .map(
          (item) => `
            <article class="channel-lead-side-item">
              <a href="${getStoryHref(item)}">
                <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
                <h3>${escapeHtml(item.title_zh)}</h3>
                <div class="byline">來源：${escapeHtml(item.source_name)} / ${escapeHtml(formatDateTime(item.published_at))}</div>
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
      ["AI 新聞", "./ai.html", channelItems.filter((item) => item.vertical === "ai")],
      ["金融", "./finance.html", channelItems.filter((item) => item.vertical === "finance")],
    ];
  } else {
    rows = ["news", "column", "research"].map((type) => [
      contentTypeLabels[type],
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
    <a href="${getStoryHref(item)}" aria-label="${escapeHtml(item.title_zh)}">
      <div class="channel-ledger-thumb"${getImageStyle(item)}></div>
      <div class="channel-ledger-body">
        <div class="story-meta">${escapeHtml(getMetaLine(item))}</div>
        <h3>${escapeHtml(item.title_zh)}</h3>
        <p>${escapeHtml(item.summary_zh)}</p>
        <div class="byline">來源：${escapeHtml(item.source_name)} / ${escapeHtml(formatDateTime(item.published_at))} / ${getReadingMinutes(item)} 分鐘</div>
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
          ? `<p class="directory-feed-note">以上就是目前符合條件的全部內容。</p>`
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
    item.title_zh,
    item.title_original,
    item.summary_zh,
    item.vertical,
    item.content_type,
    item.subcategory,
    item.source_name,
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

      if (sourceName && item.source_name !== sourceName) {
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
        label: archiveSummaryLabels[fieldName] || fieldName,
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
    : `<p class="archive-summary-empty">目前顯示全部內容。</p>`;

  summary.innerHTML = `
    <div class="archive-summary-count">${items.length} 筆結果</div>
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
  toggle.innerHTML = `<span>篩選${activeCount ? ` (${activeCount})` : ""}</span><span aria-hidden="true">${isExpanded ? "收合" : "展開"}</span>`;
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
    const values = [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));

    select.innerHTML = `<option value="">全部</option>${values
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
      .join("")}`;
  });
};

const renderArchiveRows = (items, container) => {
  const header = `
    <div class="directory-table-row header">
      <span>標題</span>
      <span>主頻道 / 型態</span>
      <span>來源</span>
      <span>Metadata</span>
    </div>
  `;

  if (!items.length) {
    container.innerHTML = `${header}<article class="directory-table-row"><div><h2>沒有符合條件的內容</h2><p>請放寬日期、分類或關鍵字。</p></div><p></p><p></p><p></p></article>`;
    return;
  }

  container.innerHTML = `${header}${items
    .map(
      (item) => `
        <article class="directory-table-row">
          <div>
            <h2><a href="${getStoryHref(item)}">${escapeHtml(item.title_zh)}</a></h2>
            <p>${escapeHtml(formatDate(item.published_at))} / ${escapeHtml(formatDateTime(item.published_at))}</p>
          </div>
          <p>${escapeHtml(verticalLabels[item.vertical] || item.vertical)} / ${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}<br />${escapeHtml(item.subcategory)}</p>
          <p>${escapeHtml(item.source_name)}<br />${escapeHtml(item.language)} / ${escapeHtml(item.region)}</p>
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
    <dd>${value ? escapeHtml(value) : "未提供"}</dd>
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
      const updated = latest ? formatDate(latest.published_at) : "尚未更新";
      const tags = topic.tags?.length ? topic.tags : [topic.slug];

      return `
        <article class="directory-card">
          <a href="${escapeHtml(topic.href || "./topics.html")}" aria-label="${escapeHtml(topic.title_zh)}">
            <div class="directory-card-image ${escapeHtml(topic.image_class || "column-image-one")}"></div>
            <h2>${escapeHtml(topic.title_zh)}</h2>
            <p>${escapeHtml(topic.description_zh)}</p>
            <p class="directory-card-note">${matches.length} 則追蹤 · 最後更新 ${escapeHtml(updated)}</p>
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
    .sort((a, b) => Number(Boolean(b.why_matters_zh)) - Number(Boolean(a.why_matters_zh)) || byPublishedDesc(a, b))
    .slice(0, 3);

  if (!sampleItems.length) {
    container.innerHTML = `
      <article class="directory-feed-item newsletter-sample-empty">
        <div class="directory-feed-meta">Empty</div>
        <div>
          <h2>目前沒有可顯示的簡報範例。</h2>
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
        const symbolLabel = symbols.length ? symbols.slice(0, 3).join(" / ") : item.source_name;
        const itemDate = formatDate(item.published_at);

        return `
          <article class="directory-feed-item newsletter-sample-item">
            <div class="directory-feed-meta">
              ${index === 0 ? "CYBERNEWS Brief" : `Brief ${String(index + 1).padStart(2, "0")}`}
              ${itemDate ? `<time datetime="${escapeHtml(item.published_at)}">${escapeHtml(itemDate)}</time>` : ""}
            </div>
            <div>
              <h2><a href="${getStoryHref(item)}">${escapeHtml(item.title_zh)}</a></h2>
              <p><strong>為什麼重要：</strong>${escapeHtml(item.why_matters_zh || item.summary_zh)}</p>
            </div>
            <div class="directory-feed-tags">
              <span>${escapeHtml(item.subcategory)}</span>
              <span>${escapeHtml(symbolLabel)}</span>
              ${sourceUrl ? `<a class="directory-mini-tag newsletter-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">原文 ↗</a>` : ""}
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
        <h2>延伸閱讀</h2>
      </div>
      <div class="article-related-grid">
        ${relatedItems
          .map(
            (item) => `
              <article class="article-related-card">
                <a href="${getStoryHref(item)}" aria-label="${escapeHtml(item.title_zh)}">
                  <div class="article-related-image" role="img" aria-label="${escapeHtml(item.title_original)}"${getImageStyle(item)}></div>
                  <h3>${escapeHtml(item.title_zh)}</h3>
                  <p>${escapeHtml(item.summary_zh)}</p>
                  <div class="article-related-tags" aria-label="Story metadata">
                    <span>${escapeHtml(item.subcategory)}</span>
                    <span>${escapeHtml(item.source_name).toUpperCase()}</span>
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
  const paragraphs = Array.isArray(item.body_zh) ? item.body_zh.filter(Boolean) : [];
  const body = paragraphs.length
    ? paragraphs
    : [
        `${item.summary_zh} 這篇內容目前只有摘要資料，後續可由編輯補上完整中文整理稿。`,
        `CYBERNEWS 會保留主頻道、內容型態、來源、原文連結與 metadata，方便讀者回到原始來源確認完整脈絡。`,
      ];

  return `
    <section class="article-body-copy" aria-label="Article body">
      <span>內文整理</span>
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
      <h2>核心問題</h2>
      <p>這份調研聚焦「${escapeHtml(item.subcategory)}」如何影響 ${escapeHtml(verticalLabels[item.vertical] || item.vertical)} 的產業、市場與資料追蹤方式。</p>
      <div class="research-panel-grid">
        <div>
          <span>主要資料來源</span>
          <p>${escapeHtml(item.source_name)}${sourceUrl ? ` / ${escapeHtml(getReadableUrlHost(sourceUrl))}` : ""}</p>
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
    </section>
  `;
};

const disclaimerMarkup = (item) => {
  if (!item.disclaimer_required && item.content_type !== "research") {
    return "";
  }

  return `
    <section class="article-disclaimer" aria-label="Disclaimer">
      <h2>免責說明</h2>
      <p>本文只整理公開來源、中文摘要與 metadata，不構成投資建議、價格預測、買賣訊號或法律意見。股票代號與幣種代號僅供查找與分類。</p>
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

  if (requestedItem && (requestedItem.content_type === "research") !== (pageType === "research")) {
    window.location.replace(getStoryHref(requestedItem));
    return;
  }

  const item = requestedItem || (!requestedId && (preferredItems[0] || items[0])) || null;

  if (!item) {
    shell.innerHTML = `
      <header class="article-hero">
        <div class="article-heading">
          <h1>找不到內容</h1>
          <p class="article-dek">請回到首頁重新選擇一篇內容。</p>
          <div class="article-cta-row">
            <a class="directory-action" href="./index.html">回到首頁</a>
          </div>
        </div>
      </header>
    `;
    return;
  }

  const sourceUrl = getSourceUrl(item);
  const sourceTitleMarkup = sourceUrl
    ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer" data-no-translate>${escapeHtml(item.title_original)}</a>`
    : `<span data-no-translate>${escapeHtml(item.title_original)}</span>`;
  const sourceActionMarkup = sourceUrl
    ? `<a class="directory-action" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">閱讀原文</a>`
    : `<span class="directory-chip">來源待補</span>`;
  const metadata = getMetadata(item);
  const publishedAt = formatDateTime(item.published_at);
  const readingMinutes = getReadingMinutes(item);
  const breadcrumb = document.querySelector(".article-breadcrumb");
  const metaDescription = document.querySelector('meta[name="description"]');

  document.body.dataset.titleZh = `${item.title_zh} - CYBERNEWS`;
  document.body.dataset.titleEn = `${item.title_original} - CYBERNEWS`;
  document.title = document.body.dataset.titleZh;

  if (metaDescription) {
    metaDescription.setAttribute("content", item.summary_zh);
  }

  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="./index.html">CYBERNEWS</a>
      <span aria-hidden="true">/</span>
      <a href="${item.vertical === "ai" ? "./ai.html" : "./finance.html"}">${escapeHtml(verticalLabels[item.vertical] || item.vertical)}</a>
      <span aria-hidden="true">/</span>
      <a href="${getDetailArchiveHref(item)}">${escapeHtml(contentTypeLabels[item.content_type] || item.content_type)}</a>
      <span aria-hidden="true">/</span>
      <span>${escapeHtml(item.subcategory)}</span>
    `;
  }

  shell.innerHTML = `
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
        <div class="article-hero-image" role="img" aria-label="${escapeHtml(item.title_original)}"${getImageStyle(item)}></div>
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
            <a class="directory-chip" href="./topics.html">加入專題追蹤</a>
            <a class="directory-chip" href="${getDetailArchiveHref(item)}">更多同類內容</a>
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

    ${articleRelatedMarkup(items, item)}
  `;
};

const initializeNewsData = async () => {
  try {
    const response = await fetch(dataAssetUrl("news.json"), { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load news data: ${response.status}`);
    }

    const items = await response.json();
    const topicsResponse = await fetch(dataAssetUrl("topics.json"), { cache: "no-store" }).catch(() => null);
    const topics = topicsResponse?.ok ? await topicsResponse.json() : [];

    renderHomePage(items);
    renderDirectoryPage(items);
    renderArchivePage(items);
    renderTopicsPage(items, topics);
    renderDetailPage(items);
    renderNewsletterPage(items);
  } catch (error) {
    console.warn(error);
  }
};

const getTranslatedText = (text, lang) => textMaps[lang].get(text) || text;

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
  const textKey = lang === "zh" ? "i18nZh" : "i18nEn";
  const placeholderKey = lang === "zh" ? "placeholderZh" : "placeholderEn";

  document.querySelectorAll("[data-i18n-zh][data-i18n-en]").forEach((element) => {
    const translated = element.dataset[textKey];
    if (translated) {
      element.textContent = translated;
    }
  });

  document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach((element) => {
    const translated = element.dataset[placeholderKey];
    if (translated) {
      element.setAttribute("placeholder", translated);
    }
  });
}

function translatePage(lang) {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  applyLatestProfile(lang);

  const titleKey = lang === "zh" ? "titleZh" : "titleEn";
  const annotatedTitle = document.body?.dataset[titleKey];
  document.title = annotatedTitle || (lang === "zh" ? textMaps.zh.get("CYBERNEWS - Global Technology Signals") : "CYBERNEWS - Global Technology Signals");

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
    input.setAttribute("placeholder", placeholders[lang][current] || current);
  });

  languageOptions.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (languageCurrent) {
    languageCurrent.textContent = lang === "zh" ? "中文" : "EN";
  }

  if (languageSwitcher && languageTrigger) {
    languageSwitcher.classList.remove("open");
    languageTrigger.setAttribute("aria-expanded", "false");
  }
}

languageTrigger?.addEventListener("click", () => {
  const isOpen = languageSwitcher?.classList.toggle("open");
  languageTrigger.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    translatePage(button.dataset.lang || "zh");
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

    const successMessage =
      document.documentElement.lang === "en"
        ? "Check your inbox and click the confirmation link to finish subscribing."
        : "請到信箱點確認連結完成訂閱";

    form.innerHTML = `<p class="newsletter-thanks">${escapeHtml(successMessage)}</p>`;
  });
});

setupMobileHeaderAutoHide();
setupFloatingHeader();
syncCurrentNavigation();

document.querySelectorAll("[data-copy-link]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = window.location.href;
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    const icon = button.querySelector("i");
    icon?.classList.replace("fa-link", "fa-check");
    window.setTimeout(() => icon?.classList.replace("fa-check", "fa-link"), 1600);
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

initializeNewsData().finally(() => {
  applyColumnFilter(document.querySelector(".popular-strip .column-years button.active")?.dataset.columnFilter || "all");
  syncColumnCaptionVisibility();
  translatePage("zh");
});
