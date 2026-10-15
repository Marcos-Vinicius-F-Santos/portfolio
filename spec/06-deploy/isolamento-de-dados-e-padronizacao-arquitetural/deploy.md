# Procedimento de Deploy — Isolamento de Dados Pessoais e Padronização Arquitetural

Ambiente: Preview e Production na Vercel  
Projeto: `portfolio`  
Repositório: `https://github.com/joaovitordf/portfolio`  
Branch: `master`  
Data: 2026-10-13  

---

## 1. Pré-condições

- [x] Spec da funcionalidade aprovada: `spec/03-features/isolamento-de-dados-e-padronizacao-arquitetural/spec.md`.
- [x] Registro de decisão arquitetural criado: `spec/02-arquitetura/DECISAO-015-isolamento-de-dados-pessoais-padronizacao-e-performance.md`.
- [x] Plano e tarefas concluídos: `spec/04-plano/isolamento-de-dados-e-padronizacao-arquitetural/`.
- [x] Checklist de convergência aprovado: `spec/05-verificacao/isolamento-de-dados-e-padronizacao-arquitetural/checklist-convergencia.md`.
- [x] Suíte de testes aprovada: 33 arquivos, 154 testes verdes (`npm test`).
- [x] Compilação de produção aprovada com zero warnings (`npm run build`).
- [x] Nenhuma alteração de schema/migration de banco de dados requerida nesta versão.
- [x] Variáveis de ambiente no Vercel configuradas (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ADMIN_USER_ID`).

---

## 2. Mudanças Promovidas

1. **Agnosticismo de Código:** Neutralização total de constantes em TypeScript (`portfolio-content.ts`, `portfolio-translations.ts`, `contact-panel.models.ts`).
2. **Carregamento Dinâmico:** Autor, nome, biografia, contatos e links alimentados exclusivamente pelo snapshot publicado no Supabase.
3. **Arquitetura Canônica:** Migração de componentes para `src/app/shared/components/` com nomenclatura canônica Angular (`.component.ts`, `.component.html`, `.component.css`).
4. **Performance:** Redução do bundle inicial para 469.13 kB através de lazy loading modular com `loadChildren` e `loadComponent`.

---

## 3. Passos de Deploy

1. **Validação Local dos Arquivos:**
   ```powershell
   git status
   npm run build
   npm test
   ```

2. **Commit e Push:**
   ```powershell
   git add .
   git commit -m "feat: isolate personal data, standardize components and optimize bundle"
   git push origin master
   ```

3. **Verificação no Vercel:**
   - O push na branch `master` dispara o build automático no Vercel.
   - O comando `prebuild` gera o `runtime-config.js` injetando as variáveis do ambiente do Vercel.
   - O `build` compila os artefatos estáticos para `dist/portfolio/browser`.
   - Verificar status do deploy em: `https://vercel.com/joaovitordfs-projects/portfolio`
   - Testar o site ao vivo: `https://portfolio-eosin-delta-19.vercel.app/`

---

## 4. Plano de Rollback

Caso ocorra qualquer anomalia após o deploy:
1. No painel da Vercel (`Deployments`), localizar a implantação anterior com status `Ready`.
2. Clicar nos três pontos (`...`) e selecionar **Instant Rollback**.
3. No repositório Git local:
   ```powershell
   git revert HEAD
   git push origin master
   ```
