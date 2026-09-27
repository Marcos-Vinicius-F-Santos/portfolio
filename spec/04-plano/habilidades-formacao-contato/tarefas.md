# Tarefas — Habilidades, formação acadêmica e contato

Plano relacionado: `spec/04-plano/habilidades-formacao-contato/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Confirmar os pontos de integração e fixar os limites da implementação.
  - Arquivos/módulos: `src/app/features/portfolio/content/`, `src/app/features/portfolio/presentation/portfolio-page/`, `src/assets/`, `supabase/migrations/`.
  - Verificação: confirmar que a implementação reutilizará a página pública, o domínio de conteúdo, `getCurriculum()`, `portfolio_files` e o bucket `curricula`; confirmar que não haverá nova rota, feature de domínio, serviço global ou tabela; confirmar que o destino `stack-tecnica` será preservado.

- [ ] T-002 [FR-001, FR-002, FR-003, FR-004] Criar os tipos e o catálogo do domínio para categorias de habilidades, formação acadêmica e conteúdo de apresentação.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.models.ts`, `src/app/features/portfolio/content/portfolio-content.ts`.
  - Verificação: o catálogo contém as seis categorias e todas as tecnologias aprovadas; a formação contém as duas pós-graduações e a instituição; nenhum dado de apresentação foi colocado diretamente no template.

- [ ] T-003 [FR-005, FR-006, FR-007, FR-008] Criar o catálogo de contatos e preparar os recursos estáticos dos símbolos.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `src/app/features/portfolio/content/portfolio-content.models.ts`, `src/assets/`.
  - Verificação: o catálogo contém os destinos exatos de LinkedIn, GitHub, e-mail e telefone; cada canal possui label; os símbolos oficiais públicos e o símbolo de currículo estão disponíveis localmente; nenhuma dependência de ícones foi adicionada.

- [ ] T-004 [FR-008, FR-009] Criar a migration versionada para restringir os currículos a PDF.
  - Arquivos/módulos: `supabase/migrations/<timestamp>_restrict_curriculum_files_to_pdf.sql`, registro de decisão baseado em `spec/02-arquitetura/DECISAO_TEMPLATE.md` se aprovado.
  - Verificação: auditar registros existentes antes da alteração; migration aplica sem descartar dados; `portfolio_files` aceita somente `application/pdf`; o bucket `curricula` aceita somente PDF; a restrição única por locale permanece; rollback remove apenas a restrição nova e restaura a configuração anterior.

## Fase 2 — Lógica principal

- [ ] T-005 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Adicionar as chaves bilíngues de títulos, categorias, labels e currículo ao contrato de conteúdo.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.ts`, `src/app/features/portfolio/content/portfolio-translations.ts`.
  - Verificação: português exibe “Habilidades”, formação e contato; inglês exibe os equivalentes aprovados; labels de canais e currículo existem nos dois idiomas; campo ausente ou tradução ausente mantém fallback seguro sem quebrar as seções.

- [ ] T-006 [FR-008, FR-009] Validar e endurecer `getCurriculum()` para o contrato dos dois PDFs.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, `src/app/features/portfolio/content/portfolio-content.models.ts`.
  - Verificação: para `pt-BR` e `en`, o serviço consulta exatamente o locale solicitado e retorna a URL pública do registro `curriculum`; registros ausentes, erro de consulta, MIME diferente de PDF ou URL inválida retornam estado seguro sem indicar download concluído.

- [ ] T-007 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Integrar o estado das novas seções e do currículo ao ciclo de vida da página.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: a página carrega o currículo do idioma inicial; troca de idioma recarrega o currículo e atualiza os textos; a navegação mantém `#stack-tecnica`; formação e contato são adicionados sem remover experiências, resultados ou projetos; contato aparece como último destino.

## Fase 3 — Interface

- [ ] T-008 [FR-001, FR-002, FR-003] Substituir o texto incompleto da Stack pela seção “Habilidades”.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`, `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: a seção mantém o ID `stack-tecnica`, exibe o título “Habilidades”, renderiza as seis categorias e apresenta cada tecnologia como nome individualmente legível.

- [ ] T-009 [FR-004] Renderizar a seção de formação acadêmica.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`, `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: a página exibe as pós-graduações em Ciência de Dados e Estatística Aplicada, a instituição Unopar Anhanguera e a tradução correspondente ao idioma selecionado.

- [ ] T-010 [FR-005, FR-006, FR-007] Renderizar a seção de contato com símbolos oficiais, labels e destinos funcionais.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`, `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`, `src/assets/`.
  - Verificação: a seção é a última da página; cada símbolo tem a label abaixo; os hrefs correspondem exatamente ao LinkedIn, GitHub, `mailto:` do e-mail e `tel:` do telefone; nenhum canal aponta para destino inventado.

- [ ] T-011 [FR-008, FR-009] Renderizar o acesso aos currículos por idioma.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`, `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: com os dois registros disponíveis, o acesso em português aponta para o PDF `pt-BR` e o acesso em inglês aponta para o PDF `en`; com o arquivo ausente ou indisponível, não há indicação falsa de download concluído e a página permanece utilizável.

- [ ] T-012 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Aplicar estilos responsivos e marcação semântica às novas seções.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss`, `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`.
  - Verificação: validar desktop, mobile estreito e mobile largo; confirmar ausência de overflow horizontal, labels legíveis, símbolos visíveis, links acionáveis, contato no final e preservação do layout vertical existente.

## Fase 4 — Testes

- [ ] T-013 [FR-001, FR-002, FR-003, FR-004] Cobrir o catálogo, as categorias, a formação e o fallback bilíngue.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.spec.ts`.
  - Verificação: testes confirmam todas as seis categorias, todas as tecnologias, as duas pós-graduações, os títulos em português/inglês e o fallback quando uma tradução estiver ausente.

- [ ] T-014 [FR-008, FR-009] Cobrir a leitura e a validação dos currículos.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.spec.ts`.
  - Verificação: testes cobrem PDF `pt-BR`, PDF `en`, ausência, erro de consulta, MIME inválido, registro de outro `file_type`, troca de locale e geração da URL pública.

- [ ] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Cobrir o caminho feliz da página pública.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: reproduzir AC-001 a AC-004; confirmar seções, ordem, conteúdo, labels, símbolos, hrefs exatos, currículo correto por idioma e preservação de `#stack-tecnica`.

- [ ] T-016 [FR-005, FR-006, FR-007, FR-008, FR-009] Cobrir o caminho de erro e a regressão das seções existentes.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: reproduzir AC-005 com currículo ausente ou destino inválido; confirmar que a página continua utilizável; confirmar que apresentação, Sobre mim, experiências, resultados, projetos, navegação e alternância de idioma continuam funcionando.

- [ ] T-017 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Executar a verificação integrada da aplicação.
  - Arquivos/módulos: suíte existente, build do projeto, preview e evidências em `spec/05-verificacao/habilidades-formacao-contato/`.
  - Verificação: testes e build concluem sem erro; migration aplica e reverte; preview é validado em desktop/mobile; alternância de idioma, navegação e download são verificados com os dois PDFs; divergências são registradas antes da entrega.

## Fase 5 — Entrega

- [ ] T-018 [FR-008, FR-009] Disponibilizar os dois currículos aprovados no Storage e validar os registros públicos.
  - Arquivos/módulos: bucket `curricula`, tabela `public.portfolio_files` e evidências de verificação.
  - Verificação: existe exatamente um registro PDF para `pt-BR` e um para `en`; cada registro aponta para um arquivo acessível no Storage; o download em cada idioma retorna o arquivo correspondente; os PDFs não foram versionados no Git.

- [ ] T-019 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Comparar Spec, plano, tarefas, implementação e testes antes da aprovação.
  - Arquivos/módulos: Spec da feature, plano, tarefas, diff da implementação, migration, testes e evidências.
  - Verificação: todos os FR e AC estão cobertos; nenhum requisito foi inventado; o anchor `stack-tecnica` foi preservado; não há nova tabela, rota ou serviço fora da arquitetura; o risco do PDF e seu rollback estão documentados.

- [ ] T-020 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009] Validar preview, rollback e aprovação final sem executar deploy.
  - Arquivos/módulos: preview da aplicação, estado de referência do repositório e checklist de verificação.
  - Verificação: confirmar comportamento em desktop/mobile e nos dois idiomas; registrar como reverter somente as alterações desta feature; obter revisão e aprovação de Marcos; não executar deploy antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Criar tela administrativa para upload, substituição ou exclusão dos currículos.
- [ ] Criar tela administrativa para editar habilidades, formação ou contatos.
- [ ] Criar nova tabela para habilidades, formação ou contatos.
- [ ] Criar nova rota pública, novo serviço global ou novo domínio de feature.
- [ ] Adicionar biblioteca de ícones ou sincronização com LinkedIn, GitHub, e-mail ou telefonia.
- [ ] Alterar o ID público `stack-tecnica` ou reorganizar as seções existentes sem uma nova decisão aprovada.
- [ ] Adicionar tecnologias ou categorias além do catálogo atual aprovado.
- [ ] Versionar os arquivos PDF dos currículos no repositório.
