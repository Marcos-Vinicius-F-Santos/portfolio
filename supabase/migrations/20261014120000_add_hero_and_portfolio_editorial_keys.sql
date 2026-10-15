-- Migration: 20261014120000_add_hero_and_portfolio_editorial_keys.sql
-- Idempotent insertion of hero, about, portfolio, contact, and education interfaceText keys.

do $$
declare
  item record;
  next_pos int;
begin
  select coalesce(max(position), -1) into next_pos
  from portfolio_editorial.draft_entities
  where draft_id = 1 and kind = 'interfaceText';

  for item in
    select * from (values
      ('copy-name', 'name', 'Desenvolvedor de Software', 'Software Engineer'),
      ('copy-heroName', 'heroName', 'Desenvolvedor de Software', 'Software Engineer'),
      ('copy-heroRole', 'heroRole', 'Engenheiro de Software', 'Software Engineer'),
      ('copy-heroAvailability', 'heroAvailability', 'Disponível para novos projetos · Remoto', 'Open to new opportunities · Remote'),
      ('copy-portfolioEyebrow', 'portfolioEyebrow', 'Portfólio', 'Portfolio'),
      ('copy-portfolioTitle', 'portfolioTitle', 'Projetos em Destaque', 'Featured Projects'),
      ('copy-portfolioSubtitle', 'portfolioSubtitle', 'Projetos e soluções desenvolvidos com foco em engenharia, performance e usabilidade.', 'Projects and solutions engineered with focus on performance, scalability, and usability.'),
      ('copy-aboutHeadline', 'aboutHeadline', 'Construindo soluções robustas com engenharia de software, arquitetura limpa e visão técnica', 'Engineering scalable solutions with clean architecture, performance, and precision'),
      ('copy-aboutFocus', 'aboutFocus', 'Foco principal: TypeScript, Angular, APIs RESTful, bancos de dados relacionais e arquiteturas modernas.', 'Main focus: TypeScript, Angular, RESTful APIs, relational databases, and modern cloud architectures.'),
      ('copy-aboutPillar1Title', 'aboutPillar1Title', 'Engenharia Front-end & Performance', 'Frontend Engineering & Performance'),
      ('copy-aboutPillar1Description', 'aboutPillar1Description', 'Desenvolvimento de SPAs escaláveis, arquitetura modular, componentização reutilizável e interfaces responsivas.', 'Scalable single-page applications, modular architectures, reusable design systems, and responsive user interfaces.'),
      ('copy-aboutPillar2Title', 'aboutPillar2Title', 'Backend & APIs Escaláveis', 'Backend & Scalable APIs'),
      ('copy-aboutPillar2Description', 'aboutPillar2Description', 'Criação de APIs RESTful de alta performance, integrações eficientes, modelagem de dados e conteinerização.', 'High-performance RESTful APIs, robust integrations, efficient data persistence, and containerization.'),
      ('copy-aboutPillar3Title', 'aboutPillar3Title', 'Arquitetura & Automação', 'Architecture & Automation'),
      ('copy-aboutPillar3Description', 'aboutPillar3Description', 'Desenvolvimento de soluções com foco em automação, confiabilidade operacional e arquitetura de sistemas.', 'Engineering resilient digital solutions with emphasis on automated workflows and operational reliability.'),
      ('copy-contactHeadline', 'contactHeadline', 'Vamos conversar sobre novas oportunidades ou projetos?', 'Let''s connect to discuss new opportunities or projects'),
      ('copy-contactSubtitle', 'contactSubtitle', 'Estou disponível para atuar como Engenheiro de Software em projetos desafiadores.', 'Available for Software Engineering roles and impactful technical challenges.'),
      ('copy-contactExplanation', 'contactExplanation', 'Fique à vontade para me enviar uma mensagem direta ou conectar nas redes.', 'Feel free to send a direct message or connect on professional networks.'),
      ('copy-contactRedirectNote', 'contactRedirectNote', 'Mensagens enviadas pelo formulário são direcionadas com segurança para o meu email ou WhatsApp.', 'Messages submitted via this form are routed securely to my email or WhatsApp.'),
      ('copy-educationNameLabel', 'educationNameLabel', 'Formação', 'Education'),
      ('copy-educationLevelLabel', 'educationLevelLabel', 'Nível', 'Level'),
      ('copy-educationStatusLabel', 'educationStatusLabel', 'Status', 'Status'),
      ('copy-educationCompletedLabel', 'educationCompletedLabel', 'Concluído', 'Completed')
    ) as t(id, key, pt_text, en_text)
  loop
    if not exists (
      select 1 from portfolio_editorial.draft_entities
      where draft_id = 1 and id = item.id
    ) then
      next_pos := next_pos + 1;
      insert into portfolio_editorial.draft_entities (
        draft_id, id, kind, parent_id, position, data
      ) values (
        1, item.id, 'interfaceText', null, next_pos, jsonb_build_object('key', item.key)
      );
    end if;

    insert into portfolio_editorial.draft_translations (
      draft_id, entity_id, locale_code, fields
    ) values (
      1, item.id, 'pt-BR', jsonb_build_object('text', item.pt_text)
    ) on conflict (draft_id, entity_id, locale_code) do update
      set fields = case
        when portfolio_editorial.draft_translations.fields = '{}'::jsonb
          or portfolio_editorial.draft_translations.fields is null
        then excluded.fields
        else portfolio_editorial.draft_translations.fields
      end;

    insert into portfolio_editorial.draft_translations (
      draft_id, entity_id, locale_code, fields
    ) values (
      1, item.id, 'en', jsonb_build_object('text', item.en_text)
    ) on conflict (draft_id, entity_id, locale_code) do update
      set fields = case
        when portfolio_editorial.draft_translations.fields = '{}'::jsonb
          or portfolio_editorial.draft_translations.fields is null
        then excluded.fields
        else portfolio_editorial.draft_translations.fields
      end;
  end loop;
end
$$;
