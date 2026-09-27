import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { EditorialCommandService } from '../content-management/editorial-command.service';
import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import type { EditorialDraftV1 } from '../content-management/editorial-draft.models';

@Component({
  selector: 'app-editorial-project-detail',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="editorial-project-detail">
      <nav><a routerLink="/admin/editor">← Voltar ao editor visual</a></nav>
      @if (draft(); as value) {
        @if (project(); as item) {
          <header>
            <p>Projeto · rascunho privado</p>
            <h1>{{ field(currentProjectId(), 'name') }}</h1>
            <div class="locale-tabs">
              @for (locale of value.locales; track locale.code) {
                <button type="button" (click)="localeCode.set(locale.code)" [attr.aria-pressed]="localeCode() === locale.code">{{ locale.label }}</button>
              }
            </div>
          </header>
          <section class="fields">
            @for (fieldName of mainFields; track fieldName) {
              <label><span>{{ labels[fieldName] }}</span><textarea [ngModel]="field(currentProjectId(), fieldName)" (blur)="saveField(currentProjectId(), fieldName, $any($event.target).value)"></textarea></label>
            }
          </section>
          <section>
            <h2>Tecnologias</h2>
            <p>O catálogo é compartilhado entre projetos e Habilidades.</p>
            <div class="technology-picker">
              @for (technology of technologies(); track technology.id) {
                <label><input type="checkbox" [checked]="selectedTechnologies().has(technology.id)" (change)="toggleTechnology(currentProjectId(), technology.id, $any($event.target).checked)" />{{ technology.label }}</label>
              }
            </div>
            <p>Para criar ou editar uma habilidade, use o catálogo compartilhado no Gerenciador de mídias.</p>
            <a routerLink="/admin/media">Gerenciar catálogo de habilidades</a>
          </section>
          <section>
            <h2>Listas do detalhe</h2>
            @for (list of lists(); track list.key) {
              <label><span>{{ list.label }}</span><textarea [ngModel]="list.values.join('\\n')" (blur)="saveList(list.ids, $any($event.target).value)"></textarea></label>
            }
          </section>
          <p role="status">{{ autosave.status() }}</p>
        } @else { <p>Projeto não encontrado no rascunho.</p> }
      } @else { <p>Carregando rascunho…</p> }
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; background:#222119; color:#f7f4e8; padding:2rem; }
    nav a { color:#72d8b1; } header { max-width:70rem; margin:2rem auto; } h1 { font-size:clamp(2rem,5vw,4rem); }
    section { max-width:70rem; margin:1.5rem auto; border-top:1px solid #69675d; padding-top:1rem; }
    .fields, section:last-of-type { display:grid; gap:1rem; } label { display:grid; gap:.4rem; } textarea { min-height:5rem; padding:.7rem; background:#171711; color:inherit; border:1px solid #8d8a7d; font:inherit; }
    .locale-tabs,.technology-picker { display:flex; flex-wrap:wrap; gap:.5rem; } button { padding:.5rem .75rem; background:#2e2d25; color:inherit; border:1px solid #8d8a7d; } button[aria-pressed=true] { border-color:#72d8b1; color:#72d8b1; }
  `],
})
export class EditorialProjectDetail {
  protected readonly autosave = inject(EditorialAutosaveQueue);
  private readonly commands = inject(EditorialCommandService);
  private readonly projectId = toSignal(inject(ActivatedRoute).paramMap);
  protected readonly draft = signal<EditorialDraftV1 | null>(null);
  protected readonly localeCode = signal('pt-BR');
  protected readonly mainFields = ['name', 'description', 'problemContext', 'solution', 'role'] as const;
  protected readonly labels: Record<string, string> = { name:'Nome', description:'Descrição', problemContext:'Contexto', solution:'Solução', role:'Papel desempenhado' };
  protected readonly project = computed(() => {
    const value = this.draft(); const id = this.projectId()?.get('id');
    return id && value?.entities[id]?.kind === 'project' ? value.entities[id] : null;
  });
  protected readonly currentProjectId = computed(() => this.projectId()?.get('id') ?? '');
  protected readonly technologies = computed(() => Object.entries(this.draft()?.technologies ?? {}).map(([id, item]) => ({ id, label: item.label })));
  protected readonly selectedTechnologies = computed(() => new Set<string>(this.project()?.data['technologyIds'] as string[] ?? []));
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
    await this.autosave.enqueue({ operationId: crypto.randomUUID(), target: `${entityId}.${field}`, command: { type:'set_translation', entityId, locale:this.localeCode(), field, value } });
    await this.refresh();
  }
  protected async saveList(ids: string[], value: string): Promise<void> { const next=value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean); for (let i=0;i<Math.min(ids.length,next.length);i++) await this.saveField(ids[i], 'text', next[i]); }
  protected async toggleTechnology(entityId: string, technologyId: string, checked: boolean): Promise<void> {
    const ids = new Set(this.selectedTechnologies()); checked ? ids.add(technologyId) : ids.delete(technologyId);
    await this.autosave.enqueue({ operationId: crypto.randomUUID(), target: `${entityId}.technologyIds`, command: { type:'set_technologies', entityId, technologyIds:[...ids] } }); await this.refresh();
  }
  private async load(): Promise<void> { try { this.draft.set(await this.commands.loadDraft()); this.autosave.initialize(this.draft()!.revision); } catch { this.draft.set(null); } }
  private async refresh(): Promise<void> { this.draft.set(await this.commands.loadDraft()); }
}
