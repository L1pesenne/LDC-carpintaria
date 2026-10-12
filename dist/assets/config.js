(function (root) {
  const data = {
    whatsapp: '5521979847262',
    phoneDisplay: '(21) 97984-7262',
    email: '',
    address: '',
    hours: '',
    siteUrl: '',
    demo: true,
    bulkRuleConfirmed: false,
    products: [
      { id: 'demo-01', name: 'Produto demonstrativo 01', category: 'Categoria exemplo A', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' },
      { id: 'demo-02', name: 'Produto demonstrativo 02', category: 'Categoria exemplo A', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' },
      { id: 'demo-03', name: 'Produto demonstrativo 03', category: 'Categoria exemplo B', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' },
      { id: 'demo-04', name: 'Produto demonstrativo 04', category: 'Categoria exemplo B', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' },
      { id: 'demo-05', name: 'Produto demonstrativo 05', category: 'Categoria exemplo C', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' },
      { id: 'demo-06', name: 'Produto demonstrativo 06', category: 'Categoria exemplo C', description: 'Espaço para descrição, medidas e unidade de venda do produto real.', image: '' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  root.LDC_CONFIG = data;
})(typeof window !== 'undefined' ? window : globalThis);
