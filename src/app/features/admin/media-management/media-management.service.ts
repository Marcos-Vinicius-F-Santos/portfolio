import { Injectable, inject } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import type { PortfolioLocale } from '../../portfolio/content/portfolio-content.models';
import {
  type AdminMediaCurriculum,
  type AdminMediaImage,
  type AdminMediaProject,
  type AdminMediaSkill,
  type AdminMediaSnapshot,
  type MediaOperationResult,
  type SkillOperationResult,
} from './media-management.models';
import { EditorialMediaService } from './editorial-media.service';

const PROJECT_IMAGES_BUCKET = 'project-images';
const SKILL_ICONS_BUCKET = 'skill-icons';
const CURRICULA_BUCKET = 'curricula';
const MAX_IMAGE_SIZE = 1_048_576;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);
const SKILL_ICON_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);
const LOCALES = new Set<PortfolioLocale>(['pt-BR', 'en']);

type Row = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class MediaManagementService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly editorialMedia = inject(EditorialMediaService, { optional: true });

  async loadSnapshot(): Promise<AdminMediaSnapshot> {
    const client = this.requireClient();
    const [
      projectsResult,
      imagesResult,
      curriculaResult,
      translationsResult,
      editorialDraftResult,
      skillCatalogResult,
    ] = await Promise.all([
      client.from('portfolio_projects').select('id, display_order').order('display_order'),
      client
        .from('portfolio_project_images')
        .select('*')
        .order('display_order', { ascending: true }),
      client
        .from('portfolio_files')
        .select('*')
        .eq('file_type', 'curriculum')
        .order('locale', { ascending: true }),
      client
        .from('portfolio_project_translations')
        .select('project_id, locale, name')
        .in('locale', ['pt-BR', 'en']),
      client.rpc('get_editor_draft'),
      client.rpc('get_editorial_technology_catalog'),
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (imagesResult.error) throw imagesResult.error;
    if (curriculaResult.error) throw curriculaResult.error;
    if (translationsResult.error) throw translationsResult.error;
    if (editorialDraftResult.error) throw editorialDraftResult.error;
    if (skillCatalogResult.error) throw skillCatalogResult.error;

    const translations = new Map<string, Row[]>();
    for (const row of (translationsResult.data ?? []) as Row[]) {
      const projectId = String(row['project_id']);
      translations.set(projectId, [...(translations.get(projectId) ?? []), row]);
    }

    const imagesByProject = new Map<string, AdminMediaImage[]>();
    for (const row of (imagesResult.data ?? []) as Row[]) {
      const image = this.mapImage(client, row);
      imagesByProject.set(image.projectId, [
        ...(imagesByProject.get(image.projectId) ?? []),
        image,
      ]);
    }

    const projects = ((projectsResult.data ?? []) as Row[]).map((row) => {
      const id = String(row['id']);
      const localized = translations.get(id) ?? [];
      const name = localized.find((item) => item['locale'] === 'pt-BR')?.['name'];
      const englishName = localized.find((item) => item['locale'] === 'en')?.['name'];
      return {
        id,
        label: String(name ?? englishName ?? id),
        images: imagesByProject.get(id) ?? [],
      } satisfies AdminMediaProject;
    });

    const curricula: Partial<Record<PortfolioLocale, AdminMediaCurriculum>> = {};
    for (const row of (curriculaResult.data ?? []) as Row[]) {
      const locale = row['locale'];
      if (locale !== 'pt-BR' && locale !== 'en') continue;
      curricula[locale] = this.mapCurriculum(client, row);
    }

    const draft = (editorialDraftResult.data ?? {}) as Row;
    const catalog = Array.isArray(skillCatalogResult.data)
      ? (skillCatalogResult.data as Row[])
      : [];
    const skills = await Promise.all(catalog.map((row) => this.mapEditorialSkill(client, row)));

    return { projects, skills, curricula, revision: Number(draft['revision'] ?? 0) };
  }

  async createEditorialSkill(label: string, file: File): Promise<SkillOperationResult> {
    return this.runSkillOperation('skill creation', async (client) => {
      const normalizedLabel = label.trim();
      if (!normalizedLabel) throw new Error('Informe o nome da habilidade.');
      validateSkillIcon(file);
      const draft = await this.loadEditorialDraft(client);
      const id = slugify(normalizedLabel);
      if (!id || Object.prototype.hasOwnProperty.call(draft['technologies'] ?? {}, id)) {
        throw new Error('Já existe uma habilidade com esse nome.');
      }
      const uploaded = await this.uploadEditorialSkillIcon(draft.revision, file);
      const technologyReceipt = await this.callReceipt(client, 'create_editorial_technology', {
        expected_revision: draft.revision,
        operation_id: crypto.randomUUID(),
        technology_id: id,
        technology_label: normalizedLabel,
        icon_media_id: uploaded.mediaId,
      });
      return technologyReceipt.revision;
    });
  }

  async updateEditorialSkill(
    expectedRevision: number,
    skillId: string,
    label: string,
    file?: File,
  ): Promise<SkillOperationResult> {
    return this.runSkillOperation('skill update', async (client) => {
      const normalizedLabel = label.trim();
      if (!normalizedLabel || !skillId) throw new Error('Informe o nome da habilidade.');
      const draft = await this.loadEditorialDraft(client);
      if (draft.revision !== expectedRevision) throw new Error('O rascunho mudou. Recarregue a tela.');
      const existing = (draft['technologies'] as Row | undefined)?.[skillId];
      if (!existing) throw new Error('Habilidade não encontrada.');
      const currentIconMediaId = String((existing as Row)['iconMediaId'] ?? '');
      let iconMediaId = isUuid(currentIconMediaId) ? currentIconMediaId : null;
      if (file) {
        validateSkillIcon(file);
        iconMediaId = (await this.uploadEditorialSkillIcon(expectedRevision, file)).mediaId;
      }
      const receipt = await this.callReceipt(client, 'update_editorial_technology', {
        expected_revision: expectedRevision,
        operation_id: crypto.randomUUID(),
        technology_id: skillId,
        technology_label: normalizedLabel,
        icon_media_id: iconMediaId,
      });
      return receipt.revision;
    });
  }

  async uploadProjectImage(projectId: string, file: File): Promise<MediaOperationResult> {
    return this.run('project image upload', async (client) => {
      this.validateProjectId(projectId);
      validateImage(file);
      await this.assertProjectExists(client, projectId);

      const storagePath = createStoragePath(projectId, file.name);
      await this.uploadObject(client, PROJECT_IMAGES_BUCKET, storagePath, file);
      try {
        const { error } = await client.from('portfolio_project_images').insert({
          project_id: projectId,
          storage_path: storagePath,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });
        if (error) throw error;
      } catch (error) {
        await this.removeObjectSafely(client, PROJECT_IMAGES_BUCKET, storagePath);
        throw error;
      }
    });
  }

  async replaceProjectImage(imageId: string, file: File): Promise<MediaOperationResult> {
    return this.run('project image replacement', async (client) => {
      this.validateProjectId(imageId);
      validateImage(file);
      const storagePath = createStoragePath('project-images', file.name);
      await this.uploadObject(client, PROJECT_IMAGES_BUCKET, storagePath, file);

      let oldStoragePath: string;
      try {
        const { data, error } = await client.rpc('replace_portfolio_project_image', {
          p_image_id: imageId,
          p_storage_path: storagePath,
          p_original_name: file.name,
          p_mime_type: file.type,
          p_size_bytes: file.size,
        });
        if (error || typeof data !== 'string' || !data) {
          throw error ?? new Error('Project image replacement did not return the old path');
        }
        oldStoragePath = data;
      } catch (error) {
        await this.removeObjectSafely(client, PROJECT_IMAGES_BUCKET, storagePath);
        throw error;
      }

      await this.removeRequiredObject(client, PROJECT_IMAGES_BUCKET, oldStoragePath);
    });
  }

  async replaceSkillIcon(skillId: string, file: File): Promise<MediaOperationResult> {
    return this.run('skill icon replacement', async (client) => {
      this.validateProjectId(skillId);
      validateSkillIcon(file);
      const storagePath = createStoragePath(skillId, file.name);
      await this.uploadObject(client, SKILL_ICONS_BUCKET, storagePath, file);

      let oldStoragePath: string | null = null;
      try {
        const { data, error } = await client.rpc('replace_portfolio_skill_icon', {
          p_skill_id: skillId,
          p_icon_url: '',
          p_storage_path: storagePath,
          p_original_name: file.name,
          p_mime_type: file.type,
          p_size_bytes: file.size,
        });
        if (error) throw error;
        oldStoragePath = typeof data === 'string' && data ? data : null;
      } catch (error) {
        await this.removeObjectSafely(client, SKILL_ICONS_BUCKET, storagePath);
        throw error;
      }

      if (oldStoragePath) {
        await this.removeRequiredObject(client, SKILL_ICONS_BUCKET, oldStoragePath);
      }
    });
  }

  async uploadCurriculum(locale: PortfolioLocale, file: File): Promise<MediaOperationResult> {
    return this.run('curriculum upload', async (client) => {
      validateLocale(locale);
      validateCurriculum(file);
      const storagePath = createStoragePath(locale, file.name);
      await this.uploadObject(client, CURRICULA_BUCKET, storagePath, file);
      try {
        const { error } = await client.from('portfolio_files').insert({
          file_type: 'curriculum',
          locale,
          storage_path: storagePath,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });
        if (error) throw error;
      } catch (error) {
        await this.removeObjectSafely(client, CURRICULA_BUCKET, storagePath);
        throw error;
      }
    });
  }

  async replaceCurriculum(locale: PortfolioLocale, file: File): Promise<MediaOperationResult> {
    return this.run('curriculum replacement', async (client) => {
      validateLocale(locale);
      validateCurriculum(file);
      const storagePath = createStoragePath(locale, file.name);
      await this.uploadObject(client, CURRICULA_BUCKET, storagePath, file);

      let oldStoragePath: string;
      try {
        const { data, error } = await client.rpc('replace_portfolio_curriculum', {
          p_locale: locale,
          p_storage_path: storagePath,
          p_original_name: file.name,
          p_mime_type: file.type,
          p_size_bytes: file.size,
        });
        if (error || typeof data !== 'string' || !data) {
          throw error ?? new Error('Curriculum replacement did not return the old path');
        }
        oldStoragePath = data;
      } catch (error) {
        await this.removeObjectSafely(client, CURRICULA_BUCKET, storagePath);
        throw error;
      }

      await this.removeRequiredObject(client, CURRICULA_BUCKET, oldStoragePath);
    });
  }

  private async assertProjectExists(client: SupabaseClient, projectId: string): Promise<void> {
    const { data, error } = await client
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Project not found');
  }

  private async uploadObject(
    client: SupabaseClient,
    bucket: string,
    storagePath: string,
    file: File,
  ): Promise<void> {
    const { error } = await client.storage.from(bucket).upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
  }

  private async removeRequiredObject(
    client: SupabaseClient,
    bucket: string,
    storagePath: string,
  ): Promise<void> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { error } = await client.storage.from(bucket).remove([storagePath]);
      if (!error) return;
      lastError = error;
    }
    throw lastError ?? new Error('Storage object removal failed');
  }

  private async removeObjectSafely(
    client: SupabaseClient,
    bucket: string,
    storagePath: string,
  ): Promise<void> {
    try {
      await this.removeRequiredObject(client, bucket, storagePath);
    } catch (cleanupError) {
      console.error('[portfolio-media-cleanup-failed]', { bucket, storagePath, cleanupError });
    }
  }

  private mapImage(client: SupabaseClient, row: Row): AdminMediaImage {
    const storagePath = String(row['storage_path'] ?? '');
    const mimeType = row['mime_type'] === 'image/png' ? 'image/png' : 'image/jpeg';
    return {
      id: String(row['id']),
      projectId: String(row['project_id']),
      storagePath,
      originalName: String(row['original_name'] ?? ''),
      mimeType,
      sizeBytes: Number(row['size_bytes'] ?? 0),
      displayOrder: Number(row['display_order'] ?? 0),
      publicUrl: client.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(storagePath).data
        .publicUrl,
    };
  }

  private mapCurriculum(client: SupabaseClient, row: Row): AdminMediaCurriculum {
    const locale = row['locale'] === 'en' ? 'en' : 'pt-BR';
    const storagePath = String(row['storage_path'] ?? '');
    return {
      id: String(row['id']),
      locale,
      storagePath,
      originalName: String(row['original_name'] ?? ''),
      sizeBytes: Number(row['size_bytes'] ?? 0),
      publicUrl: client.storage.from(CURRICULA_BUCKET).getPublicUrl(storagePath).data.publicUrl,
    };
  }

  private async mapEditorialSkill(client: SupabaseClient, row: Row): Promise<AdminMediaSkill> {
    const iconBucket = String(row['iconBucket'] ?? '');
    const iconStoragePath = String(row['iconPath'] ?? '');
    let iconPublicUrl = String(row['bundledAsset'] ?? '');
    if (iconBucket && iconStoragePath) {
      const result = await client.storage.from(iconBucket).createSignedUrl(iconStoragePath, 3600);
      if (!result.error && result.data?.signedUrl) iconPublicUrl = result.data.signedUrl;
    }
    return {
      id: String(row['id']),
      label: String(row['label'] ?? row['id']),
      iconUrl: '',
      iconStoragePath,
      iconPublicUrl,
      iconMediaId: String(row['iconMediaId'] ?? '') || undefined,
      bundledAsset: String(row['bundledAsset'] ?? '') || undefined,
      iconMime: String(row['iconMime'] ?? '') || undefined,
    };
  }

  private async loadEditorialDraft(client: SupabaseClient): Promise<Row & { revision: number }> {
    const { data, error } = await client.rpc('get_editor_draft');
    if (error || !data || typeof data !== 'object') throw error ?? new Error('Draft unavailable');
    return data as Row & { revision: number };
  }

  private async uploadEditorialSkillIcon(
    expectedRevision: number,
    file: File,
  ): Promise<{ mediaId: string }> {
    if (!this.editorialMedia) throw new Error('Fluxo editorial de mídia indisponível.');
    const result = await this.editorialMedia.upload(expectedRevision, 'skill_icon', file);
    return { mediaId: result.mediaId };
  }

  private async callReceipt(
    client: SupabaseClient,
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<{ revision: number }> {
    const { data, error } = await client.rpc(functionName, args);
    const result = data as Row | null;
    if (error || !result || typeof result['revision'] !== 'number')
      throw error ?? new Error('Editorial command failed');
    return { revision: Number(result['revision']) };
  }

  private async runSkillOperation(
    label: string,
    operation: (client: SupabaseClient) => Promise<number>,
  ): Promise<SkillOperationResult> {
    try {
      const revision = await operation(this.requireClient());
      return { ok: true, revision };
    } catch (error) {
      console.error('[portfolio-skill-operation-failed]', { label, error });
      return { ok: false, message: mediaErrorMessage(error) };
    }
  }

  private async run(
    label: string,
    operation: (client: SupabaseClient) => Promise<void>,
  ): Promise<MediaOperationResult> {
    try {
      await operation(this.requireClient());
      return { ok: true };
    } catch (error) {
      console.error('[portfolio-media-operation-failed]', { label, error });
      return { ok: false, message: mediaErrorMessage(error) };
    }
  }

  private requireClient(): SupabaseClient {
    if (!this.client) throw new Error('Supabase client unavailable');
    return this.client;
  }

  private validateProjectId(value: string): void {
    if (!value.trim()) throw new Error('Project or image identifier is required');
  }
}

function validateImage(file: File): void {
  if (!IMAGE_TYPES.has(file.type)) throw new Error('Invalid project image type');
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) throw new Error('Invalid project image size');
}

function validateSkillIcon(file: File): void {
  if (!SKILL_ICON_TYPES.has(file.type)) throw new Error('Invalid skill icon type');
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) throw new Error('Invalid skill icon size');
}

function validateCurriculum(file: File): void {
  if (file.type !== 'application/pdf') throw new Error('Invalid curriculum type');
  if (file.size <= 0) throw new Error('Invalid curriculum size');
}

function validateLocale(locale: PortfolioLocale): void {
  if (!LOCALES.has(locale)) throw new Error('Invalid curriculum locale');
}

function createStoragePath(scope: string, originalName: string): string {
  const normalized = originalName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${scope}/${randomId}-${normalized || 'file'}`;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mediaErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes('Invalid') ||
      error.message.includes('Informe') ||
      error.message.includes('Já existe') ||
      error.message.includes('não encontrada') ||
      error.message.includes('rascunho mudou')
    )
      return error.message;
    if (error.message.includes('Project not found')) return 'Projeto não encontrado.';
  }
  return 'Não foi possível salvar a mídia. Tente novamente.';
}
