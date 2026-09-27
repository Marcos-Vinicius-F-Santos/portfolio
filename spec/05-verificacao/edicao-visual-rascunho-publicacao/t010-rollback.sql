drop function if exists public.validate_editor_publication(bigint);
drop function if exists portfolio_editorial.validate_publication(bigint,uuid);
drop function if exists portfolio_editorial.required_translation_fields(text);
revoke select on portfolio_editorial.publications from portfolio_editorial_executor;
