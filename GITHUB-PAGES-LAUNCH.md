# GitHub Pages Launch

Owner-approved release: 24 November 2026. Keep the existing `main` branch Pages
deployment and `shreekesharplastic.com` custom domain. No DNS, nameserver,
Hostinger mailbox or Cloudflare custom-domain change is part of this launch.

## Release Scope

- Publish the reviewed plastic-core-led design, official logo, 360-degree viewer,
  application concepts, real black-pipe photos and existing commercial URLs.
- Keep PVC/HDPE supply and complete farm installation accessible.
- Publish production index/follow metadata for the sixteen sitemap URLs.
- Keep the privacy and specification pages noindex. Retire the excluded legacy
  `generated/` city pages rather than redirecting unrelated content to the home page.
- Exclude backend, generators, tests, drafts and project notes from Jekyll output
  through `_config.yml`. This is not repository privacy or credential protection.
- Stage only the public asset allowlist and reviewed frontend source/tests.
  Do not add `.env`, `.dev.vars`, `.wrangler`, mailbox passwords or backend secrets.

## Contact Behavior

The initial launch kept email disabled while SMTP connectivity was unresolved.
The owner subsequently approved Hostinger Mail API delivery using a mailbox-scoped
encrypted token in the existing Cloudflare Worker. The preview enquiry was
verified in the Hostinger inbox before preparing production activation.
See `EMAIL-DELIVERY.md` for the current transport, verification and rollback.

The website remains static on GitHub Pages. Its form calls the separately hosted
Worker with exact-origin CORS; it does not need a GitHub server or DNS change.
WhatsApp preparation remains optional and does not emit an accepted-email lead.

## Rebuilding

Run `node scripts/build-site.mjs`, then `node scripts/build-site.mjs --check`.
Review and stage generated pages with their required assets. Do not copy the
Cloudflare preview's noindex `dist/` files into the live root. The live site uses
the existing GitHub-managed Pages build; no new Actions plugin or package is used.

## Provenance

Original requirement-derived frontend, configuration and tests. Uses the existing
GitHub Pages build, browser/WebGL APIs and Node standard library. The approved
Google Fonts/GA4, WhatsApp and YouTube references are retained. Owner-supplied logo
and real black-pipe photographs are retained. Application pictures are existing
AI-generated concept illustrations and remain labelled as such. No new dependency,
external source code or copied template was introduced. Unused Three.js assets
and their legitimate license notice are not included in this release.
