# CYBERNEWS Deployment

This is a new standalone static product. Do not reuse the ALTOS LAB official-site
AWS runtime, GA property, GTM container, or production domain unless Tommy
explicitly changes that decision.

## Local Build

```bash
npm run validate
npm run build:static
npm run validate:site
python3 -m http.server 5173 --bind 127.0.0.1
```

Preview:

```txt
http://127.0.0.1:5173/
```

## GitHub Space

Target repo:

```txt
altoslab-offical/cybernews
```

Static preview URL after GitHub Pages deploys:

```txt
https://altoslab-offical.github.io/cybernews/
```

The repo includes `.github/workflows/pages.yml`, which rebuilds the static pages,
validates local links, uploads the artifact, and publishes GitHub Pages on every
push to `main`.

## New GA / GTM

Create new resources for this product:

- GA4 property: `CYBERNEWS`
- Web data stream URL: the final AWS or GitHub Pages URL
- GTM web container: `CYBERNEWS`

After the new IDs exist, write them to `data/site.json`:

```json
{
  "ga_measurement_id": "G-XXXXXXXXXX",
  "gtm_id": "GTM-XXXXXXX"
}
```

Then rebuild:

```bash
npm run build:static
npm run validate:site
```

The generated HTML inserts both standard GTM and GA snippets when those fields
are non-empty.

## New AWS Static Production

Preferred production shape:

```txt
S3 bucket (private static assets)
CloudFront distribution
Origin Access Control
Default root object: index.html
Custom error response: 404.html for 403/404
```

Build with the final production URL before upload:

```bash
SITE_URL="https://<new-cloudfront-or-custom-domain>" npm run build:static
npm run validate:site
aws s3 sync . "s3://<new-cybernews-bucket>" \
  --delete \
  --exclude ".git/*" \
  --exclude ".github/*" \
  --exclude "node_modules/*" \
  --exclude ".DS_Store"
aws cloudfront create-invalidation --distribution-id "<distribution-id>" --paths "/*"
```

Production completion requires browser readback through Tommy's existing Chrome
profile, plus a public check of `/`, `/latest.html`, one `articles/.../`, one
`research/.../`, `/newsletter.html`, `/rss.xml`, `/sitemap.xml`, `/llms.txt`,
and `/llms-full.txt`.
