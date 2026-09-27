import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { AdminContentDraft } from './admin-content.models';
import { ContentManagement } from './content-management';
import { AdminContentService } from './admin-content.service';

describe('ContentManagement', () => {
  it('renders the seven supported content areas and two locale boxes', async () => {
    await configure();
    const fixture = TestBed.createComponent(ContentManagement);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="content-management"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Textos e resultados');
    expect(fixture.nativeElement.textContent).toContain('Experiências');
    expect(fixture.nativeElement.textContent).toContain('Projetos');
    expect(fixture.nativeElement.textContent).toContain('Habilidades');
    expect(fixture.nativeElement.textContent).toContain('Formação');
    expect(fixture.nativeElement.textContent).toContain('Contatos');
    expect(fixture.nativeElement.querySelectorAll('textarea').length).toBeGreaterThan(0);
  });

  it('uses the standard validation message before saving incomplete content', async () => {
    const service = await configure();
    const fixture = TestBed.createComponent(ContentManagement);
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      saveCopy: (entry: unknown) => Promise<void>;
    };
    await component.saveCopy({
      key: 'aboutTitle',
      label: 'About title',
      value: { 'pt-BR': '', en: '' },
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-testid="validation-error"]')?.textContent,
    ).toContain('Campo obrigatório.');
    expect(service.saveCopy).not.toHaveBeenCalled();
  });

  it('shows publication feedback after a successful save', async () => {
    const service = await configure();
    const fixture = TestBed.createComponent(ContentManagement);
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      saveCopy: (entry: unknown) => Promise<void>;
    };
    await component.saveCopy({
      key: 'aboutTitle',
      label: 'About title',
      value: { 'pt-BR': 'Sobre mim', en: 'About me' },
    });
    fixture.detectChanges();

    expect(service.saveCopy).toHaveBeenCalledOnce();
    expect(
      fixture.nativeElement.querySelector('[data-testid="content-success"]')?.textContent,
    ).toContain('publicado');
  });
});

async function configure(): Promise<{
  loadDraft: ReturnType<typeof vi.fn>;
  saveCopy: ReturnType<typeof vi.fn>;
}> {
  const draft: AdminContentDraft = {
    copy: [
      {
        key: 'aboutTitle',
        label: 'About title',
        value: { 'pt-BR': 'Sobre mim', en: 'About me' },
      },
    ],
    experiences: [],
    projects: [],
    skillCategories: [],
    academicEntries: [],
    contacts: [],
  };
  const service = {
    loadDraft: vi.fn().mockResolvedValue(draft),
    saveCopy: vi.fn().mockResolvedValue({ ok: true }),
    saveExperience: vi.fn().mockResolvedValue({ ok: true }),
    saveProject: vi.fn().mockResolvedValue({ ok: true }),
    saveSkillCategory: vi.fn().mockResolvedValue({ ok: true }),
    saveAcademicEntry: vi.fn().mockResolvedValue({ ok: true }),
    saveContact: vi.fn().mockResolvedValue({ ok: true }),
  };
  await TestBed.configureTestingModule({
    imports: [ContentManagement],
    providers: [{ provide: AdminContentService, useValue: service }],
  }).compileComponents();
  return service;
}
