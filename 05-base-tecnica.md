# LDC Carpintaria — Base técnica e entrega local

Atualização: a versão com painel administrativo substitui a entrega puramente estática descrita abaixo. Consulte `06-painel-administrativo.md`: login, imagens e produtos agora exigem o servidor Node.js e armazenamento persistente.

Etapa 5 de 5. Site estático com cinco páginas integradas, catálogo filtrável, identidade visual e contato por WhatsApp. Sem dependências de instalação, banco de dados, checkout ou pagamento online.

A paleta final foi ajustada ao logotipo a pedido do cliente: branco no fundo, preto nos textos e painéis, amarelo `#F5C518` nos destaques e botões. A imagem conceitual de madeira conserva suas cores naturais.

## Abrir e editar

Abra `dist/index.html` diretamente no navegador para usar o site offline. Com Node.js instalado, também é possível executar:

```text
npm run build
npm run check
npm start
```

O servidor local atende em `http://127.0.0.1:4173`. O WhatsApp exige internet. Não é necessário executar `npm install`.

Os protótipos das etapas 2 e 3 são preservados como histórico. `dist/` contém a versão integrada. Não edite seus arquivos manualmente: um novo build os substitui.

## Estrutura e manutenção

- `site/config.js`: número de WhatsApp, e-mail, endereço, horários, domínio e produtos.
- `site/app.js`: menu mobile, busca, categorias e mensagens personalizadas.
- `site/extra.css`: estilos compartilhados complementares.
- `site/assets/`: fotos locais aprovadas. O build copia os arquivos para `dist/assets/`.
- `scripts/build.mjs`: geração das cinco páginas, estilos e recursos. Utiliza a página inicial da etapa 2 como base visual.
- `scripts/serve.mjs`: servidor de desenvolvimento restrito ao computador local.
- `scripts/check.mjs`: verificação dos links, metadados e regras de busca e contato.

O logotipo encontrado na pasta foi incorporado. O telefone `(21) 97984-7262`, visível nessa imagem, foi configurado como `5521979847262`. Os links foram verificados quanto ao formato e mensagem; não foi enviada nenhuma mensagem e a existência da conta de WhatsApp não foi confirmada.

## Cadastro dos produtos

Em `site/config.js`, substitua os seis exemplos por produtos reais com `id` único, `name`, `category`, `description` e `image`. Para fotos adicionadas em `site/assets/produtos/`, use caminhos como `assets/produtos/nome-da-foto.jpg`. As categorias são derivadas dos produtos; novos itens entram automaticamente na busca e nos filtros. A página inicial mostra os três primeiros itens.

O cadastro é feito por arquivo, sem painel administrativo. A listagem completa depende de JavaScript; a página fornece um contato alternativo quando ele está desativado.

## SEO e migração

As páginas têm idioma português, título e descrição próprios, título principal único e conteúdo regional. Recursos e navegação usam caminhos relativos para funcionar localmente e em hospedagem estática.

Enquanto `demo` estiver como `true`, uma faixa identifica o catálogo demonstrativo, as páginas usam `noindex, nofollow` e o `robots.txt` impede rastreamento. Isso evita apresentar os exemplos como conteúdo definitivo.

Quando domínio e conteúdo forem definidos, configure `siteUrl` com a URL HTTPS completa e barra final, por exemplo no formato `https://dominio-confirmado/`. O build gera URLs canônicas e sitemap a partir desse endereço. Não há domínio fictício configurado.

Após substituir os exemplos, revise o conteúdo e altere `demo` para `false`. Confirme a regra de venda a granel e então altere `bulkRuleConfirmed` para `true`, removendo as notas de revisão dessa condição. Execute o build e a verificação.

Envie somente o conteúdo de `dist/` para a raiz pública da hospedagem contratada e habilite HTTPS no provedor. Não envie os documentos de planejamento ou os scripts para a pasta pública. O pacote `ldc-site-local.zip` contém a versão local atual, ainda demonstrativa.

## Pendências para a versão pública

Produtos, fotos e especificações reais; confirmação da regra de venda a granel; origem do raio de 20 km; domínio e hospedagem. E-mail, endereço público e horários são opcionais na configuração e não aparecem enquanto estiverem vazios.

O projeto está preparado para revisão local e futura migração. Não foi publicado em um servidor externo.

Verificação realizada: build e checagem automática aprovados; página inicial conferida no navegador; filtros, busca sem resultados e restauração do catálogo testados; menu mobile aberto em viewport de 390 px sem transbordamento horizontal na vitrine. Os links de WhatsApp foram inspecionados sem enviar mensagens.
