(async () => {
  const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const component = ng.getComponent(document.querySelector('app-portfolio-page'));
  const select = document.querySelector('select');
  const choose = async value => { select.value=value; select.dispatchEvent(new Event('change',{bubbles:true})); await frames(); };
  const measure = () => JSON.stringify({y:scrollY,h:document.documentElement.scrollHeight,tops:[...document.querySelectorAll('section')].map(x=>x.getBoundingClientRect().top)});
  await choose('pt-BR');
  scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
  await frames();
  const before=measure();
  component.translationSource=()=>({aboutTitle:'About me'});
  await choose('en');
  const missing={title:document.querySelector('#sobre-mim-title .translated-text').textContent,body:document.querySelector('#sobre-mim p:last-child .translated-text').textContent,scrollPreserved:before===measure()};
  await choose('pt-BR');
  component.translationSource=()=>{throw new Error('Simulated translation failure')};
  await choose('en');
  const failed={title:document.querySelector('#sobre-mim-title .translated-text').textContent,scrollPreserved:before===measure()};
  return JSON.stringify({missing,failed});
})()
