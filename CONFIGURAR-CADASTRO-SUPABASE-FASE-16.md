# Configurar cadastro no Supabase — Fase 16

O código da Fase 16 já contém URL e chave pública do projeto. Para o cadastro funcionar no GitHub Pages, confira estas opções no painel do Supabase.

## 1. Ativar cadastro por e-mail

Abra:

`Authentication → Providers → Email`

Confirme que o provedor de e-mail e a criação de novos usuários estão ativados.

## 2. Configurar URLs autorizadas

Abra:

`Authentication → URL Configuration`

Use como **Site URL**:

`https://guilhermeolieiracota-commits.github.io/Arena-Snake/`

Adicione em **Redirect URLs**:

`https://guilhermeolieiracota-commits.github.io/Arena-Snake/`

Para desenvolvimento local, também pode adicionar:

`http://127.0.0.1:5500/`

`http://localhost:5500/`

## 3. Confirmação de e-mail

Se a confirmação de e-mail estiver ativa, a conta será criada, mas o jogador só poderá entrar depois de abrir o link recebido. O jogo agora informa isso claramente.

## 4. SQL

A correção do cadastro não exige um novo SQL. Continue usando as tabelas e políticas já configuradas pelas fases 12 e 13.
