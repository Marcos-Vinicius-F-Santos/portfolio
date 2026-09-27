# Procedimento de Deploy — layout-vertical-secoes

Ambiente: Vercel Production — projeto Angular em `E:\Projects\portfolio`  
Projeto Vercel: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Branch Git atual: `master`  
Remote Git: não configurado; o fluxo operacional atual usa a Vercel CLI  
Status: Deploy executado — validação operacional concluída; revisão visual manual ainda pendente  
Data: 2026-09-24

## Pré-condições

- [x] Spec da feature aprovada em `spec/03-features/layout-vertical-secoes/spec.md`.
- [x] Plano e tarefas registrados em `spec/04-plano/layout-vertical-secoes/`.
- [x] Checklist de convergência preenchida em
      `spec/05-verificacao/layout-vertical-secoes/checklist-convergencia.md`.
- [x] Suíte automatizada executada: 7 arquivos e 71 testes aprovados.
- [x] Build de produção executado com sucesso via `npm run build`.
- [x] Nenhum schema, migration, Storage, Auth ou dado de produção é alterado por esta
      feature.
- [x] Não há segredo novo para esta feature e nenhum segredo está hardcoded no código.
- [ ] Validação visual manual concluída em desktop e móvel, incluindo conteúdo extenso.
- [ ] Divergência do seletor `section:nth-child(2)` resolvida ou aprovada conscientemente.
- [ ] Diff final revisado por Marcos.
- [x] Marcos aprovou explicitamente este deploy.

Não execute os passos de publicação enquanto os itens pendentes acima não estiverem
confirmados.

## Passos do deploy

### 1. Preparar e revisar o release

Abra o PowerShell e execute:

```powershell
Set-Location 'E:\Projects\portfolio'
Get-Content '.vercel\project.json'
npx vercel whoami
git status --short
git diff --check
git diff --stat
```

Confirme:

- o usuário da CLI está autenticado;
- o projeto exibido é `portfolio`;
- o escopo é `marcos-vinicius-f-santos-projects`;
- não há alterações não relacionadas;
- as alterações esperadas de código estão somente em:

```text
src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts
src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss
src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts
```

As specs e a documentação de verificação/deploy podem ser incluídas no mesmo estado
versionado, mas não participam do bundle Angular.

### 2. Instalar dependências e validar localmente

Na raiz do projeto:

```powershell
npm ci
npm test -- --watch=false
npm run build
```

Continue somente se os testes e o build terminarem sem erro. Confirme que o build foi
gerado em:

```text
E:\Projects\portfolio\dist\portfolio
```

O warning atual de orçamento do SCSS não interrompe o build, mas deve ser registrado na
revisão do release.

### 3. Confirmar variáveis de ambiente da Vercel

Esta feature não cria nem altera variáveis de ambiente. Porém, o projeto existente usa o
script `scripts/generate-runtime-config.mjs`, que lê as seguintes variáveis durante o
build:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Antes de publicar, em **Vercel → Project Settings → Environment Variables**, confirme que
essas duas variáveis continuam configuradas para **Preview** e **Production**, se já eram
necessárias para o conteúdo publicado.

Não crie nem configure:

- `SUPABASE_SERVICE_ROLE_KEY`;
- senhas;
- tokens de acesso;
- qualquer chave privada no frontend ou no repositório.

Se as variáveis existentes estiverem ausentes, pare o deploy e configure-as pela Vercel
antes de criar a Preview. Não coloque valores reais em `.env.example`,
`public/runtime-config.js` ou arquivos versionados.

### 4. Registrar a implantação Production atual

Antes de publicar, registre uma implantação conhecida como boa:

```powershell
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
```

Anote:

```text
Deployment conhecido como bom:
URL/ID:
Data/hora:
Commit/estado:
```

Essa referência será usada no rollback caso a nova versão apresente problema.

### 5. Criar uma Preview pela CLI

Como não há remote Git configurado, use o fluxo real via Vercel CLI:

```powershell
$PreviewUrl = npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
$PreviewUrl
```

Se a saída contiver texto adicional, copie somente a URL `https://*.vercel.app` para a
variável:

```powershell
$PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIEW'
npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
```

Não promova a Preview enquanto a validação e a aprovação explícita não estiverem
concluídas.

### 6. Validar a Preview

Na URL armazenada em `$PreviewUrl`, confirme:

1. A página abre sem tela de erro.
2. As seções aparecem na ordem:
   - Sobre mim;
   - Stack técnica;
   - Experiências;
   - demais seções.
3. Todas as seções ficam em uma única coluna em viewport desktop.
4. Todas as seções continuam em uma única coluna em viewport móvel.
5. Conteúdo extenso quebra e continua verticalmente, sem corte, sobreposição ou overflow
   horizontal.
6. Os links de navegação continuam levando às seções corretas.
7. A página continua alternando o idioma sem perder as seções.
8. Não há erro JavaScript no console.
9. No dashboard da Vercel, a Preview aparece como `Ready`.

Se qualquer item falhar, não promova a Preview. Corrija o código, repita a etapa 2, crie
uma nova Preview e valide novamente.

### 7. Solicitar aprovação

Depois da validação da Preview:

1. Mostre a URL da Preview e o resultado dos testes a Marcos.
2. Aguarde a aprovação explícita.
3. Não interprete a existência de uma Preview válida como aprovação de deploy.

### 8. Publicar em Production

Somente após a aprovação explícita:

```powershell
npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
npx vercel promote status --scope marcos-vinicius-f-santos-projects
```

Depois confirme a implantação:

```powershell
npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
```

Registre neste documento:

```text
Deployment Production:
URL pública:
Deployment ID:
Preview promovida:
Estado:
Data/hora:
```

## Ordem de migration de banco (se houver)

Não se aplica. Esta feature não altera schema, banco de dados, Supabase Storage, Auth ou
qualquer dado persistido. Nenhuma migration deve ser executada.

## Validação depois do deploy

Na URL Production registrada no passo 8:

1. Abra a página em uma janela anônima.
2. Confirme no dashboard da Vercel que a implantação está `Ready`.
3. Confirme a ordem “Sobre mim” → “Stack técnica” → demais seções.
4. Confirme uma única coluna em uma viewport desktop.
5. Confirme uma única coluna em uma viewport móvel.
6. Use conteúdo extenso e confirme quebra vertical sem corte, sobreposição ou overflow
   horizontal.
7. Clique nos links de navegação e confirme que cada destino continua funcionando.
8. Alterne o idioma e confirme que a ordem e os destinos permanecem estáveis.
9. Abra o console do navegador e confirme ausência de erros JavaScript.
10. Confirme que a versão publicada corresponde à Preview aprovada.

Se algum item falhar, execute imediatamente o procedimento de rollback.

## Procedimento de rollback

### Rollback imediato para a implantação Production anterior

Use este caminho se a produção estiver quebrada ou se o layout publicado causar regressão.

1. Abra o PowerShell.
2. Confirme o vínculo e a autenticação:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   Get-Content '.vercel\project.json'
   ```

   Confirme o projeto `portfolio` e o escopo
   `marcos-vinicius-f-santos-projects`.

3. Execute o rollback para a implantação Production imediatamente anterior:

   ```powershell
   npx vercel rollback --scope marcos-vinicius-f-santos-projects
   npx vercel rollback status --scope marcos-vinicius-f-santos-projects
   ```

4. Aguarde o status indicar conclusão.
5. Abra a URL Production e repita os dez itens da seção **Validação depois do deploy**.
6. Registre o horário, a implantação defeituosa, a implantação restaurada e o resultado da
   validação.

### Rollback para uma implantação específica conhecida como boa

Se o rollback automático não restaurar a versão correta:

1. Liste as implantações:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

2. Escolha a URL/ID anotada no passo 4, antes do deploy. Não escolha uma implantação
   apenas pelo nome; confirme que ela é a versão validada.
3. Promova essa implantação:

   ```powershell
   $KnownGood = 'COLE_AQUI_A_URL_OU_ID_REGISTRADA_ANTES_DO_DEPLOY'
   npx vercel inspect $KnownGood --scope marcos-vinicius-f-santos-projects
   npx vercel promote $KnownGood --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

4. Repita a validação pós-deploy.
5. Registre a URL/ID defeituosa e a URL/ID restaurada.

### Correção permanente após o rollback

1. Não exclua a implantação defeituosa; ela é necessária para investigação.
2. Corrija o problema localmente.
3. Execute:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npm ci
   npm test -- --watch=false
   npm run build
   git diff --check
   ```

4. Crie uma nova Preview com `npx vercel deploy --yes`.
5. Valide a Preview.
6. Solicite nova aprovação explícita.
7. Promova somente a Preview aprovada.
8. Não use `git revert` para este working tree sem um commit publicado identificado. O
   rollback operacional desta feature é feito pela Vercel; o rollback permanente por Git
   só deve ser usado depois que existir um commit de release conhecido.

## Notas de recuperação de dados

Não há dados para recuperar nesta feature. O rollback restaura arquivos estáticos da
aplicação; não altera PostgreSQL, Supabase Storage, Auth ou preferências locais do
navegador.

## Histórico do deploy

```text
Status: publicado em Production; aprovação explícita recebida
Preview: https://portfolio-ka7w6c4oo-marcos-vinicius-f-santos-projects.vercel.app (dpl_qN1GDb486SWsW8Jmjj1gTvkXcVnb)
Production: https://portfolio-marcos-vinicius-f-santos-projects.vercel.app
Deployment ID: dpl_BCQpnkaxKV9rMWa1p6KpUe9ykvau
Deployment conhecido como bom antes da publicação: verificado via npx vercel ls antes da promoção
Rollback executado: não
Observações: Production Ready; alias adicional: https://portfolio-eight-pied-855iwa1x0n.vercel.app
```

