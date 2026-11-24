# Direct Website Enquiries

## Architecture

The public website stays on GitHub Pages. The contact form sends JSON over HTTPS
to the existing `shree-keshar-plastic` Cloudflare Worker at its `workers.dev`
address. The Worker uses Hostinger's Mail API to submit plain-text enquiries to
`info@shreekesharplastic.com`. No nameserver, MX, SPF, DKIM, or domain routing
change is required. Do not activate the pending Cloudflare DNS zone for this.

The previously attempted SMTP transport is retained for historical tests but is
not the selected transport. Hostinger's SMTP address falls in Cloudflare's blocked
TCP destination ranges; moving the frontend would not fix that restriction.

## Credentials and Configuration

In the Worker's runtime settings:

- `HOSTINGER_MAIL_API_TOKEN`: encrypted Secret, entered privately by the owner.
- `HOSTINGER_MAILBOX_ID`: the resource ID for the selected business mailbox.
- `EMAIL_TRANSPORT`: `hostinger-api`.
- `EMAIL_ENABLED`: `true` only after an approved delivery test.
- `STAGING_ORIGIN`: the exact existing HTTPS Worker origin.
- `ENQUIRY_RATE_LIMIT` and `ENQUIRY_TOTAL_LIMIT`: both existing bindings required.

Never put the token or mailbox password in source, frontend JavaScript, GitHub,
Wrangler `vars`, logs, screenshots, or chat. Hostinger currently grants SMTP/IMAP
and webhook management on the selected mailbox, not a send-only permission.
The owner approved this scope. Code uses only the send endpoint; it does not read,
delete, search, or otherwise manage mail. Restrict Worker deployment permissions:
anyone able to change Worker code can potentially use its runtime secrets.
The old encrypted SMTP password is unused and was not revealed or removed.

## Safety and Semantics

- Sender and recipient are fixed server-side; no visitor-provided CC or BCC.
- CORS allows only the exact business origin and exact configured preview origin.
- Cross-origin requests omit browser credentials. CORS is not authentication;
  server validation, honeypot, payload bounds and rate limits are still required.
- Rate limits fail closed. Native limits are approximate per location, not a
  strict global daily cap. Monitor mailbox quota and investigate unusual traffic.
- Hostinger fetch uses `redirect: manual`; every redirect is rejected. Workers
  does not implement `redirect: error`, although browsers do.
- The API's documented HTTP 204 means accepted for delivery, not inbox delivery.
  No retry occurs after ambiguous results. The form retains entered details.
- Visitor work email is included in the text body. The documented Hostinger send
  API does not expose Reply-To; staff should use that address when responding,
  rather than replying to the website sender.
- No automatic reply is sent to the visitor. No separate lead database is created.
- Analytics records an accepted enquiry only after acknowledgement and only if
  analytics consent exists; names, phone numbers and message bodies are excluded.

## Build and Test

Run `node --test tests/*.test.mjs` and `node scripts/build-site.mjs --check`.
The original `scripts/build-cloudflare-dashboard.mjs` creates an ignored single
Worker module for the existing dashboard editor. Runtime secrets are not bundled.
Reload the dashboard editor/settings between code and variable deployments so a
stale settings screen does not redeploy an older code version.

GitHub Pages publishes only the static files; `_config.yml` excludes backend,
tests, configuration and documentation. The Worker is deployed separately.
Rebuild production pages with `scripts/build-cloudflare.mjs`, not the preview-only
builder, which intentionally adds noindex metadata.

To stop sending, set `EMAIL_ENABLED=false` in the Worker and sync `wrangler.jsonc`.
New page loads hide the unavailable email action while retaining direct contact.
Already-open forms receive a clear rejection without losing their field values.

## Provenance

Implementation and tests are original, requirement-derived code. They use existing
browser/Node built-ins, Cloudflare runtime APIs and the owner-approved Hostinger
HTTPS Mail API. No SDK, dependency, external template, copied implementation,
package installation or third-party relay was introduced. API specification
version 1.4.0 was consulted only for request and response contracts.

Official references:

- https://docs.hostinger.com/emails/mail-api
- https://api.mail.hostinger.com/openapi/openapi.json
- https://docs.hostinger.com/emails/agentic-mail
- https://developers.cloudflare.com/workers/runtime-apis/request/
- https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/

## Verification Record

The preview test with reference `4347202a-ff34-4301-8b4e-a8fd37c44dfb` was accepted
by Hostinger and verified in the business inbox on 24 November 2026. Its unique
marker was `SKP-API-PREVIEW-2026-11-24T15-12-14-311Z`. Production verification is
pending; preview delivery alone is not a production launch sign-off.
