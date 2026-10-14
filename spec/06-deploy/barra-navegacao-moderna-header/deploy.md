# Procedimento de Deploy — Barra de Navegação Moderna e Header Flutuante

Ambiente: Preview e Production na Vercel  
Projeto: `portfolio`  
Repositório: `https://github.com/joaovitordf/portfolio`  
Branch: `master`  
Data: 2026-10-13  

---

## 1. Pré-condições

- [x] Spec da feature aprovada: `spec/03-features/barra-navegacao-moderna-header/spec.md`.
- [x] Decisão arquitetural registrada: `spec/02-arquitetura/DECISAO-016-barra-navegacao-moderna-header.md`.
- [x] Plano e tarefas concluídos: `spec/04-plano/barra-navegacao-moderna-header/`.
- [x] Checklist de convergência aprovado: `spec/05-verificacao/barra-navegacao-moderna-header/checklist-convergencia.md`.
- [x] Suíte de testes aprovada: 33 arquivos, 158 testes verdes (`npm test`).
- [x] Compilação de produção aprovada com zero warnings (`npm run build`).
- [x] Nenhuma alteração de schema/migration de banco de dados requerida nesta versão.

---

## 2. Passos de Deploy

1. **Commit e Push:**
   ```powershell
   git add .
   git commit -m "feat: add modern glassmorphism navigation header with dynamic brand, scrollspy and cv dropdown"
   git push origin master
   ```

2. **Verificação no Vercel:**
   - Acompanhar o deploy automático no dashboard da Vercel.
   - Validar em produção: `https://joaovitordf-portfolio.vercel.app/`
     - Validar monograma dinâmico (`JV.dev` ao vivo).
     - Validar navegação suave pelas seções com pílula ativa e indicador animado.
     - Validar clique em "Download CV" abrindo as opções em Português e Inglês.
     - Validar alternância de idiomas pelo menu discreto.
     - Validar menu hambúrguer em resolução mobile.
