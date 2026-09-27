# Plano de verificação — Upload e substituição de imagens e currículos

Feature: `spec/03-features/upload-substituicao-midias/spec.md`  
Plano: `spec/04-plano/upload-substituicao-midias/plano.md`  
Status: Rascunho — revisão de Marcos pendente

## 1. Verificações automatizadas

- `npm test -- --watch=false --no-progress`
  - validações de mídia;
  - upload e associação de metadados;
  - substituição e limpeza compensatória;
  - componente administrativo;
  - regressão da aplicação existente.
- `npm run build`
  - compilação Angular e validação dos templates/estilos.
- `git diff --check`
  - ausência de erros de whitespace no diff.

## 2. Matriz de cobertura

| Requisito/critério       | Evidência esperada                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| FR-001 / AC-001          | Serviço e interface enviam imagem válida para `project-images` e associam ao projeto        |
| FR-002 / AC-002          | Serviço e interface enviam PDF para o locale selecionado                                    |
| FR-003                   | Mock do Storage confirma upload no bucket correto                                           |
| FR-004                   | Mock da Data API confirma referência, MIME, nome e tamanho persistidos                      |
| FR-005 / AC-003          | RPC atualiza o registro da imagem específica, preserva ordem e remove caminho anterior      |
| FR-006 / AC-003          | RPC atualiza o currículo do locale sem duplicar registro                                    |
| FR-007                   | Leitura pública gera URL usando a nova referência após reload                               |
| FR-008 / AC-004 / AC-005 | MIME/tamanho inválidos, falha de persistência e falha de Storage não produzem sucesso falso |
| AC-006                   | Policy/grant negam escrita e remoção a `anon` e conta não autorizada                        |
| BR-012                   | Teste concorrente confirma que a última atualização confirmada prevalece                    |

## 3. Verificação manual local

1. Iniciar a aplicação em ambiente local.
2. Abrir `/` e confirmar que a página pública continua carregando.
3. Abrir `/admin` sem sessão e confirmar que somente a tela de autenticação aparece.
4. Usar uma sessão autorizada em ambiente controlado para abrir a gestão de mídia.
5. Adicionar uma imagem válida a um projeto e confirmar a associação pública.
6. Substituir uma imagem específica e confirmar que as demais imagens permanecem.
7. Enviar um PDF para `pt-BR` e outro para `en`; confirmar a seleção por idioma.
8. Substituir um currículo e confirmar que o arquivo anterior foi removido do Storage.
9. Repetir com arquivo inválido e confirmar mensagem de erro sem falsa publicação.
10. Repetir com falha simulada de persistência e confirmar limpeza do objeto novo.

## 4. Verificação de segurança

Em ambiente Supabase controlado:

- `anon` pode ler objetos públicos, mas não inserir, atualizar ou remover;
- conta autenticada não autorizada não pode inserir, atualizar ou remover;
- Marcos pode inserir/atualizar referências e remover objetos somente nos buckets
  permitidos;
- tabelas de conteúdo não recebem grant de `delete`;
- não existe `service_role`, senha ou segredo no frontend.

## 5. Critério de saída

A verificação só deve ser considerada concluída quando a suíte, o build, a verificação
visual, a checagem de policies e a comparação Spec ↔ plano ↔ tarefas ↔ código ↔ testes
estiverem registradas e Marcos tiver revisado o resultado.
