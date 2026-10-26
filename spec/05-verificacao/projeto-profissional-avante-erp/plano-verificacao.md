# Plano de Verificação — Adição da Avante Soluções Digitais como Projeto Profissional

Spec relacionada: [`spec/03-features/projeto-profissional-avante-erp/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/projeto-profissional-avante-erp/spec.md)  
Tarefas: [`spec/04-plano/projeto-profissional-avante-erp/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/projeto-profissional-avante-erp/tarefas.md)

---

## 1. Níveis de Verificação

| Nível | Escopo | Comando / Método | Critério de Sucesso |
| :--- | :--- | :--- | :--- |
| **L1 — Validação do Snapshot** | Integridade dos dados do snapshot | `node spec/05-verificacao/joao-vitor/verify-snapshot.mjs` | Execução sem erros com 6 projetos (4 profissionais, 2 pessoais) |
| **L2 — White-Label Gate** | Integridade de referências white-label | `npm run check:white-label` | 0 ocorrências ou violações no código |
| **L3 — Testes Unitários** | Resolução de ícones e integridade geral | `npm test -- --watch=false` | 100% dos testes aprovados |
| **L4 — Build de Produção** | Compilação AOT | `npm run build` | Compilação limpa sem erros |

---

## 2. Checklist de Aceite

- [x] O projeto da **Avante Soluções Digitais** está cadastrado no snapshot com tipo `professional` e visibilidade `private`.
- [x] O projeto possui todas as traduções bilíngues (nome, descrição, contexto, solução e papel).
- [x] O projeto possui 4 decisões técnicas, 3 resultados e 2 aprendizados cadastrados e traduzidos.
- [x] As tecnologias (`PrimeFaces`, `Hibernate`, `Spring Framework`, `SQL`, `ERP`) resolvem ícones visuais adequados.
- [x] O script SQL de publicação no Supabase é regerado com sucesso.
