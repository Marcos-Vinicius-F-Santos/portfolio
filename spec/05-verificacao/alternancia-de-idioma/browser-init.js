// Test-only initialization, injected by agent-browser; never imported by the app.
(() => {
  const query = new URL(location.href).searchParams;
  if (query.has('primary')) {
    Object.defineProperty(navigator, 'language', { configurable: true, get() {
      if (query.get('primary') === 'unavailable') throw new Error('Test: unavailable language');
      return query.get('primary');
    }});
    Object.defineProperty(navigator, 'languages', { configurable: true, value: [query.get('primary'), 'pt-BR', 'en-US'] });
  }
  if (query.get('reset') === '1') localStorage.removeItem('portfolio.language.v1');
  if (query.get('blocked') === '1') Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Test: blocked storage'); } });
})();
