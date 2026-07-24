# Relatório de validação — Fase 11

## Validação estática

Aprovado:

- 74 arquivos JavaScript;
- sintaxe dos módulos;
- sintaxe do Service Worker;
- imports relativos;
- 261 seletores da interface;
- correspondência entre seletores e IDs;
- manifesto;
- ícones;
- arquivos obrigatórios;
- cache offline completo.

## Migração

Aprovado:

- save versão 4 para versão 5;
- preservação do apelido;
- preservação do volume zero;
- preservação do saldo;
- preservação do XP;
- geração de ID local;
- rating inicial;
- histórico inicial vazio.

## Sequência

Aprovado:

- primeiro dia;
- bloqueio no mesmo dia;
- recompensa única;
- dia consecutivo;
- reinício após intervalo;
- preservação do saldo.

## Competitivo

Aprovado:

- cálculo positivo de bom resultado;
- registro de rating;
- bloqueio da mesma partida;
- contagem de partidas;
- pico de rating;
- correspondência entre rating e liga.

## Histórico

Aprovado:

- gravação;
- medalha correta;
- bloqueio de ID duplicado;
- limite de 50;
- melhores partidas;
- limpeza sem apagar competitivo.

## Backup

Aprovado:

- criação do objeto;
- checksum;
- importação;
- preservação do ID;
- preservação do histórico;
- preservação do rating;
- rejeição de checksum inválido.

## Regressão

Aprovado:

- testes da Fase 9;
- testes da Fase 10;
- validador geral;
- cache offline.

## Comandos executados

```bash
node ./tools/validate-project.mjs
node ./tools/test-phase9.mjs
node ./tools/test-phase10.mjs
node ./tools/test-phase11.mjs
```

## Teste visual

A validação visual definitiva deve ser executada no Live Server usando
`tests/fase-11-checklist.md`.

O ambiente atual validou sintaxe, imports, armazenamento, migração, rating,
sequência, histórico, backup, integridade e cache.
