# Checklist de Convergência — Hospedagem e Deploy na Vercel (João Vitor)

Status: Validado  
Data: 2026-10-13  
Spec: [Hospedagem e Deploy na Vercel](../../03-features/hospedagem-vercel-joao-vitor/spec.md)  
Plano: [Plano de Implementação](../../04-plano/hospedagem-vercel-joao-vitor/plano.md)  
Tarefas: [Lista de Tarefas](../../04-plano/hospedagem-vercel-joao-vitor/tarefas.md)

---

## Matriz de Rastreabilidade

| Requisito Spec | Descrição | Implementação no Código | Verificação / Teste | Status |
|---|---|---|---|---|
| **FR-001** | `vercel.json` com buildCommand, outputDirectory e rewrites SPA | `vercel.json` | Inspeção do arquivo JSON e build | Conforme |
| **FR-002** | Roteamento SPA sem erro 404 em deep links | `vercel.json` (`rewrites` para `/index.html`) | Roteamento configurado no Angular e Vercel | Conforme |
| **FR-003** | Ativos estáticos servidos diretamente | `dist/portfolio/browser` contém assets, pdfs e chunks | `npm run build` confirmando arquivos na raiz do output | Conforme |
| **FR-004** | Injeção de variáveis Supabase via runtime config | `scripts/generate-runtime-config.mjs` | Executado no `prebuild` gerando `runtime-config.js` | Conforme |
| **FR-005** | Não exposição de segredos (`service_role`) | `.env` protegido no `.gitignore` | `git status` e verificação de commits | Conforme |
| **FR-006** | Deploy contínuo via GitHub (`joaovitordf/portfolio`) | Remote `origin` apontando para repo de João Vitor | `git remote -v` | Conforme |
| **FR-007** | Suporte a deploy via Vercel CLI | `vercel.json` com schema e opções de build | `npx vercel --version` funcional | Conforme |
| **FR-008** | Preservação das funcionalidades e contatos de João Vitor | `portfolio-page.component.ts` e `.html` | 154 testes unitários passando | Conforme |

---

## Verificação de Integridade e Regressão

- [x] **Testes Automatizados**: 154 testes unitários executados e aprovados via `npm test`.
- [x] **Compilação de Produção**: `npm run build` gera o pacote em `dist/portfolio/browser` sem falhas.
- [x] **Zero Regressão**: Todas as features pré-existentes (traduções PT/EN, visualização de projetos, editor administrativo, autenticação) operam conforme o esperado.
- [x] **Rastreabilidade**: Documentos do SDD (`spec.md`, `plano.md`, `tarefas.md`, `deploy.md`) alinhados.

