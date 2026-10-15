# Plano de Tarefas — Correção da Publicação na Vercel e Aprimoramento da Redação

Feature: `correcao-publicacao-vercel-e-redacao-aprimorada`  
Status: Proposta para Aprovação  
Data: 15/10/2026  

---

## Fases de Implementação

### Fase 1: Correção do Snapshot e Validação
- [ ] **T-001**: Adicionar a mídia `"profile-image"` (`source: "managed"`, `mime: "image/jpeg"`, `assetPath: "profile.jpg"`) no mapa `media` de `snapshot-joao-v1.json`.
- [ ] **T-002**: Validar `snapshot-joao-v1.json` com `validateEditorialSnapshot` para garantir 0 erros de validação.

### Fase 2: Aprimoramento dos Textos (Anti-repetição / Tom de Engenharia)
- [ ] **T-003**: Atualizar em `snapshot-joao-v1.json` (PT-BR e EN correspondente) os textos do Hero, Sobre Mim, Headline e Pilares com a nova redação fluida e profissional extraída do currículo do IFMG.
- [ ] **T-004**: Garantir que o nome completo "João Vitor Dias Fernandes" esteja configurado como `copy-heroName` e `copy-name` no snapshot.

### Fase 3: Geração do Script SQL e Upload da Imagem no Supabase
- [ ] **T-005**: Atualizar o script SQL de publicação `publicar_snapshot_joao_vitor.sql` via `generate-publication-sql.mjs`, incluindo a inserção binária direta da foto `profile.jpg` no bucket `editorial-profile-images` do Supabase Storage.
- [ ] **T-006**: Garantir políticas de leitura pública no bucket `editorial-profile-images`.

### Fase 4: Verificação, Testes e Documentação da Vercel
- [ ] **T-007**: Executar testes unitários (`npm test`) para garantir integridade contínua (180/180).
- [ ] **T-008**: Executar o gate white-label (`node scripts/check-white-label-references.mjs`).
- [ ] **T-009**: Documentar para o João Vitor as variáveis de ambiente a preencher no painel da Vercel (`PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_BRAND_INITIALS`, `PORTFOLIO_PROFILE_IMAGE_URL`).
- [ ] **T-010**: Revisão e aprovação final com João Vitor.

