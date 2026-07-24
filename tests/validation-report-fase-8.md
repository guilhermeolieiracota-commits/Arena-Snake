# Relatório de validação — Fase 8

## Validação estática

Aprovado:

- 52 arquivos JavaScript;
- sintaxe dos módulos;
- sintaxe do Service Worker;
- imports relativos;
- 124 seletores da interface;
- correspondência entre seletores e IDs;
- manifesto JSON;
- campos obrigatórios do manifesto;
- caminhos relativos compatíveis com GitHub Pages;
- cinco ícones PNG;
- dimensões dos ícones;
- lista do cache offline;
- arquivos obrigatórios;
- integridade da estrutura.

## Teste de inicialização simulada

Aprovado:

- importação completa de `js/main.js`;
- criação dos 124 elementos utilizados;
- inicialização do Canvas simulado;
- inicialização do minimapa simulado;
- inicialização dos sistemas do jogo;
- título da Fase 8;
- criação do save local;
- ausência de exceções durante a inicialização.

## Teste de migração e conquistas

Aprovado:

- migração de save da Fase 7;
- atualização para save versão 2;
- preservação do apelido;
- preservação da skin;
- preservação de volume configurado como zero;
- criação da chave de conquistas;
- desbloqueio das 13 conquistas;
- prevenção de desbloqueios duplicados;
- persistência das conquistas;
- reset das conquistas.

## Teste do gerenciador PWA

Aprovado:

- registro de `service-worker.js`;
- escopo relativo `./`;
- verificação de atualização;
- detecção de Service Worker aguardando;
- captura do evento de instalação;
- confirmação da instalação;
- envio da mensagem `SKIP_WAITING`;
- fluxo de ativação de atualização.

## Limitação do ambiente de teste

O Chromium disponível no ambiente bloqueou navegação para qualquer URL local
com `ERR_BLOCKED_BY_ADMINISTRATOR`, inclusive HTTP, HTTPS e `file://`.

Por isso, o teste visual real do navegador precisa ser executado pelo Live
Server ou no GitHub Pages usando a checklist desta fase. A inicialização foi
validada com DOM, Canvas, armazenamento e APIs simuladas, além dos testes
estáticos e lógicos descritos acima.
