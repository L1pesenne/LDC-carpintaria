import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(tmpdir(), 'ldc-admin-test-'));
const port = 4199;
const origin = `http://127.0.0.1:${port}`;
let server;
let cookie = '';
let csrf = '';
async function start() {
  server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd:root, env:{...process.env,LDC_DATA_DIR:temporary,LDC_PORT:String(port),LDC_PUBLIC_ORIGIN:origin,LDC_SECURE_COOKIE:'false'}, stdio:['ignore','pipe','pipe'] });
  let output = ''; server.stderr.on('data', chunk=> output+=chunk);
  for(let attempt=0;attempt<60;attempt++) {
    if(server.exitCode!==null) throw new Error(output || 'Servidor de teste encerrado.');
    try { const result=await fetch(origin+'/api/auth/status');if(result.ok)return; } catch {}
    await delay(100);
  }
  throw new Error('Servidor não iniciou.');
}
async function stop() { if (!server || server.exitCode!==null) return; const ended=new Promise(resolve=>server.once('exit',resolve)); server.kill();await ended; }
async function request(url, method='GET', data, authenticated=true, withCsrf=true) {
  return fetch(origin+url,{method,headers:{Origin:origin,'Content-Type':'application/json',...(authenticated&&cookie?{Cookie:cookie}:{}),...(withCsrf&&csrf?{'X-CSRF-Token':csrf}:{})},...(data===undefined?{}:{body:JSON.stringify(data)}),redirect:'manual'});
}
try {
  await start();
  assert.equal((await request('/admin.html')).status,302);
  assert.equal((await request('/data/database.json')).status,404);
  assert.equal((await request('/api/products','POST',{},false)).status,401);
  const code=(await readFile(path.join(temporary,'primeiro-acesso.txt'),'utf8')).trim();
  const account={code,username:'admin-teste',password:'Senha-de-teste-2026!'};
  const setup=await request('/api/auth/setup','POST',account);
  assert.equal(setup.status,200);cookie=setup.headers.get('set-cookie').split(';')[0];csrf=(await setup.json()).csrf;
  assert.ok(setup.headers.get('set-cookie').includes('HttpOnly'));
  assert.equal((await request('/api/auth/setup','POST',account)).status,409);
  assert.equal((await request('/admin.html')).status,200);
  assert.equal((await request('/api/products','POST',{},true,false)).status,403);
  const image=(await readFile(path.join(root,'573816091_17847848052596195_2255176578593069298_n.jpg'))).toString('base64');
  const payload={name:'Produto teste',description:'Descrição de teste com acentos',category:'Madeira',price:125.50,imageData:'data:image/jpeg;base64,'+image};
  assert.equal((await request('/api/products','POST',{...payload,price:-1})).status,400);
  assert.equal((await request('/api/products','POST',{...payload,imageData:'data:image/jpeg;base64,SGVsbG8='})).status,400);
  const created=await request('/api/products','POST',payload);assert.equal(created.status,201);const product=(await created.json()).product;
  const list=await (await request('/api/products')).json();assert.equal(list.products.length,1);assert.equal(list.products[0].price,125.5);
  assert.equal((await request('/'+product.image)).headers.get('content-type'),'image/jpeg');
  const edit=await request('/api/products/'+product.id,'PUT',{...payload,imageData:'',name:'Produto atualizado',price:150.75});assert.equal(edit.status,200);assert.equal((await edit.json()).product.image,product.image);
  await stop();cookie='';csrf='';await start();
  assert.equal((await (await request('/api/products')).json()).products[0].name,'Produto atualizado');
  assert.equal((await request('/api/auth/login','POST',{username:account.username,password:'senha-errada'})).status,401);
  const login=await request('/api/auth/login','POST',account);assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];csrf=(await login.json()).csrf;
  assert.equal((await request('/api/products/'+product.id,'DELETE')).status,200);
  assert.equal((await (await request('/api/products')).json()).products.length,0);
  const saved=JSON.parse(await readFile(path.join(temporary,'database.json'),'utf8'));assert.equal(saved.archivedProducts.length,1);assert.ok(saved.admin.hash);assert.ok(!JSON.stringify(saved).includes(account.password));
  assert.equal((await request('/api/auth/logout','POST',{})).status,200);
  assert.equal((await request('/api/products','POST',payload)).status,401);
  console.log('OK: proteção de acesso, primeiro acesso, login, sessão, CSRF, upload, cadastro, edição, persistência após reinício, retirada e logout.');
  if (process.argv.includes('--ui')) {
    const uiLogin=await request('/api/auth/login','POST',account);cookie=uiLogin.headers.get('set-cookie').split(';')[0];csrf=(await uiLogin.json()).csrf;
    await request('/api/products','POST',{...payload,name:'Produto de demonstração visual',description:'Item usado apenas no ambiente isolado de teste do painel.',price:125.5});
    console.log(`QA visual: ${origin}/login.html · usuário ${account.username} · senha ${account.password}`);
    await new Promise(resolve=>process.once('SIGINT',resolve));
  }
} finally {
  await stop();
  assert.ok(path.resolve(temporary).startsWith(path.resolve(tmpdir())+path.sep+'ldc-admin-test-'));
  await rm(temporary,{recursive:true,force:true});
}
