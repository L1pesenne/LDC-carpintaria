(async function (root) {
  'use strict';
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const filterProducts = (items, query = '', category = '') => items.filter(item =>
    (!category || item.category === category) && normalize(`${item.name} ${item.category} ${item.description}`).includes(normalize(query)));
  function messageFor(product, coverage = false) {
    if (coverage) return 'Olá! Vim pelo site da LDC Carpintaria e gostaria de consultar a entrega no meu endereço.';
    return product ? `Olá! Vim pelo site da LDC Carpintaria e gostaria de um orçamento para ${product.name}.`
      : 'Olá! Vim pelo site da LDC Carpintaria e gostaria de solicitar um orçamento.';
  }
  function whatsappUrl(phone, message) {
    const digits = String(phone || '').replace(/\D/g, '');
    return /^55\d{10,11}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { filterProducts, messageFor, whatsappUrl };
  if (!root.document) return;
  const doc = root.document;
  doc.documentElement.classList.add('js');
  const config = root.LDC_CONFIG;
  function el(tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function quote(product, coverage = false) {
    const message = messageFor(product, coverage);
    const url = whatsappUrl(config.whatsapp, message);
    if (url) { root.open(url, '_blank', 'noopener,noreferrer'); return; }
    doc.getElementById('quote-message').value = message;
    doc.getElementById('quote-dialog').showModal();
  }
  doc.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => quote(null, button.dataset.contact === 'coverage')));
  const menuButton = doc.getElementById('menu-toggle');
  const navigation = doc.getElementById('navigation');
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('is-open', expanded);
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
  });
  const grid = doc.getElementById('products') || doc.getElementById('product-cards');
  if (!grid) return;
  if (root.location.protocol !== 'file:') {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Catálogo indisponível');
      const data = await response.json(); config.products = data.products;
      if (!data.demo) { const banner = doc.querySelector('.review'); if (banner) banner.hidden = true; }
    } catch {
      grid.replaceChildren(el('p', '', 'Não foi possível carregar os produtos. Atualize a página ou consulte nossa equipe pelo WhatsApp.')); return;
    }
  }
  const search = doc.getElementById('search');
  const filters = doc.getElementById('filters');
  let selectedCategory = '';
  if (filters) ['', ...new Set(config.products.map(product => product.category))].forEach(category => {
    const button = el('button', 'filter', category || 'Todos');
    button.type = 'button'; button.setAttribute('aria-pressed', String(category === ''));
    button.addEventListener('click', () => {
      selectedCategory = category;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    filters.append(button);
  });
  function render() {
    const shown = search ? filterProducts(config.products, search.value, selectedCategory) : config.products.slice(0, 3);
    grid.replaceChildren();
    if (search) {
      doc.getElementById('count').textContent = `${shown.length} ${shown.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
      doc.getElementById('empty').hidden = shown.length !== 0;
    } else if (!shown.length) grid.append(el('p', '', 'Novos produtos em breve. Consulte o atendimento para solicitar um orçamento.'));
    shown.forEach(product => {
      const card = el('article', 'card');
      const visual = el('div', 'visual');
      if (product.image) {
        const image = el('img'); image.src = product.image; image.alt = product.name; image.loading = 'lazy'; image.width = 600; image.height = 420;
        image.addEventListener('error', () => visual.replaceChildren(el('span', '', 'Foto indisponível')));
        visual.append(image);
      } else visual.append(el('span', '', 'Foto a fornecer'));
      const body = el('div', 'card-body');
      body.append(el('span', 'category', product.category), el(search ? 'h2' : 'h3', '', product.name), el('p', '', product.description));
      if (typeof product.price === 'number') body.append(el('strong', 'product-price', new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(product.price)));
      const button = el('button', 'btn secondary', 'Pedir orçamento ↗');
      button.type = 'button'; button.setAttribute('aria-label', `Pedir orçamento: ${product.name}`);
      button.addEventListener('click', () => quote(product));
      body.append(button); card.append(visual, body); grid.append(card);
    });
  }
  if (search) search.addEventListener('input', render);
  if (search) doc.getElementById('reset').addEventListener('click', () => {
    search.value = ''; selectedCategory = '';
    filters.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
    render(); search.focus();
  });
  render();
})(typeof window !== 'undefined' ? window : globalThis);
