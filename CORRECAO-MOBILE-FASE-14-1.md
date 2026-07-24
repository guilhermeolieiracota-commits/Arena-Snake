# Correção Mobile da Fase 14.1

Esta atualização foi aplicada diretamente sobre a Fase 14.

## Alterações

- O joystick aparece no primeiro ponto tocado no canvas.
- O primeiro toque passa a ser o centro do joystick.
- O joystick acompanha o arrasto e desaparece ao soltar.
- O aviso de atualização aparece por 6,5 segundos e some automaticamente.
- O botão Atualizar continua funcional durante esse período.
- Ranking e radar receberam posições independentes no mobile.
- A câmera mobile ficou 24% mais afastada.
- O zoom e o layout de computador foram preservados.
- O cache passou para `snake-arena-v14-2`.

## Arquivos modificados

- `css/components.css`
- `css/responsive.css`
- `index.html`
- `js/boot.js`
- `js/config/game-config.js`
- `js/config/graphics-config.js`
- `js/input/input-manager.js`
- `js/input/virtual-joystick.js`
- `js/main.js`
- `js/rendering/camera.js`
- `service-worker.js`
