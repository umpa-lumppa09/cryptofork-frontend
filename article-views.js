(()=>{
 function init(){
  const story=document.querySelector('.published-story'),meta=document.querySelector('.byline .meta'),body=document.querySelector('#article-more');
  if(!story||!meta||!body)return;
  const counter=document.createElement('span');counter.className='article-views';counter.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>11 493</span>';counter.setAttribute('aria-label','Просмотры статьи: 11 493');meta.append(counter);
  function show(n){if(!Number.isSafeInteger(n)||n<11493)return;const text=new Intl.NumberFormat('ru-RU').format(n);counter.querySelector('span').textContent=text;counter.setAttribute('aria-label','Просмотры статьи: '+text)}
  async function request(operation,readerKey){const r=await fetch('/api/analytics/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({thread:'article-token2049-novex',operation,readerKey})});if(!r.ok)throw new Error('views_unavailable');const data=await r.json();show(data.views);return data}
  request('read_stats').catch(()=>{});
  let key;try{key=localStorage.getItem('cf.article.reader');if(!/^[0-9a-f-]{36}$/i.test(key||'')){key=crypto.randomUUID();localStorage.setItem('cf.article.reader',key)}}catch{key=crypto.randomUUID()}
  let complete=false,busy=false,timer=null,visible=false;
  const end=document.createElement('span');end.className='article-read-end';end.setAttribute('aria-hidden','true');body.append(end);
  function cancel(){clearTimeout(timer);timer=null}
  async function finish(){timer=null;if(complete||busy||!visible||document.hidden||document.body.classList.contains('article-preview'))return;busy=true;try{await request('read_complete',key);complete=true;observer.disconnect()}catch{}finally{busy=false}}
  function schedule(){cancel();if(!complete&&visible&&!document.hidden&&!document.body.classList.contains('article-preview'))timer=setTimeout(finish,1500)}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:1});observer.observe(end);
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('click',e=>{if(e.target.closest('[data-article-toggle]'))schedule()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
