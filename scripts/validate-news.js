const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "data", "news.json");

const allowedVerticals = new Set(["ai", "finance"]);
const allowedContentTypes = new Set(["news", "column", "research"]);
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
];

const arrayFields = ["companies", "tickers", "coins", "topics", "authors"];

const isValidDate = (value) => {
  const date = new Date(value);
  return typeof value === "string" && value.trim() && !Number.isNaN(date.getTime());
};

const readItems = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read data/news.json: ${error.message}`);
  }
};

const errors = [];
const warnings = [];
const items = readItems();
const ids = new Set();
const strictSources = process.env.STRICT_SOURCES === "1";

if (!Array.isArray(items)) {
  errors.push("data/news.json must contain a JSON array.");
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

console.log(`Validated ${items.length} news items.`);
