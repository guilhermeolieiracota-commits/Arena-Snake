# Alterações da Fase 10

## Base utilizada

`snake-arena-fase-9-final`

A Fase 10 não foi recriada do zero.

## Sistemas preservados

- Canvas;
- movimento;
- corpo;
- câmera;
- comida;
- crescimento;
- turbo;
- bots;
- inteligência artificial;
- colisões;
- mortes;
- restos;
- respawn;
- ranking;
- minimapa;
- áudio;
- configurações;
- recordes;
- conquistas;
- moedas;
- loja;
- skins;
- desafios diários;
- PWA;
- modo offline;
- GitHub Pages.

## Arquivos novos

- `js/progression/progression-config.js`
- `js/progression/progression-system.js`
- `js/seasons/season-config.js`
- `js/seasons/season-system.js`
- `js/events/weekly-event-catalog.js`
- `js/events/weekly-event-system.js`
- `js/ui/profile-view.js`
- `js/ui/season-view.js`
- `js/ui/weekly-event-view.js`
- `tools/test-phase10.mjs`
- `ALTERACOES-FASE-10.md`
- `tests/fase-10-checklist.md`
- `tests/validation-report-fase-10.md`

## Arquivos ajustados

- `index.html`
- `css/components.css`
- `css/responsive.css`
- `js/main.js`
- `js/audio/audio-manager.js`
- `js/config/game-config.js`
- `js/challenges/daily-challenge-system.js`
- `js/storage/default-save.js`
- `js/storage/storage-service.js`
- `manifest.webmanifest`
- `service-worker.js`
- `tools/test-phase9.mjs`
- `tools/validate-project.mjs`
- `README.md`

## Correção herdada

As notificações das missões diárias e dos eventos semanais agora são mostradas
somente depois de o progresso ser salvo. Isso evita que uma atualização visual
recarregue um estado anterior.

## Versões

- jogo: `0.10.0`;
- save: `4`;
- cache: `snake-arena-v10-1`.
