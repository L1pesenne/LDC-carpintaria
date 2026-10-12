import http from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(workspace, 'dist');
const dataRoot = process.env.LDC_DATA_DIR ? path.resolve(process.env.LDC_DATA_DIR) : path.join(workspace, 'data');
const uploadsRoot = path.join(dataRoot, 'uploads');
const databasePath = path.join(dataRoot, 'database.json');
const setupPath = path.join(dataRoot, 'primeiro-acesso.txt');
const port = Number(process.env.LDC_PORT || 4173);
const secure = process.env.LDC_SECURE_COOKIE === 'true';
const expectedOrigin = process.env.LDC_PUBLIC_ORIGIN || `http://127.0.0.1:${port}`;
const derive = promisify(scrypt);
const sessions = new Map();
const attempts = new Map();
let queue = Promise.resolve();
let setupToken = '';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
await mkdir(uploadsRoot, { recursive: true });
try { await accessDatabase(); } catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await saveDatabase({ admin: null, products: [], archivedProducts: [] });
}
if (!(await accessDatabase()).admin) {
  try { setupToken = (await readFile(setupPath, 'utf8')).trim(); }
  catch { setupToken = randomBytes(16).toString('hex'); await writeFile(setupPath, setupToken, { mode: 0o600 }); }
  console.log(`Primeiro acesso: use o código disponível em ${setupPath}`);
}
async function accessDatabase() { return JSON.parse(await readFile(databasePath, 'utf8')); }
async function saveDatabase(data) {
  const temp = databasePath + '.tmp';
  await writeFile(temp, JSON.stringify(data, null, 2), { mode: 0o600 }); await rename(temp, databasePath);
}
function serial(action) { const result = queue.then(action); queue = result.catch(() => {}); return result; }
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function json(res, status, value, headers = {}) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(value)); }
function sessionFor(req) {
  const id = (req.headers.cookie || '').split(';').map(item => item.trim()).find(item => item.startsWith('ldc_session='))?.slice(12);
  const session = sessions.get(id); if (!session) return null;
  if (session.expires < Date.now()) { sessions.delete(id); return null; } return { ...session, id };
}
function cookie(value, maxAge = 28800) { return `ldc_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure ? '; Secure' : ''}`; }
function newSession(req, res, username) {
  const previous = sessionFor(req); if (previous) sessions.delete(previous.id);
  const id = randomBytes(32).toString('hex'); const csrf = randomBytes(24).toString('hex');
  sessions.set(id, { username, csrf, expires: Date.now() + 8 * 60 * 60 * 1000 }); json(res, 200, { username, csrf }, { 'Set-Cookie': cookie(id) });
}
function equal(a, b) { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); }
function guard(req, session) { if (!session) fail(401, 'Faça login para continuar.'); if (!equal(req.headers['x-csrf-token'] || '', session.csrf)) fail(403, 'Atualize a página e tente novamente.'); }
async function body(req) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) fail(415, 'Envie dados em JSON.');
  let length = 0; const chunks = [];
  for await (const chunk of req) { length += chunk.length; if (length > 8 * 1024 * 1024) fail(413, 'A imagem deve ter no máximo 5 MB.'); chunks.push(chunk); }
  try { const data=JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400,'Dados inválidos.'); return data; } catch { fail(400, 'Dados inválidos.'); }
}
function text(value, min, max, label) { if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, `${label}: use entre ${min} e ${max} caracteres.`); return value.trim(); }
async function passwordRecord(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) fail(400, 'A senha deve ter entre 12 e 128 caracteres.');
  const salt = randomBytes(16).toString('hex'); const hash = (await derive(password, salt, 64)).toString('hex'); return { salt, hash };
}
function rateLimit(req) {
  const key = req.socket.remoteAddress; let record = attempts.get(key);
  if (!record || record.until < Date.now()) { record = { count: 0, until: Date.now() + 15 * 60 * 1000 }; attempts.set(key, record); }
  if (record.count >= 5) fail(429, 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'); record.count++; return key;
}
async function imageFile(value, existing) {
  if (!value) { if (existing) return existing; fail(400, 'Selecione uma imagem do produto.'); }
  if (typeof value !== 'string') fail(400, 'Imagem inválida.');
  const match = value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/); if (!match) fail(400, 'Use uma imagem JPG, PNG ou WebP.');
  const bytes = Buffer.from(match[2], 'base64'); if (!bytes.length || bytes.length > 5 * 1024 * 1024) fail(400, 'A imagem deve ter no máximo 5 MB.');
  const valid = match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) fail(400, 'O arquivo não corresponde a uma imagem válida nesse formato.');
  const filename = `${randomUUID()}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`; await writeFile(path.join(uploadsRoot, filename), bytes, { flag: 'wx' }); return `uploads/${filename}`;
}
async function productPayload(data, existing) {
  const name = text(data.name, 1, 100, 'Nome'); const description = text(data.description, 1, 2000, 'Descrição'); const category = text(data.category || 'Produtos', 1, 60, 'Categoria');
  if (typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price < 0 || data.price > 99999999 || Math.abs(data.price * 100 - Math.round(data.price * 100)) > 0.00001) fail(400, 'Informe um preço válido com até duas casas decimais.');
  const image = await imageFile(data.imageData, existing?.image);
  return { id: existing?.id || randomUUID(), name, description, category, price: data.price, image, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
}
async function api(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/products') { json(res, 200, { products: (await accessDatabase()).products, demo: false }); return; }
  if (req.method === 'GET' && pathname === '/api/auth/status') { const session = sessionFor(req); json(res, 200, { setupRequired: !(await accessDatabase()).admin, authenticated: !!session, username: session?.username, csrf: session?.csrf }); return; }
  if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin !== expectedOrigin && !(expectedOrigin === `http://127.0.0.1:${port}` && req.headers.origin === `http://localhost:${port}`)) fail(403, 'Origem da solicitação inválida.');
  if (req.method === 'POST' && pathname === '/api/auth/setup') {
    await serial(async () => {
      const database = await accessDatabase(); if (database.admin) fail(409, 'O administrador já foi configurado.');
      const key = rateLimit(req); const data = await body(req); if (!setupToken || !equal(data.code || '', setupToken)) fail(403, 'Código de primeiro acesso inválido.');
      const username = text(data.username, 3, 60, 'Usuário'); database.admin = { username, ...await passwordRecord(data.password) }; await saveDatabase(database);
      setupToken = ''; await writeFile(setupPath, 'Primeiro acesso concluído. O código foi invalidado.'); attempts.delete(key); newSession(req, res, username);
    }); return;
  }
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const key = rateLimit(req); const data = await body(req); const admin = (await accessDatabase()).admin;
    if (typeof data.password !== 'string' || data.password.length > 128 || !admin) fail(401, 'Usuário ou senha inválidos.');
    const candidate = (await derive(data.password, admin.salt, 64)).toString('hex');
    if (!equal(data.username || '', admin.username) || !equal(candidate, admin.hash)) fail(401, 'Usuário ou senha inválidos.');
    attempts.delete(key); newSession(req, res, admin.username); return;
  }
  const session = sessionFor(req);
  if (req.method === 'POST' && pathname === '/api/auth/logout') { guard(req, session); sessions.delete(session.id); json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) }); return; }
  if (req.method === 'POST' && pathname === '/api/products') {
    guard(req, session); const data = await body(req);
    await serial(async () => { const database = await accessDatabase(); const product = await productPayload(data); database.products.push(product); await saveDatabase(database); json(res, 201, { product }); }); return;
  }
  const match = pathname.match(/^\/api\/products\/([a-f0-9-]{36})$/);
  if (match && ['PUT', 'DELETE'].includes(req.method)) {
    guard(req, session); const data = req.method === 'PUT' ? await body(req) : null;
    await serial(async () => {
      const database = await accessDatabase(); const index = database.products.findIndex(product => product.id === match[1]); if (index < 0) fail(404, 'Produto não encontrado.');
      if (req.method === 'DELETE') { database.archivedProducts.push({ ...database.products[index], deletedAt: new Date().toISOString() }); database.products.splice(index, 1); await saveDatabase(database); json(res, 200, { ok: true }); }
      else { const product = await productPayload(data, database.products[index]); database.products[index] = product; await saveDatabase(database); json(res, 200, { product }); }
    }); return;
  }
  fail(404, 'Recurso não encontrado.');
}
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try {
    const pathname = decodeURIComponent(new URL(req.url, expectedOrigin).pathname);
    if (pathname.startsWith('/api/')) { await api(req, res, pathname); return; }
    if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Método não permitido.');
    if (pathname === '/admin.html' && !sessionFor(req)) { res.writeHead(302, { Location: '/login.html', 'Cache-Control': 'no-store' }); res.end(); return; }
    let target;
    if (pathname.startsWith('/uploads/')) { const name = pathname.slice(9); if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(name)) fail(404, 'Imagem não encontrada.'); target = path.join(uploadsRoot, name); }
    else { target = path.resolve(publicRoot, '.' + pathname); if (target !== publicRoot && !target.startsWith(publicRoot + path.sep)) fail(403, 'Acesso negado.'); if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); }
    const content = await readFile(target); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    const status = error.status || (error.code === 'ENOENT' ? 404 : 500); if (!error.status && status === 500) console.error(error);
    json(res, status, { error: error.status ? error.message : status === 404 ? 'Página não encontrada.' : 'Não foi possível concluir. Tente novamente.' });
  }
});
setInterval(() => { for (const [id, session] of sessions) if (session.expires < Date.now()) sessions.delete(id); for (const [key, attempt] of attempts) if (attempt.until < Date.now()) attempts.delete(key); }, 60000).unref();
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port} · Administração: http://127.0.0.1:${port}/login.html`));
