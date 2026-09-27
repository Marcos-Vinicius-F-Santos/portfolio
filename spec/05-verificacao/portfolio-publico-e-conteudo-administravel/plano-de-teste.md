# Plano de teste — Portfólio público e conteúdo administrável

Status: Preparado para revisão; execução desta rodada pendente de aprovação de Marcos  
Spec: `spec/03-features/portfolio-publico-e-conteudo-administravel/spec.md`  
Plano: `spec/04-plano/portfolio-publico-e-conteudo-administravel/plano.md`  
Tarefas: `spec/04-plano/portfolio-publico-e-conteudo-administravel/tarefas.md`

## Prioridades

| Prioridade | Cobertura                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alta       | Header fixo, destinos atuais, remoção de numeração, apresentação, contatos sincronizados, experiências sem empresa, fallback `pt-BR`, novo projeto e falhas de persistência |
| Alta       | RLS, Storage, limite de 1 MB, upload de ícone, compensação de mídia e ausência de escrita anônima                                                                           |
| Média      | Formação em andamento, competências/conteúdos, URL pública inválida, skill sem ícone e responsividade detalhada                                                             |

## Roteiro automatizado

Executar na raiz do projeto:

```powershell
npm test -- --watch=false --no-progress
npm run build
```

Cobertura esperada:

- seleção e fallback de conteúdo por locale;
- ordenação mais recente → mais antiga;
- ausência do nome da empresa no modelo e na apresentação pública;
- formação com período, andamento, competências e conteúdos;
- contatos públicos usando a mesma fonte;
- validação de imagem até 1 MB;
- upload/substituição e limpeza compensatória de mídias;
- regressão da página pública, Admin page e rota protegida.

## Roteiro de banco e Storage

Executar somente em ambiente local ou de teste controlado, nunca por SQL manual em
produção:

```powershell
npx supabase@2.117.0 db lint --local --fail-on error
npx supabase@2.117.0 db advisors --local
npx supabase@2.117.0 migration list --local
```

Confirmar:

- migration nova presente e sem erro de schema;
- bucket `skill-icons` público para leitura e limitado a 1 MB;
- `anon` sem insert/update/delete em conteúdo e Storage;
- Marcos autorizado consegue inserir/atualizar;
- uma falha de associação remove o novo objeto enviado;
- substituição retorna e remove o objeto anterior somente depois da referência nova;
- dados existentes permanecem presentes após a migration.

## Roteiro manual público

1. Abrir a página em desktop e confirmar header fixo, títulos atuais e ausência de
   numerações.
2. Confirmar a ordem atual das seções e todos os destinos do header.
3. Confirmar apresentação inicial, contatos compactos e seção “Contact” completa.
4. Alternar entre `pt-BR` e `en`; remover uma tradução de teste e confirmar fallback para
   `pt-BR`.
5. Confirmar experiências da mais recente para a mais antiga sem nomes de empresas.
6. Confirmar formação com período, andamento, competências e conteúdos estudados.
7. Confirmar skill com ícone manual, URL pública válida, URL inválida e sem ícone.
8. Confirmar novo projeto usando o layout existente, sem alteração manual do HTML.
9. Repetir os cenários principais em viewport móvel.

## Roteiro manual administrativo

1. Acessar a Admin page sem autenticação e confirmar bloqueio.
2. Autenticar Marcos e carregar textos, experiências, projetos, skills, formação e
   contatos.
3. Salvar uma alteração válida e confirmar publicação imediata no público.
4. Cadastrar/editar formação, traduções e contatos; confirmar que os dois pontos de contato
   refletem a mesma alteração.
5. Enviar ícone válido, arquivo acima de 1 MB e tipo não aprovado; confirmar os resultados
   esperados.
6. Simular falha de persistência e confirmar que o rascunho original permanece na
   interface e não há falso sucesso.
7. Confirmar que inserir, editar e excluir existentes continuam funcionando.

## Evidência desta rodada

- `npm test -- --watch=false --no-progress`: 108 testes em 15 arquivos passaram.
- `npm run build`: passou com avisos de orçamento já existentes/aumentados pelo escopo da
  página; nenhuma falha de compilação.
- `npx supabase@2.117.0 db lint --local --fail-on error`: nenhum erro de schema.
- `npx supabase@2.117.0 db advisors --local`: avisos existentes em tabelas não relacionadas;
  nenhum achado retornado para as tabelas desta feature.
- Verificação manual em navegador e ambiente Supabase remoto: pendente.
