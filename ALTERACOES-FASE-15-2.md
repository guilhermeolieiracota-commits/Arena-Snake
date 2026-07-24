# Snake Arena — Fase 15.2

Esta atualização foi aplicada diretamente sobre a Fase 15.1.

## Nova colisão defensiva do jogador

Quando uma cobra rival encosta com a cabeça no corpo do jogador:

- a rival é eliminada;
- o jogador continua vivo;
- a eliminação é contabilizada para o jogador;
- a rival deixa os restos grandes e neon;
- os restos continuam concedendo crescimento acelerado;
- a regra vale mesmo quando a rival possui mais massa.

## O que não mudou

- choque cabeça com cabeça continua usando a regra de massa;
- o jogador ainda pode morrer ao bater no corpo de uma rival maior;
- predação por segmentos continua funcionando nas demais colisões;
- todas as correções de interface, mobile, PWA e popups foram mantidas.

## Cache

A versão do cache passou para `snake-arena-v15-2`.
