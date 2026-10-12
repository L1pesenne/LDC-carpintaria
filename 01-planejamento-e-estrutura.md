# LDC Carpintaria — Planejamento e estrutura

Etapa 1 de 5. Referência: briefing de 12 de outubro de 2026. Cliente: Gil.

## Objetivo

Apresentar a empresa e seus produtos em um site institucional com vitrine digital. O visitante deve conseguir encontrar um produto, entender as condições de atendimento e iniciar uma conversa pelo WhatsApp para orçamento. A aprovação do pedido e a negociação acontecem no atendimento.

O site não terá carrinho, checkout ou pagamento online.

## Arquitetura de páginas

| Página | Caminho previsto | Conteúdo e função | Ação principal |
| --- | --- | --- | --- |
| Início | `/` | Apresentação da LDC, entrada para o catálogo, condições de venda, entrega e cobertura | Solicitar orçamento |
| Produtos | `/produtos/` | Catálogo organizado em categorias, imagens e descrições confirmadas | Pedir orçamento do produto |
| Sobre a empresa | `/sobre/` | Apresentação institucional com história e informações fornecidas pelo cliente | Falar com a LDC |
| Área de atendimento | `/area-de-atendimento/` | Seropédica, Itaguaí e limite de atendimento de 20 km; orientação para consultar o endereço | Consultar atendimento no meu endereço |
| Contato | `/contato/` | WhatsApp e, quando disponíveis, e-mail, endereço e horário de atendimento | Iniciar conversa |

O menu principal seguirá essa ordem. O logotipo levará à página inicial. O rodapé repetirá os links e os contatos confirmados. Um botão de WhatsApp ficará acessível em todas as páginas, inclusive no celular, sem encobrir conteúdo ou controles.

## Estrutura da página inicial

1. Cabeçalho com identificação da empresa, navegação e acesso ao WhatsApp.
2. Apresentação principal com uma frase sobre a atividade da LDC, imagem aprovada e botões para consultar o catálogo e solicitar orçamento.
3. Entrada para a vitrine com categorias e produtos selecionados pelo cliente.
4. Condições de venda: materiais exclusivamente a granel, sem ensacados ou fracionados, conforme o briefing.
5. Como solicitar: escolher um produto, enviar a consulta pelo WhatsApp e alinhar disponibilidade, quantidade, endereço e entrega com o atendimento.
6. Cobertura: destaque para Seropédica e Itaguaí, sujeita ao raio máximo de 20 km.
7. Apresentação resumida da empresa com link para a página Sobre.
8. Chamada final para orçamento e rodapé com contatos.

O desenho visual e o wireframe ficam para a etapa 2.

## Estrutura da vitrine

Cada produto terá nome, categoria, imagem, descrição breve e botão de orçamento. Categorias, produtos, medidas, unidades de venda e especificações serão cadastrados a partir das informações reais do cliente.

O planejamento inicial não prevê preços públicos; valores serão tratados no orçamento. Essa escolha pode ser revista pelo cliente. Busca e filtros por categoria serão definidos conforme o tamanho do catálogo, evitando controles desnecessários em um catálogo pequeno.

Não será necessária uma página individual por produto no lançamento. Se as especificações exigirem mais espaço, essa estrutura poderá ser acrescentada depois.

## Fluxo de orçamento

Entrada no site → consulta ao catálogo → escolha do produto → clique no botão de orçamento → conversa no WhatsApp → alinhamento comercial e aprovação do pedido → combinação da entrega.

Mensagens previstas:

- Geral: “Olá! Vim pelo site da LDC Carpintaria e gostaria de solicitar um orçamento.”
- Produto: “Olá! Vim pelo site da LDC Carpintaria e gostaria de um orçamento para [nome do produto].”
- Cobertura: “Olá! Gostaria de consultar se a LDC Carpintaria atende meu endereço: [informar endereço].”

O campo de endereço é uma orientação para o visitante completar na conversa. Não haverá coleta de endereço pelo site nesta estrutura inicial.

O número de WhatsApp ainda precisa ser fornecido. Na implementação, os links usarão o número confirmado com código do país e DDD, e a mensagem será codificada corretamente. Até essa configuração, nenhum botão deve direcionar a um número fictício.

## Regras de comunicação

- Preservar a regra do briefing: venda exclusiva de materiais a granel, sem ensacados ou fracionados.
- Comunicar entrega rápida após a aprovação do pedido, sem inventar prazo em horas ou dias. O prazo específico será informado pelo atendimento.
- Não afirmar que todas as localidades de Seropédica e Itaguaí estão cobertas: o endereço deve estar dentro do raio de 20 km.
- Não inventar produtos, estoque, depoimentos, certificações, tempo de atuação ou diferenciais.

## Informações pendentes

| Informação | Motivo |
| --- | --- |
| Número de WhatsApp com DDD | Ativar o canal principal de orçamento |
| Lista de produtos, categorias, fotos e unidades de venda | Montar a vitrine com conteúdo real |
| Confirmação da regra de venda a granel | Verificar sua aplicação aos produtos da carpintaria; o briefing também usa o termo “distribuidora” |
| Endereço de origem do raio de 20 km | Definir o limite real de atendimento |
| Logo e apresentação institucional | Preparar identidade e página Sobre |
| Horários, endereço público e e-mail | Completar os contatos |
| Domínio e hospedagem | Preparar a publicação após a contratação |

Essas pendências não impedem o planejamento e o esboço visual. Conteúdo ainda não confirmado deve aparecer como indicação de preenchimento apenas no ambiente de desenvolvimento.

## Sequência de execução

1. Planejamento e estrutura: concluídos neste documento.
2. Design da página inicial: próxima etapa, com wireframe e conceito visual.
3. Vitrine de produtos: organização e comportamento do catálogo.
4. Copywriting: textos finais e comunicação das condições comerciais.
5. Base técnica: implementação local, verificação e preparação para migração.

A proposta comercial será elaborada e enviada pela equipe responsável. Após sua aprovação, a gerência deve agendar a apresentação do esboço com Alessandro, conforme o briefing. Este documento não implica envio de proposta ou agendamento.

## Critérios para a implementação

- As cinco páginas previstas devem estar acessíveis pelo menu e funcionar em celular e desktop.
- Os produtos devem permitir iniciar um orçamento com seu nome na mensagem.
- As condições comerciais e a cobertura devem estar claras antes do contato.
- O site deve funcionar localmente para revisão enquanto domínio e hospedagem estiverem pendentes; abrir o WhatsApp dependerá de conexão com a internet.
- A publicação deve aguardar a definição da infraestrutura e dos contatos reais.
