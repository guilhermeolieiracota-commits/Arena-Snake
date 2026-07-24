# Relatório de validação — Fase 12

## Validação estática

Aprovado:

- 79 arquivos JavaScript;
- sintaxe dos módulos;
- sintaxe do Service Worker;
- imports relativos;
- 292 seletores da interface;
- correspondência entre seletores e IDs;
- manifesto;
- ícones;
- SQL obrigatório;
- presença de RLS;
- presença de `auth.uid()`;
- ausência de `service_role` no arquivo de configuração;
- cache offline completo.

## Migração

Aprovado:

- Fase 9 para save atual;
- Fase 10 para save atual;
- Fase 11 para save versão 6;
- preservação do volume zero;
- preservação do apelido;
- preservação da economia;
- criação dos metadados cloud;
- auto sync ativado por padrão;
- cache global iniciado vazio.

## Autenticação simulada

Aprovado:

- login por e-mail e senha;
- armazenamento da sessão;
- usuário autenticado;
- renovação do token expirado;
- logout;
- remoção local da sessão.

## Data API simulada

Aprovado:

- cabeçalho `apikey` com chave pública;
- cabeçalho `Authorization` com JWT do usuário;
- envio do save;
- associação ao usuário autenticado;
- associação ao ID local;
- atualização do placar;
- download do save;
- substituição local;
- normalização dos dados restaurados;
- preservação da preferência cloud local.

## Placar

Aprovado:

- consulta;
- normalização;
- cache local;
- atualização dos metadados;
- retorno de cache em caso de indisponibilidade.

## Segurança do backup

Aprovado:

- backup não contém sessão;
- backup não contém access token;
- backup não contém refresh token;
- sessão usa chave de armazenamento separada.

## PWA

Aprovado:

- cache `snake-arena-v12-1`;
- 94 arquivos de execução;
- módulos online incluídos;
- CSS incluído;
- HTML incluído;
- manifesto incluído;
- ícones preservados.

## Comandos executados

```bash
node --check js/main.js
node ./tools/validate-project.mjs
node ./tools/test-phase9.mjs
node ./tools/test-phase10.mjs
node ./tools/test-phase11.mjs
node ./tools/test-phase12.mjs
```

## Teste externo necessário

O login e o banco reais dependem de um projeto Supabase do proprietário do
jogo. Por isso, a validação externa deve ser concluída após:

1. executar o SQL;
2. configurar URL e chave pública;
3. permitir a URL do Live Server ou GitHub Pages;
4. criar duas contas de teste;
5. seguir `tests/fase-12-checklist.md`.

A integração REST, sessão, renovação, envio, download, placar, migração,
segurança do backup e cache foram validados com servidor simulado.
