import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { createUuid } from '../../../../core/create-uuid';
import { EditorialCommandService } from '../../services/editorial-command.service';
import { EditorialAutosaveQueue } from '../../services/editorial-autosave-queue';
import { EditorialMediaService } from '../../services/editorial-media.service';
import type { EditorialDraftV1 } from '../../services/editorial-draft.models';

@Component({
  selector: 'app-editorial-project-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './editorial-project-detail.component.html',
  styleUrl: './editorial-project-detail.component.css',
})
export class EditorialProjectDetailComponent {
  protected readonly autosave = inject(EditorialAutosaveQueue);
  private readonly commands = inject(EditorialCommandService);
  private readonly media = inject(EditorialMediaService);
  private readonly projectId = toSignal(inject(ActivatedRoute).paramMap);
  protected readonly draft = signal<EditorialDraftV1 | null>(null);
  protected readonly localeCode = signal('pt-BR');
  private readonly uploadedImageUrls = signal<Record<string, string>>({});
  protected readonly mainFields = [
    'name',
    'description',
    'problemContext',
    'solution',
    'role',
  ] as const;
  protected readonly labels: Record<string, string> = {
    name: 'Nome',
    description: 'Descrição',
    problemContext: 'Contexto',
    solution: 'Solução',
    role: 'Papel desempenhado',
  };

  protected readonly project = computed(() => {
    const value = this.draft();
    const id = this.projectId()?.get('id');
    return id && value?.entities[id]?.kind === 'project' ? value.entities[id] : null;
  });

  protected readonly currentProjectId = computed(() => this.projectId()?.get('id') ?? '');

  protected readonly technologies = computed(() => {
    const value = this.draft();
    return Object.entries(value?.technologies ?? {}).map(([id, item]) => ({
      id,
      label: item.label,
      iconUrl: item.iconMediaId ? value?.media[item.iconMediaId]?.assetPath : undefined,
    }));
  });

  protected readonly selectedTechnologies = computed(
    () => new Set<string>((this.project()?.data['technologyIds'] as string[]) ?? []),
  );

  protected readonly images = computed(() => {
    const value = this.draft();
    const parentId = this.currentProjectId();
    if (!value || !parentId) return [];
    const uploadedUrls = this.uploadedImageUrls();
    return Object.entries(value.entities)
      .filter(([, entity]) => entity.kind === 'projectImage' && entity.parentId === parentId)
      .sort((left, right) => left[1].position - right[1].position)
      .flatMap(([id, entity]) => {
        const mediaId = String(entity.data['mediaId'] ?? '');
        const media = value.media[mediaId];
        const url = media?.assetPath ?? uploadedUrls[mediaId];
        if (!url || (media && media.mime !== 'image/png' && media.mime !== 'image/jpeg')) return [];
        return [
          {
            id,
            url,
            alt: this.field(id, 'alt') || this.field(id, 'originalName') || id,
            position: entity.position,
          },
        ];
      });
  });

  protected readonly lists = computed(() => {
    const value = this.draft();
    const parent = this.projectId()?.get('id');
    if (!value || !parent) return [];
    return ['technicalDecisions', 'results', 'learnings'].map((key) => {
      const entities = Object.entries(value.entities)
        .filter(
          ([, entity]) =>
            entity.parentId === parent &&
            entity.kind === 'listItem' &&
            entity.data['collection'] === key,
        )
        .sort((a, b) => a[1].position - b[1].position);
      return {
        key,
        label:
          key === 'technicalDecisions'
            ? 'Decisões técnicas'
            : key === 'results'
              ? 'Resultados'
              : 'Aprendizados',
        ids: entities.map(([id]) => id),
        values: entities.map(([id]) => this.field(id, 'text')),
      };
    });
  });

  constructor() {
    void this.load();
  }

  protected field(id: string, field: string): string {
    return this.draft()?.translations[this.localeCode()]?.[id]?.[field] ?? '';
  }

  protected async saveField(entityId: string, field: string, value: string): Promise<void> {
    if (this.field(entityId, field) === value) return;
    await this.autosave.enqueue({
      operationId: createUuid(),
      target: `${entityId}.${field}`,
      command: {
        type: 'set_translation',
        entityId,
        locale: this.localeCode(),
        field,
        value,
      },
    });
    await this.refresh();
  }

  protected async saveList(ids: string[], value: string): Promise<void> {
    const next = value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    for (let i = 0; i < Math.min(ids.length, next.length); i++)
      await this.saveField(ids[i], 'text', next[i]);
  }

  protected async toggleTechnology(
    entityId: string,
    technologyId: string,
    checked: boolean,
  ): Promise<void> {
    const ids = new Set(this.selectedTechnologies());
    checked ? ids.add(technologyId) : ids.delete(technologyId);
    await this.autosave.enqueue({
      operationId: createUuid(),
      target: `${entityId}.technologyIds`,
      command: { type: 'set_technologies', entityId, technologyIds: [...ids] },
    });
    await this.refresh();
  }

  protected async uploadImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const projectId = this.currentProjectId();
    if (!file || !projectId) return;
    try {
      const revision = this.autosave.confirmedRevision();
      const uploaded = await this.media.upload(revision, 'project_image', file);
      const imageId = createUuid();
      const position = this.images().length;
      const addReceipt = await this.autosave.enqueue({
        operationId: createUuid(),
        target: `${imageId}.create`,
        command: {
          type: 'add_entity',
          entityId: imageId,
          kind: 'projectImage',
          parentId: projectId,
          position,
          data: { mediaId: uploaded.mediaId },
          translations: Object.fromEntries(
            (this.draft()?.locales ?? []).map((locale) => [locale.code, { alt: file.name }]),
          ),
        },
      });
      const association = await this.media.associate(
        addReceipt.revision,
        imageId,
        uploaded.mediaId,
        'projectImage',
        position,
      );
      this.autosave.initialize(association.revision);
      const signedUrl = await this.media.createSignedUrl(uploaded.bucket, uploaded.path);
      this.uploadedImageUrls.update((urls) => ({ ...urls, [uploaded.mediaId]: signedUrl }));
      await this.refresh();
    } catch {
      // The editor keeps the rest of the draft available when one upload fails.
    } finally {
      input.value = '';
    }
  }

  private async load(): Promise<void> {
    try {
      const value = await this.commands.loadDraft();
      this.draft.set(value);
      this.autosave.initialize(value.revision);
      await this.hydrateImageUrls(value);
    } catch {
      this.draft.set(null);
    }
  }

  private async hydrateImageUrls(value: EditorialDraftV1): Promise<void> {
    const urls = { ...this.uploadedImageUrls() };
    const parentId = this.currentProjectId();
    const images = Object.values(value.entities).filter(
      (entity) => entity.kind === 'projectImage' && entity.parentId === parentId,
    );
    await Promise.all(
      images.map(async (entity) => {
        const mediaId = String(entity.data['mediaId'] ?? '');
        const media = value.media[mediaId];
        if (!media?.bucket || !media.storagePath || urls[mediaId]) return;
        try {
          urls[mediaId] = await this.media.createSignedUrl(media.bucket, media.storagePath);
        } catch {
          // Keep unavailable media out of the preview.
        }
      }),
    );
    this.uploadedImageUrls.set(urls);
  }

  private async refresh(): Promise<void> {
    const value = await this.commands.loadDraft();
    this.draft.set(value);
    await this.hydrateImageUrls(value);
  }
}
