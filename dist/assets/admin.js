(async function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let csrf = ''; let products = []; let editId = null; let deleteId = null; let previewUrl = null; let setup = false;
  function status(id, message = '', error = false) { $(id).textContent = message; $(id).className = `notice ${error ? 'error' : 'success'}`; }
  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}), ...options.headers } });
    const data = await response.json(); if (!response.ok) { const error = new Error(data.error || 'Não foi possível concluir.'); error.status = response.status; throw error; } return data;
  }
  function expiry(error, target = 'status') { if (error.status === 401 && $('admin-shell')) location.replace('login.html'); else status(target, error.message, true); }
  function node(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  const money = value => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value);
  try {
    const auth = await request('/api/auth/status'); csrf = auth.csrf || '';
    if ($('login-form')) {
      if (auth.authenticated) { location.replace('admin.html'); return; }
      setup = auth.setupRequired; $('login-title').textContent = setup ? 'Criar conta do administrador' : 'Entrar no painel';
      $('login-help').textContent = setup ? 'Defina o usuário e a senha para o primeiro acesso.' : 'Use sua conta de administrador para continuar.';
      $('setup-fields').hidden = !setup; $('confirm-field').hidden = !setup; $('code').required = setup; $('confirm').required = setup;
      $('password').minLength = setup ? 12 : 1; $('password').autocomplete = setup ? 'new-password' : 'current-password';
      $('login-submit').textContent = setup ? 'Criar conta e entrar' : 'Entrar'; $('login-form').hidden = false; status('status');
      $('login-form').addEventListener('submit', async event => {
        event.preventDefault(); if (setup && $('password').value !== $('confirm').value) { status('status','As senhas não coincidem.',true); return; }
        $('login-submit').disabled = true;
        try { await request(`/api/auth/${setup ? 'setup' : 'login'}`, { method:'POST', body:JSON.stringify({ username:$('username').value.trim(), password:$('password').value, code:$('code').value.trim() }) }); location.replace('admin.html'); }
        catch(error) { expiry(error); } finally { $('login-submit').disabled = false; }
      }); return;
    }
    if (!auth.authenticated) { location.replace('login.html'); return; }
    $('loading').hidden = true; $('admin-shell').hidden = false; $('admin-user').textContent = auth.username; await load();
    $('logout').addEventListener('click', async () => { try { await request('/api/auth/logout',{method:'POST',body:'{}'}); location.replace('login.html'); } catch(error) { expiry(error); } });
    $('new-product').addEventListener('click', () => openEditor(null)); $('admin-search').addEventListener('input', render);
    $('close-editor').addEventListener('click', () => $('editor').close()); $('cancel-editor').addEventListener('click', () => $('editor').close());
    $('editor').addEventListener('close', () => { if(previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl=null; } });
    $('product-image').addEventListener('change', () => {
      const file = $('product-image').files[0]; if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (!file) { $('image-preview').hidden = true; return; }
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) { status('editor-status','Use JPG, PNG ou WebP de até 5 MB.',true); $('product-image').value=''; return; }
      previewUrl = URL.createObjectURL(file); $('image-preview').src=previewUrl; $('image-preview').hidden=false; status('editor-status');
    });
    $('product-form').addEventListener('submit', async event => {
      event.preventDefault(); $('save-product').disabled = true; status('editor-status','Salvando produto…');
      try {
        const file = $('product-image').files[0];
        const imageData = file ? await new Promise((resolve,reject) => { const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.readAsDataURL(file); }) : '';
        await request(editId ? `/api/products/${editId}` : '/api/products', { method: editId ? 'PUT' : 'POST', body:JSON.stringify({name:$('product-name').value.trim(),description:$('product-description').value.trim(),category:$('product-category').value.trim(),price:Number($('product-price').value),imageData}) });
        $('editor').close(); await load(); status('status','Produto salvo. A vitrine já está atualizada.');
      } catch(error) { expiry(error,'editor-status'); } finally { $('save-product').disabled=false; }
    });
    $('cancel-delete').addEventListener('click',()=> $('delete-dialog').close());
    $('confirm-delete').addEventListener('click',async()=> {
      $('confirm-delete').disabled=true;
      try { await request(`/api/products/${deleteId}`,{method:'DELETE'}); $('delete-dialog').close();await load();status('status','Produto retirado da vitrine.'); }
      catch(error) { expiry(error,'delete-status'); } finally { $('confirm-delete').disabled=false; }
    });
  } catch(error) { status('status', 'Não foi possível conectar ao servidor. Execute npm start e abra o painel pelo endereço local.', true); }
  async function load() { products=(await request('/api/products')).products;render(); }
  function render() {
    $('product-total').textContent=products.length; $('category-total').textContent=new Set(products.map(product=>product.category)).size;
    const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); const query=normalize($('admin-search').value.trim());
    const visible=products.filter(product=>normalize(`${product.name} ${product.category}`).includes(query)); $('admin-products').replaceChildren(); $('admin-empty').hidden=visible.length>0;
    visible.forEach(product=> {
      const row=node('article',undefined,'admin-product');const image=node('img');image.src=product.image;image.alt=product.name;image.loading='lazy';
      const info=node('div',undefined,'product-info');info.append(node('h3',product.name),node('p',product.category),node('strong',money(product.price)));
      const actions=node('div',undefined,'row-actions');const edit=node('button','Editar','secondary');edit.setAttribute('aria-label',`Editar ${product.name}`);edit.addEventListener('click',()=>openEditor(product));
      const remove=node('button','Retirar','secondary');remove.setAttribute('aria-label',`Retirar ${product.name}`);remove.addEventListener('click',()=>{deleteId=product.id;$('delete-message').textContent=product.name;status('delete-status');$('delete-dialog').showModal();});
      actions.append(edit,remove);row.append(image,info,actions);$('admin-products').append(row);
    });
  }
  function openEditor(product) {
    editId=product?.id || null; $('product-form').reset();status('editor-status'); $('editor-title').textContent=product?'Editar produto':'Adicionar produto';
    $('product-name').value=product?.name || ''; $('product-description').value=product?.description || ''; $('product-category').value=product?.category || 'Produtos';$('product-price').value=product?.price ?? '';
    $('product-image').required=!product;$('image-preview').hidden=!product;if(product)$('image-preview').src=product.image; $('editor').showModal();
  }
})();
