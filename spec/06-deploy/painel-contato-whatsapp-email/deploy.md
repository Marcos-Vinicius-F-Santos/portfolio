# Procedimento de Deploy — Painel de contato por WhatsApp e e-mail

Ambiente: Preview e Production na Vercel; conteúdo localizado e configuração pública no runtime existente
Projeto local: `E:\Projects\portfolio`
Projeto Vercel: `portfolio`
Escopo Vercel: `marcos-vinicius-f-santos-projects`
Project ID Vercel: `prj_2Hvxo06nKqzUcJgYB0i0Gq7Kwnlj`
Data: 2026-10-07

## Pré-condições

- [x] A spec, o plano e as tarefas da feature estão registrados em `spec/03-features/painel-contato-whatsapp-email/` e `spec/04-plano/painel-contato-whatsapp-email/`.
- [x] T-001 a T-013 foram implementadas e revisadas; o procedimento de deploy está documentado.
- [x] O checklist de convergência em `spec/05-verificacao/painel-contato-whatsapp-email/checklist-convergencia.md` foi revisado e aprovado por Marcos.
- [x] A suíte completa passou: 36 arquivos e 172 testes.
- [x] O build de produção passou.
- [x] `git diff --check` passou.
- [x] Não há migration, alteração de schema, policy, Auth ou Storage nesta feature.
- [x] Não há nova variável de ambiente nem segredo necessário; o WhatsApp e o e-mail são destinos públicos já confirmados.
- [ ] O diff final completo foi revisado por Marcos para a promoção deste release.
- [ ] A árvore de trabalho foi commitada e enviada ao repositório remoto que alimenta o deploy.
- [ ] Uma implantação Production `Ready` anterior foi identificada para rollback.
- [ ] O Preview foi aberto e validado manualmente antes da promoção.

Não promova para Production enquanto as pré-condições pendentes não forem confirmadas.

## Variáveis de ambiente e segredos

Esta feature não cria nem altera variável de ambiente. Mantenha as variáveis existentes
da aplicação exatamente como já configuradas em Preview e Production. Não adicionar
`SUPABASE_SERVICE_ROLE_KEY`, senha, token ou qualquer segredo ao frontend.

Para conferir sem imprimir valores sensíveis:

```powershell
Set-Location 'E:\Projects\portfolio'
npx vercel@60.0.1 env ls --scope marcos-vinicius-f-santos-projects
```

## Passos do deploy

Execute os comandos a partir de `E:\Projects\portfolio`.

1. Confirmar a conta e o vínculo Vercel:

   ```powershell
   Set-Location 'E:\Projects\portfolio'
   npx vercel@60.0.1 whoami
   Get-Content '.vercel\project.json'
   ```

   Confirmar `projectName: portfolio`, o Project ID documentado acima e o escopo correto.

2. Revisar o estado que será publicado e repetir a validação local:

   ```powershell
   git status --short
   git diff --check
   git diff --name-only
   npm ci
   npm test -- --watch=false --no-progress
   npm run build
   ```

3. Listar deployments e registrar a Production atual com estado `Ready`:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

   Copiar o ID e a URL imutável da versão conhecida como boa para
   `$KnownGoodDeploymentId` e `$KnownGoodUrl`. Não inventar esses valores.

4. Criar o Preview:

   ```powershell
   $PreviewUrl = npx vercel@60.0.1 deploy --yes --scope marcos-vinicius-f-santos-projects
   ```

   Confirmar que o deployment chegou ao estado `Ready`.

5. Validar o Preview antes de qualquer promoção:

   ```powershell
   npx vercel@60.0.1 curl "$PreviewUrl/" --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 curl "$PreviewUrl/runtime-config.js" --scope marcos-vinicius-f-santos-projects
   ```

   Na revisão manual, confirmar:

   - a página pública carrega em PT-BR e inglês;
   - a seção de contato preserva LinkedIn, GitHub, e-mail, telefone e currículo;
   - o painel aparece depois dos links e antes do currículo;
   - campos vazios ou e-mail inválido não abrem canal;
   - valores válidos abrem WhatsApp e e-mail em nova aba/janela quando possível;
   - não há confirmação falsa de envio nem gravação no Supabase;
   - não há erro fatal no console no fluxo de contato;
   - desktop e mobile não apresentam corte, sobreposição ou ação inacessível.

6. Somente após a revisão do Preview e aprovação explícita de Marcos, promover para Production:

   ```powershell
   npx vercel@60.0.1 promote "$PreviewUrl" --yes --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 promote status portfolio --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

## Ordem de migration de banco

Não há migration nesta feature. Não executar `supabase db push`, `supabase db reset`,
SQL destrutivo ou alterações de policies, Auth, Storage e dados. A entrega é somente
frontend e conteúdo localizado já suportado pelo mecanismo existente.

## Validação depois do deploy

- Abrir a URL Production e confirmar o carregamento da página pública.
- Alternar PT-BR/inglês e confirmar rótulos, placeholders e mensagens do painel.
- Confirmar os links diretos e o currículo.
- Preencher dados de teste e verificar os destinos WhatsApp e `mailto:` sem enviar a mensagem.
- Confirmar que fechar o canal externo não cria sucesso no portfólio.
- Conferir o console e os logs do deployment para erros fatais.
- Confirmar que nenhuma variável ou segredo foi exposto no bundle.

## Procedimento de rollback

1. Interromper a validação da versão problemática e registrar horário, URL e sintoma.
2. Listar os deployments e selecionar a última Production `Ready` conhecida como boa:

   ```powershell
   npx vercel@60.0.1 ls portfolio --scope marcos-vinicius-f-santos-projects
   ```

3. Executar o rollback frontend para o deployment confirmado:

   ```powershell
   npx vercel@60.0.1 rollback "$KnownGoodDeploymentId" --yes --scope marcos-vinicius-f-santos-projects
   npx vercel@60.0.1 promote status portfolio --scope marcos-vinicius-f-santos-projects
   ```

4. Validar novamente a página pública, alternância de idioma, seção de contato e
   proteção da área administrativa.
5. Se o problema for de ambiente, corrigir a configuração na Vercel e criar um novo
   Preview. Não alterar banco, policies, Auth, Storage ou dados durante o rollback.
6. Registrar causa, deployment revertido, validações executadas e ação corretiva antes
   de tentar uma nova entrega.

## Notas de recuperação de dados

Esta feature não altera dados nem schema do Supabase. O rollback é exclusivamente
frontend e não exige remover, restaurar ou modificar dados.

## Aprovação

Aprovado pra deploy?
