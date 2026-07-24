# Ativar a Fase 13 no Supabase

A Fase 12 já está configurada. Esta atualização não recria as tabelas antigas e não apaga contas ou saves.

## 1. Execute somente o SQL de atualização

No painel do Supabase:

1. Abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase/snake-arena-phase13-upgrade.sql`.
4. Copie todo o conteúdo.
5. Cole no SQL Editor.
6. Pressione **Run**.

O SQL é idempotente. Executá-lo novamente não apaga os dados existentes.

## 2. Configure os endereços de recuperação de senha

No Supabase:

1. Entre em **Authentication**.
2. Abra **URL Configuration**.
3. Em **Site URL**, coloque o endereço publicado do jogo.
4. Em **Redirect URLs**, adicione o endereço do jogo publicado.
5. Durante testes locais, adicione também o endereço usado pelo Live Server.

Exemplos de formato:

- `http://127.0.0.1:5500/**`
- `http://localhost:5500/**`
- `https://seu-usuario.github.io/seu-repositorio/**`

Use o endereço real que aparece no navegador.

## 3. Atualize os arquivos do jogo

1. Substitua os arquivos da Fase 12 pelos arquivos da Fase 13.
2. Abra pelo Live Server ou pelo endereço publicado.
3. Aceite o aviso **Nova versão disponível**.
4. Recarregue a página.

## 4. Execute o diagnóstico

No jogo:

1. Abra **Online**.
2. Entre na conta.
3. Pressione **Executar diagnóstico**.
4. Confirme que aparecem como aprovados:
   - Configuração pública;
   - Conexão do dispositivo;
   - Tabela do placar;
   - Perfis públicos;
   - Partidas públicas;
   - Sessão autenticada;
   - Save privado.

## 5. Teste o perfil público

1. Ative **Visível**.
2. Digite uma frase curta.
3. Pressione **Salvar perfil público**.
4. Pressione **Enviar perfil e partidas**.
5. Atualize o ranking.
6. Clique no seu apelido.

## 6. Teste a recuperação de senha

1. Saia da conta.
2. Digite o e-mail.
3. Pressione **Esqueci minha senha**.
4. Abra o e-mail recebido.
5. Clique no link.
6. O jogo abrirá a tela **Definir nova senha**.
7. Digite e confirme a nova senha.

## Privacidade

Quando o perfil público é desativado:

- a linha do jogador deixa de aparecer no placar público;
- o perfil deixa de aparecer na comunidade;
- as partidas públicas anteriores são ocultadas;
- o save privado continua protegido e disponível para sincronização.

A chave configurada no frontend continua sendo somente a chave pública `sb_publishable_...`.
