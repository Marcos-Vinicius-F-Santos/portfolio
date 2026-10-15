import { describe, expect, it } from 'vitest';
import { GENERIC_EDITORIAL_SNAPSHOT as snapshot } from './editorial-snapshot.fixture';
import {
  snapshotToProfileIdentity,
  snapshotToAcademicEntries,
  snapshotToContactLinks,
  snapshotToCopy,
  snapshotToExperiences,
  snapshotToProjects,
  snapshotToSectionOrder,
  snapshotToSkillCategories,
} from './editorial-snapshot-adapter';

describe('editorial-snapshot-adapter', () => {
  it('resolves the profile identity and managed image through the instance storage', () => {
    expect(
      snapshotToProfileIdentity(snapshot, (bucket, path) => `https://storage.example/${bucket}/${path}`),
    ).toEqual({
      profileId: 'profile-generic',
      mediaId: 'profile-image',
      imageUrl: 'https://storage.example/editorial-profile-images/profile/default.png',
    });
  });

  it('projects copy texts correctly for pt-BR and en', () => {
    const ptCopy = snapshotToCopy(snapshot, 'pt-BR');
    expect(ptCopy.aboutTitle).toBe('Sobre o perfil');
    expect(ptCopy.resultsTitle).toBe('Resultados');

    const enCopy = snapshotToCopy(snapshot, 'en');
    expect(enCopy.aboutTitle).toBe('About the profile');
    expect(enCopy.resultsTitle).toBe('Results');
  });

  it('projects experiences with details and list items', () => {
    const experiences = snapshotToExperiences(snapshot, 'pt-BR');
    expect(experiences.length).toBe(1);

    const first = experiences[0]!;
    expect(first.title).toBe('Experiência de software');
    expect(first.responsibilities.length).toBeGreaterThan(0);
    expect(first.technicalDecisions.length).toBeGreaterThan(0);
    expect(first.results.length).toBeGreaterThan(0);

    const enExperiences = snapshotToExperiences(snapshot, 'en');
    expect(enExperiences[0]!.title).toBe('Software experience');
  });

  it('projects projects with technologies, links, and details', () => {
    const projects = snapshotToProjects(snapshot, 'pt-BR');
    expect(projects.length).toBe(1);
    expect(projects[0]?.name).toBe('Projeto de referência');
    expect(projects[0]?.technologies).toContain('TypeScript');
    expect(projects[0]?.links[0]).toEqual({ label: 'Site', url: 'https://example.com/project' });
  });

  it('projects skill categories and skills', () => {
    const categories = snapshotToSkillCategories(snapshot, 'pt-BR');
    expect(categories.length).toBeGreaterThan(0);

    const languages = categories.find((c) => c.label === 'Linguagens e runtime')!;
    expect(languages).toBeDefined();
    expect(languages.skills.some((s) => s.name === 'TypeScript')).toBe(true);
  });

  it('projects academic entries', () => {
    const entries = snapshotToAcademicEntries(snapshot, 'pt-BR');
    expect(entries.length).toBe(1);
    const firstAcademic = entries[0]!;
    expect(firstAcademic.institution).toBe('Instituição de referência');
    expect(firstAcademic.isCurrent).toBe(false);
    expect((firstAcademic.competencies ?? []).length).toBeGreaterThan(0);
  });

  it('projects contact links', () => {
    const contacts = snapshotToContactLinks(snapshot, 'pt-BR');
    expect(contacts.length).toBeGreaterThanOrEqual(4);
    expect(contacts.some((c) => c.symbol === 'github')).toBe(true);
    expect(contacts.some((c) => c.symbol === 'linkedin')).toBe(true);
  });

  it('projects section order', () => {
    const order = snapshotToSectionOrder(snapshot);
    expect(order).toEqual([
      'presentation-section',
      'about-section',
      'results-section',
      'experiences-section',
      'projects-section',
      'skills-section',
      'education-section',
      'contact-section',
    ]);
  });
});
