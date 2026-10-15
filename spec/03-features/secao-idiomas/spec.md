# Spec da Feature — Seção de Idiomas

Status: Proposta — aguardando aprovação de João Vitor  
Data: 2026-10-05  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código: `src/app/features/portfolio/presentation/`, `src/app/features/portfolio/content/`, `supabase/migrations/`

---

## 1. Objetivo

Apresentar publicamente uma seção dedicada a **Idiomas** (Languages) no portfólio de João Vitor, exibindo suas proficiências linguísticas conforme constam no currículo (Português Nativo, Inglês C1, Espanhol B1, Russo A1), com alternância bilíngue (`pt-BR` e `en`), integração à barra de navegação e suporte no modelo de dados/snapshot editorial.

---

## 2. Contexto e Motivação

O currículo oficial em português e inglês contém uma seção explícita de idiomas falados:
- **Português:** Nativo (*Portuguese: Native*)
- **Inglês:** C1 (Avançado) (*English: C1 - Advanced*)
- **Espanhol:** B1 (Intermediário) (*Spanish: B1 - Intermediate*)
- **Russo:** A1 (Básico) (*Russian: A1 - Beginner*)

Atualmente, o portfólio não modela nem renderiza essa informação, deixando de comunicar competências linguísticas relevantes para oportunidades nacionais e internacionais.

---

## 3. Requisitos Funcionais (EARS)

- **FR-001**: QUANDO o visitante acessar o portfólio público, O SISTEMA DEVE exibir uma seção dedicada intitulada "Idiomas" (ou "Languages" quando em inglês).
- **FR-002**: QUANDO a seção for renderizada, O SISTEMA DEVE apresentar os 4 idiomas cadastrados com seus respectivos níveis de proficiência:
  - Português: Nativo / Portuguese: Native
  - Inglês: C1 (Avançado) / English: C1 (Advanced)
  - Espanhol: B1 (Intermediário) / Spanish: B1 (Intermediate)
  - Russo: A1 (Básico) / Russian: A1 (Beginner)
- **FR-003**: QUANDO o visitante alternar o idioma da interface entre Português e Inglês, O SISTEMA DEVE traduzir reativamente o título da seção, os nomes dos idiomas e suas descrições de proficiência.
- **FR-004**: O SISTEMA DEVE incluir a seção "Idiomas" no menu de navegação rápida da página, posicionada de forma estável entre "Formação acadêmica" e "Contato".
- **FR-005**: O SISTEMA DEVE suportar a entidade e seção de idiomas no modelo editorial e snapshot versionado (`PublishedSnapshotContentService` com fallback estático em `PortfolioContentService`), garantindo conformidade com o validador de snapshot.
- **FR-006**: QUANDO carregado em dispositivos móveis ou desktop, O SISTEMA DEVE apresentar os cards/itens de idiomas com layout responsivo e acessível (tipografia, contraste e proporções consistentes com o design editorial).

---

## 4. Critérios de Aceite (Given / When / Then)

- **AC-001 (Exibição dos Idiomas)**:
  - *Dado* que estou na página inicial do portfólio em português,
  - *Quando* rolo até a seção "Idiomas",
  - *Então* vejo os cards para Português (Nativo), Inglês (C1 - Avançado), Espanhol (B1 - Intermediário) e Russo (A1 - Básico).

- **AC-002 (Alternância de Idioma)**:
  - *Dado* que visualizo a seção de idiomas em português,
  - *Quando* altero o idioma para inglês (`en`),
  - *Então* o título muda para "Languages" e os itens mudam para "Portuguese (Native)", "English (C1 - Advanced)", "Spanish (B1 - Intermediate)" e "Russian (A1 - Beginner)".

- **AC-003 (Navegação Rápida)**:
  - *Dado* que utilizo a barra de navegação no topo da página,
  - *Quando* clico no link correspondente a "Idiomas",
  - *Então* a página rola suavemente para o cabeçalho da seção `#idiomas`.

- **AC-004 (Snapshot e Integração Supabase)**:
  - *Dado* que o cliente consome o snapshot publicado do Supabase,
  - *Quando* `listLanguages(locale)` for invocado,
  - *Então* retorna a lista de idiomas tipada correspondente ao locale sem disparar exceções de validação de snapshot.

- **AC-005 (Regressão e Qualidade)**:
  - *Dado* que todas as alterações foram aplicadas,
  - *Quando* a suíte de testes automatizados (`npm test`) for executada,
  - *Então* todos os testes passam com 0 falhas e a compilação (`npm run build`) conclui com sucesso.

---

## 5. Regras de Negócio e Dados

### 5.1 Catálogo de Idiomas

| ID | Nome (PT) | Nível (PT) | Name (EN) | Level (EN) | Ordem |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `portuguese` | Português | Nativo | Portuguese | Native | 0 |
| `english` | Inglês | C1 (Avançado) | English | C1 (Advanced) | 1 |
| `spanish` | Espanhol | B1 (Intermediário) | Spanish | B1 (Intermediate) | 2 |
| `russian` | Russo | A1 (Básico) | Russian | A1 (Beginner) | 3 |
