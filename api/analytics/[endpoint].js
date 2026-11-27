'use strict';
const {isIP}=require('node:net');
const API='https://cryptofork-backend-production.up.railway.app';
const ORIGIN='https://www.cryptofork.net/';
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const endpoint=req.query.endpoint;
 if(req.method==='GET'&&endpoint==='media'){const id=String(req.query.id||'');if(!/^[0-9a-f-]{36}$/.test(id))return res.status(400).json({error:'invalid_id'});try{const upstream=await fetch(API+'/media/'+id,{signal:AbortSignal.timeout(12000)});if(!upstream.ok)return res.status(404).json({error:'not_found'});res.setHeader('Content-Type',upstream.headers.get('content-type')||'application/octet-stream');return res.status(200).send(Buffer.from(await upstream.arrayBuffer()))}catch{return res.status(502).json({error:'media_unavailable'})}}
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 if(req.headers.origin!==ORIGIN)return res.status(403).json({error:'origin_denied'});
 if(!['visit','events','revoke','community','presence'].includes(endpoint))return res.status(404).json({error:'not_found'});
 if((req.headers['content-type']||'').split(';')[0].trim()!=='application/json')return res.status(415).json({error:'json_required'});
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body)}catch{return res.status(400).json({error:'invalid_json'})}
 if(!body||typeof body!=='object'||Array.isArray(body))return res.status(400).json({error:'invalid_body'});
 const payload=JSON.stringify(body);if(Buffer.byteLength(payload)>(endpoint==='community'?3*1024*1024:32768))return res.status(413).json({error:'body_limit'});
 const key=process.env.ANALYTICS_PROXY_SECRET;if(!key)return res.status(503).json({error:'proxy_not_configured'});
 // Vercel sets X-Real-IP at ingress. Ignore IPs supplied in the body or custom client headers.
 const address=String(req.headers['x-real-ip']||'').trim();
 const headers={'Content-Type':'application/json','Origin':ORIGIN,'X-CF-Proxy-Key':key,'X-CF-Visitor-IP':isIP(address)?address:''};
 if(endpoint==='community')headers.Cookie=String(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(v=>/^__Host-cf_session=/.test(v)).join('; ');
 try{
  const upstream=await fetch(API+'/api/'+endpoint,{method:'POST',headers,body:payload,signal:AbortSignal.timeout(12000)});
  const data=await upstream.json();return res.status(upstream.status).json(data);
 }catch{return res.status(502).json({error:'collector_unavailable'})}
};
