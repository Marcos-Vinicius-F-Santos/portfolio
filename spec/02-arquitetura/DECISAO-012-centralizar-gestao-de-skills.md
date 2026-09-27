# Registro de Decisão — Gestão centralizada do catálogo de Skills

Data: 2026-09-27  
Status: Aceita — refinamento solicitado por Marcos em 2026-09-27.  
Spec: [Edição visual com rascunho e publicação](../03-features/edicao-visual-rascunho-publicacao/spec.md).

## Contexto

O catálogo editorial de tecnologias já é compartilhado, porém a criação de uma Skill
estava disponível no detalhe de projeto e a tela de mídias ainda lia o catálogo legado.
Isso permitia caminhos duplicados e deixava a gestão de ícones sem uma visão única.

## Decisão

O Gerenciador de mídias será a superfície administrativa única para criar e editar Skills:
nome, ícone e substituição do ícone serão mantidos no catálogo editorial compartilhado.
As telas de Habilidades e de projetos somente associarão IDs existentes desse catálogo.
Criação e edição usarão RPCs revisionadas e o fluxo privado de mídia; o ícone pode ser
PNG/JPEG ou SVG aprovado pela validação autoritativa já registrada na ADR-009.

## Consequências

Uma Skill criada no Gerenciador de mídias pode ser selecionada em qualquer projeto e na
seção geral de Habilidades sem duplicar nome, ID ou arquivo. A tela deixa de depender de
`portfolio_skills` para listar o catálogo editorial. Registros legados continuam sendo
preservados para leitura compatível até a migração editorial, mas não recebem novas
escritas por esse fluxo.

## Verificação

- O Gerenciador de mídias lista cada tecnologia editorial com ícone gerenciado ou bundled.
- Criar uma Skill exige nome e ícone e a torna disponível nos dois seletores.
- Substituir o ícone atualiza o mesmo ID e mantém a validação de mídia.
- O detalhe de projeto e a seção Habilidades não exibem mais controles de criação livre.
