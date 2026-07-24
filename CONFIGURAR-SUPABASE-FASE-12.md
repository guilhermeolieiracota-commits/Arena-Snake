# Ativação do Supabase — Snake Arena Fase 12 (projeto já configurado)

A Fase 12 continua totalmente funcional sem Supabase. A configuração abaixo
ativa apenas os recursos opcionais:

- criação de conta;
- login por e-mail e senha;
- save na nuvem;
- restauração em outro dispositivo;
- placar global.

## 1. Criar ou escolher o projeto

Abra o painel do Supabase e use um projeto próprio.

## 2. Criar as tabelas e políticas

Abra o **SQL Editor**, copie todo o conteúdo de:

`supabase/snake-arena-phase12.sql`

Execute uma vez.

O SQL cria:

- `snake_arena_cloud_saves`;
- `snake_arena_leaderboard`;
- índices;
- políticas RLS;
- permissões de leitura e escrita.

## 3. Configurar autenticação

No painel do Supabase:

1. Abra `Authentication`.
2. Entre em `Providers`.
3. Confirme que o provedor Email está ativado.
4. Escolha se o usuário precisa confirmar o e-mail.
5. Em `URL Configuration`, defina o endereço publicado do jogo como Site URL.
6. Adicione também o endereço do GitHub Pages em Redirect URLs.

Para testes locais, inclua o endereço usado pelo Live Server, por exemplo:

`http://127.0.0.1:5500`

## 4. Configuração pública já inserida

Este pacote já está configurado com a URL base do seu projeto Supabase e com a
chave pública `sb_publishable_...`. O arquivo ativado é:

`js/config/cloud-config.js`

Não é necessário alterar esse arquivo. Nunca coloque `service_role`, chave
`sb_secret_...`, senha do banco ou token administrativo no jogo.

## 5. Etapa obrigatória restante: executar o SQL

A chave pública não possui autorização para criar tabelas. Abra o **SQL Editor**
do Supabase, copie todo o conteúdo de:

`supabase/snake-arena-phase12.sql`

e pressione **Run** uma vez.

## 6. Testar localmente

1. Abra pelo Live Server.
2. Recarregue para atualizar o Service Worker.
3. Abra `Online`.
4. Crie uma conta.
5. Confirme o e-mail, caso essa opção esteja ativada.
6. Entre na conta.
7. Clique em `Enviar este dispositivo`.
8. Atualize o placar.

## 7. Testar a restauração

1. Exporte também um backup JSON local.
2. Envie o progresso para a nuvem.
3. Abra o jogo em outro navegador ou perfil.
4. Entre na mesma conta.
5. Clique em `Baixar e substituir`.
6. Confirme a substituição.

O jogo recarregará com o save recebido.

## 8. Publicação no GitHub Pages

Depois de configurar a URL e a chave pública:

1. envie os arquivos ao repositório;
2. aguarde o workflow do GitHub Pages;
3. abra o site publicado;
4. atualize a PWA quando o aviso aparecer;
5. teste login, envio, download e placar.

## Segurança implementada

- save privado por `auth.uid()`;
- apenas o dono pode inserir, ler, alterar ou apagar o próprio save;
- placar possui leitura pública;
- cada usuário altera somente a própria posição no placar;
- sessão fica separada do backup JSON;
- nenhum token de login é enviado dentro do save;
- nenhuma chave administrativa é usada no navegador.

## Limitação do placar

O placar da Fase 12 é comunitário e recebe números calculados pelo próprio jogo.
Ele possui RLS contra alteração de outras contas, mas ainda não possui validação
anti-cheat em servidor. Uma futura fase poderá usar Edge Functions ou servidor
autoritativo para validar partidas.
