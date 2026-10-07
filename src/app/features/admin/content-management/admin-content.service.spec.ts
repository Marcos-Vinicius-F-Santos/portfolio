import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { AdminContentService } from './admin-content.service';

describe('AdminContentService', () => {
  it('upserts both translations when saving an existing public text key', async () => {
    const client = fakeClient();
    const service = configure(client);

    const result = await service.saveCopy({
      key: 'aboutTitle',
      label: 'About title',
      value: { 'pt-BR': 'Sobre mim', en: 'About me' },
    });

    expect(result).toEqual({ ok: true });
    expect(client.from).toHaveBeenCalledWith('portfolio_texts');
    expect(client.from).toHaveBeenCalledWith('portfolio_text_translations');
  });

  it('saves the contact panel copy independently for Portuguese and English', async () => {
    const client = fakeClient();
    const service = configure(client);

    const result = await service.saveCopy({
      key: 'contactMessagePlaceholder',
      label: 'Contact message placeholder',
      value: { 'pt-BR': 'Escreva sua mensagem...', en: 'Write your message...' },
    });

    expect(result).toEqual({ ok: true });
    expect(client.from).toHaveBeenCalledWith('portfolio_texts');
    expect(client.from).toHaveBeenCalledWith('portfolio_text_translations');
  });

  it('reports a persistence failure without claiming success', async () => {
    const client = fakeClient(new Error('permission denied'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = configure(client);

    const result = await service.saveCopy({
      key: 'aboutTitle',
      label: 'About title',
      value: { 'pt-BR': 'Sobre mim', en: 'About me' },
    });

    expect(result).toEqual({
      ok: false,
      message: 'Não foi possível salvar o conteúdo. Tente novamente.',
    });
    expect(errorSpy).toHaveBeenCalledWith(
      '[portfolio-content-save-failed]',
      expect.objectContaining({ label: 'copy' }),
    );
    errorSpy.mockRestore();
  });
});

function configure(client: SupabaseClient): AdminContentService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [AdminContentService, { provide: SUPABASE_CLIENT, useValue: client }],
  });
  return TestBed.inject(AdminContentService);
}

function fakeClient(failure: Error | null = null): SupabaseClient {
  const client = {
    from: vi.fn(() => query(failure)),
  };
  return client as unknown as SupabaseClient;
}

function query(failure: Error | null) {
  const builder: Record<string, unknown> & { then: Promise<unknown>['then'] } = {
    upsert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(() =>
      Promise.resolve({ data: failure ? null : { id: 'text-1' }, error: failure }),
    ),
    then: (resolve, reject) => Promise.resolve({ data: [], error: failure }).then(resolve, reject),
  };
  return builder;
}
