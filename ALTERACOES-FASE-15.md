# Snake Arena — Alterações da Fase 15

## O que foi ajustado

### 1) Menu reorganizado para PC e celular
- Novo layout inicial com organização em blocos mais limpos.
- Estrutura pensada para ficar elegante no desktop e bem distribuída no mobile.
- Botão **Entrar na arena** ficou mais destacado.
- Resumos de perfil, temporada, competitivo e online foram agrupados de forma mais visual.
- Grade de atalhos ficou mais uniforme.

### 2) Notificação de atualização fora da gameplay
- O aviso de atualização não deve mais permanecer aparecendo durante a partida.
- Se uma atualização for detectada enquanto o jogador estiver em jogo, o aviso fica pendente.
- O banner volta a aparecer apenas quando sair da gameplay ativa.
- O aviso continua temporário e some sozinho depois de alguns segundos.

### 3) Arena com campo de visão maior
- A câmera foi ajustada para deixar a arena parecer maior em relação à cobra.
- O jogador passa a enxergar melhor o entorno, especialmente no celular.

### 4) Efeito de morte mais forte e neon
- Quando uma cobra morre, os fragmentos do corpo ficam maiores.
- Os fragmentos agora possuem brilho neon mais intenso.
- O visual dos restos ficou mais chamativo e valioso.

### 5) Crescimento mais rápido ao comer restos de cobras mortas
- Os restos deixados por cobras eliminadas rendem mais massa.
- Isso acelera o crescimento de quem coletar esses fragmentos.
- A coleta também ficou visualmente mais impactante.

## Arquivos principais alterados
- `index.html`
- `css/components.css`
- `css/responsive.css`
- `js/config/graphics-config.js`
- `js/config/balance-config.js`
- `js/entities/food.js`
- `js/systems/food-system.js`
- `js/systems/particle-system.js`
- `js/rendering/food-renderer.js`
- `js/main.js`
- `service-worker.js`
