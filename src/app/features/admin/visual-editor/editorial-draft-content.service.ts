import { Injectable, computed, signal } from '@angular/core';

import type {
  EditorialDraftCommand,
  EditorialDraftV1,
} from '../content-management/editorial-draft.models';
import type { EditorialEntityKind } from '../../portfolio/content/editorial-snapshot.models';
import type {
  PortfolioAcademicEntry,
  PortfolioContactLink,
  PortfolioExperience,
  PortfolioLocale,
  PortfolioProject,
  PortfolioSkillCategory,
} from '../../portfolio/content/portfolio-content.models';

@Injectable()
export class EditorialDraftContentService {
  private readonly draftState = signal<EditorialDraftV1 | null>(null);
  private readonly contentRevisionState = signal(0);
  readonly draft = this.draftState.asReadonly();
  readonly editorialContentRevision = this.contentRevisionState.asReadonly();
  private readonly localeState = signal<PortfolioLocale>('pt-BR');
  readonly selectedLocale = this.localeState.asReadonly();
  private resolveReady: () => void = () => undefined;
  private readonly readyPromise = new Promise<void>((resolve) => (this.resolveReady = resolve));
  readonly remoteCopy = computed(() => {
    const draft = this.draftState();
    const values = draft?.translations[this.localeState()] ?? {};
    return Object.fromEntries(
      Object.entries(values)
        .filter(([id]) => id.startsWith('copy-'))
        .map(([id, fields]) => [id.slice(5), fields['text'] ?? '']),
    );
  });
  readonly editorialSectionOrder = computed(
    () =>
      this.draftState()
        ?.sections.slice()
        .sort((a, b) => a.position - b.position)
        .map((section) => section.id) ?? [],
  );
  readonly lastError = signal<Error | null>(null);

  setDraft(draft: EditorialDraftV1): void {
    this.draftState.set(draft);
    this.contentRevisionState.update((revision) => revision + 1);
    this.resolveReady();
  }
  async listSectionOrder(): Promise<string[]> {
    await this.readyPromise;
    return this.requireDraft()
      .sections.slice()
      .sort((a, b) => a.position - b.position)
      .map((section) => section.id);
  }
  reorderSections(sectionIds: readonly string[]): void {
    const draft = this.requireDraft();
    const positions = new Map(sectionIds.map((id, index) => [id, index]));
    this.draftState.set({
      ...draft,
      sections: draft.sections
        .map((section) => ({ ...section, position: positions.get(section.id) ?? section.position }))
        .sort((a, b) => a.position - b.position),
    });
  }
  reorderCollection(
    kind: string,
    parentId: string | undefined,
    visibleIds: readonly string[],
  ): string[] {
    const draft = this.requireDraft();
    const collection = Object.entries(draft.entities)
      .filter(([, entity]) => entity.kind === kind && entity.parentId === parentId)
      .sort((a, b) => a[1].position - b[1].position);
    const visible = new Set(visibleIds);
    if (
      visible.size !== visibleIds.length ||
      visibleIds.some((id) => !collection.some(([candidate]) => candidate === id))
    ) {
      throw new Error('Invalid visible editorial collection');
    }
    let nextVisible = 0;
    const completeOrder = collection.map(([id]) =>
      visible.has(id) ? visibleIds[nextVisible++] : id,
    );
    const positions = new Map(completeOrder.map((id, index) => [id, index]));
    this.draftState.set({
      ...draft,
      entities: Object.fromEntries(
        Object.entries(draft.entities).map(([id, entity]) => [
          id,
          positions.has(id) ? { ...entity, position: positions.get(id)! } : entity,
        ]),
      ),
    });
    this.contentRevisionState.update((revision) => revision + 1);
    return completeOrder;
  }
  addEntity(command: Extract<EditorialDraftCommand, { type: 'add_entity' }>): void {
    const draft = this.requireDraft();
    this.draftState.set({
      ...draft,
      entities: {
        ...draft.entities,
        [command.entityId]: {
          kind: command.kind,
          parentId: command.parentId,
          position: command.position,
          data: command.data,
        },
      },
      translations: Object.fromEntries(
        Object.entries(draft.translations).map(([locale, values]) => [
          locale,
          command.translations[locale]
            ? { ...values, [command.entityId]: command.translations[locale] }
            : values,
        ]),
      ),
    });
    this.contentRevisionState.update((revision) => revision + 1);
  }
  removeEntity(entityId: string): {
    dependentCount: number;
    restore: readonly EditorialDraftCommand[];
  } {
    const draft = this.requireDraft();
    const ids = this.descendantIds(draft, entityId);
    const restore: EditorialDraftCommand[] = [];
    for (const id of ids) {
      const entity = draft.entities[id];
      restore.push({
        type: 'add_entity',
        entityId: id,
        kind: entity.kind,
        parentId: entity.parentId,
        position: entity.position,
        data: { ...entity.data } as Record<string, string | boolean | null>,
        translations: {},
      });
      for (const [locale, values] of Object.entries(draft.translations)) {
        for (const [field, value] of Object.entries(values[id] ?? {})) {
          restore.push({ type: 'set_translation', entityId: id, locale, field, value });
        }
      }
    }
    const removed = new Set(ids);
    this.draftState.set({
      ...draft,
      entities: Object.fromEntries(
        Object.entries(draft.entities).filter(([id]) => !removed.has(id)),
      ),
      translations: Object.fromEntries(
        Object.entries(draft.translations).map(([locale, values]) => [
          locale,
          Object.fromEntries(Object.entries(values).filter(([id]) => !removed.has(id))),
        ]),
      ),
    });
    this.contentRevisionState.update((revision) => revision + 1);
    return { dependentCount: ids.length - 1, restore };
  }
  dependencyCount(entityId: string): number {
    return this.descendantIds(this.requireDraft(), entityId).length - 1;
  }
  nextPosition(kind: EditorialEntityKind, parentId?: string): number {
    const positions = Object.values(this.requireDraft().entities)
      .filter((entity) => entity.kind === kind && entity.parentId === parentId)
      .map((entity) => entity.position);
    return positions.length ? Math.max(...positions) + 1 : 0;
  }
  isAvailable(): boolean {
    return Boolean(this.draftState());
  }
  async loadCopy(locale: PortfolioLocale): Promise<void> {
    this.localeState.set(locale);
  }
  chooseLocale(locale: string): void {
    if (locale === 'pt-BR' || locale === 'en') this.localeState.set(locale);
  }
  async listExperiences(locale: PortfolioLocale): Promise<PortfolioExperience[]> {
    await this.readyPromise;
    const draft = this.requireDraft();
    return this.entities('experience').map(([id, entity]) => ({
      id,
      startDate: String(entity.data['startDate'] ?? ''),
      endDate: typeof entity.data['endDate'] === 'string' ? entity.data['endDate'] : null,
      displayOrder: entity.position,
      title: this.text(draft, locale, id, 'title'),
      context: this.text(draft, locale, id, 'context'),
      responsibilities: this.list(draft, locale, id, 'responsibilities'),
      technicalDecisions: this.list(draft, locale, id, 'technicalDecisions'),
      results: this.list(draft, locale, id, 'results'),
      editorialListIds: this.listIds(draft, id),
    }));
  }
  async listProjects(locale: PortfolioLocale): Promise<PortfolioProject[]> {
    await this.readyPromise;
    const draft = this.requireDraft();
    return this.entities('project').map(([id, entity]) => ({
      id,
      displayOrder: entity.position,
      type: entity.data['type'] === 'professional' ? 'professional' : 'personal',
      locale,
      name: this.text(draft, locale, id, 'name'),
      description: this.text(draft, locale, id, 'description'),
      problemContext: this.text(draft, locale, id, 'problemContext'),
      solution: this.text(draft, locale, id, 'solution'),
      role: this.text(draft, locale, id, 'role'),
      technicalDecisions: this.list(draft, locale, id, 'technicalDecisions'),
      technologyIds: Array.isArray(entity.data['technologyIds'])
        ? entity.data['technologyIds'].map(String)
        : [],
      technologies: Array.isArray(entity.data['technologyIds'])
        ? entity.data['technologyIds'].map(
            (technologyId) =>
              draft.technologies[String(technologyId)]?.label ?? String(technologyId),
          )
        : [],
      results: this.list(draft, locale, id, 'results'),
      learnings: this.list(draft, locale, id, 'learnings'),
      links: [],
      images: [],
      editorialListIds: this.listIds(draft, id),
    }));
  }
  async listSkillCategories(locale: PortfolioLocale): Promise<PortfolioSkillCategory[]> {
    await this.readyPromise;
    const draft = this.requireDraft();
    return this.entities('skillCategory').map(([id, category]) => ({
      id,
      labelKey: '',
      label: this.text(draft, locale, id, 'label'),
      displayOrder: category.position,
      skills: this.entities('skill')
        .filter(([, skill]) => skill.parentId === id)
        .map(([skillId, skill]) => ({
          id: skillId.replace(/^skill-/, ''),
          name: this.text(draft, locale, skillId, 'name'),
          iconUrl: this.skillIconUrl(draft, String(skill.data['technologyId'] ?? '')),
        })),
    }));
  }
  async listAcademicEntries(locale: PortfolioLocale): Promise<PortfolioAcademicEntry[]> {
    await this.readyPromise;
    const draft = this.requireDraft();
    return this.entities('academic').map(([id, entity]) => ({
      id,
      nameKey: '',
      name: this.text(draft, locale, id, 'name'),
      institution: this.text(draft, locale, id, 'institution'),
      startDate: String(entity.data['startDate'] ?? ''),
      endDate: typeof entity.data['endDate'] === 'string' ? entity.data['endDate'] : null,
      isCurrent: entity.data['isCurrent'] === true,
      competencies: this.list(draft, locale, id, 'competencies'),
      studiedContent: this.list(draft, locale, id, 'studiedContent'),
      displayOrder: entity.position,
      editorialListIds: this.listIds(draft, id),
    }));
  }
  async listContactLinks(locale: PortfolioLocale): Promise<PortfolioContactLink[]> {
    await this.readyPromise;
    const draft = this.requireDraft();
    return this.entities('contact').map(([id, entity]) => ({
      id,
      labelKey: '',
      label: this.text(draft, locale, id, 'label'),
      href: String(entity.data['href'] ?? ''),
      symbol: entity.data['symbol'] as PortfolioContactLink['symbol'],
      iconPath: `/assets/contact/${String(entity.data['symbol'])}.svg`,
      displayOrder: entity.position,
    }));
  }
  async getCurriculum(): Promise<null> {
    return null;
  }

  private requireDraft(): EditorialDraftV1 {
    const draft = this.draftState();
    if (!draft) throw new Error('Editorial draft is not loaded');
    return draft;
  }
  private entities(kind: string) {
    return Object.entries(this.requireDraft().entities)
      .filter(([, entity]) => entity.kind === kind)
      .sort((a, b) => a[1].position - b[1].position);
  }
  private text(draft: EditorialDraftV1, locale: string, id: string, field: string): string {
    return (
      draft.translations[locale]?.[id]?.[field] ?? draft.translations['pt-BR']?.[id]?.[field] ?? ''
    );
  }

  private skillIconUrl(draft: EditorialDraftV1, technologyId: string): string | undefined {
    const iconMediaId = draft.technologies[technologyId]?.iconMediaId;
    if (!iconMediaId) return undefined;
    return draft.media[iconMediaId]?.assetPath;
  }
  private list(
    draft: EditorialDraftV1,
    locale: string,
    parentId: string,
    collection: string,
  ): string[] {
    return Object.entries(draft.entities)
      .filter(
        ([, entity]) =>
          entity.kind === 'listItem' &&
          entity.parentId === parentId &&
          entity.data['collection'] === collection,
      )
      .sort((a, b) => a[1].position - b[1].position)
      .map(([id]) => this.text(draft, locale, id, 'text'));
  }
  private listIds(draft: EditorialDraftV1, parentId: string): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    Object.entries(draft.entities)
      .filter(([, entity]) => entity.kind === 'listItem' && entity.parentId === parentId)
      .sort((a, b) => a[1].position - b[1].position)
      .forEach(([id, entity]) => {
        const collection = String(entity.data['collection'] ?? '');
        if (collection) (result[collection] ??= []).push(id);
      });
    return result;
  }
  private descendantIds(draft: EditorialDraftV1, rootId: string): string[] {
    const result = [rootId];
    for (const id of result) {
      Object.entries(draft.entities)
        .filter(([, entity]) => entity.parentId === id)
        .forEach(([childId]) => result.push(childId));
    }
    return result;
  }
}
