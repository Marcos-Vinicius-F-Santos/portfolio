# Tarefas — Layout vertical das seções

Plano relacionado: `spec/04-plano/layout-vertical-secoes/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-002] Mapear a implementação atual da página pública, identificando o container do grid de três colunas, os estilos responsivos, a ordem das seções, os IDs de navegação e os comandos de teste.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/` e arquivos de configuração/teste já existentes.
  - Verificação: registrar os arquivos envolvidos, confirmar onde a regra de três colunas é aplicada, listar os breakpoints suportados e executar a verificação inicial disponível sem alterar o comportamento.

- [ ] T-002 [FR-001, FR-002] Confirmar que a mudança será feita nos arquivos existentes de `portfolio/presentation`, sem criar nova feature, camada ou estrutura por tipo de arquivo.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/`.
  - Verificação: revisar o escopo da alteração e confirmar que não há mudança planejada em Supabase, banco, Storage, Auth ou área administrativa.

## Fase 2 — Lógica principal

- [ ] T-003 [FR-002] Reorganizar a composição da página para exibir “Sobre mim” primeiro, “Stack técnica” em seguida e as demais seções posteriormente.
  - Arquivos/módulos: template/componente de composição da página em `src/app/features/portfolio/presentation/`.
  - Verificação: inspecionar a ordem dos elementos no DOM e confirmar que a sequência começa por “Sobre mim”, seguida de “Stack técnica”, sem alterar o conteúdo das seções.

- [ ] T-004 [FR-001, FR-002] Preservar os IDs, links de navegação, componentes e conteúdo existentes durante a reorganização.
  - Arquivos/módulos: template da página, navegação e componentes das seções em `src/app/features/portfolio/presentation/`.
  - Verificação: ativar cada link de navegação existente e confirmar que ele continua levando à seção correta; confirmar que as demais seções mantêm sua ordem relativa atual.

## Fase 3 — Interface

- [ ] T-005 [FR-001] Alterar o container existente para uma única coluna vertical em todos os breakpoints suportados pela página pública.
  - Arquivos/módulos: arquivo de estilos associado ao container da página em `src/app/features/portfolio/presentation/`.
  - Verificação: validar em cada viewport suportada que nenhuma seção fica lado a lado com outra e que o layout não retorna a três colunas.

- [ ] T-006 [FR-001] Ajustar as regras de largura, quebra e overflow para distribuir verticalmente o conteúdo que exceder o espaço horizontal disponível.
  - Arquivos/módulos: estilos do container e das seções em `src/app/features/portfolio/presentation/`.
  - Verificação: usar conteúdo extenso ou a maior seção existente em uma viewport estreita e confirmar que o texto é quebrado verticalmente, sem corte, sobreposição ou overflow horizontal.

- [ ] T-007 [FR-002] Preservar a identidade visual, os espaçamentos e a navegação enquanto a disposição das seções é alterada.
  - Arquivos/módulos: template, estilos e navegação da página pública.
  - Verificação: comparar a página antes e depois da mudança e confirmar que somente a organização em colunas e a ordem definida foram alteradas.

## Fase 4 — Testes

- [ ] T-008 [FR-001, FR-002] Adicionar ou atualizar testes automatizados para a ordem das seções e a disposição em uma coluna.
  - Arquivos/módulos: testes existentes da página pública ou da feature `portfolio/presentation`, usando o runner já configurado.
  - Verificação: executar a suíte e confirmar a ordem “Sobre mim” → “Stack técnica” → demais seções e a regra de uma coluna.

- [ ] T-009 [FR-001] Verificar visualmente a disposição em uma coluna em todos os tamanhos de tela suportados.
  - Arquivos/módulos: página pública e estilos da feature.
  - Verificação: revisar as viewports desktop e móvel utilizadas pelo projeto, confirmar que as seções ficam uma abaixo da outra e que não há overflow horizontal.

- [ ] T-010 [FR-001] Cobrir o caminho de erro de conteúdo que excede a largura disponível.
  - Arquivos/módulos: teste automatizado ou verificação de navegador da página pública.
  - Verificação: executar o cenário com conteúdo extenso e confirmar distribuição vertical, ausência de corte/sobreposição e ausência de retorno ao grid de três colunas.

- [ ] T-011 [FR-001, FR-002] Executar a verificação de regressão, build, lint e os demais comandos de qualidade existentes.
  - Arquivos/módulos: aplicação completa e configuração de qualidade do projeto.
  - Verificação: build e verificações configuradas concluídos sem erro; navegação, conteúdo e demais comportamentos públicos existentes continuam funcionando.

## Fase 5 — Entrega

- [ ] T-012 [FR-001, FR-002] Revisar a convergência entre Spec, plano, tarefas, implementação e testes e preparar o rollback.
  - Arquivos/módulos: diff completo da feature e documentação de entrega, se necessária.
  - Verificação: confirmar cobertura de FR-001 e FR-002, ausência de alterações fora do escopo, commit/estado de referência identificado e rollback por reversão do commit definido.

- [ ] T-013 [FR-001, FR-002] Submeter a feature para revisão e aprovação de Marcos antes de qualquer deploy.
  - Arquivos/módulos: resultado final da feature.
  - Verificação: revisão humana concluída e aprovação registrada; nenhum deploy executado antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Alteração do conteúdo textual ou dos dados das seções.
- [ ] Alteração da área administrativa, autenticação ou persistência no Supabase.
- [ ] Criação de novas seções ou componentes estruturais.
- [ ] Mudança da identidade visual, tipografia, cores ou navegação além do necessário para a reorganização.
- [ ] Alteração da ordem relativa das demais seções sem atualização explícita da Spec.

