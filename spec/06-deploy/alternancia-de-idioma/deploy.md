# Procedimento de Deploy — Alternância de idioma

**Ambiente:** produção na Vercel  
**Projeto:** `portfolio`  
**Escopo:** `marcos-vinicius-f-santos-projects`  
**URL pública:** `https://portfolio-eight-pied-855iwa1x0n.vercel.app`  
**Data:** 2026-09-23

## Pré-condições

- [x] Revisão de convergência aprovada.
- [x] 54 testes automatizados passaram.
- [x] Build de produção passou.
- [x] Fluxo verificado no Chrome em desktop e viewport móvel.
- [x] Alterações registradas no commit local `c53d7f4`.
- [x] Prévia publicada; resposta autenticada e produção visualmente validadas.
- [x] Deployment anterior `dpl_7M6Jq5zq7CfR5XzdgXHnje3syKA2` registrado.
- [x] Aprovação explícita de Marcos recebida.

## Variáveis de ambiente e segredos

Nenhuma variável de ambiente ou segredo precisa ser criado, alterado ou removido.

O vínculo local `.vercel/project.json` deve continuar com:

- project ID: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`
- org ID: `team_f40xcyXvtR6SnxVzP1VbKdPW`

A sessão local da Vercel CLI deve estar autenticada. Este deploy manual não exige `VERCEL_TOKEN`.

## Passos do deploy

O repositório não possui remoto Git nem integração GitHub → Vercel. O fluxo real disponível usa a Vercel CLI no projeto local já vinculado.

1. Abra o PowerShell:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   Get-Content '.vercel\project.json'
   npx vercel whoami
   ```

   Confirme o projeto `portfolio` e o escopo `marcos-vinicius-f-santos-projects`.

2. Revise o release:

   ```powershell
   git status --short
   git diff --check
   git diff
   ```

   Os arquivos esperados ficam em:

   - `src/app/features/portfolio/content/`
   - `src/app/features/portfolio/presentation/portfolio-page/`
   - `spec/03-features/alternancia-de-idioma/`
   - `spec/04-plano/alternancia-de-idioma/`
   - `spec/05-verificacao/alternancia-de-idioma/`
   - `spec/06-deploy/alternancia-de-idioma/`

   Pare se houver mudança não relacionada fora desses caminhos.

3. Crie o commit candidato:

   ```powershell
   git add -- 'src/app/features/portfolio/content' 'src/app/features/portfolio/presentation/portfolio-page' 'spec/03-features/alternancia-de-idioma' 'spec/04-plano/alternancia-de-idioma' 'spec/05-verificacao/alternancia-de-idioma' 'spec/06-deploy/alternancia-de-idioma'
   git diff --cached --check
   git diff --cached --stat
   git commit -m 'feat: implementa alternancia de idioma'
   git rev-parse HEAD
   ```

4. Verifique o commit:

   ```powershell
   npm test -- --watch=false
   npm run build
   ```

   Prossiga somente se ambos terminarem com sucesso.

5. Registre a produção ativa antes de publicar:

   ```powershell
   npx vercel ls portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel inspect 'https://portfolio-eight-pied-855iwa1x0n.vercel.app' --scope marcos-vinicius-f-santos-projects
   ```

   ```text
   Deployment anterior:
   Commit candidato:
   Data/hora:
   ```

   Referência anterior conhecida: `https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app`, ID `dpl_7M6Jq5zq7CfR5XzdgXHnje3syKA2`. Confirme-a com `vercel inspect` antes do deploy.

6. Publique uma prévia:

   ```powershell
   $PreviewUrl = npx vercel deploy --yes --scope marcos-vinicius-f-santos-projects
   $PreviewUrl
   npx vercel inspect $PreviewUrl --scope marcos-vinicius-f-santos-projects
   ```

   Se a variável incluir texto além da URL, copie a URL `https://...vercel.app` da saída:

   ```powershell
   $PreviewUrl = 'COLE_AQUI_A_URL_DA_PREVIA'
   ```

7. Execute na prévia todo o roteiro da seção “Validação depois do deploy”.

8. Somente após a aprovação explícita, promova a prévia validada:

   ```powershell
   npx vercel promote $PreviewUrl --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

9. Repita o roteiro na URL de produção e preencha o histórico deste documento.

## Ordem de migration e compatibilidade

Não há migration, banco, API ou contrato externo. O conteúdo e o estado de idioma ficam no cliente.

## Validação depois do deploy

1. Com português como idioma principal do navegador, confirme que a página inicia em português e não sugere inglês.
2. Em janela anônima, use inglês como idioma principal. Confirme o início em português e o popup `Idioma sugerido: Inglês`.
3. Aceite; confirme a tradução para inglês. Recarregue; confirme que o inglês é restaurado.
4. Alterne entre português e inglês pelo controle do site.
5. Em uma seção interna e com a página rolada, alterne o idioma; confirme seção e posição preservadas.
6. Em nova janela anônima, recuse a sugestão; recarregue e confirme que ela não reaparece.
7. Limpe os dados locais; confirme que a sugestão volta a aparecer.
8. Com espanhol ou outro idioma não suportado como principal, confirme que a sugestão oferece inglês.
9. Confira seções, links e layout em desktop e viewport móvel, sem erro fatal no console.

Se algum item falhar em produção, execute o rollback imediatamente.

## Procedimento de rollback

1. Abra o projeto e confirme conta e vínculo:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel whoami
   Get-Content '.vercel\project.json'
   ```

2. Confirme `portfolio` e `marcos-vinicius-f-santos-projects`. Em seguida, restaure o deployment imediatamente anterior:

   ```powershell
   npx vercel rollback --scope marcos-vinicius-f-santos-projects
   ```

   Aceite a confirmação da CLI.

3. Confira a conclusão:

   ```powershell
   npx vercel rollback status --scope marcos-vinicius-f-santos-projects
   npx vercel inspect 'https://portfolio-eight-pied-855iwa1x0n.vercel.app' --scope marcos-vinicius-f-santos-projects
   ```

4. Abra a produção em janela anônima. Confirme que a página, seções, links e navegação carregam sem erro fatal.

5. Se o rollback automático restaurar a versão errada, promova a referência conhecida:

   ```powershell
   $KnownGood = 'https://portfolio-m4cscu20o-marcos-vinicius-f-santos-projects.vercel.app'
   npx vercel inspect $KnownGood --scope marcos-vinicius-f-santos-projects
   npx vercel promote $KnownGood --yes --scope marcos-vinicius-f-santos-projects
   npx vercel promote status --scope marcos-vinicius-f-santos-projects
   ```

   No `inspect`, confirme o ID `dpl_7M6Jq5zq7CfR5XzdgXHnje3syKA2`. Se ele não corresponder, use a URL registrada no passo 5 do deploy.

6. Registre horário, sintoma, deployment defeituoso e deployment restaurado. Uma nova publicação exige correção, testes, build, nova prévia e nova aprovação.

## Notas de recuperação de dados

Não há dado de servidor para recuperar. O rollback não apaga a preferência de idioma gravada no navegador. Ela fica sem efeito na versão anterior e poderá ser lida novamente em uma publicação futura.

## Histórico do deploy

```text
Status: publicado e validado
Commit publicado: c53d7f4
URL da prévia promovida: https://portfolio-agpnb5zqf-marcos-vinicius-f-santos-projects.vercel.app
Deployment de produção: dpl_E5djeir5AVhQmyzfG6Fqb2kFQw2h
URL imutável da produção: https://portfolio-6tzm90785-marcos-vinicius-f-santos-projects.vercel.app
Deployment anterior: dpl_7M6Jq5zq7CfR5XzdgXHnje3syKA2
Início: 2026-09-23 12:26 BRT
Conclusão: 2026-09-23 12:36 BRT
Responsável: Codex, com aprovação de Marcos
Resultado da validação: 54 testes, build, resposta autenticada da prévia e inspeção visual da produção aprovados
Rollback necessário: não
Observações: a prévia exigia autenticação Vercel; a validação visual final foi executada no alias público após a promoção.
```
