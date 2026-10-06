# Procedimento de Deploy — Componentes reutilizáveis do painel administrativo

## Ambiente

- Aplicação Angular estática publicada na Vercel.
- Projeto Vercel: `portfolio`.
- Escopo Vercel: `marcos-vinicius-f-santos-projects`.
- O Supabase continua sendo consumido pelo runtime existente; esta feature não altera banco, Auth, Storage, policies ou variáveis de ambiente.
- O deploy deve ser validado primeiro em Preview e promovido para Production somente depois da validação.

## Data

2026-10-06

## Pré-condições

- [x] A especificação aprovada está em `spec/03-features/reusable-components/spec.md`.
- [x] O plano e as tarefas T-001 a T-010 estão aprovados e concluídos em `spec/04-plano/reusable-components/`.
- [x] A revisão de convergência está registrada em `spec/05-verificacao/reusable-components/checklist-convergencia.md`.
- [x] A suíte completa passou: 34 arquivos de teste e 162 testes.
- [x] O build de produção passou, com os avisos de orçamento já conhecidos do projeto.
- [x] `git diff --check` passou.
- [x] Não há segredo hardcoded ou commitado; `.env*` permanece ignorado e `public/runtime-config.js` é gerado e ignorado.
- [ ] O diff final foi revisado por Marcos antes da promoção.
- [ ] A árvore de trabalho foi commitada e enviada para o repositório remoto que alimenta o deploy.
- [ ] O Preview foi aberto e validado manualmente nos fluxos público e administrativo.

A aprovação verbal do deploy foi registrada, mas as três verificações finais acima ainda precisam ser concluídas antes da promoção para Production.

## Passos do deploy

Execute os comandos a partir de `E:\Projects\portfolio`.

1. Confirmar autenticação e vínculo do projeto:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   $VercelScope = 'marcos-vinicius-f-santos-projects'
   $ProjectId = 'prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj'
   npx vercel@60.0.1 whoami
   Get-Content '.vercel\project.json'
   ```

2. Revisar o estado que será publicado:

   ```powershell
   git status --short
   git diff --check
   git diff
   ```

3. Instalar as dependências reproduzindo o lockfile e executar a verificação local:

   ```powershell
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   ```

4. Registrar a implantação `Ready` atual que poderá servir de rollback. Não invente o ID: copie o deployment real retornado pelo comando.

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

   Preencha no registro de deploy o ID e a URL do deployment anterior escolhido como `$KnownGoodDeploymentId` e `$KnownGoodUrl`.

5. Criar o Preview:

   ```powershell
   $PreviewUrl = npx vercel@60.0.1 deploy --yes --scope $VercelScope
   ```

   Guardar a URL retornada e confirmar que o deployment ficou `Ready`.

6. Verificar o Preview antes de promover:

   ```powershell
   npx vercel@60.0.1 curl "$PreviewUrl/" --scope $VercelScope
   npx vercel@60.0.1 curl "$PreviewUrl/runtime-config.js" --scope $VercelScope
   ```

   O conteúdo de `runtime-config.js` deve conter apenas a configuração pública esperada e nunca segredo. A validação manual deve cobrir:

   - `/`: carregamento da página pública e alternância PT/EN.
   - `/admin`: usuário deslogado vê o login e credenciais inválidas não concedem acesso.
   - `/admin/editor`: cabeçalho, cabeçalho de seção, feedback e cards compartilhados renderizam sem alterar as interações existentes.
   - `/admin/media`: cards de imagem e de estado vazio renderizam, incluindo o estado `Sem ícone`.
   - Console do navegador sem erro fatal durante os fluxos acima.

7. Somente após a revisão do Preview e a aprovação final, promover para Production:

   ```powershell
   npx vercel@60.0.1 promote $PreviewUrl --yes --scope $VercelScope
   npx vercel@60.0.1 promote status portfolio --scope $VercelScope
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

   Registrar a URL e o deployment promovido.

## Ordem de migration de banco

Não há migration nova nesta feature. Não executar `supabase db push`, `supabase db reset`, SQL destrutivo ou alterações de policies, Auth, Storage e dados. A mudança é exclusivamente de componentes e estilos frontend.

## Validação depois do deploy

- Abrir a URL de Production e confirmar carregamento da página pública.
- Confirmar alternância PT/EN.
- Confirmar que `/admin` continua protegida para usuários deslogados.
- Com uma sessão administrativa autorizada, confirmar `/admin`, `/admin/editor` e `/admin/media`.
- Repetir a verificação dos cabeçalhos, feedbacks e variantes de cards compartilhados.
- Conferir o console do navegador e os logs do deployment para erros fatais.
- Confirmar que o runtime continua apontando para a configuração esperada e não expõe segredos.

## Procedimento de rollback

1. Interromper a validação da versão problemática e registrar horário, URL e sintoma.
2. Listar os deployments e selecionar o último deployment Production com estado `Ready` antes da promoção problemática:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

3. Executar o rollback para o deployment confirmado:

   ```powershell
   npx vercel@60.0.1 rollback $KnownGoodDeploymentId --yes --scope $VercelScope
   npx vercel@60.0.1 promote status portfolio --scope $VercelScope
   ```

4. Validar novamente a URL pública, PT/EN, a proteção de `/admin` e os fluxos administrativos essenciais.
5. Se o problema for de ambiente, corrigir a configuração na Vercel e criar um novo Preview; não modificar banco, chaves, policies ou dados como parte do rollback frontend.
6. Registrar causa, deployment revertido, validações executadas e ação corretiva antes de tentar novo deploy.

## Notas de recuperação de dados

Este deploy não altera dados nem schema do Supabase. O rollback frontend também não desfaz nem remove dados. Não executar comandos de reset, drop, revogação de chaves ou alteração de policies para recuperar a versão anterior.

## Aprovação

Aprovado pra deploy?
