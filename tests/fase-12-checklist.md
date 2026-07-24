# Checklist de validação — Fase 12

## Regressão local

- [ ] O jogo abre sem Supabase configurado.
- [ ] O menu informa Modo local.
- [ ] É possível iniciar uma partida.
- [ ] Bots continuam funcionando.
- [ ] Comida continua funcionando.
- [ ] Turbo continua funcionando.
- [ ] Colisões continuam funcionando.
- [ ] Moedas continuam funcionando.
- [ ] Loja continua funcionando.
- [ ] Perfil continua funcionando.
- [ ] Temporada continua funcionando.
- [ ] Evento semanal continua funcionando.
- [ ] Histórico continua funcionando.
- [ ] Backup local continua funcionando.
- [ ] PWA continua funcionando offline.

## Configuração

- [ ] O SQL executa sem erro.
- [ ] As duas tabelas são criadas.
- [ ] RLS está ativado nas duas tabelas.
- [ ] Políticas do save existem.
- [ ] Políticas do placar existem.
- [ ] A URL foi adicionada ao `cloud-config.js`.
- [ ] A chave pública foi adicionada.
- [ ] `enabled` foi alterado para `true`.
- [ ] Nenhuma `service_role` foi colocada no projeto.
- [ ] Site URL foi configurada no Supabase.
- [ ] Redirect URL do GitHub Pages foi configurada.
- [ ] URL do Live Server foi configurada para testes.

## Conta

- [ ] A tela Online abre.
- [ ] A configuração aparece como Configurado.
- [ ] Criar conta funciona.
- [ ] Mensagem de confirmação aparece quando necessária.
- [ ] Login funciona.
- [ ] E-mail conectado aparece.
- [ ] Recarregar mantém a sessão.
- [ ] Sessão expirada é renovada.
- [ ] Logout funciona.
- [ ] Logout não apaga o progresso local.

## Envio para nuvem

- [ ] Enviar este dispositivo funciona.
- [ ] Uma linha aparece em `snake_arena_cloud_saves`.
- [ ] `user_id` corresponde à conta.
- [ ] `player_id` corresponde ao ID local.
- [ ] `save_version` é 6.
- [ ] `save_data` contém o progresso.
- [ ] Access token não aparece no save.
- [ ] Refresh token não aparece no save.
- [ ] Último envio é atualizado.
- [ ] Envio automático funciona após a partida.
- [ ] Desativar envio automático funciona.
- [ ] Sem internet, a partida continua salva localmente.

## Download

- [ ] Baixar pede confirmação.
- [ ] Cancelar não altera o save local.
- [ ] Conta sem save mostra aviso.
- [ ] Conta com save restaura os dados.
- [ ] O jogo recarrega após restauração.
- [ ] Apelido é restaurado.
- [ ] Moedas são restauradas.
- [ ] Skins são restauradas.
- [ ] XP é restaurado.
- [ ] Rating é restaurado.
- [ ] Histórico é restaurado.
- [ ] Preferência de auto sync local é preservada.
- [ ] Último download é atualizado.

## RLS

- [ ] Usuário A envia o próprio save.
- [ ] Usuário B envia o próprio save.
- [ ] Usuário A não consegue ler o save de B.
- [ ] Usuário A não consegue atualizar o save de B.
- [ ] Usuário A não consegue apagar o save de B.
- [ ] Usuário autenticado atualiza somente a própria linha do placar.
- [ ] Usuário anônimo consegue ler o placar.

## Placar global

- [ ] Envio atualiza a linha do placar.
- [ ] Apelido aparece.
- [ ] Rating aparece.
- [ ] Liga aparece.
- [ ] Nível aparece.
- [ ] Melhor score aparece.
- [ ] Vitórias aparecem.
- [ ] Ordenação por rating funciona.
- [ ] Atualizar placar funciona.
- [ ] Data da atualização aparece.
- [ ] Placar fica salvo no cache.
- [ ] Placar em cache aparece offline.

## Sessão e backup

- [ ] Backup JSON local continua funcionando.
- [ ] Backup não contém `access_token`.
- [ ] Backup não contém `refresh_token`.
- [ ] Importar backup não conecta conta automaticamente.
- [ ] Logout remove a sessão somente do navegador atual.
- [ ] Apagar progresso não expõe tokens na interface.

## Rede

- [ ] Ficar offline mostra aviso.
- [ ] Tela Online informa Sem internet.
- [ ] Botões de envio e download são desativados offline.
- [ ] Voltar à internet atualiza o status.
- [ ] Placar é atualizado ao reconectar.
- [ ] Falha de servidor não interrompe a partida.

## PWA

- [ ] Cache é `snake-arena-v12-1`.
- [ ] Os módulos online estão no cache.
- [ ] Atualização da Fase 11 aparece.
- [ ] Cache antigo é removido.
- [ ] A PWA instalada abre em modo local.
- [ ] A tela Online abre offline.

## Console

- [ ] Nenhum erro aparece ao abrir sem configuração.
- [ ] Nenhum erro aparece ao abrir configurado.
- [ ] Nenhum erro aparece ao entrar.
- [ ] Nenhum erro aparece ao enviar.
- [ ] Nenhum erro aparece ao baixar.
- [ ] Nenhum erro aparece ao atualizar o placar.
