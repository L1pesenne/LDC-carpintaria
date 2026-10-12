(function (root) {
  'use strict';
  const config = { whatsapp: '' }; // Preencher somente com o telefone confirmado, país + DDD + número.
  const products = [
    { id: 'demo-01', name: 'Produto demonstrativo 01', category: 'Categoria exemplo A', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' },
    { id: 'demo-02', name: 'Produto demonstrativo 02', category: 'Categoria exemplo A', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' },
    { id: 'demo-03', name: 'Produto demonstrativo 03', category: 'Categoria exemplo B', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' },
    { id: 'demo-04', name: 'Produto demonstrativo 04', category: 'Categoria exemplo B', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' },
    { id: 'demo-05', name: 'Produto demonstrativo 05', category: 'Categoria exemplo C', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' },
    { id: 'demo-06', name: 'Produto demonstrativo 06', category: 'Categoria exemplo C', description: 'Espaço para descrição do material, medidas e unidade de venda.', image: '' }
  ];
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const filterProducts = (items, query, category) => items.filter(item =>
    (!category || item.category === category) && normalize(`${item.name} ${item.category} ${item.description}`).includes(normalize(query)));
  const messageFor = product => product
    ? `Olá! Vim pelo site da LDC Carpintaria e gostaria de um orçamento para ${product.name}.`
    : 'Olá! Vim pelo site da LDC Carpintaria e gostaria de solicitar um orçamento.';
  function whatsappUrl(phone, message) {
    const digits = String(phone).replace(/\D/g, '');
    if (!/^55\d{10,11}$/.test(digits)) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }
  const api = { products, filterProducts, messageFor, whatsappUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  const doc = root.document;
  const grid = doc.getElementById('products');
  const search = doc.getElementById('search');
  const filters = doc.getElementById('filters');
  const count = doc.getElementById('count');
  const empty = doc.getElementById('empty');
  const dialog = doc.getElementById('quote-dialog');
  let selectedCategory = '';
  function element(tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function quote(product) {
    const message = messageFor(product);
    const url = whatsappUrl(config.whatsapp, message);
    if (url) { root.open(url, '_blank', 'noopener,noreferrer'); return; }
    doc.getElementById('quote-message').value = message;
    dialog.showModal();
  }
  ['', ...new Set(products.map(product => product.category))].forEach(category => {
    const button = element('button', 'filter', category || 'Todos');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === ''));
    button.addEventListener('click', () => {
      selectedCategory = category;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    filters.append(button);
  });
  function render() {
    const shown = filterProducts(products, search.value, selectedCategory);
    grid.replaceChildren();
    count.textContent = `${shown.length} ${shown.length === 1 ? 'produto demonstrativo encontrado' : 'produtos demonstrativos encontrados'}`;
    empty.hidden = shown.length !== 0;
    shown.forEach(product => {
      const card = element('article', 'card');
      const visual = element('div', 'visual');
      if (product.image) {
        const image = element('img'); image.src = product.image; image.alt = product.name; image.loading = 'lazy';
        image.addEventListener('error', () => visual.replaceChildren(element('span', '', 'Foto indisponível')));
        visual.append(image);
      } else { visual.append(element('span', '', 'Foto a fornecer')); }
      const body = element('div', 'card-body');
      body.append(element('span', 'category', product.category), element('h2', '', product.name), element('p', '', product.description));
      const button = element('button', 'button outline', 'Pedir orçamento ↗');
      button.type = 'button'; button.setAttribute('aria-label', `Pedir orçamento: ${product.name}`);
      button.addEventListener('click', () => quote(product));
      body.append(button); card.append(visual, body); grid.append(card);
    });
  }
  search.addEventListener('input', render);
  doc.getElementById('reset').addEventListener('click', () => {
    search.value = ''; selectedCategory = '';
    filters.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
    render(); search.focus();
  });
  doc.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => quote(null)));
  render();
})(typeof window !== 'undefined' ? window : globalThis);
