# Correção de Popups — Fase 15.1

Esta correção resolve a causa dos avisos persistentes, em vez de apenas esconder os elementos visualmente.

## Alterações

- O Service Worker ativa automaticamente a versão nova.
- O jogo não exige mais tocar no botão **Atualizar**.
- O banner inferior de atualização foi desativado.
- O cache antigo é limpo uma única vez usando a versão `15-1`.
- Recompensas com valor zero não entram na fila de notificações.
- Todas as notificações abertas são fechadas quando a partida começa.
- Novas recompensas e conquistas não criam popup durante a gameplay.
- O restante do progresso, Supabase e modo offline foram preservados.

## Arquivos alterados

- `css/components.css`
- `js/boot.js`
- `js/config/game-config.js`
- `js/main.js`
- `js/pwa/pwa-manager.js`
- `service-worker.js`
