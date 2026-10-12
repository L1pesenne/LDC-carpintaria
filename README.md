# LDC Carpintaria

Site institucional e vitrine de produtos, com painel administrativo para gerenciar nome, descrição, categoria, preço e imagem. Identidade visual em amarelo, preto e branco e orçamento pelo WhatsApp.

## Executar localmente

Requer Node.js 24 ou versão compatível. Não há dependências externas para instalar.

```sh
npm run build
npm start
```

Site: http://127.0.0.1:4173/

Administrador: http://127.0.0.1:4173/login.html

No primeiro início, o servidor gera `data/primeiro-acesso.txt`. Use esse código na tela de primeiro acesso para escolher o usuário e uma senha de pelo menos 12 caracteres. Não há conta ou senha padrão.

## Verificação

```sh
npm run check
npm run check:admin
```

O teste administrativo usa dados temporários separados do catálogo real e verifica autenticação, proteção das alterações, imagens e persistência.

## Arquivos

- `site/`: configuração, comportamento do site e páginas administrativas.
- `scripts/`: build, servidor e verificações.
- `dist/`: arquivos do site gerados pelo build.
- `data/`: conta administrativa, catálogo e imagens; criada pelo servidor e ignorada pelo Git.
- Documentos numerados: planejamento e decisões de cada etapa.

O catálogo gerenciado começa vazio. Os exemplos de `site/config.js` são somente referência para o protótipo offline. Edite produtos pelo painel com o servidor em execução.

## Hospedagem e backup

A versão com login exige Node.js, uma instância do servidor e armazenamento persistente. Coloque o servidor atrás de um proxy HTTPS e configure `LDC_PUBLIC_ORIGIN` para a origem do domínio e `LDC_SECURE_COOKIE=true`. A porta pode ser definida por `LDC_PORT` e a pasta privada de dados por `LDC_DATA_DIR`.

Faça backup privado da pasta `data/`. Ela não deve ser publicada nem enviada ao GitHub. A hospedagem estática de `dist/` sozinha não fornece login ou cadastro.

Consulte [a documentação do painel](06-painel-administrativo.md) para detalhes. Domínio, hospedagem e confirmação das condições de venda continuam pendentes.
