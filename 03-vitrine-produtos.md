# LDC Carpintaria — Vitrine digital

Etapa 3 de 5. Abra `03-vitrine-produtos.html` no navegador. A página funciona localmente, sem instalação ou recursos externos, e segue a paleta da etapa 2.

## Experiência implementada

- Cards com espaço para foto, categoria, nome, descrição e botão de orçamento.
- Busca por nome, categoria e descrição, sem diferenciar letras maiúsculas ou acentos.
- Filtros por categoria combinados com a busca e contagem de resultados.
- Estado sem resultados com botão para limpar a busca e os filtros.
- Mensagem de orçamento personalizada com o nome do produto selecionado.
- Aviso com prévia da mensagem enquanto o WhatsApp estiver pendente.
- Layout com três colunas no desktop, duas em telas intermediárias e uma no celular.
- Rótulos de busca, indicação do filtro selecionado, foco visível e aviso de resultados para tecnologias assistivas.

O catálogo não contém preços, carrinho, checkout ou pagamento. Os seis produtos e as três categorias são demonstrativos e estão identificados como exemplos, sem alegações sobre o estoque real.

## Cadastro e configuração

Os dados ficam em `03-catalogo.js`. Cada produto possui `id`, `name`, `category`, `description` e `image`. Substituir os exemplos pelos dados aprovados. Em `image`, usar o caminho de uma fotografia local aprovada; sem imagem, o card apresenta “Foto a fornecer”.

Preencher `config.whatsapp` apenas com o número real em formato internacional brasileiro, com 55, DDD e número. Após a configuração, o botão abre o WhatsApp com a mensagem codificada. Sem número válido, permanece a prévia local e nenhum contato fictício é aberto. A validação de formato não verifica se o telefone possui uma conta de WhatsApp.

O uso do WhatsApp exige conexão. O catálogo e seus filtros funcionam offline.

## Próxima etapa

Etapa 4: preparar os textos comerciais finais. A integração de todas as páginas e a preparação técnica para publicação ficam para a etapa 5.
