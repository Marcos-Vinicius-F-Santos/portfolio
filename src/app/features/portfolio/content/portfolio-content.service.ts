import { computed, inject, Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import type { PortfolioCopy } from './portfolio-content';
import {
  type PortfolioExperience,
  type PortfolioFile,
  type PortfolioLocale,
  type PortfolioProject,
  type PortfolioProjectImage,
} from './portfolio-content.models';

type Row = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class PortfolioContentService {
  private readonly client = inject(SUPABASE_CLIENT);

  private readonly remoteCopyState = signal<Partial<PortfolioCopy>>({});
  private readonly errorState = signal<Error | null>(null);

  readonly remoteCopy = computed(() => this.remoteCopyState());
  readonly lastError = computed(() => this.errorState());
  readonly isAvailable = computed(() => this.client !== null);

  async loadCopy(locale: PortfolioLocale): Promise<Partial<PortfolioCopy>> {
    this.remoteCopyState.set({});
    this.errorState.set(null);
    if (!this.client) {
      return {};
    }

    try {
      const { data: texts, error: textsError } = await this.client
        .from('portfolio_texts')
        .select('id, content_key');

      if (textsError) {
        throw textsError;
      }

      const textRows = (texts ?? []) as Row[];
      const ids = textRows.map((row) => String(row['id']));
      if (ids.length === 0) {
        this.remoteCopyState.set({});
        this.errorState.set(null);
        return {};
      }

      const { data: translations, error: translationsError } = await this.client
        .from('portfolio_text_translations')
        .select('text_id, value')
        .in('text_id', ids)
        .eq('locale', locale);

      if (translationsError) {
        throw translationsError;
      }

      const translationByTextId = new Map(
        ((translations ?? []) as Row[]).map((row) => [String(row['text_id']), row['value']]),
      );
      const copy: Record<string, unknown> = {};

      for (const row of textRows) {
        const key = String(row['content_key']);
        if (translationByTextId.has(String(row['id']))) {
          copy[key] = translationByTextId.get(String(row['id']));
        }
      }

      this.remoteCopyState.set(copy as Partial<PortfolioCopy>);
      this.errorState.set(null);
      return copy as Partial<PortfolioCopy>;
    } catch (error) {
      this.errorState.set(toError(error));
      this.remoteCopyState.set({});
      return {};
    }
  }

  async listExperiences(locale: PortfolioLocale): Promise<PortfolioExperience[]> {
    if (!this.client) return [];
    const client = this.client;

    try {
      const { data: experiences, error } = await client
        .from('portfolio_experiences')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      const rows = (experiences ?? []) as Row[];
      const ids = rows.map((row) => String(row['id']));
      const translations = await this.getTranslations(
        client,
        'portfolio_experience_translations',
        'experience_id',
        ids,
        locale,
      );

      return rows.map((row) => {
        const translation = translations.get(String(row['id'])) ?? {};
        return {
          id: String(row['id']),
          startDate: String(row['start_date']),
          endDate: nullableString(row['end_date']),
          companyContext: String(row['company_context']),
          displayOrder: Number(row['display_order']),
          title: String(translation['title'] ?? ''),
          context: String(translation['context'] ?? ''),
          responsibilities: stringArray(translation['responsibilities']),
          technicalDecisions: stringArray(translation['technical_decisions']),
          results: stringArray(translation['results']),
        };
      });
    } catch (error) {
      this.errorState.set(toError(error));
      return [];
    }
  }

  async listProjects(locale: PortfolioLocale): Promise<PortfolioProject[]> {
    if (!this.client) return [];
    const client = this.client;

    try {
      const { data: projects, error } = await client
        .from('portfolio_projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      const rows = (projects ?? []) as Row[];
      const ids = rows.map((row) => String(row['id']));
      const [translations, imageRows] = await Promise.all([
        this.getTranslations(
          client,
          'portfolio_project_translations',
          'project_id',
          ids,
          locale,
        ),
        this.getProjectImages(client, ids),
      ]);

      return rows.map((row) => {
        const id = String(row['id']);
        const translation = translations.get(id) ?? {};
        const images = (imageRows.get(id) ?? []).map((image) => this.toProjectImage(client, image));

        return {
          id,
          displayOrder: Number(row['display_order']),
          locale,
          name: String(translation['name'] ?? ''),
          description: String(translation['description'] ?? ''),
          problemContext: String(translation['problem_context'] ?? ''),
          solution: String(translation['solution'] ?? ''),
          role: String(translation['role'] ?? ''),
          technicalDecisions: stringArray(translation['technical_decisions']),
          technologies: stringArray(translation['technologies']),
          results: stringArray(translation['results']),
          learnings: stringArray(translation['learnings']),
          links: Array.isArray(translation['links']) ? translation['links'] : [],
          images,
        };
      });
    } catch (error) {
      this.errorState.set(toError(error));
      return [];
    }
  }

  async getCurriculum(locale: PortfolioLocale): Promise<PortfolioFile | null> {
    if (!this.client) return null;
    const client = this.client;

    try {
      const { data, error } = await client
        .from('portfolio_files')
        .select('*')
        .eq('file_type', 'curriculum')
        .eq('locale', locale)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      const row = data as Row;
      return {
        id: String(row['id']),
        fileType: 'curriculum',
        locale,
        storagePath: String(row['storage_path']),
        originalName: String(row['original_name']),
        mimeType: String(row['mime_type']),
        sizeBytes: Number(row['size_bytes']),
        publicUrl: client.storage.from('curricula').getPublicUrl(String(row['storage_path'])).data.publicUrl,
      };
    } catch (error) {
      this.errorState.set(toError(error));
      return null;
    }
  }

  private async getTranslations(
    client: SupabaseClient,
    table: string,
    foreignKey: string,
    ids: string[],
    locale: PortfolioLocale,
  ): Promise<Map<string, Row>> {
    if (ids.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from(table)
      .select('*')
      .in(foreignKey, ids)
      .eq('locale', locale);

    if (error) {
      throw error;
    }

    return new Map(
      ((data ?? []) as Row[]).map((row) => [String(row[foreignKey]), row]),
    );
  }

  private async getProjectImages(
    client: SupabaseClient,
    projectIds: string[],
  ): Promise<Map<string, Row[]>> {
    if (projectIds.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from('portfolio_project_images')
      .select('*')
      .in('project_id', projectIds)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    const grouped = new Map<string, Row[]>();
    for (const row of (data ?? []) as Row[]) {
      const projectId = String(row['project_id']);
      const current = grouped.get(projectId) ?? [];
      current.push(row);
      grouped.set(projectId, current);
    }
    return grouped;
  }

  private toProjectImage(client: SupabaseClient, row: Row): PortfolioProjectImage {
    const storagePath = String(row['storage_path']);
    const mimeType = String(row['mime_type']);
    return {
      id: String(row['id']),
      projectId: String(row['project_id']),
      storagePath,
      originalName: String(row['original_name']),
      mimeType: mimeType === 'image/png' ? 'image/png' : 'image/jpeg',
      sizeBytes: Number(row['size_bytes']),
      displayOrder: Number(row['display_order']),
      publicUrl: client.storage.from('project-images').getPublicUrl(storagePath).data.publicUrl,
    };
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
