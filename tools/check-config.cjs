const {getConfig}=require('../lib/runtime-config.cjs');
try { getConfig(); console.log('SITE_ORIGIN and BACKEND_URL: OK'); } catch(e) { console.error(e.message); process.exitCode=1; }
if((process.env.ANALYTICS_PROXY_SECRET||'').length<32){console.error('Set ANALYTICS_PROXY_SECRET to at least 32 random characters');process.exitCode=1}else console.log('ANALYTICS_PROXY_SECRET: present (value hidden)');
if(!/^https:\/\/t\.me\/[A-Za-z0-9_+/-]+$/.test(process.env.WEBINAR_TELEGRAM_URL||'')){console.error('Set WEBINAR_TELEGRAM_URL');process.exitCode=1}
