import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Bundle only our known modules for Cloudflare's single-file web editor.
// This is not a general JavaScript bundler; reject unexpected imports.
const root = new URL('../', import.meta.url);
const files = ['hostinger-smtp.mjs', 'hostinger-mail-api.mjs', 'enquiry.mjs', 'worker.mjs'];
const parts = [];
for (const file of files) {
  let source = await readFile(new URL(`cloudflare/${file}`, root), 'utf8');
  if (file === 'enquiry.mjs') {
    source = source.replace("import { MAILBOX as EMAIL, sendHostingerEmail, smtpConfigured } from './hostinger-smtp.mjs';", 'const EMAIL = MAILBOX;');
    source = source.replace("import { mailApiConfigured, sendHostingerApiEmail } from './hostinger-mail-api.mjs';", '');
  } else if (file === 'worker.mjs') {
    source = source.replace("import { handleEnquiry } from './enquiry.mjs';", '');
  }
  if (/^import\s/m.test(source)) throw new Error(`Unreviewed import in ${file}`);
  if (file !== 'worker.mjs') source = source.replace(/^export (?=(?:async )?function |const )/gm, '');
  parts.push(`// Source: cloudflare/${file}\n${source.trim()}`);
}
const output = new URL('.wrangler/preview-worker.mjs', root);
await mkdir(new URL('.wrangler/', root), { recursive: true });
await writeFile(output, parts.join('\n\n') + '\n');
console.log(`Dashboard module prepared: ${output.pathname}`);
