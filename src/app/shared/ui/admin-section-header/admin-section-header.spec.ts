import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AdminSectionHeader } from './admin-section-header';

@Component({
  imports: [AdminSectionHeader],
  template:
    '<app-admin-section-header title="Seção" description="Detalhe"><button>Ação</button></app-admin-section-header>',
})
class HostComponent {}

@Component({
  imports: [AdminSectionHeader],
  template: '<app-admin-section-header title="Sem detalhe" />',
})
class WithoutDescriptionHostComponent {}

describe('AdminSectionHeader', () => {
  it('renders the optional description and projected actions', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Seção');
    expect(fixture.nativeElement.textContent).toContain('Detalhe');
    expect(fixture.nativeElement.textContent).toContain('Ação');
  });

  it('does not render an empty description paragraph', async () => {
    await TestBed.configureTestingModule({
      imports: [WithoutDescriptionHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(WithoutDescriptionHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });
});
