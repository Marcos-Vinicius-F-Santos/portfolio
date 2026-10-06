import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { EditorialCommandService } from '../../services/editorial-command.service';
import { EditorialAutosaveQueue } from '../../services/editorial-autosave-queue';
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
