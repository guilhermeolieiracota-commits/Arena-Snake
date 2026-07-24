# Relatório de validação — Fase 13

## Validação estática

Aprovado:

- 81 arquivos JavaScript;
- sintaxe de todos os módulos;
- imports relativos;
- 333 seletores da interface;
- correspondência entre seletores e IDs;
- manifesto;
- ícones;
- Service Worker;
- 96 arquivos de execução no cache;
- arquivos obrigatórios;
- SQL da Fase 12;
- SQL de atualização da Fase 13;
- ausência de `service_role` na configuração pública.

## Regressão

Aprovado:

- testes da Fase 9;
- testes da Fase 10;
- testes da Fase 11;
- testes da Fase 12.

## Testes da Fase 13

Aprovado:

- save versão 7;
- configuração padrão do perfil público;
- recuperação por e-mail;
- endpoint de reenvio de confirmação;
- consumo do link de recuperação;
- atualização da senha;
- autenticação da atualização;
- envio do perfil público;
- normalização da frase;
- envio da partida recente;
- vínculo ao usuário autenticado;
- leitura dos perfis públicos;
- feed de partidas públicas;
- ocultação do perfil;
- ocultação das partidas antigas;
- persistência da privacidade;
- diagnóstico das tabelas e sessão;
- cache do diagnóstico;
- busca por apelido;
- filtro por liga;
- ordenação do ranking.

## Segurança

Aprovado por inspeção:

- chave usada no frontend continua pública;
- nenhuma `service_role` foi adicionada;
- save permanece em tabela privada;
- perfis usam RLS;
- partidas públicas usam RLS;
- usuário só grava linhas ligadas ao próprio `auth.uid()`;
- perfil oculto deixa de ser lido publicamente;
- recuperação não expõe se o e-mail existe;
- tokens continuam fora do save e do backup.

## Teste de navegador

Foi feita uma tentativa com Chromium headless e servidor HTTP local. O Chromium do ambiente não concluiu a navegação dentro do limite e foi encerrado.

A validação visual definitiva deve ser executada no Live Server usando `tests/fase-13-checklist.md`.

## Comandos

```bash
node ./tools/validate-project.mjs
node ./tools/test-phase9.mjs
node ./tools/test-phase10.mjs
node ./tools/test-phase11.mjs
node ./tools/test-phase12.mjs
node ./tools/test-phase13.mjs
```
