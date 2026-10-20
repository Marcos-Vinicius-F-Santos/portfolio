# Plano de Verificação — Layout em Coluna Única na Página de Detalhes

Spec relacionada: [`spec/03-features/detalhes-projeto-coluna-unica/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/detalhes-projeto-coluna-unica/spec.md)  
Tarefas: [`spec/04-plano/detalhes-projeto-coluna-unica/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/detalhes-projeto-coluna-unica/tarefas.md)

---

## 1. Níveis de Verificação

| Nível | Escopo | Comando / Método | Critério de Sucesso |
| :--- | :--- | :--- | :--- |
| **L1 — White-Label Gate** | Integridade White-Label | `npm run check:white-label` | 0 ocorrências ou violações |
| **L2 — Testes Unitários** | Sequência e renderização dos cards | `npm test -- --watch=false` | 100% dos testes aprovados (inclusive `project-detail.component.spec.ts`) |
| **L3 — Build de Produção** | Compilação AOT e bundle sizes | `npm run build` | Compilação sem avisos ou erros |
| **L4 — Inspeção Visual** | Responsividade e leitura em coluna única | Navegação no browser | Leitura natural sem quebras, cards fluidos, micro-ícones nítidos e destaque em Resultados |

---

## 2. Checklist de Aceite

- [x] A página `/projetos/:id` exibe os cards em coluna única com largura ideal de leitura (`max-width: 52rem` centralizado).
- [x] O card de **Contexto** aparece como o primeiro bloco do estudo.
- [x] O card de **Resultados** é renderizado imediatamente antes do card de **Tecnologias**.
- [x] O card de **Tecnologias** aparece por último na narrativa técnica com os chips de tecnologias devidamente estilizados.
- [x] Os cabeçalhos dos cards possuem micro-ícones vetoriais modernos.
- [x] O card de **Resultados** possui destaque visual para atrair a atenção do recrutador.
- [x] Todos os atributos de edição editorial (`data-editorial-*`) continuam intactos.
