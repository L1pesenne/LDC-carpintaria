# Painel administrativo — LDC Carpintaria

O site agora tem um servidor Node.js para autenticação, cadastro de produtos e armazenamento de imagens. A paleta amarela, preta e branca foi mantida.

## Acesso

Execute `npm run build` e `npm start`. Abra `http://127.0.0.1:4173/login.html`.

No primeiro acesso, copie o código do arquivo `data/primeiro-acesso.txt`, escolha um usuário e uma senha de pelo menos 12 caracteres. O código só funciona antes da criação da primeira conta e é invalidado após o uso. Nos acessos seguintes, informe apenas usuário e senha.

Não existe senha padrão. A senha é armazenada como hash scrypt com salt, nunca em texto puro. A sessão tem duração máxima de oito horas, usa cookie HttpOnly e SameSite=Strict e termina ao sair da conta ou reiniciar o servidor. Alterações exigem sessão e token de proteção contra requisições forjadas. Há limite de tentativas de autenticação.

## Produtos

O administrador pode cadastrar, editar e retirar produtos. Campos: nome, descrição, preço em reais, categoria e imagem JPG, PNG ou WebP de até 5 MB. Todos são obrigatórios no cadastro; ao editar, a imagem anterior pode ser mantida.

Preços aparecem na vitrine e nos destaques da página inicial. O pedido continua sendo negociado pelo WhatsApp. Novos produtos aparecem ao abrir ou atualizar a página, sem executar outro build.

O catálogo do servidor começa vazio para não misturar itens reais com exemplos. Os produtos demonstrativos permanecem apenas como referência na configuração do protótipo offline.

## Armazenamento e backup

`data/database.json` guarda a conta administrativa, produtos e cópias dos produtos retirados. `data/uploads/` guarda as imagens. Esses arquivos ficam fora da pasta pública e não são substituídos pelo build. Imagens são servidas por rotas específicas. Faça backup da pasta `data/` inteira, preservando a confidencialidade do arquivo de conta.

“Retirar” remove o item da vitrine e preserva uma cópia em `archivedProducts`; a recuperação é manual no servidor. Imagens antigas também são preservadas. Não há painel de recuperação ou redefinição de senha por e-mail nesta versão.

## Hospedagem

Esta versão exige hospedagem que execute Node.js e ofereça disco persistente. Enviar apenas `dist/` a uma hospedagem estática não habilita o login ou o cadastro. O ZIP antigo `ldc-site-local.zip` corresponde à entrega estática anterior.

O pacote atualizado `ldc-site-com-painel.zip` inclui o site e o servidor, sem contas, senhas, produtos de teste ou arquivos privados de dados. Ao instalar em outra máquina, o primeiro início gera um novo código para criar o administrador. A conta e os produtos já cadastrados devem ser migrados separadamente com backup privado de `data/`.

Para produção, execute o servidor atrás de um proxy HTTPS, configure `LDC_PUBLIC_ORIGIN` com a origem exata do domínio e `LDC_SECURE_COOKIE=true`. O servidor escuta em `127.0.0.1`, adequado ao proxy local. `LDC_PORT` permite escolher a porta. `LDC_DATA_DIR` pode apontar para um volume persistente privado. Execute apenas uma instância do servidor com esta base JSON; múltiplas instâncias exigem adaptação para um banco compartilhado.

As páginas administrativas não são indexáveis. O catálogo público segue a configuração de SEO da etapa anterior; revise as pendências de domínio e regras comerciais antes da publicação.
