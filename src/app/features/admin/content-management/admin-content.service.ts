import { Injectable, inject } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { ENGLISH_COPY } from '../../portfolio/content/portfolio-translations';
import {
  ORIGINAL_COPY,
  PORTFOLIO_ACADEMIC_ENTRIES,
  PORTFOLIO_CONTACT_LINKS,
  PORTFOLIO_EDITABLE_COPY_KEYS,
  PORTFOLIO_SKILL_CATEGORIES,
  type PortfolioCopyKey,
} from '../../portfolio/content/portfolio-content';
import type {
  PortfolioContactSymbol,
  PortfolioProjectLink,
} from '../../portfolio/content/portfolio-content.models';
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
  type AdminSaveResult,
  type AdminSkillCategoryDraft,
  type AdminSkillDraft,
  type LocalizedValue,
} from './admin-content.models';

type Row = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private readonly client = inject(SUPABASE_CLIENT);

  async loadDraft(): Promise<AdminContentDraft> {
    const [copy, experiences, projects, skillCategories, academicEntries, contacts] =
      await Promise.all([
        this.loadCopy(),
        this.loadExperiences(),
        this.loadProjects(),
        this.loadSkillCategories(),
        this.loadAcademicEntries(),
        this.loadContacts(),
      ]);
    return { copy, experiences, projects, skillCategories, academicEntries, contacts };
  }

  async saveCopy(entry: AdminCopyEntry): Promise<AdminSaveResult> {
    return this.run('copy', async (client) => {
      const { data, error } = await client
        .from('portfolio_texts')
        .upsert(
          { content_key: entry.key, content_type: resultKey(entry.key) ? 'result' : 'text' },
          { onConflict: 'content_key' },
        )
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Text record was not returned');
      const textId = String((data as Row)['id']);
      await this.saveLocalizedRows(
        client,
        'portfolio_text_translations',
        'text_id',
        textId,
        entry.value,
        (value) => ({ value }),
      );
    });
  }

  async saveExperience(experience: AdminExperienceDraft): Promise<AdminSaveResult> {
    return this.run('experience', async (client) => {
      const base = {
        ...(experience.id ? { id: experience.id } : {}),
        start_date: experience.startDate,
        end_date: experience.endDate || null,
        name: experience.name,
        display_order: experience.displayOrder,
      };
      const { data, error } = await client
        .from('portfolio_experiences')
        .upsert(base)
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Experience record was not returned');
      const id = String((data as Row)['id']);
      await this.saveLocalizedRows(
        client,
        'portfolio_experience_translations',
        'experience_id',
        id,
        experience.translations,
        (value) => ({
          title: value.title,
          context: value.context,
          responsibilities: value.responsibilities,
          technical_decisions: value.technicalDecisions,
          results: value.results,
        }),
      );
    });
  }

  async saveProject(project: AdminProjectDraft): Promise<AdminSaveResult> {
    return this.run('project', async (client) => {
      const base = {
        ...(project.id ? { id: project.id } : {}),
        project_type: project.type,
        display_order: project.displayOrder,
      };
      const { data, error } = await client
        .from('portfolio_projects')
        .upsert(base)
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Project record was not returned');
      const id = String((data as Row)['id']);
      await this.saveLocalizedRows(
        client,
        'portfolio_project_translations',
        'project_id',
        id,
        project.translations,
        (value) => ({
          name: value.name,
          description: value.description,
          problem_context: value.problemContext,
          solution: value.solution,
          role: value.role,
          technical_decisions: value.technicalDecisions,
          technologies: value.technologies,
          results: value.results,
          learnings: value.learnings,
          links: value.links,
        }),
      );
    });
  }

  async saveSkillCategory(category: AdminSkillCategoryDraft): Promise<AdminSaveResult> {
    return this.run('skill category', async (client) => {
      const { data, error } = await client
        .from('portfolio_skill_categories')
        .upsert(
          {
            ...(category.id ? { id: category.id } : {}),
            category_key: category.categoryKey,
            display_order: category.displayOrder,
          },
          { onConflict: 'category_key' },
        )
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Skill category was not returned');
      const categoryId = String((data as Row)['id']);
      await this.saveLocalizedRows(
        client,
        'portfolio_skill_category_translations',
        'category_id',
        categoryId,
        category.label,
        (value) => ({ label: value }),
      );

      for (const skill of category.skills) {
        if (!skill.name['pt-BR'].trim() && !skill.name.en.trim()) continue;
        const skillResult = await client
          .from('portfolio_skills')
          .upsert({
            ...(skill.id ? { id: skill.id } : {}),
            category_id: categoryId,
            display_order: skill.displayOrder,
            icon_url: skill.iconUrl.trim() || null,
            icon_storage_path: skill.iconStoragePath.trim() || null,
          })
          .select('id')
          .single();
        if (skillResult.error || !skillResult.data) {
          throw skillResult.error ?? new Error('Skill record was not returned');
        }
        await this.saveLocalizedRows(
          client,
          'portfolio_skill_translations',
          'skill_id',
          String((skillResult.data as Row)['id']),
          skill.name,
          (value) => ({ name: value }),
        );
      }
    });
  }

  async saveAcademicEntry(entry: AdminAcademicDraft): Promise<AdminSaveResult> {
    return this.run('academic entry', async (client) => {
      const { data, error } = await client
        .from('portfolio_academic_entries')
        .upsert({
          ...(entry.id ? { id: entry.id } : {}),
          display_order: entry.displayOrder,
          start_date: entry.startDate || null,
          end_date: entry.isCurrent ? null : entry.endDate || null,
          is_current: entry.isCurrent,
        })
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Academic entry was not returned');
      await this.saveLocalizedRows(
        client,
        'portfolio_academic_entry_translations',
        'entry_id',
        String((data as Row)['id']),
        entry.translation,
        (value) => ({
          name: value.name,
          institution: value.institution,
          competencies: value.competencies,
          studied_content: value.studiedContent,
        }),
      );
    });
  }

  async saveContact(contact: AdminContactDraft): Promise<AdminSaveResult> {
    return this.run('contact', async (client) => {
      const { data, error } = await client
        .from('portfolio_contact_links')
        .upsert(
          {
            ...(contact.id ? { id: contact.id } : {}),
            symbol: contact.symbol,
            href: contact.href,
            display_order: contact.displayOrder,
          },
          { onConflict: 'symbol' },
        )
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Contact record was not returned');
      await this.saveLocalizedRows(
        client,
        'portfolio_contact_link_translations',
        'contact_id',
        String((data as Row)['id']),
        contact.label,
        (value) => ({ label: value }),
      );
    });
  }

  private async loadCopy(): Promise<AdminCopyEntry[]> {
    const values = new Map<string, LocalizedValue<string>>(
      PORTFOLIO_EDITABLE_COPY_KEYS.map((key) => [
        key,
        { 'pt-BR': ORIGINAL_COPY[key], en: ENGLISH_COPY[key] },
      ]),
    );
    const client = this.requireClient();
    const { data: texts, error } = await client.from('portfolio_texts').select('id, content_key');
    if (error) throw error;
    const rows = (texts ?? []) as Row[];
    const ids = rows.map((row) => String(row['id']));
    if (ids.length > 0) {
      const { data: translations, error: translationError } = await client
        .from('portfolio_text_translations')
        .select('text_id, locale, value')
        .in('text_id', ids);
      if (translationError) throw translationError;
      for (const row of (translations ?? []) as Row[]) {
        const key = rows.find((item) => String(item['id']) === String(row['text_id']))?.[
          'content_key'
        ];
        const value = values.get(String(key));
        if (!value) continue;
        if (row['locale'] === 'pt-BR' || row['locale'] === 'en') {
          value[row['locale']] = String(row['value'] ?? '');
        }
      }
    }
    return PORTFOLIO_EDITABLE_COPY_KEYS.map((key) => ({
      key,
      label: humanizeKey(key),
      value: values.get(key) as LocalizedValue<string>,
    }));
  }

  private async loadExperiences(): Promise<AdminExperienceDraft[]> {
    const client = this.requireClient();
    const { data, error } = await client
      .from('portfolio_experiences')
      .select('*')
      .order('start_date', { ascending: false })
      .order('display_order', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    return this.mapExperiences(
      rows,
      await this.loadTranslations(
        client,
        'portfolio_experience_translations',
        'experience_id',
        rows.map((row) => String(row['id'])),
      ),
    );
  }

  private async loadProjects(): Promise<AdminProjectDraft[]> {
    const client = this.requireClient();
    const { data, error } = await client
      .from('portfolio_projects')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    return this.mapProjects(
      rows,
      await this.loadTranslations(
        client,
        'portfolio_project_translations',
        'project_id',
        rows.map((row) => String(row['id'])),
      ),
    );
  }

  private async loadSkillCategories(): Promise<AdminSkillCategoryDraft[]> {
    const client = this.requireClient();
    const { data: categories, error } = await client
      .from('portfolio_skill_categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    const categoryRows = (categories ?? []) as Row[];
    if (categoryRows.length === 0) return fallbackSkillDrafts();
    const categoryIds = categoryRows.map((row) => String(row['id']));
    const [categoryTranslations, skillsResult] = await Promise.all([
      this.loadTranslations(
        client,
        'portfolio_skill_category_translations',
        'category_id',
        categoryIds,
      ),
      client
        .from('portfolio_skills')
        .select('*')
        .in('category_id', categoryIds)
        .order('display_order'),
    ]);
    if (skillsResult.error) throw skillsResult.error;
    const skillRows = (skillsResult.data ?? []) as Row[];
    const skillTranslations = await this.loadTranslations(
      client,
      'portfolio_skill_translations',
      'skill_id',
      skillRows.map((row) => String(row['id'])),
    );
    return categoryRows.map((row) => {
      const id = String(row['id']);
      const categoryTranslation = localizedFromRows(categoryTranslations.get(id));
      return {
        id,
        categoryKey: String(row['category_key']),
        displayOrder: Number(row['display_order']),
        label: {
          'pt-BR': String(categoryTranslation['pt-BR']?.['label'] ?? ''),
          en: String(categoryTranslation.en?.['label'] ?? ''),
        },
        skills: skillRows
          .filter((skill) => String(skill['category_id']) === id)
          .map((skill) => {
            const translation = localizedFromRows(skillTranslations.get(String(skill['id'])));
            return {
              id: String(skill['id']),
              displayOrder: Number(skill['display_order']),
              iconUrl: String(skill['icon_url'] ?? ''),
              iconStoragePath: String(skill['icon_storage_path'] ?? ''),
              name: {
                'pt-BR': String(translation['pt-BR']?.['name'] ?? ''),
                en: String(translation.en?.['name'] ?? ''),
              },
            };
          }),
      };
    });
  }

  private async loadAcademicEntries(): Promise<AdminAcademicDraft[]> {
    const client = this.requireClient();
    const { data, error } = await client
      .from('portfolio_academic_entries')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return fallbackAcademicDrafts();
    const translations = await this.loadTranslations(
      client,
      'portfolio_academic_entry_translations',
      'entry_id',
      rows.map((row) => String(row['id'])),
    );
    return rows.map((row) => {
      const translation = localizedFromRows(translations.get(String(row['id'])));
      return {
        id: String(row['id']),
        displayOrder: Number(row['display_order']),
        startDate: String(row['start_date'] ?? ''),
        endDate: String(row['end_date'] ?? ''),
        isCurrent: Boolean(row['is_current']),
        translation: {
          'pt-BR': {
            name: String(translation['pt-BR']?.['name'] ?? ''),
            institution: String(translation['pt-BR']?.['institution'] ?? ''),
            competencies: stringArray(translation['pt-BR']?.['competencies']),
            studiedContent: stringArray(translation['pt-BR']?.['studied_content']),
          },
          en: {
            name: String(translation.en?.['name'] ?? ''),
            institution: String(translation.en?.['institution'] ?? ''),
            competencies: stringArray(translation.en?.['competencies']),
            studiedContent: stringArray(translation.en?.['studied_content']),
          },
        },
      };
    });
  }

  private async loadContacts(): Promise<AdminContactDraft[]> {
    const client = this.requireClient();
    const { data, error } = await client
      .from('portfolio_contact_links')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return fallbackContactDrafts();
    const translations = await this.loadTranslations(
      client,
      'portfolio_contact_link_translations',
      'contact_id',
      rows.map((row) => String(row['id'])),
    );
    return rows.flatMap((row) => {
      const symbol = contactSymbol(row['symbol']);
      if (!symbol) return [];
      const translation = localizedFromRows(translations.get(String(row['id'])));
      return [
        {
          id: String(row['id']),
          symbol,
          href: String(row['href'] ?? ''),
          displayOrder: Number(row['display_order']),
          label: {
            'pt-BR': String(translation['pt-BR']?.['label'] ?? ''),
            en: String(translation.en?.['label'] ?? ''),
          },
        },
      ];
    });
  }

  private async loadTranslations(
    client: SupabaseClient,
    table: string,
    foreignKey: string,
    ids: string[],
  ): Promise<Map<string, Row[]>> {
    if (ids.length === 0) return new Map();
    const { data, error } = await client.from(table).select('*').in(foreignKey, ids);
    if (error) throw error;
    const result = new Map<string, Row[]>();
    for (const row of (data ?? []) as Row[]) {
      const key = String(row[foreignKey]);
      result.set(key, [...(result.get(key) ?? []), row]);
    }
    return result;
  }

  private mapExperiences(rows: Row[], translations: Map<string, Row[]>): AdminExperienceDraft[] {
    return rows.map((row) => ({
      id: String(row['id']),
      startDate: String(row['start_date'] ?? ''),
      endDate: String(row['end_date'] ?? ''),
      name: String(row['name'] ?? ''),
      displayOrder: Number(row['display_order'] ?? 0),
      translations: localizedExperience(translations.get(String(row['id']))),
    }));
  }

  private mapProjects(rows: Row[], translations: Map<string, Row[]>): AdminProjectDraft[] {
    return rows.map((row) => ({
      id: String(row['id']),
      displayOrder: Number(row['display_order'] ?? 0),
      type: row['project_type'] === 'personal' ? 'personal' : 'professional',
      translations: localizedProject(translations.get(String(row['id']))),
    }));
  }

  private async saveLocalizedRows<T>(
    client: SupabaseClient,
    table: string,
    foreignKey: string,
    id: string,
    values: LocalizedValue<T>,
    map: (value: T) => Row,
  ): Promise<void> {
    for (const locale of ['pt-BR', 'en'] as const) {
      const { error } = await client
        .from(table)
        .upsert(
          { [foreignKey]: id, locale, ...map(values[locale]) },
          { onConflict: `${foreignKey},locale` },
        );
      if (error) throw error;
    }
  }

  private async run(
    label: string,
    operation: (client: SupabaseClient) => Promise<void>,
  ): Promise<AdminSaveResult> {
    try {
      await operation(this.requireClient());
      return { ok: true };
    } catch (error) {
      console.error('[portfolio-content-save-failed]', { label, error });
      return { ok: false, message: 'Não foi possível salvar o conteúdo. Tente novamente.' };
    }
  }

  private requireClient(): SupabaseClient {
    if (!this.client) throw new Error('Supabase client unavailable');
    return this.client;
  }
}

function resultKey(key: string): boolean {
  return key.startsWith('results');
}

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
}

function localizedFromRows(rows: Row[] | undefined): { 'pt-BR'?: Row; en?: Row } {
  const result: { 'pt-BR'?: Row; en?: Row } = {};
  for (const row of rows ?? []) {
    if (row['locale'] === 'pt-BR' || row['locale'] === 'en') result[row['locale']] = row;
  }
  return result;
}

function localizedExperience(rows: Row[] | undefined): LocalizedValue<AdminExperienceTranslation> {
  const values = localizedFromRows(rows);
  return {
    'pt-BR': experienceTranslation(values['pt-BR']),
    en: experienceTranslation(values.en),
  };
}

function experienceTranslation(row: Row | undefined): AdminExperienceTranslation {
  return {
    title: String(row?.['title'] ?? ''),
    context: String(row?.['context'] ?? ''),
    responsibilities: stringArray(row?.['responsibilities']),
    technicalDecisions: stringArray(row?.['technical_decisions']),
    results: stringArray(row?.['results']),
  };
}

function localizedProject(rows: Row[] | undefined): LocalizedValue<AdminProjectTranslation> {
  const values = localizedFromRows(rows);
  return {
    'pt-BR': projectTranslation(values['pt-BR']),
    en: projectTranslation(values.en),
  };
}

function projectTranslation(row: Row | undefined): AdminProjectTranslation {
  return {
    name: String(row?.['name'] ?? ''),
    description: String(row?.['description'] ?? ''),
    problemContext: String(row?.['problem_context'] ?? ''),
    solution: String(row?.['solution'] ?? ''),
    role: String(row?.['role'] ?? ''),
    technicalDecisions: stringArray(row?.['technical_decisions']),
    technologies: stringArray(row?.['technologies']),
    results: stringArray(row?.['results']),
    learnings: stringArray(row?.['learnings']),
    links: projectLinks(row?.['links']),
  };
}

function fallbackSkillDrafts(): AdminSkillCategoryDraft[] {
  return PORTFOLIO_SKILL_CATEGORIES.map((category, categoryIndex) => ({
    id: '',
    categoryKey: category.id,
    displayOrder: categoryIndex,
    label: { 'pt-BR': category.labelKey, en: category.labelKey },
    skills: category.skills.map((skill, index) => ({
      id: '',
      displayOrder: index,
      iconUrl: skill.iconUrl ?? '',
      iconStoragePath: skill.iconStoragePath ?? '',
      name: { 'pt-BR': skill.name, en: skill.name },
    })),
  }));
}

function fallbackAcademicDrafts(): AdminAcademicDraft[] {
  return PORTFOLIO_ACADEMIC_ENTRIES.map((entry, index) => ({
    id: '',
    displayOrder: entry.displayOrder ?? index,
    startDate: entry.startDate ?? '',
    endDate: entry.endDate ?? '',
    isCurrent: entry.isCurrent ?? false,
    translation: {
      'pt-BR': {
        name: entry.nameKey,
        institution: entry.institution,
        competencies: entry.competencies ?? [],
        studiedContent: entry.studiedContent ?? [],
      },
      en: {
        name: entry.nameKey,
        institution: entry.institution,
        competencies: entry.competencies ?? [],
        studiedContent: entry.studiedContent ?? [],
      },
    },
  }));
}

function fallbackContactDrafts(): AdminContactDraft[] {
  return PORTFOLIO_CONTACT_LINKS.map((link, index) => ({
    id: '',
    symbol: link.symbol,
    href: link.href,
    displayOrder: index,
    label: { 'pt-BR': link.labelKey, en: link.labelKey },
  }));
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function projectLinks(value: unknown): PortfolioProjectLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Row;
    return typeof row['label'] === 'string' && typeof row['url'] === 'string'
      ? [{ label: row['label'], url: row['url'] }]
      : [];
  });
}

function contactSymbol(value: unknown): PortfolioContactSymbol | null {
  return value === 'linkedin' || value === 'github' || value === 'email' || value === 'phone'
    ? value
    : null;
}
