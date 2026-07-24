# Checklist de validação — Fase 11

## Migração

- [ ] Save da Fase 10 abre.
- [ ] Save passa para versão 5.
- [ ] Apelido permanece.
- [ ] Moedas permanecem.
- [ ] Skins permanecem.
- [ ] XP permanece.
- [ ] Títulos permanecem.
- [ ] Temporada permanece.
- [ ] Evento permanece.
- [ ] Configurações permanecem.
- [ ] Volume zero permanece.
- [ ] ID local é criado.
- [ ] Rating começa em 1000.
- [ ] Histórico começa vazio.

## Identidade

- [ ] ID aparece no perfil.
- [ ] ID aparece em Dados.
- [ ] Copiar ID funciona.
- [ ] Recarregar mantém o ID.
- [ ] Exportar e importar mantém o ID.
- [ ] ID não muda ao atualizar a PWA.

## Sequência diária

- [ ] Primeira entrada do dia cria sequência 1.
- [ ] Recompensa diária entra no saldo.
- [ ] Abrir novamente no mesmo dia não paga.
- [ ] Dia seguinte aumenta a sequência.
- [ ] Pular um dia reinicia a sequência.
- [ ] Maior sequência é preservada.
- [ ] Sete dias concedem bônus.
- [ ] Bônus de sete dias não duplica.
- [ ] Menu atualiza a sequência.
- [ ] Perfil atualiza a sequência.

## Competitivo

- [ ] Rating inicial é 1000.
- [ ] Tela competitiva abre.
- [ ] Liga Bronze aparece.
- [ ] Bom resultado aumenta rating.
- [ ] Resultado ruim pode diminuir rating.
- [ ] Rating nunca fica negativo.
- [ ] Rating da mesma partida não duplica.
- [ ] Pico de rating é preservado.
- [ ] Vitória aumenta contador.
- [ ] Top 3 aumenta contador.
- [ ] Posição média atualiza.
- [ ] Promoção de liga gera notificação.
- [ ] Menu mostra liga e rating.
- [ ] HUD mostra liga e rating.
- [ ] Tela de derrota mostra variação.

## Medalhas

- [ ] Primeiro lugar mostra Campeão.
- [ ] Segundo mostra Vice-campeão.
- [ ] Terceiro mostra Terceiro lugar.
- [ ] Top 5 mostra medalha.
- [ ] Três eliminações podem mostrar Caçador.
- [ ] Sobrevivência longa pode mostrar Sobrevivente.
- [ ] Demais partidas mostram Competidor.

## Histórico

- [ ] Primeira partida cria registro.
- [ ] Data aparece.
- [ ] Score aparece.
- [ ] Posição aparece.
- [ ] Massa aparece.
- [ ] Eliminações aparecem.
- [ ] Tempo aparece.
- [ ] Rating aparece.
- [ ] Recompensas aparecem.
- [ ] Liga aparece.
- [ ] Medalha aparece.
- [ ] IDs duplicados são bloqueados.
- [ ] Limite é 50 partidas.
- [ ] Partidas mais antigas são removidas.
- [ ] Limpar histórico funciona.
- [ ] Limpar histórico não apaga rating.

## Ranking local

- [ ] Tela competitiva mostra melhores partidas.
- [ ] Maior score aparece primeiro.
- [ ] Empate considera posição.
- [ ] Novo recorde atualiza a lista.
- [ ] Limpar histórico limpa o ranking local.
- [ ] Rating permanece após limpar.

## Compartilhamento

- [ ] Compartilhar funciona na derrota.
- [ ] Compartilhar funciona no histórico.
- [ ] Web Share abre quando disponível.
- [ ] Fallback copia para área de transferência.
- [ ] Texto contém medalha.
- [ ] Texto contém score.
- [ ] Texto contém posição.
- [ ] Texto contém rating.
- [ ] Texto contém nível.

## Backup

- [ ] Tela Dados abre.
- [ ] Versão do save aparece.
- [ ] Tamanho aparece.
- [ ] Quantidade de partidas aparece.
- [ ] Exportar cria JSON.
- [ ] Nome do arquivo contém data.
- [ ] Último backup atualiza.
- [ ] Backup contém checksum.
- [ ] Importar backup válido funciona.
- [ ] Importar preserva ID.
- [ ] Importar preserva rating.
- [ ] Importar preserva histórico.
- [ ] Arquivo inválido é rejeitado.
- [ ] Checksum inválido é rejeitado.
- [ ] Arquivo acima de 5 MB é rejeitado.
- [ ] Importação pede confirmação.

## Exclusão

- [ ] Apagar tudo pede primeira confirmação.
- [ ] Apagar tudo pede confirmação final.
- [ ] Cancelar mantém os dados.
- [ ] Confirmar reinicia o save.
- [ ] Novo ID é criado depois do reset.

## PWA e offline

- [ ] Cache é `snake-arena-v11-1`.
- [ ] Novos módulos estão no cache.
- [ ] Histórico funciona offline.
- [ ] Rating funciona offline.
- [ ] Sequência funciona offline.
- [ ] Exportação funciona offline.
- [ ] Importação funciona offline.
- [ ] Atualização da Fase 10 aparece.
- [ ] Cache antigo é removido.

## Regressão

- [ ] Movimento funciona.
- [ ] Comida funciona.
- [ ] Crescimento funciona.
- [ ] Turbo funciona.
- [ ] Bots funcionam.
- [ ] Colisões funcionam.
- [ ] Ranking da arena funciona.
- [ ] Minimapa funciona.
- [ ] Áudio funciona.
- [ ] Recordes funcionam.
- [ ] Conquistas funcionam.
- [ ] Moedas funcionam.
- [ ] Loja funciona.
- [ ] Missões funcionam.
- [ ] Perfil funciona.
- [ ] XP funciona.
- [ ] Temporada funciona.
- [ ] Evento semanal funciona.
- [ ] O console não mostra erros.
