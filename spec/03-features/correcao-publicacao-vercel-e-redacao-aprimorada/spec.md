# Spec da Feature — Correção da Publicação na Vercel e Aprimoramento da Redação (White-Label)

Status: Proposta para Aprovação de João Vitor  
Data: 15/10/2026  
Projeto: Portfólio Profissional (`joaovitordf/portfolio`)  
Onde vive no código:
- `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json` (conteúdo editorial do snapshot v1)
- `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` (gerador do script SQL de publicação)
- `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql` (script de carga direta no Supabase)
- `public/runtime-config.js` / Vercel Environment Variables (`PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_BRAND_INITIALS`, `PORTFOLIO_PROFILE_IMAGE_URL`)

---

## 1. Contexto e Diagnóstico do Problema

### 1.1 Por que a Vercel não estava carregando o conteúdo publicado
1. **Erro de validação no front-end (`validateEditorialSnapshot`):**
   - Na chamada do front-end ao Supabase (`get_published_snapshot`), o banco retornava o snapshot com HTTP 200.
   - Contudo, no snapshot publicado (`snapshot-joao-v1.json`), a entidade `profile` apontava para `"mediaId": "profile-image"`, mas a chave `"profile-image"` **não constava no dicionário de `media`**.
   - A função `validateEditorialSnapshot` rejeitava o snapshot como inválido (`missing_reference: Mídia inexistente: profile-image`).
   - Diante disso, o `PublishedSnapshotService` descartava o snapshot e o `PortfolioContentService` recorria ao fallback hardcoded neutro (`Desenvolvedor de Software`, `PF.dev`, sem projetos, avatar genérico).

2. **Variáveis de Ambiente na Vercel:**
   - A requisição pública ao `https://joaovitordf-portfolio.vercel.app/runtime-config.js` revelou que as variáveis `PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_BRAND_INITIALS` e `PORTFOLIO_PROFILE_IMAGE_URL` estão vazias `""` no ambiente da Vercel.
   - Para que o monógrama (`JV.dev`), o nome e a foto de perfil estejam disponíveis imediatamente em runtime, essas variáveis devem ser preenchidas no painel da Vercel.

3. **Foto de Perfil:**
   - Para a foto de perfil ser servida de forma persistente e pública em produção (sem depender de arquivos ignorados pelo Git), ela deve ser carregada no bucket `editorial-profile-images` do Supabase Storage e referenciada pelo snapshot.

### 1.2 Redação Repetitiva e Genérica
- As descrições atuais foram geradas a partir de templates genéricos ("Desenvolvedor de Software com atuação em engenharia de sistemas, desenvolvimento web...").
- A nova redação será reestruturada com base no currículo real do IFMG, destacando experiências práticas em produção (SensorEng, Avante Sistemas, Visão Computacional, Russian Mastery), sem repetições cansativas.

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Integridade do Snapshot Editorial v1 (Resolução da Validação)
- **GIVEN** a entidade `profile` no snapshot apontando para `mediaId: "profile-image"`
- **WHEN** o snapshot for gerado
- **THEN** o mapa `media` do snapshot DEVE conter a chave `"profile-image"` com schema válido (`source: "managed"`, `mime: "image/jpeg"`, `assetPath: "profile.jpg"`)
- **AND** a execução de `validateEditorialSnapshot(snapshot)` DEVE retornar `{ valid: true }` sem nenhuma issue.

### FR-002 — Nome Completo do Autor no Hero
- **GIVEN** o carregamento do snapshot válido publicado ou a injeção via runtime config
- **WHEN** a seção de apresentação (Hero) for renderizada
- **THEN** o título principal (`.hero-title`) DEVE exibir `"João Vitor Dias Fernandes"`
- **AND** o monograma do header DEVE exibir `"JV.dev"` quando configurado ou derivado de João Vitor.

### FR-003 — Redação Fluida e Profissional baseada no Currículo Real
- **GIVEN** as informações acadêmicas e profissionais do currículo de João Vitor
- **WHEN** os textos forem compilados no snapshot
- **THEN** os seguintes textos devem ser atualizados:
  1. **Hero Intro (`copy-intro`):** *"Engenheiro de Software focado em construir soluções web escaláveis, sistemas com telemetria em tempo real, APIs de alto desempenho e pipelines de visão computacional aplicados à indústria."*
  2. **Sobre Mim Headline (`copy-aboutHeadline`):** *"Engenharia orientada a impacto: arquitetura modular, alta performance e foco em resolver problemas reais de negócio."*
  3. **Sobre Mim Corpo (`copy-aboutBody`):** *"Sou Bacharel em Ciência da Computação pelo IFMG. Minha trajetória une experiência prática no desenvolvimento de sistemas web em produção, plataformas industriais com monitoramento em tempo real e automação inteligente. Busco sempre entender a fundo as regras de negócio para projetar soluções estáveis, elegantes e escaláveis."*
  4. **Sobre Mim Foco (`copy-aboutFocus`):** *"Stack principal: TypeScript & Angular, Python (FastAPI), Java (Spring Boot), Visão Computacional (OpenCV & YOLOv8), PostgreSQL, Supabase e Docker."*
  5. **Pilares Técnicos:**
     - Pilar 1: *Front-end Escalável & Tempo Real* — *Desenvolvimento de SPAs modulares com lazy loading (redução de 85% de pacote), bibliotecas de componentes reutilizáveis e interfaces reativas com telemetria IoT e streaming de vídeo.*
     - Pilar 2: *Back-end & Arquitetura Cloud* — *APIs RESTful de alto rendimento com FastAPI, Spring Boot e Laravel, bancos relacionais otimizados (PostgreSQL), cache com Redis e containerização Docker.*
     - Pilar 3: *Visão Computacional & IA Aplicada* — *Modelos customizados YOLOv8 para rastreamento e contagem, automação inteligente com OCR para leitura de documentos e inferência em vídeo de baixa latência.*

### FR-004 — Upload e Disponibilização da Foto no Supabase Storage
- **GIVEN** a foto de perfil `public/profile.jpg`
- **WHEN** for incluída instrução SQL de carga / política no bucket `editorial-profile-images`
- **THEN** a foto deve estar publicamente acessível na URL do storage do Supabase e vinculada ao perfil.

### FR-005 — Guia de Configuração das Variáveis de Ambiente da Vercel
- **GIVEN** o deploy no projeto Vercel
- **WHEN** o usuário configurar as variáveis no painel da Vercel
- **THEN** devem ser fornecidas as instruções exatas das chaves a preencher:
  - `PORTFOLIO_AUTHOR_NAME="João Vitor Dias Fernandes"`
  - `PORTFOLIO_BRAND_INITIALS="JV"`
  - `PORTFOLIO_PROFILE_IMAGE_URL="https://efxcpncyzqtfaewdbaar.supabase.co/storage/v1/object/public/editorial-profile-images/profile.jpg"`

---

## 3. Critérios de Aceite (DoD)

1. [ ] Snapshot `snapshot-joao-v1.json` é 100% válido sob `validateEditorialSnapshot`.
2. [ ] Script `publicar_snapshot_joao_vitor.sql` atualizado e executável no Supabase sem erros.
3. [ ] Textos do Hero, Sobre Mim e Pilares estão redigidos com a nova versão não repetitiva.
4. [ ] O nome completo "João Vitor Dias Fernandes" aparece no Hero.
5. [ ] Seção `#portfolio` (Russian Mastery e Boxe) carrega sem falhas de validação.
6. [ ] 100% dos testes unitários passando (`npm test`).
7. [ ] Gate de conformidade white-label aprovado (`node scripts/check-white-label-references.mjs`).
8. [ ] Aprovação de João Vitor antes de qualquer push/deploy.

