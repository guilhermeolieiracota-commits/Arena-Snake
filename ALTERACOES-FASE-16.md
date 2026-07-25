# Snake Arena — Fase 16

Esta atualização foi construída diretamente sobre a Fase 15.4.3, sem recriar o projeto.

## Novos recursos

- correção do fluxo de criação de conta Supabase;
- confirmação de senha no cadastro;
- erros de autenticação em português;
- partidas com duração de 2 minutos;
- progressão por fases cada vez mais difíceis;
- avanço somente ao sobreviver até o final;
- repetição da fase atual ao morrer;
- encerramento total da partida ao sair da tela;
- interrupção do loop, bots, alimentos, partículas, áudio, controles e requisições pendentes;
- detecção de tentativa interrompida por fechamento abrupto;
- crescimento da cobra em comprimento e volume;
- colisões e câmera adaptadas à nova espessura;
- nova favicon e novos ícones PWA usando a imagem aprovada;
- maior fase e fases concluídas adicionadas ao perfil;
- fase registrada no histórico de partidas.

## Arquivos novos

- `js/stages/stage-config.js`
- `js/stages/stage-system.js`
- `js/stages/run-guard.js`
- `manifest-v16.webmanifest`
- novos ícones `v16` em `assets/icons`
- `tools/test-phase16.mjs`
- `tests/fase-16-checklist.md`
- `CONFIGURAR-CADASTRO-SUPABASE-FASE-16.md`
