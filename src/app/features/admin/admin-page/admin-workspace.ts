import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-workspace',
  imports: [RouterLink],
  template: `
    <main>
      <h1>Área administrativa</h1>
      <p>O conteúdo é alterado pelo editor visual e publicado após revisão.</p>
      <nav aria-label="Ferramentas administrativas">
        <a routerLink="/admin/editor">Abrir edição visual</a>
        <a routerLink="/admin/media">Abrir Gerenciador de mídias</a>
      </nav>
    </main>
  `,
})
export class AdminWorkspace {}
