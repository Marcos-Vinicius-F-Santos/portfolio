# Lista de Tarefas — Hospedagem e Deploy na Vercel (João Vitor)

Status: Em andamento  
Spec: [Hospedagem e Deploy na Vercel](../../03-features/hospedagem-vercel-joao-vitor/spec.md)  
Plano: [Plano de Implementação](./plano.md)

---

## Tarefas

- [x] **T001 — Atualizar a configuração do `vercel.json`**
  - Definir `buildCommand: "npm run build"`.
  - Definir `outputDirectory: "dist/portfolio/browser"`.
  - Configurar regras de reescrita SPA para todas as rotas direcionando para `/index.html`.

- [x] **T002 — Validação da suíte de testes e compilação de produção**
  - Executar `npm test` garantindo 154 testes unitários com 100% de sucesso.
  - Executar `npm run build` confirmando que os artefatos são gerados em `dist/portfolio/browser`.

- [x] **T003 — Estruturar a documentação SDD completa**
  - Criar `spec/03-features/hospedagem-vercel-joao-vitor/spec.md`.
  - Criar `spec/04-plano/hospedagem-vercel-joao-vitor/plano.md`.
  - Criar `spec/04-plano/hospedagem-vercel-joao-vitor/tarefas.md`.
  - Criar `spec/05-verificacao/hospedagem-vercel-joao-vitor/checklist-convergencia.md`.
  - Criar `spec/06-deploy/hospedagem-vercel-joao-vitor/deploy.md`.

- [ ] **T004 — Publicar alterações no GitHub de João Vitor (`origin/master`)**
  - Executar `git push origin master` enviando o merge e as configurações de deploy para o repositório remoto.

- [ ] **T005 — Configuração do projeto na Vercel e Variáveis de Ambiente**
  - Acessar o dashboard da Vercel (ou via CLI) e importar o repositório `joaovitordf/portfolio`.
  - Configurar as variáveis de ambiente:
    - `SUPABASE_URL`
    - `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANON_KEY`)
    - `SUPABASE_ADMIN_USER_ID`
  - Disparar o deploy de produção.

- [ ] **T006 — Teste de fumaça pós-deploy (Smoke Testing)**
  - Validar carregamento da home `/`.
  - Validar recarregamento (F5) em `/admin` e `/projetos/:id`.
  - Validar funcionamento do painel de contato e download dos currículos.
