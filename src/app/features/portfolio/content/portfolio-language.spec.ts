import { classifyBrowserLanguage } from './portfolio-language';

describe('primary browser language (AC-001/005/006/011)', () => {
  it.each([
    ['pt', 'pt-BR'],
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['en', 'en'],
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['EN-us', 'en'],
    ['es', 'other'],
    ['fr-FR', 'other'],
    [undefined, null],
    ['', null],
    ['not a locale', null],
    [12, null],
  ])('classifies %s as %s', (input, expected) => {
    expect(classifyBrowserLanguage(input)).toBe(expected);
  });
});
