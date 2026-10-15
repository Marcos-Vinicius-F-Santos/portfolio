# Tarefas — Aprimoramento da Seção "Sobre mim"

Plano relacionado: `spec/04-plano/aprimoramento-secao-sobre-mim/plano.md`  
Spec relacionada: `spec/03-features/aprimoramento-secao-sobre-mim/spec.md`  

---

## Fase 1 — Contratos de Cópia e Textos Bilíngues
- [x] T-001 [FR-001, FR-002, FR-003] Atualizar `PortfolioCopy` e `ORIGINAL_COPY` em `src/app/features/portfolio/services/portfolio-content.ts` com a nova bio e pilares.
- [x] T-002 [FR-001, FR-002, FR-003] Atualizar `ENGLISH_COPY` em `src/app/features/portfolio/services/portfolio-translations.ts` com a versão traduzida para inglês.

## Fase 2 — Snapshots Editoriais e Validação
- [x] T-003 [FR-004] Validar que o validador de snapshot editorial continua 100% íntegro e aprovado.

## Fase 3 — Template e Estilos da Seção "Sobre mim"
- [x] T-004 [FR-001, FR-002, FR-003, FR-004] Atualizar `portfolio-page.component.html` para renderizar o layout moderno da seção `#sobre-mim` com headline, narrativa, foco e grid de 3 cards com ícones vetoriais.
- [x] T-005 [FR-001, FR-002] Adicionar os estilos correspondentes em `portfolio-page.component.css` com tokens de tema, tipografia Space Grotesk/Inter, responsividade mobile/desktop e estados de hover elegantes.

## Fase 4 — Verificação e Testes
- [x] T-006 [AC-001, AC-002, AC-003] Atualizar e executar a suíte de testes unitários (`npm test -- --no-watch`), 170 testes passando com 100% de sucesso.
- [x] T-007 Executar o build de produção (`npm run build`) para assegurar que os limites de bundle e compilação estão íntegros.
