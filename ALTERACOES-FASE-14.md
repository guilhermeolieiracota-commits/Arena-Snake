# Alterações da Fase 14

## Base utilizada

`snake-arena-fase-13-correcao-carregamento-final`

A Fase 14 foi adicionada diretamente sobre a versão que já funcionava no VS Code e no GitHub Pages. Nenhum sistema anterior foi recriado.

## Correções mobile

- HUD reorganizado em duas linhas compactas;
- apenas informações essenciais durante a partida;
- notificações menores;
- fila de notificações, sem empilhamento;
- recompensas com valor zero não aparecem;
- ranking e radar separados;
- joystick e turbo respeitam a área segura do celular;
- aviso de atualização fica oculto durante a partida;
- aviso de atualização menor no menu;
- barra e controles do navegador não cobrem os botões;
- regras limitadas a media queries, preservando o desktop.

## Borda segura

- a borda vermelha não gera mais morte;
- a cabeça é mantida dentro do círculo da arena;
- a direção é refletida para dentro;
- o efeito vermelho de aproximação foi preservado;
- jogadores e bots usam a mesma regra.

## Predação por segmentos

- cobras maiores podem morder o corpo das menores;
- a cobra maior não morre ao tocar uma presa válida;
- a presa perde um segmento por mordida;
- a presa perde massa gradualmente;
- o predador recebe massa e pontuação;
- cada mordida aumenta a meta de crescimento do predador;
- existe intervalo entre mordidas para evitar consumo instantâneo;
- a vítima pode fugir enquanto ainda possui segmentos;
- ao chegar ao tamanho mínimo, a próxima mordida finaliza a vítima;
- cobras menores continuam morrendo ao bater no corpo de cobras maiores;
- choques de cabeça continuam seguindo a regra de vantagem de massa.

## Arquivos novos

- `js/systems/predation-system.js`
- `tools/test-phase14.mjs`
- `ALTERACOES-FASE-14.md`
- `tests/fase-14-checklist.md`
- `tests/validation-report-fase-14.md`

## Arquivos ajustados

- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `css/responsive.css`
- `js/main.js`
- `js/config/game-config.js`
- `js/config/balance-config.js`
- `js/core/game.js`
- `js/entities/snake.js`
- `js/systems/collision-system.js`
- `js/systems/death-system.js`
- `tools/validate-project.mjs`
- `README.md`

## Versões

- jogo: `0.14.0`;
- save: `7`, sem migração necessária;
- cache: `snake-arena-v14-1`.
