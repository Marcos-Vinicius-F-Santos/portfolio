# Plano de Verificação — Placeholder Visual com Cadeado nos Cards de Projetos

Spec relacionada: `spec/03-features/thumbnails-cadeado-projetos-privados/spec.md`  
Plano de tarefas: `spec/04-plano/thumbnails-cadeado-projetos-privados/tarefas.md`  

---

## 1. Estratégia de Teste

| Nível | Escopo | Ferramenta | Comando |
| :--- | :--- | :--- | :--- |
| **L1** | Conformidade White-Label | Node.js script | `npm run check:white-label` |
| **L2** | Testes Unitários de Componente | Vitest / Karma (ng test) | `npm test -- --watch=false` |
| **L3** | Compilação de Produção | Angular CLI | `npm run build` |
| **L4** | Revisão e Aprovação Visual | Manual (João Vitor) | Inspeção local / Vercel após aprovação |

---

## 2. Cenários de Aceite a Validar

1. **Card de Projeto Privado sem Capa:**
   - Exibe o badge de visibilidade no topo esquerdo (`PRIVADO` / `PRIVATE`).
   - No centro da área 16:10, exibe o ícone SVG de cadeado de segurança.
   - Abaixo do cadeado, exibe o texto "CÓDIGO PROPRIETÁRIO" (ou "PROPRIETARY CODE" em inglês).
   - O monograma truncado (ex: `S—`) não deve mais aparecer.

2. **Card de Projeto Público sem Capa:**
   - Exibe o badge de visibilidade no topo esquerdo (`PÚBLICO` / `PUBLIC`).
   - No centro, exibe o ícone de código `< >` e a legenda "CÓDIGO ABERTO" (ou "OPEN SOURCE").

3. **Card de Projeto com Capa Real:**
   - Renderiza a imagem `<img>` normalmente, ocultando o placeholder.

4. **Alternância de Idioma:**
   - Ao trocar para inglês (`en`), os rótulos mudam automaticamente para "PROPRIETARY CODE" e "OPEN SOURCE".

---

## 3. Critérios de Convergência

```text
SPEC (spec.md) ↔ PLANO (tarefas.md) ↔ CÓDIGO (ProjectCardComponent) ↔ TESTES (189+ testes)
```

Nenhum commit ou push para o GitHub será realizado antes da aprovação explícita de João Vitor.

