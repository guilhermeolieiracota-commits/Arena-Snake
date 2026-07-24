# Ativar o modo online agora

A URL e a chave pública do projeto já foram inseridas no jogo.

## Única etapa obrigatória no Supabase

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor**.
3. Clique em **New query**.
4. Abra o arquivo `supabase/snake-arena-phase12.sql`.
5. Copie todo o conteúdo para o editor.
6. Clique em **Run**.

Depois disso:

1. Abra o jogo pelo Live Server.
2. Recarregue a página para receber o cache `snake-arena-v12-2`.
3. Abra a tela **Online**.
4. Crie uma conta com e-mail e senha.
5. Confirme o e-mail caso o projeto exija confirmação.
6. Entre e pressione **Enviar este dispositivo**.
7. Atualize o placar global.

## Autenticação

Em **Authentication → Providers**, mantenha o provedor Email ativado. A
confirmação de e-mail pode ficar ligada ou desligada conforme sua preferência.

## Segurança

Não adicione ao projeto nenhuma chave `service_role`, `sb_secret_...`, senha do
banco ou token administrativo. A chave pública já configurada é suficiente para
o frontend, desde que o SQL com RLS tenha sido executado.
