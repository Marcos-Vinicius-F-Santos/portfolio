# Procedimento de Deploy — Área administrativa autenticada

Ambiente: produção e preview na Vercel, com Supabase Auth remoto  
Data: 2026-09-25  
Projeto Vercel: `portfolio`  
Escopo Vercel: `marcos-vinicius-f-santos-projects`  
Project ID: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`  
Projeto Supabase: `portfolio-profissional` (`jjndvtjhxutuerwvjocy`)  
Região Supabase: `sa-east-1`

O repositório não possui Git remoto configurado. O procedimento real desta entrega usa
a Vercel CLI, vinculada ao projeto local por `.vercel/project.json`. Nenhum deploy será
executado por este documento.

## Pré-condições

- [x] A suíte atual passou: `96` testes em `11` arquivos.
- [x] `npm run build` passou; os avisos de orçamento do bundle estão registrados e não
      impedem a compilação.
- [x] A revisão de convergência foi registrada em
      `spec/05-verificacao/area-administrativa-autenticada/checklist-convergencia.md`.
- [x] `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` existem na Vercel para Production e
      Preview.
- [x] Migrations locais e remotas estão alinhadas; esta feature não adiciona migration.
- [x] O UUID `21fbb14d-8e11-4166-b320-639d8a7cb4df` está vinculado a
      `public.portfolio_admins`.
- [ ] Login real de Marcos em `/admin` foi validado no deployment de preview.
- [ ] Persistência após fechar e reabrir o navegador foi validada no deployment de
      preview.
- [ ] Conta não autorizada foi testada em ambiente aprovado e não acessou a área.
- [ ] O WARN de proteção contra senhas comprometidas desativada foi avaliado no painel
      do Supabase.
- [ ] Marcos revisou o diff final e respondeu explicitamente **“Aprovado”**.

Não promova a prévia enquanto qualquer pré-condição manual ou a aprovação final estiver
pendente. Se o checklist de convergência atual ainda tiver uma divergência de rota ou de
sessão persistida, corrija e revalide-a antes de seguir.

## Variáveis de ambiente e segredos

Não há nova variável exigida por esta feature. As duas variáveis públicas já estão
configuradas no projeto Vercel em Production e Preview:

| Variável                   | Destino atual        | Valor esperado                             | Tratamento                                           |
| -------------------------- | -------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `SUPABASE_URL`             | Production e Preview | `https://jjndvtjhxutuerwvjocy.supabase.co` | URL pública do projeto                               |
| `SUPABASE_PUBLISHABLE_KEY` | Production e Preview | Publishable key do projeto Supabase        | Chave pública; não usar `service_role` ou secret key |

Confirme somente os nomes e ambientes, sem imprimir valores:

```powershell
Set-Location 'E:\Projects\portfolio'
npx vercel@60.0.1 env list production --scope marcos-vinicius-f-santos-projects
npx vercel@60.0.1 env list preview --scope marcos-vinicius-f-santos-projects
```

Se alguma variável estiver ausente, adicione-a interativamente. Não passe a chave na
linha de comando e não use `--force` sem confirmar que o valor anterior está incorreto:

```powershell
npx vercel@60.0.1 env add SUPABASE_URL production --scope marcos-vinicius-f-santos-projects
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY production --scope marcos-vinicius-f-santos-projects
# Cole a publishable key do projeto Supabase; nunca cole service_role ou secret key

npx vercel@60.0.1 env add SUPABASE_URL preview --scope marcos-vinicius-f-santos-projects
# Cole: https://jjndvtjhxutuerwvjocy.supabase.co

npx vercel@60.0.1 env add SUPABASE_PUBLISHABLE_KEY preview --scope marcos-vinicius-f-santos-projects
# Cole a mesma publishable key do projeto Supabase
```

Não versionar `.env`, senha do Auth, senha do banco, `service_role`, secret key ou token
da Vercel. O frontend gera `public/runtime-config.js` durante o build; esse arquivo é
gerado e não deve ser commitado.

## Passos do deploy

1. Abra o PowerShell no projeto e confirme a conta e o projeto Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   $VercelScope = 'marcos-vinicius-f-santos-projects'
   $SupabaseProjectRef = 'jjndvtjhxutuerwvjocy'

   npx vercel@60.0.1 whoami
   Get-Content '.vercel\project.json'
   ```

   O projeto deve ser `portfolio`, o `orgId` deve ser
   `team_f40xcyXvtR6SnxVzP1VbKdPW` e o Project ID deve ser
   `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`.

2. Registre a versão de produção conhecida como estável antes de criar a prévia:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

   Na saída, localize a linha mais recente com `Environment Production` e status
   `Ready`. No momento deste documento, ela é:

   ```powershell
   $KnownGoodDeploymentId = 'dpl_73Uq8paLZHgUQSuVzs5nhjUHCboF'
   $KnownGoodUrl = 'https://portfolio-nv0ckoqg7-marcos-vinicius-f-santos-projects.vercel.app'
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   ```

   Se a lista retornar outra produção mais recente, substitua as duas variáveis pelos
   dados dela. Esses valores são a referência do rollback desta release.

3. Confira o estado do working tree e não publique alterações não relacionadas:

   ```powershell
   git status --short
   git diff --check
   git diff
   ```

   Pare se houver arquivo inesperado no diff ou se `git diff --check` falhar.

4. Confirme as variáveis da Vercel conforme a seção anterior. Se alguma tiver sido
   alterada, aguarde a conclusão da atualização antes de criar a prévia.

5. Confirme o Supabase em modo somente leitura. Esta feature não possui migration nova
   e não exige `db push`:

   ```powershell
   npx supabase@2.117.0 migration list --project-ref $SupabaseProjectRef

   npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select user_id, created_at from public.portfolio_admins order by created_at;"

   npx supabase@2.117.0 db query --linked --project-ref $SupabaseProjectRef "select schemaname, tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'portfolio_admins' order by policyname;"
   ```

   A lista deve permanecer alinhada entre local e remoto, conter o UUID
   `21fbb14d-8e11-4166-b320-639d8a7cb4df` e mostrar a policy
   `portfolio_admins_select_self`. Não altere `portfolio_admins`, policies ou Auth durante
   este deploy.

6. Instale exatamente as dependências do lockfile e execute os gates locais:

   ```powershell
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   ```

   Pare imediatamente se qualquer comando falhar. O build pode exibir os avisos de
   orçamento já registrados; uma nova falha ou aumento relevante exige revisão antes da
   publicação.

7. Crie uma prévia, sem promovê-la para produção:

   ```powershell
   $PreviewUrl = npx vercel@60.0.1 deploy --yes --scope $VercelScope | Select-Object -Last 1
   $PreviewUrl
   npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
   ```

   Se a saída não for uma URL `https://...vercel.app`, copie manualmente a URL exibida e
   defina `$PreviewUrl` com ela. Confirme que o deployment está `Ready` e é `Preview`.

8. Valide a configuração publicada antes de abrir o fluxo de autenticação:

   ```powershell
   $PageResponse = npx vercel@60.0.1 curl "$PreviewUrl/" --scope $VercelScope --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $PageResponse -notmatch '<app-root') {
     throw 'A página pública não retornou o HTML Angular esperado.'
   }

   $RuntimeResponse = npx vercel@60.0.1 curl "$PreviewUrl/runtime-config.js" --scope $VercelScope --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $RuntimeResponse -notmatch '__PORTFOLIO_SUPABASE_CONFIG__' -or $RuntimeResponse -notmatch 'jjndvtjhxutuerwvjocy.supabase.co' -or $RuntimeResponse -notmatch 'sb_publishable_') {
     throw 'runtime-config.js ausente ou com configuração Supabase inválida.'
   }
   ```

9. Execute a validação manual na URL da prévia:

   - Abra `/` em janela anônima e confirme que a página pública carrega sem login.
   - Confirme que não existe link público para `/admin` e abra `/admin` diretamente.
   - Informe credenciais inválidas e confirme a mensagem padrão sem acesso.
   - Autentique Marcos e confirme a renderização de `data-testid="admin-area"`.
   - Feche e reabra o navegador, acesse `/admin` novamente e confirme a persistência da
     sessão autorizada.
   - Em ambiente aprovado, autentique uma conta diferente e confirme que ela não recebe
     a área administrativa e tem a sessão local encerrada.
   - Retorne a `/` e confirme que a página pública e a alternância PT/EN continuam
     funcionando.

   Pare e não promova se qualquer passo falhar, se `/admin` redirecionar para a página
   pública após uma sessão válida ou se houver acesso administrativo para outra conta.

10. Depois da revisão do resultado da prévia e da aprovação explícita de Marcos, promova
    exatamente a URL validada:

    ```powershell
    npx vercel@60.0.1 promote $PreviewUrl --yes --scope $VercelScope
    npx vercel@60.0.1 promote status portfolio --scope $VercelScope
    npx vercel@60.0.1 inspect $PreviewUrl --scope $VercelScope
    ```

11. Registre a URL e o ID do deployment promovido no histórico deste documento e confira
    os logs de erro:

    ```powershell
    npx vercel@60.0.1 ls portfolio --scope $VercelScope
    npx vercel@60.0.1 logs $PreviewUrl --scope $VercelScope --level error --since 1h
    ```

## Ordem de migration de banco (se houver)

Não há migration nova nesta feature. A ordem obrigatória é somente a conferência do
histórico existente antes do frontend:

1. `npx supabase@2.117.0 migration list --project-ref jjndvtjhxutuerwvjocy`
2. Confirmar que as versões locais e remotas estão alinhadas.
3. Confirmar que `public.portfolio_admins` contém o UUID autorizado e que a policy
   `portfolio_admins_select_self` existe.
4. Não executar `supabase db push`, `supabase db reset`, `DROP TABLE` ou alteração manual
   de policy para publicar esta feature.

Se surgir migration não aplicada ou divergência de schema, interrompa o deploy e trate a
migration em uma mudança separada, aprovada e versionada.

## Validação depois do deploy

Use o alias de produção mostrado pelo `vercel inspect` e repita os checks essenciais:

1. Abrir `/` e confirmar HTTP 200, carregamento da página pública e alternância PT/EN.
2. Abrir `/admin` diretamente sem sessão e confirmar que somente a entrada de
   autenticação aparece.
3. Testar credenciais inválidas e confirmar tratamento visual padrão sem concessão de
   acesso.
4. Autenticar Marcos e confirmar a área administrativa protegida.
5. Fechar e reabrir o navegador e confirmar que a sessão de Marcos permanece válida.
6. Testar uma conta diferente somente em ambiente aprovado e confirmar rejeição,
   encerramento da sessão e ausência do container administrativo.
7. Conferir `runtime-config.js` e garantir que contém somente a URL e a publishable key;
   nunca deve conter `service_role`, secret key, senha ou token.
8. Conferir os logs da última hora e interromper a entrega se houver erro fatal de
   inicialização, roteamento ou autenticação.

## Procedimento de rollback

Use esta sequência se a produção apresentar tela em branco, erro fatal, configuração
Supabase ausente, falha de roteamento ou acesso administrativo indevido. Ela reverte
somente o frontend para o deployment conhecido como estável e não altera o banco.

1. Pare novas validações e abra o PowerShell no projeto:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   $VercelScope = 'marcos-vinicius-f-santos-projects'
   $KnownGoodDeploymentId = 'dpl_73Uq8paLZHgUQSuVzs5nhjUHCboF'
   $KnownGoodUrl = 'https://portfolio-nv0ckoqg7-marcos-vinicius-f-santos-projects.vercel.app'
   npx vercel@60.0.1 whoami
   ```

2. Confirme que o deployment conhecido como estável está `Ready` antes de revertê-lo:

   ```powershell
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   ```

   Se ele não estiver `Ready`, pare e escolha outro deployment `Production` ou `Ready`
   imediatamente anterior na saída de:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

3. Execute o rollback para o ID confirmado:

   ```powershell
   npx vercel@60.0.1 rollback $KnownGoodDeploymentId --yes --scope $VercelScope
   npx vercel@60.0.1 rollback status portfolio --scope $VercelScope
   ```

4. Confirme que o alias de produção voltou para o deployment estável:

   ```powershell
   npx vercel@60.0.1 inspect $KnownGoodDeploymentId --scope $VercelScope
   npx vercel@60.0.1 ls portfolio --scope $VercelScope
   ```

5. Faça a checagem mínima da versão restaurada:

   ```powershell
   $Response = npx vercel@60.0.1 curl "$KnownGoodUrl/" --scope $VercelScope --yes 2>$null | Out-String
   if ($LASTEXITCODE -ne 0 -or $Response -notmatch '<app-root') {
     throw 'A versão restaurada não retornou o HTML Angular esperado.'
   }
   ```

   Em uma janela anônima, abra `$KnownGoodUrl/`, confirme a página pública e teste a
   alternância PT/EN. Não tente validar a área administrativa até confirmar que a
   produção voltou ao estado estável.

6. Não remova migrations, não apague `portfolio_admins`, não revogue a publishable key e
   não execute `supabase db reset`, `DROP TABLE` ou exclusão manual de dados como resposta
   imediata a uma falha do frontend.

7. Se o incidente for causado apenas por variável de ambiente, corrija a variável no
   ambiente correto da Vercel, crie nova prévia e repita todos os gates. Não force uma
   correção direto em produção sem nova prévia:

   ```powershell
   npx vercel@60.0.1 env list production --scope $VercelScope
   npx vercel@60.0.1 env list preview --scope $VercelScope
   ```

8. Se o incidente envolver UUID, allowlist, policy ou Auth do Supabase, preserve os dados,
   não altere migrations aplicadas e registre o incidente. Qualquer correção de banco ou
   policy deve ser uma migration compensatória ou procedimento operacional aprovado,
   executado separadamente do rollback do frontend.

9. Registre horário, sintoma, deployment defeituoso, deployment restaurado, comandos
   executados e impacto no Supabase. Uma nova tentativa exige nova prévia, validação e
   aprovação explícita.

## Notas de recuperação de dados (se aplicável)

- Esta feature não cria tabela, não altera schema e não insere conteúdo administrativo.
- O vínculo de Marcos em `public.portfolio_admins` é configuração operacional existente;
  não deve ser removido durante rollback do frontend.
- A sessão do Supabase Auth é estado do navegador e não é recuperada nem apagada por um
  rollback da Vercel. Se a versão anterior não usar a sessão, o usuário poderá precisar
  autenticar-se novamente depois da nova publicação.
- Nenhuma senha, token, `service_role` ou secret key deve ser registrada neste documento.

## Histórico do deploy

```text
Data: 2026-09-25
Status: produção promovida e deployment Ready
Preview validada: https://portfolio-gsli0e66l-marcos-vinicius-f-santos-projects.vercel.app
Preview deployment: dpl_3TbMeTjt9Z8ysmPjnfd67ah1eNyj
Produção promovida: https://portfolio-e966vcafa-marcos-vinicius-f-santos-projects.vercel.app
Production deployment: dpl_C6msXkFPnLEVt7HWirarb5JwRinH
Alias de produção: https://portfolio-marcos-vinicius-f-santos-projects.vercel.app
Deployment estável anterior: dpl_73Uq8paLZHgUQSuVzs5nhjUHCboF
Testes: 96 testes em 11 arquivos passaram
Build: passou com avisos de orçamento já conhecidos
Migrations: locais e remotas alinhadas; nenhuma migration nova aplicada
Logs Vercel: nenhum log de erro encontrado na última hora
HTML público e runtime-config.js: validados em produção
Validação manual de autenticação: não executada nesta sessão
Aprovação de Marcos: recebida antes da promoção
Rollback necessário: não
```

## Aprovação

O deploy somente pode ser promovido depois que Marcos revisar a prévia, executar a
validação manual e responder explicitamente:

**Aprovado pra deploy?**
