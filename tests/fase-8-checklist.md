# Checklist de validação — Fase 8

## Carregamento

- [ ] A tela de carregamento aparece imediatamente.
- [ ] A animação funciona.
- [ ] A tela desaparece após a inicialização.
- [ ] O menu aparece depois do carregamento.
- [ ] O carregamento não fica preso por mais de alguns segundos.

## Manifesto e ícones

- [ ] `manifest.webmanifest` abre sem erro.
- [ ] O nome exibido é Snake Arena.
- [ ] O modo de exibição é standalone.
- [ ] O ícone de 192 pixels aparece.
- [ ] O ícone de 512 pixels aparece.
- [ ] O ícone maskable possui margem segura.
- [ ] O ícone da aba aparece.

## Instalação

- [ ] O botão Instalar app aparece quando suportado.
- [ ] O aviso de instalação aparece.
- [ ] Fechar o aviso não remove o botão do menu.
- [ ] Confirmar instala o jogo.
- [ ] O jogo abre sem a barra normal do navegador.
- [ ] O botão desaparece depois da instalação.

## Service Worker

- [ ] O Service Worker é registrado.
- [ ] O escopo corresponde à pasta do jogo.
- [ ] O cache Snake Arena é criado.
- [ ] Os arquivos JavaScript estão no cache.
- [ ] Os arquivos CSS estão no cache.
- [ ] O manifesto está no cache.
- [ ] Os ícones estão no cache.

## Offline

- [ ] O jogo foi aberto online pelo menos uma vez.
- [ ] Depois disso, abre sem internet.
- [ ] O menu funciona offline.
- [ ] A partida inicia offline.
- [ ] Bots funcionam offline.
- [ ] Áudio gerado pelo navegador funciona offline.
- [ ] Skins e recordes continuam disponíveis.
- [ ] O aviso offline aparece.
- [ ] Voltar à internet remove o aviso.

## Atualização

- [ ] Alterar a versão do Service Worker cria uma atualização.
- [ ] O aviso Nova versão disponível aparece.
- [ ] Fechar o aviso mantém a versão atual.
- [ ] Atualizar ativa o novo Service Worker.
- [ ] A página recarrega após a ativação.
- [ ] Caches antigos são removidos.

## Conquistas

- [ ] A tela mostra 13 conquistas.
- [ ] A contagem geral aparece.
- [ ] Conquistas bloqueadas mostram progresso.
- [ ] Primeira partida desbloqueia corretamente.
- [ ] Coleta desbloqueia objetivos.
- [ ] Pontuação desbloqueia objetivos.
- [ ] Massa desbloqueia objetivos.
- [ ] Eliminações desbloqueiam objetivos.
- [ ] Sobrevivência desbloqueia objetivo.
- [ ] Top 3 é confirmado ao final.
- [ ] Primeiro lugar é confirmado ao final.
- [ ] A notificação aparece uma única vez.
- [ ] O som da conquista funciona.
- [ ] Recarregar mantém conquistas.
- [ ] Zerar conquistas não apaga recordes.
- [ ] Migrar save da Fase 7 mantém configurações e recordes.

## GitHub Pages

- [ ] O workflow aparece na aba Actions.
- [ ] A validação é executada.
- [ ] O artefato é enviado.
- [ ] O deploy termina com sucesso.
- [ ] O `index.html` abre no endereço publicado.
- [ ] CSS e JavaScript funcionam no subdiretório.
- [ ] Manifesto funciona no subdiretório.
- [ ] Service Worker usa o escopo correto.
- [ ] Instalação funciona no endereço HTTPS.

## Regressão

- [ ] Movimento continua funcionando.
- [ ] Comida continua funcionando.
- [ ] Crescimento continua funcionando.
- [ ] Turbo continua funcionando.
- [ ] Bots continuam funcionando.
- [ ] Colisões continuam funcionando.
- [ ] Ranking continua funcionando.
- [ ] Minimap continua funcionando.
- [ ] Skins continuam funcionando.
- [ ] Áudio continua funcionando.
- [ ] Recordes continuam funcionando.
- [ ] Configurações continuam funcionando.
- [ ] O console não mostra erros.
