import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaManagement } from './media-management';
import type { AdminMediaSnapshot } from './media-management.models';
import { MediaManagementService } from './media-management.service';

describe('MediaManagement', () => {
  let fixture: ComponentFixture<MediaManagement>;
  const snapshot: AdminMediaSnapshot = {
    projects: [
      {
        id: 'project-1',
        label: 'Projeto público',
        images: [
          {
            id: 'image-1',
            projectId: 'project-1',
            storagePath: 'project-1/image.png',
            originalName: 'image.png',
            mimeType: 'image/png',
            sizeBytes: 20,
            displayOrder: 0,
            publicUrl: 'https://storage.test/image.png',
          },
        ],
      },
    ],
    skills: [],
    curricula: {
      'pt-BR': {
        id: 'curriculum-pt',
        locale: 'pt-BR',
        storagePath: 'pt-BR/resume.pdf',
        originalName: 'resume.pdf',
        sizeBytes: 40,
        publicUrl: 'https://storage.test/resume.pdf',
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaManagement],
      providers: [
        {
          provide: MediaManagementService,
          useValue: {
            loadSnapshot: vi.fn(async () => snapshot),
            uploadProjectImage: vi.fn(async () => ({ ok: true })),
            replaceProjectImage: vi.fn(async () => ({ ok: true })),
            replaceSkillIcon: vi.fn(async () => ({ ok: true })),
            uploadCurriculum: vi.fn(async () => ({ ok: true })),
            replaceCurriculum: vi.fn(async () => ({ ok: true })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaManagement);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the project image targets and both curriculum locales', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[data-testid="media-management"]')).not.toBeNull();
    expect(element.textContent).toContain('Projeto público');
    expect(element.textContent).toContain('image.png');
    expect(element.textContent).toContain('pt-BR');
    expect(element.textContent).toContain('en');
  });
});
