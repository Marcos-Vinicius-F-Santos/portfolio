import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AdminFeedback } from './admin-feedback';

@Component({
  imports: [AdminFeedback],
  template: '<app-admin-feedback variant="error" message="Falha" testId="feedback" />',
})
class HostComponent {}

@Component({
  imports: [AdminFeedback],
  template: '<app-admin-feedback variant="success" message="Salvo" />',
})
class SuccessHostComponent {}

describe('AdminFeedback', () => {
  it('keeps the error accessibility semantics and test id', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.admin-feedback') as HTMLElement;
    expect(feedback.getAttribute('role')).toBe('alert');
    expect(feedback.getAttribute('data-testid')).toBe('feedback');
    expect(feedback.textContent).toContain('Falha');
  });

  it('renders a successful status with status semantics', async () => {
    await TestBed.configureTestingModule({ imports: [SuccessHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SuccessHostComponent);
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.admin-feedback') as HTMLElement;
    expect(feedback.classList.contains('admin-feedback--success')).toBe(true);
    expect(feedback.getAttribute('role')).toBe('status');
    expect(feedback.textContent).toContain('Salvo');
  });
});
