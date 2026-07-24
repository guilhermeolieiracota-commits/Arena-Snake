# Alterações da Fase 13

## Base utilizada

`snake-arena-fase-12-configurado`

A Fase 13 foi adicionada sobre a base completa da Fase 12. O jogo não foi recriado.

## Sistemas preservados

- jogabilidade completa;
- bots e colisões;
- ranking da arena;
- economia e loja;
- missões e conquistas;
- perfil, XP e níveis;
- temporadas e evento semanal;
- ligas e histórico local;
- backup local;
- autenticação Supabase;
- save privado na nuvem;
- placar global;
- PWA e modo offline.

## Arquivos novos

- `js/online/cloud-community-system.js`
- `js/ui/community-view.js`
- `supabase/snake-arena-phase13-upgrade.sql`
- `tools/test-phase13.mjs`
- `ATIVAR-FASE-13.md`
- `ALTERACOES-FASE-13.md`
- `tests/fase-13-checklist.md`
- `tests/validation-report-fase-13.md`

## Arquivos ajustados

- `index.html`
- `css/components.css`
- `css/responsive.css`
- `js/main.js`
- `js/config/game-config.js`
- `js/config/cloud-config.js`
- `js/storage/default-save.js`
- `js/storage/storage-service.js`
- `js/online/supabase-rest-client.js`
- `js/online/cloud-session-service.js`
- `js/online/cloud-sync-system.js`
- `js/ui/online-view.js`
- `manifest.webmanifest`
- `service-worker.js`
- `tools/validate-project.mjs`
- testes de regressão das fases anteriores;
- `README.md`.

## Versões

- jogo: `0.13.0`;
- save: `7`;
- cache: `snake-arena-v13-1`.
