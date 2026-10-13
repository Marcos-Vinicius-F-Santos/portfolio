# Registro de Decisão — Isolamento de Dados Pessoais, Padronização Arquitetural e Performance

Data: 2026-10-13  
Status: Aprovado  
Specs Relacionadas:
- [Isolamento de Dados e Padronização Arquitetural](../03-features/isolamento-de-dados-e-padronizacao-arquitetural/spec.md)
- [Padronização da Arquitetura do Frontend](./DECISAO-013-padronizacao-arquitetural-frontend.md)
- [Incorporação das Atualizações Upstream](./DECISAO-014-incorporacao-atualizacoes-upstream-painel-contato-e-componentes-admin.md)

---

## 1. Contexto

Após a incorporação das atualizações upstream (`upstream/master` de Marcos) e a configuração do deploy independente na Vercel para João Vitor, foi realizada uma auditoria completa no repositório com base em Spec-Driven Development (SDD).

A auditoria identificou quatro necessidades críticas:
1. **Risco de Contaminação de Dados Pessoais entre Forks:**
   Os arquivos de fallback locais (`portfolio-content.ts`, `portfolio-translations.ts`, `contact-panel.models.ts`) continham dados pessoais de João Vitor e de Marcos hardcoded no código TypeScript compartilhado. Em caso de falha de conexão com o Supabase ou sincronização de código entre os repositórios (pull/merge), dados de uma pessoa poderiam ser exibidos no portfólio da outra.
2. **Desvios da Padronização Arquitetural (DECISAO-013):**
   - O painel de contato foi incorporado sob `src/app/features/portfolio/presentation/contact-panel/`, infringindo a regra de que a pasta `presentation/` foi descontinuada e componentes compartilháveis devem residir em `src/app/shared/components/`.
   - Componentes administrativos reutilizáveis foram adicionados em `src/app/shared/ui/` em vez de `src/app/shared/components/`.
   - Nomes de arquivos e classes não utilizavam o sufixo canônico `.component.ts` e `*Component`.
3. **Alerta de Orçamento de Bundle (Performance):**
   O build de produção do Angular emitiu aviso de estouro de orçamento (`Initial chunk: 603 kB > 500 kB budget`) devido ao carregamento direto (*eager*) das rotas principais em `src/app/app.routes.ts`, que incluía a biblioteca `@supabase/supabase-js` no bundle inicial.
4. **Acoplamento de Testes Unitários a Dados Pessoais:**
   Testes unitários faziam asserções rígidas sobre nomes próprios, formações acadêmicas e telefones de autores específicos, gerando fragilidade e conflitos a cada sincronização.

---

## 2. Decisões Arquiteturais

### 2.1. Arquitetura 100% Agnóstica de Pessoa (*White-Label*)
- **Fallbacks Neutros:** Os dados estáticos de fallback em `portfolio-content.ts` e `portfolio-translations.ts` passam a ser inteiramente genéricos (ex: cargo "Desenvolvedor de Software", textos descritivos neutros, links institucionais neutros).
- **Dados Pessoais Exclusivamente via Supabase:** O nome, biografia, métricas profissionais, formação, experiências e canais de contato de cada autor são lidos exclusivamente a partir do snapshot publicado no banco de dados Supabase de cada instância (`portfolio_publications`).
- **Destinos Dinâmicos de Contato:** O número de WhatsApp e o e-mail do `ContactPanelComponent` deixam de ser constantes hardcoded. Em vez disso, são derivados dinamicamente das entidades de contato (`symbol: 'phone'` e `symbol: 'email'`) retornadas pelo Supabase. `DEFAULT_CONTACT_PANEL_DESTINATIONS` passa a ser um objeto neutro `{ whatsappNumber: '', email: '' }`.
- **Metadados Neutros no HTML:** O `<title>` em `src/index.html` passa a ser neutro (`Portfólio Profissional`), sendo atualizado dinamicamente pelo Angular Title Service após a resolução do snapshot. O atributo `lang` é corrigido para `pt-BR`.

### 2.2. Consolidação sob `src/app/shared/components/`
- Mover `src/app/features/portfolio/presentation/contact-panel/` para `src/app/shared/components/contact-panel/`.
- Renomear arquivos para a convenção canônica:
  - `contact-panel.component.ts`, `contact-panel.component.html`, `contact-panel.component.css`.
  - Exportar `ContactPanelComponent` (mantendo alias `ContactPanel` se necessário para retrocompatibilidade).
- Mover componentes administrativos de `src/app/shared/ui/admin-*` para `src/app/shared/components/admin-*`, renomeando para `*.component.ts`, `*.component.html`, `*.component.css`.
- Eliminar as pastas desnecessárias `presentation/` e `ui/`.

### 2.3. Lazy Loading Universal de Rotas
- Em `src/app/app.routes.ts`, converter todas as rotas de nível superior (`''`, `'admin'`, `'admin/login'`) para `loadComponent: () => import(...)`.
- Com isso, o bundle inicial baixa drasticamente para menos de 200 kB, eliminando completamente o warning de budget do Angular.

### 2.4. Desacoplamento da Suíte de Testes
- Atualizar asserções de testes para validar estrutura, contratos e comportamento utilizando fixtures/mocks controlados, sem depender de nomes ou dados pessoais de João Vitor ou Marcos.
- Silenciar ruídos de log de erro esperados em testes unitários (`media-management.service.spec.ts`).

---

## 3. Consequências

- **Isolamento Total:** Atualizações de código podem ser mescladas livremente entre os repositórios de Marcos e João Vitor sem qualquer risco de vazamento de dados de contato ou biografia.
- **Conformidade Arquitetural:** 100% dos componentes seguem o Angular Style Guide e a DECISAO-013.
- **Performance de Carregamento:** O bundle inicial é otimizado com lazy loading, respeitando com folga o limite de 500 kB.
- **Testes Robustos:** A suíte de testes permanece 100% verde e imune a alterações em dados pessoais do CMS.
