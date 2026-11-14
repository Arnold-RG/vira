import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.html', '.js', '.css', '.json', '.txt', '.md', '.svg'].includes(extname(name).toLowerCase())) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(root);
const html = readFileSync(join(root, 'index.html'), 'utf8');

const BANNED = /\b(unleash|empower|transform|cutting[ -]?edge|world[ -]?class|game[ -]?changing|next[ -]?gen(?:eration)?|revolutionize|seamless|viral|elevate)\b/i;
const NAMES = /\b(Arnova|Anvira|Ateck|King Whisper)\b/;
const EMAIL = /mailto:|[A-Z0-9._%+-]+@gmail\.com/i;

test('copy has no banned marketing words, aliases or email', () => {
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  assert.equal(BANNED.test(visible), false, 'banned word in page copy');
  assert.equal(NAMES.test(html), false);
  assert.equal(EMAIL.test(html), false);
  const content = readFileSync(join(root, 'content.json'), 'utf8');
  assert.equal(BANNED.test(content), false);
  assert.equal(NAMES.test(content), false);
  assert.equal(EMAIL.test(content), false);
});

test('page makes no third-party resource requests', () => {
  const resources = [];
  const srcRe = /<(?:script|img|source|video|audio|iframe|object|embed)\b[^>]*\b(?:src|href)=["'](https?:[^"']+)["']/gi;
  const linkRe = /<link\b[^>]*href=["'](https?:[^"']+)["']/gi;
  let m;
  while ((m = srcRe.exec(html))) resources.push(m[1]);
  while ((m = linkRe.exec(html))) {
    const tag = m[0];
    if (/\brel=["'](?:canonical|icon|apple-touch-icon)/i.test(tag)) continue;
    resources.push(m[1]);
  }
  assert.deepEqual(resources, [], 'unexpected remote resources in HTML: ' + resources.join(', '));

  const css = readFileSync(join(root, 'css/site.css'), 'utf8');
  const cssUrls = [...css.matchAll(/url\(\s*["']?(https?:[^"')]+)["']?\s*\)/gi)].map((x) => x[1]);
  assert.deepEqual(cssUrls, [], 'remote url() in CSS');
  assert.equal(/@import\s+["']?https?:/i.test(css), false);

  for (const file of files) {
    if (!file.endsWith('.js') || file.endsWith('.test.js')) continue;
    const t = readFileSync(file, 'utf8');
    const fetches = [...t.matchAll(/\bfetch\(\s*["'](https?:[^"']+)/g)].map((x) => x[1]);
    assert.deepEqual(fetches, [], file + ' fetches remotely');
  }
});

test('WhatsApp is main-first and CSP is strict', () => {
  assert.match(html, /Content-Security-Policy/);
  assert.equal(html.includes('unsafe-inline'), false);
  assert.equal(html.includes('unsafe-eval'), false);
  assert.match(html, /form-action 'self' https:\/\/wa\.me/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /img-src 'self'/);
  const wa = [...html.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((x) => x[1]);
  assert.equal(wa[0], '250794607518');
  assert.ok(html.indexOf('WhatsApp, Main:') < html.indexOf('WhatsApp, Backup:'));
  assert.match(html, /value="RW"[^>]*checked/);
  assert.match(html, /class="[^"]*btn-wa-primary[^"]*"/);
  assert.equal(html.includes('mailto:'), false);
});

test('placeholder slots are clearly empty, not pretended real', () => {
  const content = JSON.parse(readFileSync(join(root, 'content.json'), 'utf8'));
  assert.equal(content.slots.founder_photo.src, '');
  assert.match(content.slots.founder_photo.label, /coming soon/i);
  for (const k of ['why_i_built_vira', 'motivation', 'education', 'experience', 'mission', 'motto', 'about']) {
    assert.match(content.slots[k].body, /Coming soon — Arnold is writing this/);
  }
  assert.deepEqual(content.slots.work_gallery.projects, []);
  assert.match(content.slots.work_gallery.empty, /Real project photos coming soon/);
  assert.match(html, /Founder photo coming soon/);
  assert.match(html, /Real project photos coming soon/);
});

test('FAQ accordion is present and Vira is not described as small', () => {
  assert.match(html, /id=["']faq["']/);
  assert.match(html, /<details>/);
  assert.match(html, /\bFAQ\b/);
  assert.match(html, /aria-labelledby="faq-title"/);
  assert.equal(/small studio/i.test(html), false);
  assert.equal(/small technology studio/i.test(html), false);
  const content = readFileSync(join(root, 'content.json'), 'utf8');
  assert.equal(/small studio/i.test(content), false);
  assert.match(html, /Verify before you pay/);
  assert.match(html, /Americas, Europe/);
  assert.match(html, /WhatsApp only/);
});

test('plans use the final four tiers and prices in PLN', () => {
  assert.match(html, /data-choose="Basic"/);
  assert.match(html, /data-choose="Standard"/);
  assert.match(html, /data-choose="Super"/);
  assert.match(html, /data-choose="Plus"/);
  assert.equal(html.includes('data-choose="Starter"'), false);
  assert.equal(html.includes('data-choose="Premium"'), false);
  assert.equal(html.includes('Premium Plus'), false);
  assert.match(html, /Plans for businesses in Rwanda, priced in PLN/);
  assert.match(html, /155–175 PLN/);
  assert.match(html, /255–275 PLN/);
});

test('footer has the studio details on the page', () => {
  const foot = html.slice(html.indexOf('<footer'));
  assert.match(foot, /Vision\. Innovation\. Reliability\. Automation\./);
  assert.match(foot, /Websites/);
  assert.match(foot, /Financial support and management/);
  assert.match(foot, /href="#builder"/);
  assert.match(foot, /href="#why-clients"/);
  assert.match(foot, /WhatsApp, Main: \+250 794 607 518 \(Rwanda\)/);
  assert.match(foot, /WhatsApp, Backup: \+48 575 217 930 \(Poland\)/);
  assert.match(foot, /Kigali, Rwanda/);
  assert.match(foot, />Poland</);
  assert.match(foot, /BLIK/);
  assert.match(foot, /Bank transfer/);
  assert.match(foot, /MTN MoMo Pay/);
  assert.match(foot, /PayPal/);
  assert.match(foot, /Americas, Europe, Africa/);
  assert.match(foot, /PHOTO-CREDITS\.md/);
  assert.match(foot, /© 2026 Vira/);
});

test('every image is local and every photo file is credited', () => {
  const imgSrc = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  assert.ok(imgSrc.length > 0, 'expected images');
  for (const tag of imgSrc) {
    const src = /(?:src|srcset)=["']([^"']+)["']/.exec(tag);
    assert.ok(src, 'img without src: ' + tag);
    assert.equal(/^https?:/i.test(src[1]), false, 'remote img: ' + src[1]);
    assert.equal(src[1].startsWith('//'), false, 'protocol-relative img: ' + src[1]);
    const path = src[1].split(/\s+/)[0];
    assert.ok(existsSync(join(root, path)), 'missing file for ' + path);
  }
  const sources = [...html.matchAll(/<source\b[^>]*>/gi)].map((m) => m[0]);
  for (const tag of sources) {
    const src = /srcset=["']([^"']+)["']/.exec(tag);
    if (!src) continue;
    assert.equal(/^https?:/i.test(src[1]), false, 'remote source: ' + src[1]);
    assert.ok(existsSync(join(root, src[1])), 'missing file for ' + src[1]);
  }

  const photosDir = join(root, 'assets', 'photos');
  const credits = readFileSync(join(root, 'PHOTO-CREDITS.md'), 'utf8');
  const photos = readdirSync(photosDir).filter((n) => !n.startsWith('.'));
  assert.ok(photos.length >= 6, 'expected at least 6 photos');
  for (const name of photos) {
    const heading = credits.includes('assets/photos/' + name) || credits.includes(name);
    assert.ok(heading, name + ' is not listed in PHOTO-CREDITS.md');
    const idx = credits.indexOf(name);
    const slice = credits.slice(Math.max(0, idx), idx + 600);
    assert.match(slice, /Photographer:/);
    assert.match(slice, /Source page: https:\/\/www\.(pexels|unsplash)\.com\//);
    assert.match(slice, /Licence:/);
  }
  assert.equal(/kigali|kraków|krakow/i.test(credits), false, 'city photos should be gone');
  assert.equal(/not our team/i.test(html), false);
});
