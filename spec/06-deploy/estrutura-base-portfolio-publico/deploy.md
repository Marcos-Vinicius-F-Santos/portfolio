# Procedimento de Deploy — estrutura-base-portfolio-publico

Ambiente: Vercel Production, projeto Angular estático em `E:\Projects\portfolio`
Data: 2026-09-22
Status: Deploy executado e validação pós-deploy concluída

## Escopo e valores operacionais

Este procedimento publica a aplicação Angular da feature `estrutura-base-portfolio-publico` como site estático na Vercel, seguindo a arquitetura aprovada: código no GitHub e deploy conectado ao branch de produção na Vercel.

Valores operacionais registrados para esta execução:

- Repositório GitHub: ainda não configurado (`<OWNER>/<REPOSITORY>`)
- Projeto Vercel: `portfolio` (`prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`)
- Escopo Vercel: `marcos-vinicius-f-santos-projects`
- URL de produção: `https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app`
- Branch de produção: `main`

O projeto Vercel foi criado durante este deploy. O remote GitHub e um domínio personalizado continuam não configurados.

## Pré-condições

- [x] A revisão de convergência foi concluída em `spec/05-verificacao/checklist-convergencia.md`.
- [x] A feature foi implementada no projeto Angular em `E:\Projects\portfolio`.
- [x] O build local produz os artefatos em `dist/portfolio`.
- [x] Não há banco de dados nem migration nesta feature.
- [x] O aprovador revisou o diff final e aprovou o deploy.
- [ ] O repositório GitHub foi criado e o remote `origin` aponta para `<OWNER>/<REPOSITORY>`.
- [ ] O projeto Vercel está conectado ao repositório GitHub e usa `main` como branch de produção. Nesta execução, o deploy foi feito diretamente pela CLI.
- [ ] Existe uma implantação Preview conhecida como válida para esta versão. Nesta execução, a aprovação foi dada para publicação direta.
- [x] O aprovador aceitou que o primeiro deploy não tinha uma implantação Production anterior para rollback.

## Passos do deploy

### 1. Preparar a versão local

Abra o PowerShell e execute:

```powershell
Set-Location E:\Projects\portfolio
git status --short
```

Se houver alterações não relacionadas à feature, pare e resolva antes de continuar. O deploy deve partir de um commit revisado.

Instale exatamente o que está no lockfile e rode as verificações locais:

```powershell
npm ci
npm test -- --watch=false --no-progress
npm run build
```

Continue somente se os testes passarem e o comando de build terminar sem erro. Confirme que `E:\Projects\portfolio\dist\portfolio` existe e contém o build estático.

### 2. Configurar o GitHub uma única vez

Se ainda não existir um remote, crie um repositório vazio no GitHub com o nome definido para `<REPOSITORY>`. Não gere README, `.gitignore` ou licença no GitHub, pois o projeto já possui esses arquivos localmente.

Depois, execute na raiz do projeto:

```powershell
Set-Location E:\Projects\portfolio
git remote -v
git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
git branch -M main
git push -u origin main
```

Se `origin` já existir, não execute `git remote add`; confirme que ele aponta para o repositório correto e use apenas:

```powershell
git branch -M main
git push -u origin main
```

### 3. Configurar o projeto Vercel uma única vez

Na Vercel:

1. Abra o dashboard da conta que será dona do deploy.
2. Selecione **Add New → Project**.
3. Importe o repositório GitHub `<OWNER>/<REPOSITORY>`.
4. Use a raiz do repositório (`.`) como **Root Directory**.
5. Confirme o preset **Angular** quando ele for detectado.
6. Configure, caso a detecção automática não preencha os campos:
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/portfolio`
   - **Production Branch:** `main`
7. Em **Settings → General**, confirme Node.js `24.x`, para manter o mesmo baseline usado localmente.
8. Não cadastre variáveis de ambiente para esta feature: a aplicação atual não lê variáveis de ambiente e não possui integração com Supabase.
9. Salve o projeto e registre neste arquivo o nome/ID do projeto e a URL de produção.

A Vercel deve criar uma implantação Preview para commits fora de `main`. Antes de promover qualquer versão, abra a URL Preview e execute a validação descrita abaixo.

### 4. Validar a Preview

Na URL fornecida pela Vercel para a Preview:

1. Confirme que a página única abre sem erro de build.
2. Confirme a presença das seções **Sobre mim**, **Experiências** e **Stack técnica**.
3. Clique nos três itens de navegação e confirme que cada clique leva à seção correspondente.
4. Redimensione para uma viewport desktop e para uma viewport estreita de dispositivo móvel; confirme que o conteúdo continua legível e que as seções não ficam sobrepostas.
5. Confirme a identidade visual preta, vermelha e verde.
6. Abra o console do navegador e confirme que não há erro JavaScript relacionado à aplicação.

Se qualquer verificação falhar, não faça merge em `main`. Corrija, rode novamente os comandos da etapa 1 e aguarde uma nova Preview.

### 5. Promover para Production

Depois da validação da Preview e da aprovação do responsável pelo deploy:

1. Abra um Pull Request da branch que gerou a Preview para `main`.
2. Confirme no Pull Request que a Preview validada é a mesma versão que será integrada.
3. Faça o merge em `main`.
4. Aguarde a Vercel concluir a implantação Production gerada pelo commit de `main`.
5. Registre o SHA do commit, o ID/URL da implantação e a URL de produção nesta documentação ou no registro de entrega.

Esse fluxo usa o mecanismo GitHub → Vercel previsto para o produto. O deploy não deve ser feito diretamente com um build local copiado manualmente para a Vercel.
### Registro da execução aprovada

Como não havia remote GitHub nem projeto Vercel existente, a execução autorizada usou o caminho direto da CLI:

```powershell
Set-Location E:\Projects\portfolio
npx vercel --prod --yes
```

Resultado:

- Commit local de origem: `33a3bde docs: register convergence and deploy procedure`
- Projeto criado: `marcos-vinicius-f-santos-projects/portfolio`
- Deployment ID: `7M6Jq5zq7CfR5XzdgXHnje3syKA2`
- URL Production: `https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app`
- URL alternativa da implantação: `https://portfolio-eight-pied-855iwa1x0n.vercel.app`
- Status: `Ready`
- Build remoto: Angular detectado; `npm run build` concluído; saída efetiva em `/vercel/path0/dist/portfolio`

Esta é uma divergência operacional do fluxo GitHub → Vercel previsto originalmente. O próximo deploy deve configurar o remote GitHub e conectar o projeto Vercel antes de publicar mudanças.

## Ordem de migration de banco (se houver)

Não se aplica. Esta feature é uma aplicação Angular estática e não cria, altera ou migra banco de dados.

## Validação depois do deploy

Na URL `https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app`:

1. Abra a página em uma janela anônima.
2. Confirme que a resposta é carregada pela Vercel e que a página não exibe erro de build.
3. Confirme as três seções: **Sobre mim**, **Experiências** e **Stack técnica**.
4. Confirme a navegação entre seções nos três links.
5. Confirme o layout em desktop e em viewport móvel estreita.
6. Confirme as cores preta, vermelha e verde e a leitura do conteúdo.
7. Abra o console do navegador e confirme ausência de erros JavaScript.
8. No dashboard da Vercel, confirme que a implantação Production está `Ready`, pertence ao commit esperado de `main` e está associada ao domínio de produção.

Se qualquer item falhar, interrompa a divulgação da URL e execute o procedimento de rollback.

## Procedimento de rollback

### Rollback de emergência na Vercel

Use este caminho quando a Production estiver quebrada. Ele restaura uma implantação anterior sem reconstruir o projeto.

1. Abra o PowerShell.
2. Execute:

   ```powershell
   Set-Location E:\Projects\portfolio
   npx vercel login
   npx vercel link
   npx vercel rollback
   npx vercel rollback status
   ```

   Execute `npx vercel login` e `npx vercel link` somente se a máquina ainda não estiver autenticada ou o diretório ainda não estiver vinculado ao projeto `portfolio`; escolha o escopo `marcos-vinicius-f-santos-projects` e o projeto correto quando a CLI perguntar.

3. Aguarde `vercel rollback status` indicar que o rollback terminou.
4. Abra `https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app` em uma janela anônima.
5. Repita os oito itens da seção **Validação depois do deploy**.
6. Se o rollback tiver restaurado a versão errada, promova explicitamente a implantação conhecida como válida:

   ```powershell
   npx vercel promote <GOOD_DEPLOYMENT_URL_OR_ID>
   npx vercel promote status
   ```

7. Registre no incidente: horário, URL/ID da implantação ruim, URL/ID da implantação restaurada e resultado da validação.

No plano Hobby, `vercel rollback` só pode voltar para a implantação Production imediatamente anterior. Para voltar a uma implantação mais antiga, a conta precisa ter o plano que permite indicar a URL/ID histórica; nesse caso, substitua a etapa 2 por:

```powershell
npx vercel rollback <GOOD_DEPLOYMENT_URL_OR_ID>
npx vercel rollback status
```

### Correção permanente depois do rollback

1. Não apague a implantação ruim na Vercel; ela é necessária para investigação e pode ser necessária para rollback.
2. Identifique o commit ruim no GitHub e corrija o problema localmente.
3. Na raiz do projeto, rode:

   ```powershell
   Set-Location E:\Projects\portfolio
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   git status --short
   git add .
   git commit -m "fix: restore portfolio production"
   git push origin main
   ```

4. Valide a nova Preview antes de permitir que ela chegue a `main`. Se a correção já foi revertida em uma branch separada, faça o merge apenas depois de a Preview passar.
5. Depois de uma nova implantação Production válida, confirme a URL e o commit no dashboard da Vercel.

O commit inicial da feature (`118f2b1`) era um commit raiz; portanto, `git revert 118f2b1` não é um rollback comprovado para uma versão anterior do produto. Para esta primeira publicação, o rollback operacional é o rollback/promote da Vercel. O rollback por Git passa a ser aplicável depois que houver um commit posterior com um pai conhecido e uma versão anterior efetivamente publicada.

## Mudanças de variáveis de ambiente e segredos

- Esta feature não exige variáveis de ambiente da aplicação.
- Não há chave, senha, token ou configuração Supabase necessária para o deploy atual.
- O fluxo normal GitHub → Vercel usa a autenticação das contas no GitHub e no dashboard; não é necessário criar `VERCEL_TOKEN` para o deploy manual descrito acima.
- Se a CLI for automatizada no futuro, `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` deverão existir apenas como segredos do ambiente de CI ou do gerenciador de credenciais local; nunca devem ser colocados em código, Markdown versionado ou saída de terminal.
- Se uma feature futura adicionar Supabase ou outra integração, as variáveis deverão ser definidas na Spec daquela feature e cadastradas separadamente nos ambientes Preview e Production da Vercel antes do deploy. Não cadastrar variáveis futuras agora.

## Riscos e pontos de atenção

- **Sem remote/projeto Vercel registrados:** o primeiro deploy não pode ser executado até preencher `<OWNER>/<REPOSITORY>`, `<VERCEL_PROJECT_NAME_OR_ID>`, `<VERCEL_SCOPE_OR_ACCOUNT>` e `<PRODUCTION_URL>`. Isso é uma pendência operacional, não uma decisão de arquitetura.
- **Primeiro deploy sem versão Production anterior:** não existe rollback automático para uma versão anterior antes da primeira publicação válida. Merece Registro de Decisão? **Sim**, se o aprovador quiser publicar diretamente em Production sem uma Preview validada ou sem uma estratégia de fallback.
- **Saída do build:** `dist/portfolio` foi confirmada localmente. Se a Vercel detectar outra saída para o preset Angular, o deploy deve parar; ajuste o campo Output Directory somente após confirmar o caminho gerado nos logs do build.
- **Node.js:** a Vercel deve usar Node `24.x`, alinhado ao ambiente local. Se o projeto Vercel estiver em outra major, o deploy deve parar até a configuração ser corrigida e o build ser repetido.
- **Rollback no plano Hobby:** só é possível voltar à implantação Production imediatamente anterior. Merece Registro de Decisão? **Sim**, se for necessário garantir rollback para mais de uma versão histórica.

## Referências operacionais

- [Documentação Vercel — configurar build](https://vercel.com/docs/builds/configure-a-build)
- [Documentação Vercel — promover uma implantação](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Documentação Vercel — rollback de uma implantação Production](https://vercel.com/docs/deployments/rollback-production-deployment)


