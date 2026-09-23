(async () => {
  const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const measure = () => ({y: scrollY, height: document.documentElement.scrollHeight, sections: [...document.querySelectorAll('section')].map(s => ({id:s.id, top:s.getBoundingClientRect().top + scrollY, height:s.getBoundingClientRect().height}))});
  const results = [];
  const select = document.querySelector('select');
  for (const section of [...document.querySelectorAll('section'), null]) {
    scrollTo({top: section ? section.offsetTop : document.documentElement.scrollHeight, behavior:'instant'});
    await frames();
    for (const language of ['pt-BR','en']) {
      const before = measure();
      select.value = language;
      select.dispatchEvent(new Event('change', {bubbles:true}));
      await frames();
      const after = measure();
      results.push({section: section?.id ?? 'bottom', language, before, after, preserved: JSON.stringify(before) === JSON.stringify(after)});
    }
  }
  return JSON.stringify({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,results});
})()
