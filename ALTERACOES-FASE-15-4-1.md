# Snake Arena — Alterações da Fase 15.4.1

## Correções aplicadas

### 1) Banner do topo corrigido
- O banner do cabeçalho agora foi embutido diretamente no HTML.
- Isso evita falha de carregamento da imagem do topo.

### 2) Reset de rolagem no carregamento
- Foi adicionado reset automático de rolagem ao abrir, recarregar ou voltar para a página.
- Isso corrige o problema do menu abrir já rolado para baixo no mobile.

### 3) Ícones centralizados
- O alinhamento visual dos ícones dos cards foi ajustado.
- Os ícones agora usam centralização e `object-fit: contain`.

### 4) Cache atualizado
- O service worker foi atualizado para `snake-arena-v15-4-1`, forçando a nova versão a substituir a antiga com mais segurança.

## Arquivos alterados
- `index.html`
- `css/components.css`
- `css/responsive.css`
- `service-worker.js`
- `README.md`
