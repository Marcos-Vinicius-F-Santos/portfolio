# Plano de Verificação — Revisão Geral e Refinamento do Portfólio

Spec relacionada: [`spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md)  
Plano de tarefas: [`spec/04-plano/revisao-geral-e-refinamento-portfolio/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/revisao-geral-e-refinamento-portfolio/tarefas.md)

---

## 1. Níveis de Verificação

| Nível | Escopo | Comando / Método | Critério |
| :--- | :--- | :--- | :--- |
| **L1 — White-Label Gate** | Isolamento de dados pessoais no código | `npm run check:white-label` | Código de saída `0` (zero referências bloqueadas) |
| **L2 — Testes Unitários** | Componentes, serviços e adaptadores | `npm test -- --watch=false` | 100% dos testes passando |
| **L3 — Build de Produção** | Bundle size e compilação AOT | `npm run build` | Build limpo e bundle inicial < 500 kB |
| **L4 — Auditoria de Dados** | Snapshot publicado no Supabase | Consulta SQL / script de verificação | Datas, nomes, skills e siglas 100% alinhados |

---

## 2. Checklist de Convergência Final

- [ ] Todas as siglas possuem explicação clara na primeira menção (PT-BR e EN).
- [ ] Tecnologias listadas refletem exatamente o currículo oficial (sem `React` ou `Node.js` indevidos, e com `Visão Computacional` devidamente categorizada).
- [ ] Navegação entre Home e Detalhe de Projeto funciona via SPA sem recarregar a página.
- [ ] Aba do navegador (`<title>`) e meta tags atualizam dinamicamente com a identidade do perfil.
- [ ] Aprovação explícita de João Vitor antes de commit/push.

