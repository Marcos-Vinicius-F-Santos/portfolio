# Registro de Alterações — Adição da Avante Soluções Digitais como Projeto Profissional

Data: 19/10/2026  
Escopo:
1. Inclusão da **Avante Soluções Digitais — Sistema ERP Corporativo** como Projeto Profissional na vitrine `#portfolio` e com página de detalhes completa (`/projetos/:id`).
2. Mapeamento neutro de ícones visuais para o ecossistema corporativo: `Spring Framework`, `PrimeFaces`, `Hibernate`, `SQL` e `ERP` em `technology-icons.ts`.
3. Atualização e validação estrutural do snapshot com 6 projetos (4 profissionais: SensorEng, Ponto IFMG, Gestão de Crédito e Avante; 2 pessoais: Russian Mastery e Boxe).
4. Validação e sincronização completa do snapshot editorial com o banco de dados Supabase.

---

## 1. Conteúdo e Modelagem do Projeto Avante ERP

- **Identificador (UUID):** `7f41a8c9-9ca4-4155-b6ab-8bf4dcf6c9a9`
- **Classificação:** `type: "professional"`, `visibility: "private"` (código proprietário corporativo com badge e thumbnail de segurança).
- **Stack Tecnológica:** Java, Spring Framework, JSF (JavaServer Faces), PrimeFaces, Hibernate, Oracle Database, SQL, Git, ERP.
- **Estrutura Completa de Estudo de Caso (pt-BR e en):**
  - **Contexto:** Desafios de sistemas ERP corporativos com alta densidade de regras fiscais e integridade transacional concorrente.
  - **Solução:** Atuação presencial full-stack em módulos de negócio com Java/Spring, telas ricas em PrimeFaces/JSF, ORM com Hibernate e tuning no Oracle Database.
  - **Papel:** Desenvolvedor Júnior Fullstack.
  - **Decisões Técnicas:** 4 escolhas arquiteturais documentadas (regras em camadas desacopladas, formulários dinâmicos JSF, otimização de ORM/JPA para evitar N+1, diagnóstico e indexação de queries SQL no Oracle).
  - **Resultados:** 3 métricas de impacto (estabilidade de módulos atendendo múltiplos setores, redução do tempo de resolução de incidentes de produção, ganho expressivo de performance em relatórios operacionais).
  - **Aprendizados:** 2 consolidações técnicas (engenharia em sistemas legados de grande porte e depuração full-stack entre JSF, Spring e Oracle).

---

## 2. Resolução de Ícones Tecnológicos (`technology-icons.ts`)

- Adicionado mapeamento neutro em `DIRECT_ICON_URLS`:
  - `spring framework` ➔ `/assets/technologies/spring.svg`
  - `primefaces` ➔ `/assets/skills/jsf.svg`
  - `hibernate` ➔ `/assets/skills/java.png`
  - `sql` ➔ `/assets/skills/sql-server.png`
  - `erp` ➔ `/assets/technologies/sap.svg`
- Novo teste unitário adicionado em `project-detail.component.spec.ts` validando a resolução de todos os novos ícones.

---

## 3. Validação e Gates de Qualidade

- **Validação de Snapshot:** Validador automatizado executado com 100% de aprovação (6 projetos, 4 profissionais, 2 pessoais, 0 inconsistências e validação estrita de unicidade de constraints).
- **White-Label Gate:** `npm run check:white-label` aprovado (0 violações).
- **Testes Automatizados:** `npm test -- --watch=false` com 193 testes aprovados em 36 suítes.
- **Build de Produção:** `npm run build` gerado com sucesso sem erros.

