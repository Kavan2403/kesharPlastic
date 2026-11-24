# Legacy SEO Automation (Disabled)

Do not run these historical generators. Both entry points are guarded because they
would recreate unverified claims or overwrite the reviewed commercial pages.
The files below document the old system, not the current publishing workflow.

The maintained, dependency-free static build is:

```bash
node scripts/build-site.mjs
node --test tests/site.test.mjs
node scripts/preview-server.mjs
```

Edit `site/catalogue.mjs`, `site/pages.mjs`, `site/components.mjs` and
`site/layout.mjs` for the current site. Existing `/generated/` content remains
outside the preview and requires a separate URL-disposition review before launch.

## Historical Documentation

This generator builds scalable local SEO pages and blogs for **Shree Keshar Plastic** without any backend.

## Run

```bash
node seo-system/generate-seo.js
```

## Output

Generated files are written to:

- `generated/index.html` (hub)
- `generated/<service>-in-<city>/index.html` (local SEO pages)
- `generated/blog/<topic>/index.html` (blog pages)
- `generated/sitemap.xml`
- `generated/robots.txt`
- `generated/assets/seo.css`
- `generated/assets/seo.js`

## Features Included

- Programmatic SEO pages for service + city combinations
- Auto content generation with template variation (duplicate-risk reduction)
- Internal linking + related pages block
- JSON-LD schema: `LocalBusiness`, `Product`, `FAQPage`, `Review`, `Article`
- Blog automation pages with service links
- Automatic sitemap and robots generation
- Lead capture (Call + WhatsApp + form to WhatsApp)
- Sticky floating CTA buttons
- Lazy-load behavior for images

## Scale to 100+ pages

Edit these arrays in `seo-system/generate-seo.js`:

- `cities`
- `serviceTypes`
- `blogs`

Then rerun the generator.
