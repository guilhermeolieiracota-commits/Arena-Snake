# Instalar e publicar a Fase 16

## Aplicar somente a atualização

1. Faça uma cópia de segurança da pasta atual `D:\Snake Arena\Jogo`.
2. Extraia `snake-arena-fase-16-atualizacao.zip`.
3. Abra a pasta extraída.
4. Copie todo o conteúdo que está dentro dela.
5. Cole em `D:\Snake Arena\Jogo`.
6. Escolha **Mesclar pastas** e **Substituir arquivos existentes**.
7. Não apague outros arquivos do projeto.

## Conferir antes de publicar

No terminal do VS Code:

```powershell
cd "D:\Snake Arena\Jogo"
git status --short
```

Arquivos novos aparecem com `??` e arquivos modificados com `M`. Não deve aparecer uma lista enorme de exclusões marcadas com `D`.

## Publicar no GitHub

```powershell
git add .
git commit -m "Adicionar Fase 16 completa"
git push
```

Aguarde a publicação ficar verde na aba **Actions** do GitHub.

## Atualizar no celular

1. Feche a aba ou o aplicativo instalado.
2. Abra novamente depois da publicação.
3. O boot `16-0` limpará o cache da versão anterior.
4. Para trocar o ícone de um aplicativo já instalado, remova o atalho antigo e adicione o jogo novamente à tela inicial.

## Cadastro Supabase

Siga também `CONFIGURAR-CADASTRO-SUPABASE-FASE-16.md`.
