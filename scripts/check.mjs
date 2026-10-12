import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const config = require('../site/config.js');
const app = require('../site/app.js');
const pages = ['index.html', 'produtos.html', 'sobre.html', 'area-de-atendimento.html', 'contato.html'];
for (const file of pages) {
  const html = await readFile(path.join(root, 'dist', file), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: um título principal`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: IDs únicos`);
  assert.ok(html.includes('name="description"'));
  assert.ok(html.includes(`href="${file}" aria-current="page"`));
  assert.ok(html.includes('assets/config.js'));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (url.startsWith('#')) assert.ok(ids.includes(url.slice(1)), `${file}: âncora ${url}`);
    else if (!/^[a-z]+:/i.test(url)) await access(path.join(root, 'dist', url));
  }
}
const sample = [{name:'Tábua 02', category:'A', description:'Madeira'}, {name:'Tábua 03', category:'B', description:'Madeira'}];
assert.equal(app.filterProducts(sample, 'TÁBUA').length, 2);
assert.equal(app.filterProducts(sample, '02', 'A').length, 1);
assert.equal(app.filterProducts(sample, '02', 'B').length, 0);
assert.equal(app.filterProducts(sample, 'inexistente').length, 0);
assert.equal(app.whatsappUrl('', 'teste'), null);
assert.ok(app.whatsappUrl(config.whatsapp, 'teste').startsWith('https://wa.me/5521979847262?text='));
assert.ok(decodeURIComponent(app.whatsappUrl(config.whatsapp, app.messageFor(sample[0]))).includes(sample[0].name));
assert.ok(app.messageFor(null, true).includes('endereço'));
assert.equal(new Set(config.products.map(item => item.id)).size, config.products.length);
console.log('OK: cinco páginas, links locais, âncoras, metadados, filtros e mensagens de WhatsApp.');
