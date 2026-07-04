const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const htmlFiles = [];
const errors = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }

    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(filePath);
    }
  }
};

const targetExists = (fromFile, href) => {
  const cleanHref = href.split("#")[0].split("?")[0];

  if (!cleanHref || cleanHref.startsWith("http") || cleanHref.startsWith("mailto:") || cleanHref.startsWith("tel:")) {
    return true;
  }

  const resolved = path.resolve(path.dirname(fromFile), cleanHref);
  const candidates = cleanHref.endsWith("/")
    ? [path.join(resolved, "index.html")]
    : [resolved, path.join(resolved, "index.html")];

  return candidates.some((candidate) => fs.existsSync(candidate));
};

walk(rootDir);

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(rootDir, filePath);

  if (!/<link\s+rel=["']canonical["']/i.test(html)) {
    errors.push(`${rel}: missing canonical link.`);
  }

  if (!/<meta\s+property=["']og:title["']/i.test(html)) {
    errors.push(`${rel}: missing og:title.`);
  }

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)) {
    const href = match[1];

    if (!targetExists(filePath, href)) {
      errors.push(`${rel}: missing local target "${href}".`);
    }
  }
}

if (errors.length) {
  errors.forEach((error) => console.error(`Error: ${error}`));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files.`);
