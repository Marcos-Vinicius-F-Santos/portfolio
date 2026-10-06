import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AdminCard } from './admin-card';

@Component({
  imports: [AdminCard],
  template: '<app-admin-card variant="dashed"><h3>Conteúdo</h3></app-admin-card>',
})
class HostComponent {}

@Component({
  imports: [AdminCard],
  template: '<app-admin-card variant="image"><span>Imagem</span></app-admin-card>',
})
class ImageHostComponent {}

describe('AdminCard', () => {
  it('projects content and applies the selected variant', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.admin-card') as HTMLElement;
    expect(card.classList.contains('admin-card--dashed')).toBe(true);
    expect(card.textContent).toContain('Conteúdo');
  });

  it('applies the image variant while preserving projected content', async () => {
    await TestBed.configureTestingModule({ imports: [ImageHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ImageHostComponent);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.admin-card') as HTMLElement;
    expect(card.classList.contains('admin-card--image')).toBe(true);
    expect(card.textContent).toContain('Imagem');
  });
});
