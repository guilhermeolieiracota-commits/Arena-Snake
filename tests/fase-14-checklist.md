# Checklist de validação — Fase 14

## Desktop

- [ ] O layout do menu mantém o padrão anterior.
- [ ] O HUD mantém o padrão de desktop.
- [ ] Ranking e radar mantêm o tamanho anterior.
- [ ] Notificações continuam aparecendo no canto.
- [ ] Mouse, teclado e Espaço continuam funcionando.
- [ ] Tela cheia continua funcionando.

## Mobile

- [ ] O HUD mostra pontuação, massa, posição e turbo sem cortar.
- [ ] Áudio, configurações e pausa aparecem na segunda linha.
- [ ] O nome do jogador não ocupa espaço no HUD superior.
- [ ] Ranking aparece no canto inferior esquerdo.
- [ ] Radar aparece no canto inferior direito.
- [ ] Ranking e radar não se sobrepõem.
- [ ] Turbo não fica atrás da barra do navegador.
- [ ] Joystick não fica atrás da barra do navegador.
- [ ] Notificações aparecem uma por vez.
- [ ] Notificações não cobrem o HUD inteiro.
- [ ] Recompensa de zero moedas não aparece.
- [ ] Aviso de atualização não aparece durante a partida.
- [ ] Aviso de atualização fica compacto no menu.
- [ ] Orientação vertical funciona.
- [ ] Orientação horizontal funciona.

## Borda

- [ ] Encostar na borda vermelha não mata o jogador.
- [ ] Encostar na borda não encerra a partida.
- [ ] A cobra é direcionada para dentro.
- [ ] A cabeça não atravessa a arena.
- [ ] Bots também não morrem na borda.
- [ ] A borda continua vermelha quando o jogador se aproxima.
- [ ] O radar continua mostrando a posição corretamente.

## Predação

- [ ] Uma cobra maior pode tocar o corpo de uma menor sem morrer.
- [ ] A presa perde apenas um segmento por mordida.
- [ ] A presa fica visualmente menor.
- [ ] O predador recebe massa.
- [ ] O predador recebe pontuação.
- [ ] O predador cresce após as mordidas.
- [ ] Existe efeito visual no ponto da mordida.
- [ ] Existe intervalo entre mordidas.
- [ ] A presa consegue fugir durante o intervalo.
- [ ] Uma cobra do mesmo tamanho não pode devorar a outra pelo corpo.
- [ ] Uma cobra menor morre ao bater no corpo da maior.
- [ ] A última mordida elimina a vítima mínima.
- [ ] A eliminação final entra no contador.
- [ ] Bots podem caçar cobras menores.
- [ ] Bots maiores podem morder o jogador menor.

## PWA e GitHub Pages

- [ ] O cache muda para `snake-arena-v14-1`.
- [ ] O aviso de nova versão aparece no menu.
- [ ] Clicar em Atualizar aplica a Fase 14.
- [ ] O arquivo `predation-system.js` está no cache.
- [ ] O jogo abre offline após a atualização.
- [ ] O GitHub Pages carrega sem tela infinita.

## Regressão

- [ ] Login continua funcionando.
- [ ] Supabase continua funcionando.
- [ ] Perfil público continua funcionando.
- [ ] Ranking global continua funcionando.
- [ ] Save na nuvem continua funcionando.
- [ ] Loja continua funcionando.
- [ ] Missões continuam funcionando.
- [ ] Temporada continua funcionando.
- [ ] Evento semanal continua funcionando.
- [ ] Histórico continua funcionando.
- [ ] Backup continua funcionando.
- [ ] Áudio continua funcionando.
- [ ] O console não apresenta erros.
