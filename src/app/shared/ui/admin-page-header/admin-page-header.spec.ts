import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AdminPageHeader } from './admin-page-header';

@Component({
  imports: [AdminPageHeader],
  template:
    '<app-admin-page-header title="Título" description="Descrição"><button>Ação</button></app-admin-page-header>',
})
class HostComponent {}

describe('AdminPageHeader', () => {
  it('renders the page content and projected actions', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Título');
    expect(fixture.nativeElement.textContent).toContain('Descrição');
    expect(fixture.nativeElement.textContent).toContain('Ação');
    expect(fixture.nativeElement.textContent).toContain('Área administrativa');
  });
});
