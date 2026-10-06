import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  type AdminAcademicDraft,
  type AdminContactDraft,
  type AdminContentDraft,
  type AdminCopyEntry,
  type AdminExperienceDraft,
  type AdminExperienceTranslation,
  type AdminLocale,
  type AdminProjectDraft,
  type AdminProjectTranslation,
  type AdminSkillCategoryDraft,
  type AdminSkillDraft,
  LOCALES,
} from './admin-content.models';
import type { PortfolioProjectLink } from '../../portfolio/content/portfolio-content.models';
import { AdminCard } from '../../../shared/ui/admin-card/admin-card';
import { AdminFeedback } from '../../../shared/ui/admin-feedback/admin-feedback';
import { AdminPageHeader } from '../../../shared/ui/admin-page-header/admin-page-header';
import { AdminSectionHeader } from '../../../shared/ui/admin-section-header/admin-section-header';
import { AdminContentService } from './admin-content.service';

const STANDARD_VALIDATION_MESSAGE = 'Campo obrigatório.';
const SAVE_SUCCESS_MESSAGE = 'Conteúdo salvo e publicado.';

@Component({
  selector: 'app-content-management',
  imports: [
    FormsModule,
    AdminCard,
    AdminFeedback,
    AdminPageHeader,
    AdminSectionHeader,
  ],
  templateUrl: './content-management.html',
  styleUrl: './content-management.scss',
})
export class ContentManagement {
  private readonly service = inject(AdminContentService);
  protected readonly locales = LOCALES;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly statusMessage = signal('');
  protected readonly validationMessage = signal('');
  protected readonly draft = signal<AdminContentDraft>(emptyDraft());
  private readonly committedDraft = signal<AdminContentDraft>(emptyDraft());

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const loaded = await this.service.loadDraft();
      this.draft.set(loaded);
      this.committedDraft.set(cloneDraft(loaded));
    } catch {
      this.errorMessage.set('Não foi possível carregar o conteúdo. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  protected setCopy(entry: AdminCopyEntry, locale: AdminLocale, value: string): void {
    entry.value[locale] = value;
    this.clearMessages();
  }

  protected setExperienceField(
    experience: AdminExperienceDraft,
    locale: AdminLocale,
    field: keyof AdminExperienceTranslation,
    value: string,
  ): void {
    const translation = experience.translations[locale];
    if (field === 'responsibilities' || field === 'technicalDecisions' || field === 'results') {
      translation[field] = splitLines(value);
    } else {
      translation[field] = value;
    }
    this.clearMessages();
  }

  protected setProjectField(
    project: AdminProjectDraft,
    locale: AdminLocale,
    field: keyof AdminProjectTranslation,
    value: string,
  ): void {
    const translation = project.translations[locale];
    if (
      field === 'technicalDecisions' ||
      field === 'technologies' ||
      field === 'results' ||
      field === 'learnings'
    ) {
      translation[field] = splitLines(value);
    } else if (field === 'links') {
      translation.links = parseLinks(value);
    } else {
      translation[field] = value;
    }
    this.clearMessages();
  }

  protected setSkillName(skill: AdminSkillDraft, locale: AdminLocale, value: string): void {
    skill.name[locale] = value;
    this.clearMessages();
  }

  protected setAcademicField(
    entry: AdminAcademicDraft,
    locale: AdminLocale,
    field: 'name' | 'institution' | 'competencies' | 'studiedContent',
    value: string,
  ): void {
    if (field === 'competencies' || field === 'studiedContent') {
      entry.translation[locale][field] = splitLines(value);
    } else {
      entry.translation[locale][field] = value;
    }
    this.clearMessages();
  }

  protected setContactField(contact: AdminContactDraft, locale: AdminLocale, value: string): void {
    contact.label[locale] = value;
    this.clearMessages();
  }

  protected addExperience(): void {
    this.draft.update((draft) => ({
      ...draft,
      experiences: [...draft.experiences, emptyExperience()],
    }));
  }

  protected addProject(): void {
    this.draft.update((draft) => ({
      ...draft,
      projects: [...draft.projects, emptyProject()],
    }));
  }

  protected addSkillCategory(): void {
    this.draft.update((draft) => ({
      ...draft,
      skillCategories: [...draft.skillCategories, emptySkillCategory(draft.skillCategories.length)],
    }));
  }

  protected addSkill(category: AdminSkillCategoryDraft): void {
    category.skills.push(emptySkill(category.skills.length));
    this.clearMessages();
  }

  protected addAcademic(): void {
    this.draft.update((draft) => ({
      ...draft,
      academicEntries: [...draft.academicEntries, emptyAcademic(draft.academicEntries.length)],
    }));
  }

  protected addContact(): void {
    this.draft.update((draft) => ({
      ...draft,
      contacts: [...draft.contacts, emptyContact(draft.contacts.length)],
    }));
  }

  protected async saveCopy(entry: AdminCopyEntry): Promise<void> {
    if (!entry.value['pt-BR'].trim() || !entry.value.en.trim()) return this.invalid();
    await this.save(() => this.service.saveCopy(entry));
  }

  protected async saveExperience(experience: AdminExperienceDraft): Promise<void> {
    const valid =
      Boolean(experience.startDate && experience.name.trim()) &&
      this.locales.every((locale) => validExperienceTranslation(experience.translations[locale]));
    if (!valid) return this.invalid();
    await this.save(() => this.service.saveExperience(experience));
  }

  protected async saveProject(project: AdminProjectDraft): Promise<void> {
    const valid = this.locales.every((locale) =>
      validProjectTranslation(project.translations[locale]),
    );
    if (!project.type || !valid) return this.invalid();
    await this.save(() => this.service.saveProject(project));
  }

  protected async saveSkillCategory(category: AdminSkillCategoryDraft): Promise<void> {
    const valid =
      category.categoryKey.trim() &&
      category.label['pt-BR'].trim() &&
      category.label.en.trim() &&
      category.skills.every((skill) => skill.name['pt-BR'].trim() && skill.name.en.trim());
    if (!valid) return this.invalid();
    await this.save(() => this.service.saveSkillCategory(category));
  }

  protected async saveAcademic(entry: AdminAcademicDraft): Promise<void> {
    const valid = this.locales.every(
      (locale) =>
        entry.translation[locale].name.trim() && entry.translation[locale].institution.trim(),
    );
    if (!valid) return this.invalid();
    await this.save(() => this.service.saveAcademicEntry(entry));
  }

  protected async saveContact(contact: AdminContactDraft): Promise<void> {
    const valid =
      contact.href.trim() && this.locales.every((locale) => contact.label[locale].trim());
    if (!valid) return this.invalid();
    await this.save(() => this.service.saveContact(contact));
  }

  protected arrayText(value: string[]): string {
    return value.join('\n');
  }

  protected linksText(value: { label: string; url: string }[]): string {
    return value.map((link) => `${link.label} | ${link.url}`).join('\n');
  }

  protected copyValue(entry: AdminCopyEntry, locale: AdminLocale): string {
    return entry.value[locale];
  }

  protected experienceValue(
    experience: AdminExperienceDraft,
    locale: AdminLocale,
    field: keyof AdminExperienceTranslation,
  ): string {
    const value = experience.translations[locale][field];
    return Array.isArray(value) ? this.arrayText(value) : value;
  }

  protected projectValue(
    project: AdminProjectDraft,
    locale: AdminLocale,
    field: keyof AdminProjectTranslation,
  ): string {
    const value = project.translations[locale][field];
    if (field === 'links') return this.linksText(value as PortfolioProjectLink[]);
    if (Array.isArray(value)) return this.arrayText(value as string[]);
    return value;
  }

  protected academicValue(
    entry: AdminAcademicDraft,
    locale: AdminLocale,
    field: 'competencies' | 'studiedContent',
  ): string {
    return this.arrayText(entry.translation[locale][field]);
  }

  private async save(operation: () => Promise<{ ok: boolean; message?: string }>): Promise<void> {
    this.saving.set(true);
    this.clearMessages();
    const result = await operation();
    this.saving.set(false);
    if (!result.ok) {
      this.draft.set(cloneDraft(this.committedDraft()));
      this.errorMessage.set(result.message ?? 'Não foi possível salvar o conteúdo.');
      return;
    }
    this.committedDraft.set(cloneDraft(this.draft()));
    this.statusMessage.set(SAVE_SUCCESS_MESSAGE);
  }

  private invalid(): void {
    this.validationMessage.set(STANDARD_VALIDATION_MESSAGE);
    this.statusMessage.set('');
  }

  private clearMessages(): void {
    this.validationMessage.set('');
    this.errorMessage.set('');
    this.statusMessage.set('');
  }
}

function emptyDraft(): AdminContentDraft {
  return {
    copy: [],
    experiences: [],
    projects: [],
    skillCategories: [],
    academicEntries: [],
    contacts: [],
  };
}

function emptyExperience(): AdminExperienceDraft {
  return {
    id: '',
    startDate: '',
    endDate: '',
    name: '',
    displayOrder: 0,
    translations: { 'pt-BR': emptyExperienceTranslation(), en: emptyExperienceTranslation() },
  };
}

function emptyExperienceTranslation(): AdminExperienceTranslation {
  return { title: '', context: '', responsibilities: [], technicalDecisions: [], results: [] };
}

function emptyProject(): AdminProjectDraft {
  return {
    id: '',
    displayOrder: 0,
    type: 'professional',
    translations: { 'pt-BR': emptyProjectTranslation(), en: emptyProjectTranslation() },
  };
}

function emptyProjectTranslation(): AdminProjectTranslation {
  return {
    name: '',
    description: '',
    problemContext: '',
    solution: '',
    role: '',
    technicalDecisions: [],
    technologies: [],
    results: [],
    learnings: [],
    links: [],
  };
}

function emptySkillCategory(index: number): AdminSkillCategoryDraft {
  return {
    id: '',
    categoryKey: `category-${index + 1}`,
    displayOrder: index,
    label: { 'pt-BR': '', en: '' },
    skills: [],
  };
}

function emptySkill(index: number): AdminSkillDraft {
  return {
    id: '',
    displayOrder: index,
    iconUrl: '',
    iconStoragePath: '',
    name: { 'pt-BR': '', en: '' },
  };
}

function emptyAcademic(index: number): AdminAcademicDraft {
  return {
    id: '',
    displayOrder: index,
    startDate: '',
    endDate: '',
    isCurrent: false,
    translation: {
      'pt-BR': { name: '', institution: '', competencies: [], studiedContent: [] },
      en: { name: '', institution: '', competencies: [], studiedContent: [] },
    },
  };
}

function emptyContact(index: number): AdminContactDraft {
  return {
    id: '',
    symbol: 'email',
    href: '',
    displayOrder: index,
    label: { 'pt-BR': '', en: '' },
  };
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLinks(value: string): { label: string; url: string }[] {
  return value.split('\n').flatMap((line) => {
    const [label, url] = line.split('|').map((item) => item.trim());
    return label && url ? [{ label, url }] : [];
  });
}

function validExperienceTranslation(value: AdminExperienceTranslation): boolean {
  return Boolean(
    value.title.trim() &&
    value.context.trim() &&
    value.responsibilities.length &&
    value.technicalDecisions.length &&
    value.results.length,
  );
}

function validProjectTranslation(value: AdminProjectTranslation): boolean {
  return Boolean(
    value.name.trim() &&
    value.description.trim() &&
    value.problemContext.trim() &&
    value.role.trim() &&
    value.technicalDecisions.length &&
    value.technologies.length &&
    value.results.length &&
    value.learnings.length,
  );
}

function cloneDraft(draft: AdminContentDraft): AdminContentDraft {
  return structuredClone(draft);
}
