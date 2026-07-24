# Checklist de validação — Fase 13

## Atualização do Supabase

- [ ] O SQL da Fase 12 já foi executado.
- [ ] `snake-arena-phase13-upgrade.sql` executa sem apagar dados.
- [ ] A tabela `snake_arena_public_profiles` existe.
- [ ] A tabela `snake_arena_public_matches` existe.
- [ ] RLS está ativo nas duas tabelas.
- [ ] O placar possui a coluna `public_profile`.
- [ ] O diagnóstico aprova as tabelas da Fase 13.

## Migração

- [ ] Save da Fase 12 abre sem erro.
- [ ] Save passa para versão 7.
- [ ] Moedas permanecem.
- [ ] Skins permanecem.
- [ ] XP e níveis permanecem.
- [ ] Rating e liga permanecem.
- [ ] Histórico permanece.
- [ ] Conta permanece conectada.
- [ ] Auto sync permanece configurado.
- [ ] Perfil público inicia ativo.

## Recuperação de senha

- [ ] O botão Esqueci minha senha aparece.
- [ ] E-mail inválido é rejeitado.
- [ ] Solicitação válida mostra mensagem genérica.
- [ ] O e-mail de recuperação chega.
- [ ] O link retorna ao jogo.
- [ ] A tela Definir nova senha abre.
- [ ] Senha menor que seis caracteres é rejeitada.
- [ ] Confirmação diferente é rejeitada.
- [ ] Nova senha é salva.
- [ ] Login funciona com a nova senha.
- [ ] Alterar senha com conta conectada funciona.

## Confirmação de cadastro

- [ ] Reenviar confirmação exige e-mail válido.
- [ ] A mensagem de confirmação aparece.
- [ ] O e-mail é recebido.
- [ ] O endereço de retorno está autorizado no Supabase.

## Perfil público

- [ ] Perfil público aparece para conta conectada.
- [ ] Frase aceita até 80 caracteres.
- [ ] Espaços duplicados são normalizados.
- [ ] Salvar perfil envia os dados.
- [ ] Skin correta aparece.
- [ ] Título correto aparece.
- [ ] Liga e rating aparecem.
- [ ] Nível aparece.
- [ ] Sequência aparece.
- [ ] Partidas e eliminações aparecem.
- [ ] Melhor score e vitórias aparecem.
- [ ] Atualização fica registrada.

## Privacidade

- [ ] Desativar Visível oculta o perfil.
- [ ] O jogador deixa de aparecer publicamente no placar.
- [ ] Partidas antigas são ocultadas.
- [ ] O proprietário continua acessando o próprio save privado.
- [ ] Reativar Visível restaura perfil e novas partidas.
- [ ] A preferência permanece depois de recarregar.

## Partidas públicas

- [ ] Enviar perfil e partidas funciona.
- [ ] Até 20 partidas recentes são enviadas.
- [ ] IDs duplicados são atualizados e não duplicados.
- [ ] Medalha aparece.
- [ ] Score aparece.
- [ ] Posição aparece.
- [ ] Eliminações aparecem.
- [ ] Duração aparece.
- [ ] Rating e liga aparecem.
- [ ] Data aparece.

## Ranking global avançado

- [ ] Até 100 jogadores são carregados.
- [ ] Busca por apelido funciona.
- [ ] Busca por ID funciona.
- [ ] Filtro Bronze funciona.
- [ ] Filtro Prata funciona.
- [ ] Filtro Ouro funciona.
- [ ] Filtro Platina funciona.
- [ ] Filtro Diamante funciona.
- [ ] Filtro Mestre funciona.
- [ ] Ordenar por rating funciona.
- [ ] Ordenar por score funciona.
- [ ] Ordenar por vitórias funciona.
- [ ] Ordenar por nível funciona.
- [ ] Contagem de resultados atualiza.
- [ ] Jogador atual fica destacado.
- [ ] Clique no apelido abre o perfil.

## Comunidade

- [ ] Feed global aparece.
- [ ] Feed usa cache quando offline.
- [ ] Clique no feed abre o perfil.
- [ ] Perfil mostra partidas recentes.
- [ ] Fechar perfil funciona.
- [ ] Perfil inexistente não quebra a tela.
- [ ] Jogadores antigos da Fase 12 continuam aparecendo no placar.

## Diagnóstico

- [ ] Configuração pública é verificada.
- [ ] Rede é verificada.
- [ ] Placar é verificado.
- [ ] Perfis são verificados.
- [ ] Partidas são verificadas.
- [ ] Sessão é verificada.
- [ ] Save privado é verificado.
- [ ] Tempo de cada verificação aparece.
- [ ] Resultado é salvo localmente.
- [ ] Diagnóstico anterior aparece offline.

## Sincronização

- [ ] Enviar dispositivo também atualiza comunidade.
- [ ] Auto sync envia save após partida.
- [ ] Auto sync envia perfil e partidas após partida.
- [ ] Falha comunitária não apaga o save local.
- [ ] Download da nuvem continua pedindo confirmação.
- [ ] Tokens continuam fora do backup.

## PWA e offline

- [ ] Cache é `snake-arena-v13-1`.
- [ ] Novos módulos entram no cache.
- [ ] Interface online abre offline.
- [ ] Ranking em cache aparece offline.
- [ ] Feed em cache aparece offline.
- [ ] Diagnóstico anterior aparece offline.
- [ ] O jogo continua iniciando partidas offline.
- [ ] Cache antigo é removido.

## Regressão

- [ ] Jogabilidade funciona.
- [ ] Bots funcionam.
- [ ] Colisões funcionam.
- [ ] Turbo funciona.
- [ ] Ranking da arena funciona.
- [ ] Loja funciona.
- [ ] Missões funcionam.
- [ ] Conquistas funcionam.
- [ ] Perfil e XP funcionam.
- [ ] Temporada funciona.
- [ ] Evento semanal funciona.
- [ ] Rating local funciona.
- [ ] Histórico local funciona.
- [ ] Backup local funciona.
- [ ] Save privado da Fase 12 funciona.
- [ ] Placar global da Fase 12 funciona.
- [ ] O console não mostra erros.
