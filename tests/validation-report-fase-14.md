# Relatório de validação — Fase 14

## Base

A Fase 14 foi construída diretamente sobre `snake-arena-fase-13-correcao-carregamento-final`.

## Validação estática

Aprovado:

- 83 arquivos JavaScript;
- sintaxe dos módulos;
- imports relativos;
- 333 seletores da interface;
- manifesto e ícones;
- cache offline com os arquivos da predação;
- Service Worker `snake-arena-v14-1`;
- boot de atualização `14-1`;
- configuração pública do Supabase preservada.

## Testes de regressão

Aprovado:

- Fase 9;
- Fase 10;
- Fase 11;
- Fase 12;
- Fase 13.

## Testes da Fase 14

Aprovado:

- cabeça mantida dentro do raio da arena;
- reflexão da direção na borda;
- ausência de morte por borda;
- geração de mordida contra cobra menor;
- cobra maior não morre na mordida;
- perda de um segmento da vítima;
- perda gradual de massa da vítima;
- redução gradual da espessura da vítima;
- ganho de massa do predador;
- aumento da meta de crescimento do predador;
- ganho de pontuação;
- efeito visual da mordida;
- cooldown entre mordidas;
- morte da cobra menor ao atacar corpo maior;
- eliminação final por predação;
- regras mobile dentro de media queries;
- fila de notificações;
- bloqueio de recompensa com valor zero;
- classe de estado mobile durante a partida.

## Comandos executados

```bash
node ./tools/validate-project.mjs
node ./tools/test-phase9.mjs
node ./tools/test-phase10.mjs
node ./tools/test-phase11.mjs
node ./tools/test-phase12.mjs
node ./tools/test-phase13.mjs
node ./tools/test-phase14.mjs
```

## Limitação do teste visual automatizado

O Chromium headless disponível no ambiente não concluiu a navegação local e precisou ser encerrado por timeout. Por isso, a conferência visual final deve ser feita no celular e no computador usando `tests/fase-14-checklist.md`.

Os testes de sintaxe, imports, cache, colisão, borda, crescimento e regressão foram concluídos com sucesso.
