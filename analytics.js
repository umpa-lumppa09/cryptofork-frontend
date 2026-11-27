/* Optional first-party analytics. No visitor ID, collector request or event before consent. */
(()=>{
 'use strict';
 const API='/api/analytics';
 const VERSION='2026-11-17-v2',KEY='cf.analytics.consent',IDENTITY='cf.analytics.visitor',SESSION='cf.analytics.session';
 const pages=new Set(['index','forum','topic','menu','news','articles','article','article-full','login','register','forgot-password']);
 const page=(location.pathname.split('/').pop()||'index.html').replace('.html','').replace(/^portal$/, 'index');
 if(!pages.has(page)||(!window.crypto?.randomUUID&&!window.crypto?.getRandomValues))return;
 const memory=new Map();let volatileSession=null;
 function uuid(){if(window.crypto.randomUUID)return window.crypto.randomUUID();const b=window.crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return Array.from(b,(n,i)=>([4,6,8,10].includes(i)?'-':'')+n.toString(16).padStart(2,'0')).join('')}
 const articleIds=new Set(['ai-nodes','platforms','first-node','earnings','novex','future','token2049-novex',...(window.CryptoForkPublications||[]).map(m=>m.id)]);
 const articleId=new URLSearchParams(location.search).get('id');
 const ctx={page,article:articleIds.has(articleId)?articleId:''};
 let connection='off';
 function updateStatus(){const label=document.querySelector('[data-consent-state]');if(label)label.textContent=!consent?'выключена':connection==='connected'?'разрешена · соединение установлено':connection==='connecting'?'разрешена · подключаемся…':'разрешена · нет соединения, нажмите «Проверить подключение»'}
 let consent=false,token='',queue=[],running=false,flushTimer=null,startPromise=null,epoch=0,typing=false,commentSent=false;
 let readRanges=[],readHeight=0,readSince=0,readReported=false,commentsReported=false;
 const seenComments=new Set();let commentsCount=0;const commentDwell=new Map();const onceKeys=new Set();
 function get(key){try{return localStorage.getItem(key)||memory.get(key)||null}catch{return memory.get(key)||null}}
 function set(key,value){memory.set(key,value);try{localStorage.setItem(key,value)}catch{}return true}
 function remove(key){memory.delete(key);try{localStorage.removeItem(key)}catch{}}
 function choice(){try{const c=JSON.parse(get(KEY));return c&&c.version===VERSION&&Date.now()-c.time<365*86400000?c.value:null}catch{return null}}
 const protectedChoice=!!(navigator.globalPrivacyControl||navigator.doNotTrack==='1');
 function showChoice(){
  document.getElementById('cookie-choice')?.remove();
  let dialog=document.getElementById('analytics-choice');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='analytics-choice';dialog.className='analytics-consent';dialog.setAttribute('aria-labelledby','analytics-consent-title');dialog.innerHTML=`<h2 id="analytics-consent-title">Настройки приватности</h2><p>С вашего согласия мы сохраняем случайный идентификатор браузера, IP подключения, страницы и действия на сайте. Эти сведения отправляются владельцу сайта в Telegram для анализа посещений.</p><p>В аналитику не передаются поисковые запросы, email и пароли. Опубликованные комментарии и вложения отправляются модераторам в Telegram как часть работы сайта. Отказ не ограничивает доступ к сайту. Отозвать согласие можно через «Приватность» внизу страницы.</p><p class="consent-small">События хранятся на сервере до 30 дней. Случайный номер браузера — до года. Уже отправленные сообщения остаются в Telegram. Текущая настройка: <strong data-consent-state></strong>.</p><button type="button" class="connection-retry" data-analytics-retry>Проверить подключение</button><div class="consent-actions"><button type="button" data-analytics-deny>Без аналитики</button><button type="button" class="primary" data-analytics-allow>Разрешить аналитику</button></div>`;document.body.append(dialog);dialog.querySelector('[data-analytics-allow]').onclick=()=>{set(KEY,JSON.stringify({value:'yes',version:VERSION,time:Date.now()}));dialog.close();start()};dialog.querySelector('[data-analytics-deny]').onclick=()=>{set(KEY,JSON.stringify({value:'no',version:VERSION,time:Date.now()}));dialog.close();stop()};dialog.querySelector('[data-analytics-retry]').onclick=()=>{if(choice()!=='yes'){const label=dialog.querySelector('[data-consent-state]');label.textContent='выключена · для проверки сначала разрешите аналитику';return}consent=false;start()};dialog.addEventListener('cancel',()=>{if(!choice())set(KEY,JSON.stringify({value:'no',version:VERSION,time:Date.now()}))})}
  updateStatus();if(!dialog.open)dialog.showModal();
 }
 function cookieBanner(){
  const banner=document.createElement('section');banner.id='cookie-choice';banner.className='cookie-banner';banner.setAttribute('aria-label','Настройки cookie и аналитики');banner.innerHTML=`<div><h2>Мы ценим вашу конфиденциальность</h2><p>Используем данные браузера для работы сайта. С вашего согласия IP и действия на CryptoFork передаются владельцу в Telegram для анализа трафика. <button type="button" class="cookie-details">Дополнительная информация</button></p></div><div class="cookie-actions"><button type="button" data-analytics-deny>Только необходимое</button><button type="button" class="primary" data-analytics-allow>Принять все</button></div>`;
  banner.querySelector('.cookie-details').onclick=showChoice;
  banner.querySelector('[data-analytics-allow]').onclick=()=>{set(KEY,JSON.stringify({value:'yes',version:VERSION,time:Date.now()}));banner.remove();start()};
  banner.querySelector('[data-analytics-deny]').onclick=()=>{set(KEY,JSON.stringify({value:'no',version:VERSION,time:Date.now()}));banner.remove();stop()};document.body.append(banner);
 }
 const settings=document.createElement('button');settings.type='button';settings.className='privacy-settings';settings.textContent='Приватность';settings.onclick=showChoice;document.body.append(settings);
 async function post(path,data){const response=await fetch(API+path.replace('/api',''),{method:'POST',mode:'same-origin',credentials:'omit',referrerPolicy:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!response.ok)throw new Error('collector_unavailable');return response.json()}
 async function start(){
  if(consent)return;consent=true;token='';connection='connecting';updateStatus();const generation=++epoch;
  let visitor=get(IDENTITY);if(!visitor){visitor=uuid();if(!set(IDENTITY,visitor)){consent=false;return}}
  let session=volatileSession;try{session=JSON.parse(sessionStorage.getItem(SESSION))||session}catch{}
  if(!session||Date.now()-session.started>30*60000){session={key:uuid(),started:Date.now()};try{sessionStorage.removeItem('cf.analytics.queue')}catch{}}else if(!queue.length){try{const saved=JSON.parse(sessionStorage.getItem('cf.analytics.queue'));if(Array.isArray(saved))queue=saved.slice(-100)}catch{}}
  volatileSession=session;try{sessionStorage.setItem(SESSION,JSON.stringify(session))}catch{}
  startPromise=post('/api/visit',{visitorKey:visitor,sessionKey:session.key,consent:VERSION,...ctx}).then(result=>{if(generation!==epoch||!consent){post('/api/revoke',{token:result.token}).catch(()=>{if(generation===epoch){connection='error';updateStatus()}});return}token=result.token;connection='connected';updateStatus();emit('page_view');presence('visible');flush()}).catch(()=>{if(generation===epoch){connection='error';updateStatus()}});
  // Retry the same session handshake, retaining the queue and avoiding duplicate roots.
  let attempts=0;while(consent&&generation===epoch&&!token&&attempts++<4){await startPromise;if(token||generation!==epoch)break;await new Promise(resolve=>setTimeout(resolve,Math.min(1000*2**attempts,16000)));if(!consent||generation!==epoch)break;startPromise=post('/api/visit',{visitorKey:visitor,sessionKey:session.key,consent:VERSION,...ctx}).then(result=>{if(generation!==epoch||!consent){post('/api/revoke',{token:result.token}).catch(()=>{if(generation===epoch){connection='error';updateStatus()}});return}token=result.token;connection='connected';updateStatus();emit('page_view');presence('visible');flush()}).catch(()=>{if(generation===epoch){connection='error';updateStatus()}})}
 }
 function rememberQueue(){try{sessionStorage.setItem('cf.analytics.queue',JSON.stringify(queue))}catch{}}
 function stop(){consent=false;connection='off';updateStatus();volatileSession=null;epoch++;queue=[];onceKeys.clear();const oldToken=token;token='';clearTimeout(flushTimer);remove(IDENTITY);try{sessionStorage.removeItem(SESSION);sessionStorage.removeItem('cf.analytics.queue')}catch{}if(oldToken)post('/api/revoke',{token:oldToken}).catch(()=>{});}
 function emit(type,details={},once){if(!consent||document.visibilityState==='prerender')return;if(once){if(onceKeys.has(once))return;onceKeys.add(once)}if(queue.length>=100)return;queue.push({id:uuid(),type,...ctx,...details});rememberQueue();clearTimeout(flushTimer);flushTimer=setTimeout(flush,650)}
 async function flush(){if(!consent||!token||running||!queue.length)return;running=true;const batch=queue.slice(0,20),generation=epoch;try{await post('/api/events',{token,events:batch});if(generation===epoch){queue=queue.filter(event=>!batch.some(sent=>sent.id===event.id));rememberQueue()}}catch{}finally{running=false;if(consent&&queue.length)flushTimer=setTimeout(flush,3000)}}
 const throttles=new Map();function throttle(key,ms){const now=Date.now();if(now-(throttles.get(key)||0)<ms)return false;throttles.set(key,now);return true}
 document.addEventListener('click',e=>{
  if(!consent)return;const target=e.target.closest('button,a,.zero-header,.sidebar-promo');if(!target||target.closest('.analytics-consent,.privacy-settings,.cookie-banner'))return;
  if(target.matches('[data-like-id]'))return;
  if(target.matches('[data-reply-id]')){emit('comment_reply',{commentId:target.dataset.replyId});return}
  const banner=e.target.closest('.zero-header,.sidebar-promo');if(banner){const brand=banner.querySelector('img')?.getAttribute('src')?.includes('community')?'community':'novex';emit('banner_click',{placement:banner.matches('.zero-header')?'header':'sidebar',brand});return}
  if(target.matches('[data-article-toggle]')){emit(target.getAttribute('aria-expanded')==='true'?'expand':'collapse');return}
  if(target.matches('[data-toggle="post-more"]')){emit(target.getAttribute('aria-expanded')==='true'?'expand':'collapse');return}
  if(target.matches('.related-card')){const novex=/novex/i.test(target.textContent);emit(novex?'banner_click':'related',novex?{placement:'article',brand:'novex'}:{});return}
  const rules=[['.menu-toggle','menu_open'],['[data-close],.overlay','menu_close'],['[data-create]','create_open'],['[data-reply]','comment_reply'],['[data-attach]','attach'],['[data-like]','like'],['[data-share]','share'],['[data-add-section]','add_section'],['[data-add-link]','add_link'],['[data-remove-block]','remove_block'],['[data-categories]','rubrics'],['[data-rubric]','filter'],['[data-sort]','sort'],['[data-page]','pagination'],['.content-link-button','custom_link']];
  for(const [selector,type] of rules)if(target.matches(selector)){emit(type);return}
  if(target.dataset.auth){emit(target.dataset.auth==='Войти'?'login_click':'register_click');return}
  if(target.dataset.provider){emit(target.dataset.provider==='VK ID'?'provider_vk':'provider_mail');return}
  if(target.matches('.material-card a,.topic a.wide'))emit('open_material');
  if(target.matches('.banner')){if(/novex/i.test(target.querySelector('img')?.getAttribute('src')||''))emit('banner_click',{placement:'article',brand:'novex'});else emit('open_material')}
 });
 document.addEventListener('pointerdown',e=>{if(e.target.closest('.overlay')&&consent)emit('menu_close')},{passive:true});
 document.addEventListener('input',e=>{if(!consent)return;if(e.target.matches('.composer input[name="comment"]')&&e.target.value.trim()&&!typing){typing=true;emit('comment_typing',{},'typing')}if(e.target.matches('[data-search]')&&throttle('search',15000))emit('search')});
 document.addEventListener('change',e=>{if(e.target.matches('.filters select,.categories select'))emit('filter');if(e.target.matches('input[type="file"]'))emit('add_media')});
 document.addEventListener('submit',e=>{if(e.target.matches('.composer')){typing=false;onceKeys.delete('typing')}if(e.target.matches('[data-auth-form]')){const type=e.target.dataset.authForm;emit(type==='login'?'login_submit':type==='register'?'register_submit':'recover_submit')}});
 document.addEventListener('cryptofork:discussion-created',()=>emit('create_submit'));
 function addRange(from,to){readRanges.push([from,to]);readRanges.sort((a,b)=>a[0]-b[0]);const merged=[];for(const range of readRanges){const last=merged[merged.length-1];if(last&&range[0]<=last[1]+12)last[1]=Math.max(last[1],range[1]);else merged.push(range)}readRanges=merged}
 function visibilityTick(){
  if(!consent||document.visibilityState!=='visible'||document.querySelector('.drawer.is-open,dialog[open]'))return;const height=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);
  const content=document.querySelector('.article-content'),expanded=document.querySelector('[data-article-toggle]')?.getAttribute('aria-expanded')==='true';
  if(content&&expanded&&!readReported){const rect=content.getBoundingClientRect();if(Math.abs(rect.height-readHeight)>30){readHeight=rect.height;readRanges=[];readSince=Date.now()}const from=Math.max(0,-rect.top),to=Math.min(rect.height,height-rect.top);if(to>from+30)addRange(from,to);const coverage=readRanges.reduce((sum,[a,b])=>sum+b-a,0);if(readRanges.length&&readRanges[0][0]<24&&readRanges.at(-1)[1]>rect.height-24&&coverage>=rect.height*.97&&Date.now()-readSince>=3000){readReported=true;emit('article_read',{},'article-read')}}
  if(!commentsReported)document.querySelectorAll('#comments .comment,#comments .reply').forEach(el=>{if(!el.dataset.commentId)return;const commentKey=el.dataset.commentId;if(seenComments.has(commentKey))return;const r=el.getBoundingClientRect(),visible=Math.min(r.bottom,height)-Math.max(r.top,0);if(visible>=Math.min(r.height*.5,120)){const first=commentDwell.get(commentKey);if(first&&Date.now()-first>=1000){seenComments.add(commentKey);commentsCount++;if(commentsCount>=5&&!commentsReported){commentsReported=true;emit('comments_read',{},'comments-read')}}else if(!first)commentDwell.set(commentKey,Date.now())}else commentDwell.delete(commentKey)})
 }
 setInterval(visibilityTick,700);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 window.addEventListener('pagehide',flush);window.addEventListener('online',()=>{if(consent&&!token){consent=false;start()}else flush()});
 window.addEventListener('storage',e=>{if(e.key===KEY){if(choice()==='no')stop();else if(choice()==='yes')start()}});
 let outgoing='hidden';
 function presence(state,beacon=false){if(!consent||!token)return;const data={token,...ctx,state};if(beacon&&navigator.sendBeacon){const accepted=navigator.sendBeacon('/api/analytics/presence',new Blob([JSON.stringify(data)],{type:'application/json'}));if(accepted)return}post('/api/presence',data).catch(()=>{})}
 document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||!consent)return;try{const url=new URL(link.href,location.href);if(!/^https?:$/.test(url.protocol))return;if(url.origin!==location.origin){outgoing='external';presence('external',true)}else if(url.pathname!==location.pathname){outgoing='navigating';presence('navigating',true)}}catch{}},true);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){outgoing='hidden';presence('visible')}else presence(outgoing,true)});
 window.addEventListener('pagehide',()=>presence(outgoing,true));setInterval(()=>{if(document.visibilityState==='visible')presence('visible')},15000);
 window.CryptoForkAnalytics=Object.freeze({token:()=>consent?token:''});
 if(choice()==='yes')start();else if(!choice()&&!protectedChoice)cookieBanner();
})();
