# Correção da tela de carregamento

Esta correção foi feita sobre a Fase 13 completa.

## Alterações

- novo carregador `js/boot.js`;
- limpeza automática do Service Worker e caches antigos uma única vez;
- recarga automática após a limpeza;
- mensagem de erro real caso um módulo falhe;
- botão para limpar o cache e tentar novamente;
- fallback do minimapa quando `ResizeObserver` não estiver disponível;
- cache atualizado para `snake-arena-v13-2`;
- jogo atualizado para `0.13.1`.

## Arquivos que precisam ser substituídos no GitHub

- `index.html`;
- `service-worker.js`;
- `css/components.css`;
- `js/config/game-config.js`;
- `js/ui/minimap-renderer.js`.

Arquivo novo:

- `js/boot.js`.

Depois do deploy, abra:

`https://guilhermeolieiracota-commits.github.io/Arena-Snake/?bootFix=13-4`

A primeira abertura pode recarregar automaticamente uma vez.
