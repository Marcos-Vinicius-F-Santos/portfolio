do $$
declare r jsonb; before_count bigint;
begin
  r := portfolio_editorial.apply_draft_command(0,'10000000-0000-4000-8000-000000000001',
    '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Sobre mim atualizado"}',
    '11111111-1111-4111-8111-111111111111');
  if r->>'revision' <> '1' or r->>'repeated' <> 'false' then raise exception 'first receipt invalid'; end if;
  r := portfolio_editorial.apply_draft_command(0,'10000000-0000-4000-8000-000000000001',
    '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"Sobre mim atualizado"}',
    '11111111-1111-4111-8111-111111111111');
  if r->>'revision' <> '1' or r->>'repeated' <> 'true' then raise exception 'idempotent receipt invalid'; end if;

  begin
    perform portfolio_editorial.apply_draft_command(0,'10000000-0000-4000-8000-000000000002',
      '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"stale"}',
      '11111111-1111-4111-8111-111111111111');
    raise exception 'stale revision was accepted';
  exception when serialization_failure then null; end;
  begin
    perform portfolio_editorial.apply_draft_command(1,'10000000-0000-4000-8000-000000000001',
      '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"text","value":"different"}',
      '11111111-1111-4111-8111-111111111111');
    raise exception 'operation reuse was accepted';
  exception when unique_violation then null; end;
  begin
    perform portfolio_editorial.apply_draft_command(1,'10000000-0000-4000-8000-000000000003',
      '{"type":"set_translation","entityId":"copy-aboutTitle","locale":"pt-BR","field":"html","value":"<b>x</b>"}',
      '11111111-1111-4111-8111-111111111111');
    raise exception 'invalid field was accepted';
  exception when invalid_parameter_value then null; end;
  if (select revision from portfolio_editorial.draft where id=1) <> 1 then raise exception 'failed command changed revision'; end if;

  perform portfolio_editorial.apply_draft_command(1,'10000000-0000-4000-8000-000000000004',
    '{"type":"reorder_collection","kind":"project","entityIds":["d9580705-9f05-407a-a367-1c729da2e63a","3c67f7d3-57a6-4ece-af10-496b8ca33727"]}',
    '11111111-1111-4111-8111-111111111111');
  if (select position from portfolio_editorial.draft_entities where id='d9580705-9f05-407a-a367-1c729da2e63a') <> 0 then raise exception 'reorder failed'; end if;

  select count(*) into before_count from portfolio_editorial.draft_entities;
  perform portfolio_editorial.apply_draft_command(2,'10000000-0000-4000-8000-000000000005',
    '{"type":"add_entity","entityId":"new-contact","kind":"contact","position":4,"data":{"symbol":"email","href":"mailto:test@example.com"},"translations":{"pt-BR":{"label":"Teste"},"en":{"label":"Test"}}}',
    '11111111-1111-4111-8111-111111111111');
  perform portfolio_editorial.apply_draft_command(3,'10000000-0000-4000-8000-000000000006',
    '{"type":"remove_entity","entityId":"new-contact"}',
    '11111111-1111-4111-8111-111111111111');
  if (select count(*) from portfolio_editorial.draft_entities) <> before_count then raise exception 'add/remove changed cardinality'; end if;
  if (select revision from portfolio_editorial.draft where id=1) <> 4 or (select count(*) from portfolio_editorial.operations) <> 4 then
    raise exception 'revision or operation receipt count invalid';
  end if;
end $$;
