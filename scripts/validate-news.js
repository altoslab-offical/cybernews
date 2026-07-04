const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataFile = process.env.NEWS_DATA_FILE || "data/news.json";
const dataPath = path.resolve(rootDir, dataFile);

const allowedVerticals = new Set(["ai", "finance"]);
const allowedContentTypes = new Set(["news", "column", "research"]);
const allowedLocales = ["zh-Hant", "zh-Hans", "en"];
const allowedSubcategories = new Set([
  "算力與晶片",
  "AI 資本與雲端",
  "AI 公司與產品",
  "科技股",
  "加密與穩定幣",
  "監管與政策",
  "AI 應用與人才",
]);

const requiredFields = [
  "id",
  "title_zh",
  "title_original",
  "summary_zh",
  "why_matters_zh",
  "body_zh",
  "vertical",
  "content_type",
  "subcategory",
  "source_name",
  "source_url",
  "canonical_url",
  "published_at",
  "fetched_at",
  "language",
  "region",
  "companies",
  "tickers",
  "coins",
  "topics",
  "authors",
  "image_url",
  "is_original_research",
  "disclaimer_required",
  "locales",
  "sources_by_locale",
];

const arrayFields = ["companies", "tickers", "coins", "topics", "authors"];
const requiredLocaleFields = ["title", "summary", "why_matters", "body", "subcategory"];
const requiredSourceFields = ["source_name", "region"];

const isValidDate = (value) => {
  const date = new Date(value);
  return typeof value === "string" && value.trim() && !Number.isNaN(date.getTime());
};

const readItems = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read ${path.relative(rootDir, dataPath)}: ${error.message}`);
  }
};

const errors = [];
const warnings = [];
const items = readItems();
const ids = new Set();
const strictSources = process.env.STRICT_SOURCES === "1";

if (!Array.isArray(items)) {
  errors.push(`${path.relative(rootDir, dataPath)} must contain a JSON array.`);
} else {
  items.forEach((item, index) => {
    const label = item && item.id ? item.id : `item[${index}]`;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label}: item must be an object.`);
      return;
    }

    requiredFields.forEach((field) => {
      if (!(field in item)) {
        errors.push(`${label}: missing required field "${field}".`);
        return;
      }

      if (typeof item[field] === "string" && !item[field].trim()) {
        errors.push(`${label}: field "${field}" cannot be empty.`);
      }
    });

    if (ids.has(item.id)) {
      errors.push(`${label}: duplicate id "${item.id}".`);
    }
    ids.add(item.id);

    if (!allowedVerticals.has(item.vertical)) {
      errors.push(`${label}: invalid vertical "${item.vertical}". Use ai or finance.`);
    }

    if (!allowedContentTypes.has(item.content_type)) {
      errors.push(`${label}: invalid content_type "${item.content_type}". Use news, column, or research.`);
    }

    if (!allowedSubcategories.has(item.subcategory)) {
      errors.push(`${label}: invalid subcategory "${item.subcategory}".`);
    }

    ["published_at", "fetched_at"].forEach((field) => {
      if (!isValidDate(item[field])) {
        errors.push(`${label}: "${field}" must be a valid ISO datetime.`);
      }
    });

    arrayFields.forEach((field) => {
      if (!Array.isArray(item[field])) {
        errors.push(`${label}: "${field}" must be an array.`);
      }
    });

    if (!Array.isArray(item.body_zh) || item.body_zh.length === 0 || item.body_zh.length > 3) {
      errors.push(`${label}: "body_zh" must contain 1 to 3 digest paragraphs.`);
    }

    if (!item.locales || typeof item.locales !== "object" || Array.isArray(item.locales)) {
      errors.push(`${label}: "locales" must be an object keyed by zh-Hant, zh-Hans, and en.`);
    } else {
      allowedLocales.forEach((locale) => {
        const localePayload = item.locales[locale];
        if (!localePayload || typeof localePayload !== "object" || Array.isArray(localePayload)) {
          errors.push(`${label}: missing locales.${locale}.`);
          return;
        }

        requiredLocaleFields.forEach((field) => {
          const value = localePayload[field];
          if (field === "body") {
            if (!Array.isArray(value) || value.length === 0 || value.length > 3 || value.some((paragraph) => typeof paragraph !== "string" || !paragraph.trim())) {
              errors.push(`${label}: locales.${locale}.body must contain 1 to 3 non-empty paragraphs.`);
            }
            return;
          }

          if (typeof value !== "string" || !value.trim()) {
            errors.push(`${label}: locales.${locale}.${field} must be a non-empty string.`);
          }
        });
      });
    }

    if (!item.sources_by_locale || typeof item.sources_by_locale !== "object" || Array.isArray(item.sources_by_locale)) {
      errors.push(`${label}: "sources_by_locale" must be an object keyed by zh-Hant, zh-Hans, and en.`);
    } else {
      allowedLocales.forEach((locale) => {
        const sourcePayload = item.sources_by_locale[locale];
        if (!sourcePayload || typeof sourcePayload !== "object" || Array.isArray(sourcePayload)) {
          errors.push(`${label}: missing sources_by_locale.${locale}.`);
          return;
        }

        requiredSourceFields.forEach((field) => {
          if (typeof sourcePayload[field] !== "string" || !sourcePayload[field].trim()) {
            errors.push(`${label}: sources_by_locale.${locale}.${field} must be a non-empty string.`);
          }
        });
      });
    }

    ["source_url", "canonical_url"].forEach((field) => {
      if (typeof item[field] === "string" && item[field].includes("example.com")) {
        const message = `${label}: "${field}" still uses example.com placeholder.`;

        if (strictSources) {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }
    });
  });
}

warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`Error: ${error}`));
  process.exit(1);
}

console.log(`Validated ${items.length} news items from ${path.relative(rootDir, dataPath)}.`);
