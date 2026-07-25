# Relatório de validação — Fase 16

## Validações aprovadas

- 97 arquivos JavaScript/MJS passaram em `node --check`;
- 86 módulos JavaScript do jogo foram encontrados pelo validador;
- 361 seletores da interface foram conferidos;
- nenhum ID duplicado foi encontrado no HTML;
- imports relativos, manifesto, ícones e cache offline foram validados;
- testes das Fases 9, 10, 11, 12, 13, 14, 14 mobile, 15.1 e 15.2 passaram;
- testes próprios da Fase 16 passaram;
- cronômetro configurado em 120 segundos;
- progressão e persistência das fases foram testadas;
- aumento de velocidade, agressividade e quantidade de bots foi testado;
- marcador de partida interrompida foi testado;
- crescimento de raio, espaçamento e afunilamento da cauda foi testado;
- fluxo de cadastro foi testado com uma resposta simulada do Supabase;
- URL de retorno, metadado de apelido e confirmação por e-mail foram conferidos;
- manifesto utiliza somente os novos ícones v16.

## Conferência necessária no ambiente real

A autenticação deve ser testada com o projeto Supabase publicado, pois depende das configurações externas de `Authentication → Providers` e `Authentication → URL Configuration`.

A saída por bloqueio de tela, troca de aplicativo e fechamento da PWA deve receber uma conferência final em um celular real. O código trata `visibilitychange`, `pagehide`, `beforeunload`, `blur` e `freeze`, encerra o loop e limpa os sistemas da partida.

A tentativa de executar um teste visual com Chromium headless não terminou no ambiente de execução. Por isso, a verificação visual final deve seguir `tests/fase-16-checklist.md` no navegador e no aparelho.
