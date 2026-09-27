do $$ declare result jsonb; original_hash text;
begin
  result := portfolio_editorial.validate_publication(0,'11111111-1111-4111-8111-111111111111');
  if result->>'valid' <> 'true' or jsonb_array_length(result->'errors') <> 0
    or length(result->>'reviewHash') <> 64 then raise exception 'initial draft validation failed: %',result; end if;
  original_hash := result->>'reviewHash';
  delete from portfolio_editorial.draft_translations where entity_id='copy-aboutTitle' and locale_code='en';
  result := portfolio_editorial.validate_publication(0,'11111111-1111-4111-8111-111111111111');
  if result->>'valid' <> 'false' or jsonb_array_length(result->'errors') = 0
    or result->>'reviewHash'=original_hash then raise exception 'incomplete locale was not detected'; end if;
  begin perform portfolio_editorial.validate_publication(1,'11111111-1111-4111-8111-111111111111');
    raise exception 'stale revision accepted'; exception when serialization_failure then null; end;
end $$;
