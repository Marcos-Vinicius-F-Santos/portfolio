import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { PortfolioLocale } from '../../portfolio/content/portfolio-content.models';
import {
  type AdminMediaImage,
  type AdminMediaProject,
  type AdminMediaSnapshot,
} from './media-management.models';
import { MediaManagementService } from './media-management.service';

const LOCALES: PortfolioLocale[] = ['pt-BR', 'en'];

@Component({
  selector: 'app-media-management',
  imports: [FormsModule],
  templateUrl: './media-management.html',
  styleUrl: './media-management.scss',
})
export class MediaManagement {
  private readonly service = inject(MediaManagementService);

  protected readonly locales = LOCALES;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly statusMessage = signal('');
  protected readonly snapshot = signal<AdminMediaSnapshot>({
    projects: [],
    skills: [],
    curricula: {},
  });
  protected selectedProjectId = '';
  protected selectedSkillId = '';
  protected selectedSkillLabel = '';
  protected newSkillLabel = '';
  protected selectedImageFile: File | null = null;
  protected selectedSkillFile: File | null = null;
  protected newSkillFile: File | null = null;

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      this.snapshot.set(await this.service.loadSnapshot());
      if (!this.selectedProjectId && this.snapshot().projects.length > 0) {
        this.selectedProjectId = this.snapshot().projects[0].id;
      }
      if (!this.selectedSkillId && this.snapshot().skills.length > 0) {
        this.selectedSkillId = this.snapshot().skills[0].id;
      }
      this.selectedSkillLabel = this.selectedSkill()?.label ?? '';
    } catch {
      this.errorMessage.set('Não foi possível carregar as mídias. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  protected selectedProject(): AdminMediaProject | undefined {
    return this.snapshot().projects.find((project) => project.id === this.selectedProjectId);
  }

  protected setProject(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedProjectId = value;
    this.clearMessages();
  }

  protected setImageFile(event: Event): void {
    this.selectedImageFile = this.fileFrom(event);
    this.clearMessages();
  }

  protected setSkillFile(event: Event): void {
    this.selectedSkillFile = this.fileFrom(event);
    this.clearMessages();
  }

  protected setNewSkillFile(event: Event): void {
    this.newSkillFile = this.fileFrom(event);
    this.clearMessages();
  }

  protected setSkill(event: Event): void {
    this.selectedSkillId = (event.target as HTMLSelectElement).value;
    this.selectedSkillLabel = this.selectedSkill()?.label ?? '';
    this.clearMessages();
  }

  protected selectedSkill() {
    return this.snapshot().skills.find((skill) => skill.id === this.selectedSkillId);
  }

  protected async uploadSkillIcon(): Promise<void> {
    if (!this.selectedSkillFile || !this.selectedSkillId) {
      this.errorMessage.set('Selecione uma habilidade e uma imagem válida.');
      return;
    }
    await this.saveSkill(() =>
      this.service.updateEditorialSkill(
        this.snapshot().revision ?? 0,
        this.selectedSkillId,
        this.selectedSkillLabel,
        this.selectedSkillFile as File,
      ),
    );
  }

  protected async saveSkillLabel(): Promise<void> {
    if (!this.selectedSkillId || !this.selectedSkillLabel.trim()) {
      this.errorMessage.set('Informe o nome da habilidade.');
      return;
    }
    await this.saveSkill(() =>
      this.service.updateEditorialSkill(
        this.snapshot().revision ?? 0,
        this.selectedSkillId,
        this.selectedSkillLabel,
      ),
    );
  }

  protected async createSkill(): Promise<void> {
    if (!this.newSkillLabel.trim() || !this.newSkillFile) {
      this.errorMessage.set('Informe o nome e selecione um ícone para a habilidade.');
      return;
    }
    await this.saveSkill(() =>
      this.service.createEditorialSkill(this.newSkillLabel, this.newSkillFile as File),
    );
    this.newSkillLabel = '';
    this.newSkillFile = null;
  }

  protected async uploadImage(): Promise<void> {
    if (!this.selectedImageFile || !this.selectedProjectId) {
      this.errorMessage.set('Selecione um projeto e uma imagem válida.');
      return;
    }
    await this.save(() =>
      this.service.uploadProjectImage(this.selectedProjectId, this.selectedImageFile as File),
    );
  }

  protected async replaceImage(image: AdminMediaImage, event: Event): Promise<void> {
    const file = this.fileFrom(event);
    if (!file) {
      this.errorMessage.set('Selecione uma imagem válida.');
      return;
    }
    await this.save(() => this.service.replaceProjectImage(image.id, file));
  }

  protected async uploadOrReplaceCurriculum(locale: PortfolioLocale, event: Event): Promise<void> {
    const file = this.fileFrom(event);
    if (!file) {
      this.errorMessage.set('Selecione um currículo PDF.');
      return;
    }
    const current = this.snapshot().curricula[locale];
    await this.save(() =>
      current
        ? this.service.replaceCurriculum(locale, file)
        : this.service.uploadCurriculum(locale, file),
    );
  }

  private async save(operation: () => Promise<{ ok: boolean; message?: string }>): Promise<void> {
    this.saving.set(true);
    this.clearMessages();
    const result = await operation();
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(result.message ?? 'Não foi possível salvar a mídia.');
      return;
    }
    this.statusMessage.set('Mídia salva e publicada.');
    this.selectedImageFile = null;
    this.selectedSkillFile = null;
    this.newSkillFile = null;
    await this.reload();
  }

  private async saveSkill(
    operation: () => Promise<{ ok: boolean; message?: string; revision?: number }>,
  ): Promise<void> {
    this.saving.set(true);
    this.clearMessages();
    const result = await operation();
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(result.message ?? 'Não foi possível salvar a habilidade.');
      return;
    }
    this.statusMessage.set('Habilidade salva no catálogo compartilhado.');
    this.selectedSkillFile = null;
    this.newSkillFile = null;
    await this.reload();
  }

  private fileFrom(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] ?? null;
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.statusMessage.set('');
  }
}
