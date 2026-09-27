import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { MediaManagementService } from './media-management.service';

describe('MediaManagementService', () => {
  it('uploads a valid project image and persists its metadata', async () => {
    const client = fakeClient();
    const service = configure(client);

    const result = await service.uploadProjectImage('project-1', imageFile());

    expect(result).toEqual({ ok: true });
    expect(client.storage.from('project-images').upload).toHaveBeenCalledWith(
      expect.stringContaining('project-1/'),
      expect.any(File),
      expect.objectContaining({ contentType: 'image/png', upsert: false }),
    );
    expect(client.from).toHaveBeenCalledWith('portfolio_project_images');
  });

  it('rejects an invalid image before touching Storage', async () => {
    const client = fakeClient();
    const service = configure(client);

    const result = await service.uploadProjectImage(
      'project-1',
      new File(['data'], 'document.pdf', { type: 'application/pdf' }),
    );

    expect(result).toEqual({ ok: false, message: 'Invalid project image type' });
    expect(client.storage.from('project-images').upload).not.toHaveBeenCalled();
  });

  it('replaces one project image and removes the previous object', async () => {
    const client = fakeClient();
    client.rpc.mockResolvedValue({ data: 'project-1/old.png', error: null });
    const service = configure(client);

    const result = await service.replaceProjectImage('image-1', imageFile());

    expect(result).toEqual({ ok: true });
    expect(client.rpc).toHaveBeenCalledWith(
      'replace_portfolio_project_image',
      expect.objectContaining({ p_image_id: 'image-1', p_mime_type: 'image/png' }),
    );
    expect(client.storage.from('project-images').remove).toHaveBeenCalledWith([
      'project-1/old.png',
    ]);
  });

  it('replaces a skill icon through the restricted RPC and removes the previous object', async () => {
    const client = fakeClient();
    client.rpc.mockResolvedValue({ data: 'skill-1/old.png', error: null });
    const service = configure(client);

    const result = await service.replaceSkillIcon('skill-1', imageFile());

    expect(result).toEqual({ ok: true });
    expect(client.rpc).toHaveBeenCalledWith(
      'replace_portfolio_skill_icon',
      expect.objectContaining({ p_skill_id: 'skill-1', p_mime_type: 'image/png' }),
    );
    expect(client.storage.from('skill-icons').upload).toHaveBeenCalled();
    expect(client.storage.from('skill-icons').remove).toHaveBeenCalledWith(['skill-1/old.png']);
  });

  it('accepts an SVG skill icon and preserves its MIME type', async () => {
    const client = fakeClient();
    client.rpc.mockResolvedValue({ data: '', error: null });
    const service = configure(client);

    const result = await service.replaceSkillIcon(
      'skill-1',
      new File(['<svg></svg>'], 'typescript.svg', { type: 'image/svg+xml' }),
    );

    expect(result).toEqual({ ok: true });
    expect(client.storage.from('skill-icons').upload).toHaveBeenCalledWith(
      expect.stringContaining('skill-1/'),
      expect.any(File),
      expect.objectContaining({ contentType: 'image/svg+xml', upsert: false }),
    );
    expect(client.rpc).toHaveBeenCalledWith(
      'replace_portfolio_skill_icon',
      expect.objectContaining({ p_mime_type: 'image/svg+xml' }),
    );
  });

  it('rejects an SVG when it is used as a project image', async () => {
    const client = fakeClient();
    const service = configure(client);

    const result = await service.uploadProjectImage(
      'project-1',
      new File(['<svg></svg>'], 'project.svg', { type: 'image/svg+xml' }),
    );

    expect(result).toEqual({ ok: false, message: 'Invalid project image type' });
    expect(client.storage.from('project-images').upload).not.toHaveBeenCalled();
  });

  it('cleans up the new object when metadata persistence fails', async () => {
    const client = fakeClient();
    client.insertError = new Error('permission denied');
    const service = configure(client);

    const result = await service.uploadCurriculum('en', curriculumFile());

    expect(result).toEqual({
      ok: false,
      message: 'Não foi possível salvar a mídia. Tente novamente.',
    });
    expect(client.storage.from('curricula').remove).toHaveBeenCalledWith([
      expect.stringContaining('en/'),
    ]);
  });
});

function configure(client: SupabaseClient): MediaManagementService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [MediaManagementService, { provide: SUPABASE_CLIENT, useValue: client }],
  });
  return TestBed.inject(MediaManagementService);
}

function imageFile(): File {
  return new File(['png'], 'screen.png', { type: 'image/png' });
}

function curriculumFile(): File {
  return new File(['pdf'], 'resume.pdf', { type: 'application/pdf' });
}

function fakeClient() {
  const storageBucket = {
    upload: vi.fn(async () => ({ data: {}, error: null })),
    remove: vi.fn(async () => ({ data: [], error: null })),
    getPublicUrl: vi.fn((path: string) => ({
      data: { publicUrl: `https://storage.test/${path}` },
    })),
  };
  const client = {
    insertError: null as Error | null,
    from: vi.fn((table: string) => {
      const builder: Record<string, unknown> & { then: Promise<unknown>['then'] } = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        in: vi.fn(() => builder),
        order: vi.fn(() => builder),
        maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'project-1' }, error: null })),
        insert: vi.fn(() =>
          Promise.resolve({
            data: null,
            error: table === 'portfolio_files' ? client.insertError : null,
          }),
        ),
        then: (resolve, reject) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
      };
      return builder;
    }),
    rpc: vi.fn(async () => ({ data: '', error: null })),
    storage: {
      from: vi.fn(() => storageBucket),
    },
  };
  return client as unknown as SupabaseClient & {
    insertError: Error | null;
    rpc: ReturnType<typeof vi.fn>;
    storage: { from: ReturnType<typeof vi.fn> };
  };
}
