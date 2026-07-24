# Snake Arena — Alterações da Fase 15.3

## Objetivo
Atualizar a tela inicial do jogo para o novo layout visual enviado como referência, com foco em:

- visual mais limpo e moderno;
- melhor leitura no celular;
- menos informações soltas na home;
- agrupamento das funções em blocos minimalistas.

## O que mudou

### 1) Nova home do jogo
- Hero principal redesenhado com título grande `Snake Arena`.
- Subtítulo mais curto e direto.
- Campo de apelido destacado.
- Botão `Entrar na arena` maior e mais chamativo.

### 2) Ajustes rápidos reorganizados
- Controle mobile
- Qualidade gráfica
- Dificuldade dos bots

Agora esses itens aparecem em um bloco limpo e visualmente mais elegante.

### 3) Funções agrupadas por categoria
A tela inicial agora usa 3 grupos principais:

- **Progresso**
- **Personalizar**
- **Sistema**

Cada grupo pode ser expandido para revelar as opções relacionadas, reduzindo a poluição visual.

### 4) Home otimizada para mobile
- Estrutura em pilha no celular.
- Melhor espaçamento entre cards.
- Elementos grandes para toque.
- Arte lateral escondida em telas menores para priorizar leitura.

### 5) Funções mantidas
As funções anteriores continuam preservadas, incluindo:
- progresso do jogador;
- loja;
- skins;
- perfil;
- competitivo;
- histórico;
- dados;
- configurações;
- tela cheia;
- instalação do app;
- conta online.

## Arquivos alterados
- `index.html`
- `css/components.css`
- `css/responsive.css`
- `service-worker.js`
