# Snake Arena — Fase 15.4.2 Final

Esta versão foi construída sobre a Fase 15.3, sem recriar o projeto do zero.

## Novidades da Fase 15.4.1

Esta atualização foca em fidelidade visual ao mockup aprovado da nova tela inicial.

- cabeçalho do menu inicial agora usa a arte visual do mockup;
- layout do topo ficou muito mais próximo da referência;
- ícones dos cartões foram substituídos por ícones visuais próprios;
- ajustes rápidos ficaram compactos e fiéis ao design aprovado;
- cartões `Progresso`, `Personalizar` e `Sistema` ficaram mais minimalistas e recolhidos por padrão;
- versão mobile ficou mais próxima da aparência planejada;
- cache offline atualizado para `snake-arena-v15-4-1`.
- correção do topo no mobile com reset de rolagem ao abrir/recarregar.
- banner do cabeçalho embutido diretamente no HTML para não falhar no carregamento.
- alinhamento dos ícones refinado para evitar descentralização visual.

Detalhes completos: `ALTERACOES-FASE-15-4.md`.

## Novos recursos

### Recuperação e segurança da conta

- solicitação de recuperação por e-mail;
- reenvio de confirmação de cadastro;
- consumo automático do link de recuperação;
- definição de nova senha;
- alteração de senha para conta conectada;
- sessão e save continuam separados;
- tokens não entram no backup local.

### Perfil público

Cada jogador pode publicar:

- apelido;
- frase de até 80 caracteres;
- skin;
- título;
- liga e rating;
- nível;
- sequência diária;
- partidas;
- eliminações;
- melhor pontuação;
- melhor massa;
- vitórias.

O perfil pode ser ocultado a qualquer momento.

### Partidas da comunidade

As partidas recentes podem ser sincronizadas separadamente do save privado.

Dados públicos:

- medalha;
- pontuação;
- posição;
- massa;
- eliminações;
- duração;
- rating;
- liga;
- data.

O limite enviado por dispositivo é de 20 partidas recentes por sincronização.

### Ranking global avançado

- até 100 jogadores carregados;
- busca por apelido ou ID;
- filtro por liga;
- ordenação por rating, pontuação, vitórias ou nível;
- destaque do jogador atual;
- acesso ao perfil público clicando no apelido.

### Feed global

A comunidade mostra as partidas públicas mais recentes. Clicar no jogador abre o perfil e as partidas recentes dele.

### Diagnóstico da nuvem

O diagnóstico verifica:

- configuração pública;
- conexão do dispositivo;
- tabela do placar;
- tabela de perfis;
- tabela de partidas;
- sessão autenticada;
- save privado.

O resultado fica salvo localmente para consulta offline.

### Privacidade

Ao desativar o perfil público:

- o placar oculta o jogador;
- o perfil público fica invisível;
- partidas públicas anteriores são ocultadas;
- o save privado continua disponível para a própria conta.

A segurança de escrita usa o usuário autenticado e políticas RLS. Nenhuma chave secreta foi adicionada.

## Atualização do Supabase

Execute:

`supabase/snake-arena-phase13-upgrade.sql`

Instruções completas:

`ATIVAR-FASE-13.md`

## Save e offline

- save versão 7;
- cache `snake-arena-v13-1`;
- dados comunitários possuem cache local;
- o jogo continua funcional quando a internet cai;
- falhas da comunidade não interrompem a partida.

## Validação

Execute:

```bash
node ./tools/validate-project.mjs
node ./tools/test-phase9.mjs
node ./tools/test-phase10.mjs
node ./tools/test-phase11.mjs
node ./tools/test-phase12.mjs
node ./tools/test-phase13.mjs
```

## Próxima fase possível

A próxima fase pode adicionar:

- amigos;
- solicitações de amizade;
- comparação direta de perfis;
- grupos ou clãs;
- desafios entre jogadores;
- notificações sociais;
- temporadas globais administradas pelo Supabase.

- botão principal redesenhado para ficar fiel ao mockup.
- tela inicial agora começa pelo topo no mobile (sem cortar o banner).
- fundo geral da Home ajustado para combinar com o fundo do banner.
- banner integrado visualmente ao layout para não parecer imagem colada.
