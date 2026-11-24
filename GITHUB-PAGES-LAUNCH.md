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

The form has `data-email-delivery="disabled"`: no email availability request is
made to GitHub Pages, and the direct-send button remains hidden and disabled.
The visitor can prepare and review a WhatsApp message locally, then explicitly
open WhatsApp and send it there. Phone and `mailto:` links remain available.
Preparation is not a delivered enquiry and does not emit `generate_lead`.

The separate Cloudflare preview has `EMAIL_ENABLED=false` after the owner-approved
rollback. Its encrypted mailbox secret remains in Cloudflare, not in this repo.
The SMTP attempt failed before authentication because Hostinger's current SMTP
address resolves inside Cloudflare's blocked outbound TCP destination ranges.
Do not enable direct email or change DNS as a side effect of publishing this site.

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
