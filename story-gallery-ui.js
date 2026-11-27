(()=>{
 function init(){
  const story=document.querySelector('.published-story');
  if(story){
   let queued=false;
   function fitPreview(){
    queued=false;if(!document.body.classList.contains('article-preview')||window.scrollY>20)return;
    const cover=story.querySelector(':scope > .material-cover');
    const first=document.querySelector('#comments [data-comment-id]')||document.querySelector('.composer');
    if(!cover||!first)return;
    const current=cover.getBoundingClientRect().height;
    if(!current)return;
    const available=(window.visualViewport?.height||window.innerHeight)-first.getBoundingClientRect().top+current-45;
    const height=Math.max(100,Math.min(280,available));
    const previous=parseFloat(document.documentElement.style.getPropertyValue('--story-preview-cover'));
    if(!Number.isFinite(previous)||Math.abs(previous-height)>1)document.documentElement.style.setProperty('--story-preview-cover',height+'px');
   }
   function scheduleFit(){if(!queued){queued=true;requestAnimationFrame(fitPreview)}}
   new ResizeObserver(scheduleFit).observe(document.querySelector('main')||document.body);
   window.addEventListener('resize',scheduleFit,{passive:true});
   window.addEventListener('load',scheduleFit,{once:true});scheduleFit();
  }

  document.querySelectorAll('.published-story .story-gallery-steps,.published-story .story-gallery-results').forEach((gallery,index)=>{
   if(gallery.dataset.sliderReady)return;
   gallery.dataset.sliderReady='true';gallery.classList.add('story-gallery-slider');gallery.id=gallery.id||`story-screens-${index+1}`;gallery.tabIndex=0;gallery.setAttribute('aria-label','Скриншоты: прокрутите горизонтально или используйте кнопки');
   const controls=document.createElement('div');controls.className='story-slider-controls';
   controls.innerHTML='<button type="button" class="story-slider-prev" aria-label="Предыдущие скриншоты">←</button><div class="story-slider-track"><span class="story-slider-caption">Скриншоты <span class="story-slider-dots"></span></span><input type="range" min="0" max="1000" value="0" aria-label="Положение галереи скриншотов"></div><span class="story-slider-count" aria-live="polite"></span><button type="button" class="story-slider-next" aria-label="Следующие скриншоты">→</button>';
   gallery.after(controls);const prev=controls.querySelector('.story-slider-prev'),next=controls.querySelector('.story-slider-next'),range=controls.querySelector('input'),count=controls.querySelector('.story-slider-count');
   const dots=controls.querySelector('.story-slider-dots');const pageCount=Math.ceil(gallery.children.length/2);for(let page=0;page<pageCount;page++){const dot=document.createElement('button');dot.type='button';dot.className='story-slider-dot';dot.setAttribute('aria-label',`Показать страницу ${page+1} из ${pageCount}`);dot.onclick=()=>gallery.scrollTo({left:page*(gallery.clientWidth+12),behavior:'smooth'});dots.append(dot);}
   [prev,next,range].forEach(el=>el.setAttribute('aria-controls',gallery.id));
   function update(){const max=gallery.scrollWidth-gallery.clientWidth;const position=Math.max(0,gallery.scrollLeft);range.value=max>0?Math.round(position/max*1000):0;range.style.setProperty('--slider-progress',range.value/10+'%');const activePage=Math.round(position/(gallery.clientWidth+12));[...dots.children].forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===activePage)));prev.disabled=position<2;next.disabled=max-position<2;range.disabled=max<2;const items=[...gallery.children];const bounds=gallery.getBoundingClientRect();const visible=items.map((el,i)=>({el,i})).filter(({el})=>{const box=el.getBoundingClientRect();return box.right>bounds.left+2&&box.left<bounds.right-2});if(visible.length)count.textContent=`${visible[0].i+1}–${visible.at(-1).i+1} / ${items.length}`;else count.textContent=`${items.length} скриншота`;}
   prev.onclick=()=>gallery.scrollBy({left:-(gallery.clientWidth+12),behavior:'smooth'});next.onclick=()=>gallery.scrollBy({left:gallery.clientWidth+12,behavior:'smooth'});
   range.addEventListener('input',()=>{gallery.scrollLeft=Number(range.value)/1000*(gallery.scrollWidth-gallery.clientWidth)});
   gallery.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(gallery);update();
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
