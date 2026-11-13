import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAccounts } from './payments.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

const PLN_DISPLAY = 'b26f60032b900a7e0151ecceea6a8c8e1f423d674a33706a7f6fff6bd1eb6db2';
const PLN_DIGITS  = '7d992cf0b9d4d1c1c1d31f63439d49e2bf02c00a7634585f6341dd067e2b77b0';
const EUR_DISPLAY = 'b23896592c0d3788727ef53e7584f39ca6d7516dbdd3698d96025ea038d6f823';
const EUR_DIGITS  = 'a5b826ee0f2ad84f1afbe56334a3bc64810d26deef786092961b3e137e18bffd';

test('assembled accounts match fingerprints and display shape', () => {
  const accounts = listAccounts();
  assert.equal(accounts.length, 2);
  assert.equal(accounts[0].currency, 'PLN');
  assert.equal(accounts[1].currency, 'EUR');
  for (const a of accounts) {
    assert.match(a.display, /^\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{4}$/);
    assert.equal(a.digits, a.display.replace(/ /g, ''));
    assert.equal(a.digits.length, 26);
  }
  assert.equal(sha(accounts[0].display), PLN_DISPLAY);
  assert.equal(sha(accounts[0].digits), PLN_DIGITS);
  assert.equal(sha(accounts[1].display), EUR_DISPLAY);
  assert.equal(sha(accounts[1].digits), EUR_DIGITS);
});

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else {
      const ext = extname(name).toLowerCase();
      if (['.html', '.js', '.css', '.svg', '.txt', '.md', '.json', '.mjs'].includes(ext)) out.push(p);
    }
  }
  return out;
}

test('repo text files do not contain the assembled account strings', () => {
  const accounts = listAccounts();
  const needles = accounts.flatMap((a) => [a.display, a.digits]);
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const n of needles) {
      assert.equal(text.includes(n), false, file + ' contains an account string');
    }
  }
});
