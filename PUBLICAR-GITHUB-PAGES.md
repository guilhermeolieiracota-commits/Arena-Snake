# Publicação no GitHub Pages

O projeto já contém o workflow necessário em:

`.github/workflows/deploy-pages.yml`

Não é necessário compilar o jogo e não é necessário mover os arquivos para
outra pasta.

## Estrutura correta no repositório

O `index.html` precisa ficar na raiz do repositório junto com:

- `manifest.webmanifest`;
- `service-worker.js`;
- pasta `css`;
- pasta `js`;
- pasta `assets`;
- pasta `.github`.

## Primeira publicação

1. Crie um novo repositório no GitHub.
2. Coloque todo o conteúdo desta pasta na raiz do repositório.
3. Confirme que o branch principal se chama `main`.
4. Faça o primeiro commit e envie os arquivos.
5. Abra as configurações do repositório.
6. Entre em `Pages`.
7. Em `Build and deployment`, escolha `GitHub Actions`.
8. Abra a aba `Actions`.
9. Aguarde o workflow `Publicar Snake Arena no GitHub Pages`.
10. Abra o endereço apresentado na etapa de publicação.

## Atualizações futuras

Depois da primeira configuração, basta alterar os arquivos e enviar um novo
commit para o branch `main`.

O workflow executará automaticamente:

1. validação dos arquivos;
2. preparação do site;
3. publicação no GitHub Pages.

## Instalação como aplicativo

Depois que o jogo estiver publicado:

1. abra o site no navegador;
2. aguarde o primeiro carregamento completo;
3. use o botão `Instalar app` quando ele aparecer;
4. confirme a instalação.

O botão depende do suporte do navegador. Em alguns aparelhos, a instalação
também aparece no menu do próprio navegador.

## Teste offline

1. abra o jogo publicado pelo menos uma vez;
2. espere a tela inicial aparecer;
3. recarregue a página;
4. desligue a internet;
5. abra o jogo novamente.

Os arquivos principais ficam salvos no cache do aplicativo.

## Atualização do aplicativo instalado

Quando uma nova versão for publicada, o jogo verifica o Service Worker. Quando
a atualização fica pronta, aparece o aviso `Nova versão disponível`.

Pressione `Atualizar` para ativar os novos arquivos e recarregar o jogo.

## Teste local

Use o Live Server do VS Code ou outro servidor local.

Não abra o `index.html` diretamente por `file://`, porque Service Workers e
instalação PWA dependem de um contexto servido por HTTP seguro ou localhost.

## Validação manual

Execute no terminal, na raiz do projeto:

```bash
node ./tools/validate-project.mjs
```

O comando verifica:

- arquivos obrigatórios;
- manifesto;
- tamanhos dos ícones;
- imports JavaScript;
- seletores usados pela interface;
- lista de arquivos do cache offline.
