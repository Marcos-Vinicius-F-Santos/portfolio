import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { EditorialCommandService } from '../content-management/editorial-command.service';
import { createUuid } from '../../../core/create-uuid';
import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialMediaService } from '../media-management/editorial-media.service';
import type { EditorialDraftV1 } from '../content-management/editorial-draft.models';

@Component({
  selector: 'app-editorial-project-detail',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="editorial-project-detail">
      <nav class="detail-nav"><a routerLink="/admin/editor"><span aria-hidden="true">←</span> Voltar ao editor visual</a></nav>
      @if (draft(); as value) {
        @if (project(); as item) {
          <header class="project-header">
            <div>
              <p class="detail-kicker">Projeto · rascunho privado</p>
              <p class="detail-subtitle">Conteúdo, tecnologias e mídia do projeto</p>
            </div>
            <h1>{{ field(currentProjectId(), 'name') }}</h1>
            <div class="locale-tabs" role="tablist" aria-label="Idioma do projeto">
              @for (locale of value.locales; track locale.code) {
                <button class="locale-tab" type="button" (click)="localeCode.set(locale.code)" [attr.aria-pressed]="localeCode() === locale.code">{{ locale.label }}</button>
              }
            </div>
          </header>
          <section class="editorial-panel fields">
            <div class="panel-heading"><div><p class="panel-kicker">Conteúdo principal</p><h2>Informações do projeto</h2></div><span class="panel-index">01</span></div>
            @for (fieldName of mainFields; track fieldName) {
              <label class="field-control"><span>{{ labels[fieldName] }}</span><textarea [ngModel]="field(currentProjectId(), fieldName)" (blur)="saveField(currentProjectId(), fieldName, $any($event.target).value)"></textarea></label>
            }
          </section>
          <section class="editorial-panel">
            <div class="panel-heading"><div><p class="panel-kicker">Catálogo compartilhado</p><h2>Tecnologias</h2></div><span class="panel-index">02</span></div>
            <p class="panel-description">Selecione as tecnologias usadas neste projeto. O catálogo é compartilhado com as habilidades.</p>
            <div class="technology-picker" role="group" aria-label="Tecnologias do projeto">
              @for (technology of technologies(); track technology.id) {
                <label class="technology-option" [class.selected]="selectedTechnologies().has(technology.id)">
                  <input type="checkbox" [checked]="selectedTechnologies().has(technology.id)" (change)="toggleTechnology(currentProjectId(), technology.id, $any($event.target).checked)" />
                  @if (technology.iconUrl) {
                    <img [src]="technology.iconUrl" [alt]="'Ícone de ' + technology.label" />
                  } @else {
                    <span class="technology-icon-placeholder" aria-hidden="true">◇</span>
                  }
                  <span>{{ technology.label }}</span>
                </label>
              }
            </div>
            @if (!technologies().length) { <p>Nenhuma tecnologia cadastrada no catálogo.</p> }
            <div class="panel-help"><span aria-hidden="true">i</span><p>Para criar ou editar uma habilidade, use o catálogo compartilhado no Gerenciador de mídias.</p><a routerLink="/admin/media">Gerenciar catálogo</a></div>
          </section>
          <section class="editorial-panel project-images">
            <div class="panel-heading"><div><p class="panel-kicker">Biblioteca do projeto</p><h2>Imagens do projeto</h2></div><span class="panel-index">03</span></div>
            <p class="panel-description">PNG ou JPG de até 1 MB. Arraste depois para ordenar; a primeira imagem publicada será usada como capa.</p>
            <label class="image-upload">
              <span class="upload-icon" aria-hidden="true">＋</span><span><strong>Adicionar imagem</strong><small>Escolher arquivo PNG ou JPG</small></span>
              <input aria-label="Adicionar imagem ao projeto" type="file" accept="image/png,image/jpeg" (change)="uploadImage($event)" />
            </label>
            @if (images().length) {
              <div class="image-list">
                @for (image of images(); track image.id) {
                  <figure class="image-card">
                    <img [src]="image.url" [alt]="image.alt" loading="lazy" />
                    <figcaption><span>{{ image.alt }}</span><small>{{ image.position === 0 ? 'Capa' : 'Imagem ' + (image.position + 1) }}</small></figcaption>
                  </figure>
                }
              </div>
            } @else {
              <div class="empty-media"><span aria-hidden="true">▧</span><p>Nenhuma imagem associada a este projeto.</p><small>Adicione a primeira imagem para começar a galeria.</small></div>
            }
          </section>
          <section class="editorial-panel">
            <div class="panel-heading"><div><p class="panel-kicker">Conteúdo aprofundado</p><h2>Listas do detalhe</h2></div><span class="panel-index">04</span></div>
            @for (list of lists(); track list.key) {
              <label class="field-control"><span>{{ list.label }}</span><textarea [ngModel]="list.values.join('\\n')" (blur)="saveList(list.ids, $any($event.target).value)"></textarea></label>
            }
          </section>
          <p class="detail-save-state" role="status"><span class="save-dot" aria-hidden="true"></span>{{ autosave.status() }}</p>
        } @else { <p>Projeto não encontrado no rascunho.</p> }
      } @else { <p>Carregando rascunho…</p> }
    </main>
  `,
  styles: [`
    :host { --editor-bg:#171711; --editor-surface:#222119; --editor-raised:#2e2d25; --editor-line:#4b4a42; --editor-line-strong:#69675d; --editor-text:#f7f4e8; --editor-muted:#aaa89d; --editor-accent:#72d8b1; --editor-danger:#ff9d91; display:block; min-height:100vh; background:var(--editor-surface); color:var(--editor-text); color-scheme:dark; }
    .editorial-project-detail { max-width:78rem; margin:0 auto; padding:1.5rem clamp(1rem,4vw,4rem) 5rem; }
    .detail-nav { margin-bottom:clamp(2rem,5vw,4.5rem); }
    .detail-nav a { display:inline-flex; align-items:center; gap:.5rem; color:var(--editor-accent); font-size:.9rem; text-decoration:none; }
    .detail-nav a:hover { text-decoration:underline; text-underline-offset:.25rem; }
    .project-header { display:grid; gap:1rem; margin-bottom:2rem; }
    .detail-kicker,.panel-kicker { margin:0; color:var(--editor-accent); font-family:Consolas,'Courier New',monospace; font-size:.7rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
    .detail-subtitle,.panel-description { margin:.3rem 0 0; color:var(--editor-muted); line-height:1.55; }
    h1 { max-width:12ch; margin:0; font-size:clamp(2.5rem,7vw,5.5rem); letter-spacing:-.08em; line-height:.9; }
    h2 { margin:.25rem 0 0; font-size:clamp(1.3rem,2vw,1.8rem); letter-spacing:-.04em; }
    .locale-tabs { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.75rem; }
    button { display:inline-flex; align-items:center; justify-content:center; min-height:2.45rem; padding:.55rem .8rem; border:1px solid var(--editor-line-strong); border-radius:.5rem; background:transparent; color:inherit; font:inherit; cursor:pointer; transition:all 160ms ease; }
    button:hover { border-color:var(--editor-accent); background:var(--editor-raised); transform:translateY(-1px); }
    button:focus-visible { outline:2px solid var(--editor-accent); outline-offset:2px; }
    button[aria-pressed=true] { border-color:var(--editor-accent); background:rgb(114 216 177 / 12%); color:var(--editor-accent); }
    .editorial-panel { display:grid; gap:1.25rem; margin:1.25rem 0; padding:clamp(1.1rem,3vw,2rem); border:1px solid var(--editor-line); border-radius:.85rem; background:color-mix(in srgb,var(--editor-bg) 72%,var(--editor-surface)); }
    .panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding-bottom:1rem; border-bottom:1px solid var(--editor-line); }
    .panel-index { color:var(--editor-line-strong); font-family:Consolas,'Courier New',monospace; font-size:.8rem; }
    .fields { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .fields .panel-heading { grid-column:1 / -1; }
    .field-control { display:grid; gap:.45rem; }
    .field-control > span { color:var(--editor-muted); font-size:.82rem; font-weight:700; }
    textarea { box-sizing:border-box; width:100%; min-height:6rem; padding:.8rem; border:1px solid var(--editor-line-strong); border-radius:.5rem; background:var(--editor-surface); color:inherit; font:inherit; line-height:1.55; resize:vertical; }
    textarea:focus { border-color:var(--editor-accent); outline:2px solid rgb(114 216 177 / 22%); }
    .technology-picker { display:grid; grid-template-columns:repeat(auto-fill,minmax(10rem,1fr)); gap:.6rem; }
    .technology-option { position:relative; display:flex; align-items:center; gap:.6rem; min-width:0; padding:.7rem; border:1px solid var(--editor-line); border-radius:.55rem; background:var(--editor-raised); cursor:pointer; transition:all 160ms ease; }
    .technology-option:hover { border-color:var(--editor-line-strong); background:#39382f; transform:translateY(-1px); }
    .technology-option.selected { border-color:var(--editor-accent); box-shadow:0 0 0 1px var(--editor-accent) inset; background:rgb(114 216 177 / 10%); }
    .technology-option input { position:absolute; opacity:0; pointer-events:none; }
    .technology-option img,.technology-icon-placeholder { flex:0 0 2rem; width:2rem; height:2rem; object-fit:contain; display:grid; place-items:center; }
    .technology-icon-placeholder { border:1px dashed var(--editor-line-strong); border-radius:.35rem; color:var(--editor-accent); }
    .panel-help { display:flex; align-items:center; flex-wrap:wrap; gap:.55rem; padding:.8rem; border:1px solid var(--editor-line); border-radius:.5rem; color:var(--editor-muted); font-size:.85rem; }
    .panel-help > span { display:grid; width:1.3rem; height:1.3rem; place-items:center; border:1px solid var(--editor-accent); border-radius:50%; color:var(--editor-accent); }
    .panel-help p { flex:1; margin:0; }
    .panel-help a { color:var(--editor-accent); }
    .project-images { gap:1rem; }
    .image-upload { display:flex; align-items:center; gap:.8rem; width:max-content; max-width:100%; padding:.9rem 1rem; border:1px dashed var(--editor-accent); border-radius:.65rem; background:rgb(114 216 177 / 5%); cursor:pointer; }
    .image-upload:hover { background:rgb(114 216 177 / 12%); }
    .image-upload strong,.image-upload small { display:block; }
    .image-upload small { margin-top:.2rem; color:var(--editor-muted); }
    .upload-icon { color:var(--editor-accent); font-size:1.6rem; line-height:1; }
    .image-upload input { position:absolute; width:1px; height:1px; opacity:0; }
    .image-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(13rem,1fr)); gap:.8rem; }
    .image-card { overflow:hidden; margin:0; border:1px solid var(--editor-line); border-radius:.65rem; background:var(--editor-bg); }
    .image-card img { display:block; width:100%; aspect-ratio:600 / 320; object-fit:cover; }
    .image-card figcaption { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.7rem; font-size:.82rem; }
    .image-card figcaption span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .image-card figcaption small { flex:0 0 auto; color:var(--editor-accent); }
    .empty-media { display:grid; justify-items:center; gap:.3rem; padding:2.25rem 1rem; border:1px dashed var(--editor-line-strong); border-radius:.65rem; color:var(--editor-muted); text-align:center; }
    .empty-media > span { color:var(--editor-accent); font-size:2rem; }
    .empty-media p,.empty-media small { margin:0; }
    .detail-save-state { display:flex; align-items:center; gap:.45rem; color:var(--editor-muted); font-size:.8rem; }
    .save-dot { width:.45rem; height:.45rem; border-radius:50%; background:var(--editor-accent); }
    @media (max-width: 700px) { .editorial-project-detail { padding-inline:1rem; } .fields { grid-template-columns:1fr; } .fields .panel-heading { grid-column:auto; } .image-upload { width:100%; box-sizing:border-box; } }
  `],
})
export class EditorialProjectDetail {
  protected readonly autosave = inject(EditorialAutosaveQueue);
  private readonly commands = inject(EditorialCommandService);
  private readonly media = inject(EditorialMediaService);
  private readonly projectId = toSignal(inject(ActivatedRoute).paramMap);
  protected readonly draft = signal<EditorialDraftV1 | null>(null);
  protected readonly localeCode = signal('pt-BR');
  private readonly uploadedImageUrls = signal<Record<string, string>>({});
  protected readonly mainFields = ['name', 'description', 'problemContext', 'solution', 'role'] as const;
  protected readonly labels: Record<string, string> = { name:'Nome', description:'Descrição', problemContext:'Contexto', solution:'Solução', role:'Papel desempenhado' };
  protected readonly project = computed(() => {
    const value = this.draft(); const id = this.projectId()?.get('id');
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
  protected readonly selectedTechnologies = computed(() => new Set<string>(this.project()?.data['technologyIds'] as string[] ?? []));
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
        return [{
          id,
          url,
          alt: this.field(id, 'alt') || this.field(id, 'originalName') || id,
          position: entity.position,
        }];
      });
  });
  protected readonly lists = computed(() => {
    const value = this.draft(); const parent = this.projectId()?.get('id'); if (!value || !parent) return [];
    return ['technicalDecisions','results','learnings'].map((key) => {
      const entities = Object.entries(value.entities).filter(([, entity]) => entity.parentId === parent && entity.kind === 'listItem' && entity.data['collection'] === key).sort((a,b) => a[1].position-b[1].position);
      return { key, label: key === 'technicalDecisions' ? 'Decisões técnicas' : key === 'results' ? 'Resultados' : 'Aprendizados', ids: entities.map(([id]) => id), values: entities.map(([id]) => this.field(id,'text')) };
    });
  });
  constructor() { void this.load(); }
  protected field(id: string, field: string): string { return this.draft()?.translations[this.localeCode()]?.[id]?.[field] ?? ''; }
  protected async saveField(entityId: string, field: string, value: string): Promise<void> {
    if (this.field(entityId, field) === value) return;
    await this.autosave.enqueue({ operationId: createUuid(), target: `${entityId}.${field}`, command: { type:'set_translation', entityId, locale:this.localeCode(), field, value } });
    await this.refresh();
  }
  protected async saveList(ids: string[], value: string): Promise<void> { const next=value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean); for (let i=0;i<Math.min(ids.length,next.length);i++) await this.saveField(ids[i], 'text', next[i]); }
  protected async toggleTechnology(entityId: string, technologyId: string, checked: boolean): Promise<void> {
    const ids = new Set(this.selectedTechnologies()); checked ? ids.add(technologyId) : ids.delete(technologyId);
    await this.autosave.enqueue({ operationId: createUuid(), target: `${entityId}.technologyIds`, command: { type:'set_technologies', entityId, technologyIds:[...ids] } }); await this.refresh();
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
    } catch { this.draft.set(null); }
  }
  private async hydrateImageUrls(value: EditorialDraftV1): Promise<void> {
    const urls = { ...this.uploadedImageUrls() };
    const parentId = this.currentProjectId();
    const images = Object.values(value.entities).filter(
      (entity) => entity.kind === 'projectImage' && entity.parentId === parentId,
    );
    await Promise.all(images.map(async (entity) => {
      const mediaId = String(entity.data['mediaId'] ?? '');
      const media = value.media[mediaId];
      if (!media?.bucket || !media.storagePath || urls[mediaId]) return;
      try {
        urls[mediaId] = await this.media.createSignedUrl(media.bucket, media.storagePath);
      } catch {
        // Keep unavailable media out of the preview.
      }
    }));
    this.uploadedImageUrls.set(urls);
  }
  private async refresh(): Promise<void> {
    const value = await this.commands.loadDraft();
    this.draft.set(value);
    await this.hydrateImageUrls(value);
  }
}
