'use strict';
const {isIP}=require('node:net');
const BASE='https://cryptofork-backend-production.up.railway.app';
const ORIGIN='https://www.cryptofork.net';
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
 const action=req.query.action;
 const get=new Set(['me','providers','callback']),post=new Set(['profile','register','login','logout','start','complete','change-password','forgot','reset']);
 if(!(req.method==='GET'&&get.has(action))&&!(req.method==='POST'&&post.has(action)))return res.status(405).json({error:'method_not_allowed'});
 if(req.method==='POST'&&req.headers.origin!==ORIGIN)return res.status(403).json({error:'origin_denied'});
 if(req.method==='POST'&&(req.headers['content-type']||'').split(';')[0].trim()!=='application/json')return res.status(415).json({error:'json_required'});
 const key=process.env.ANALYTICS_PROXY_SECRET;if(!key)return res.status(503).json({error:'auth_unavailable'});
 let body;
 if(req.method==='POST'){
  let data=req.body;try{if(typeof data==='string')data=JSON.parse(data)}catch{return res.status(400).json({error:'invalid_request'})}
  if(!data||typeof data!=='object'||Array.isArray(data))return res.status(400).json({error:'invalid_request'});
  body=JSON.stringify(data);if(Buffer.byteLength(body)>200000)return res.status(413).json({error:'body_limit'});
 }
 const query=new URLSearchParams();for(const name of ['state','code','device_id','error'])if(typeof req.query[name]==='string')query.set(name,req.query[name]);
 const cookie=String(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(v=>/^__Host-cf_(session|oauth)=/.test(v)).join('; ');
 const ip=String(req.headers['x-real-ip']||'');
 try{
  const upstream=await fetch(BASE+'/auth/'+action+(query.size?'?'+query:'') ,{method:req.method,redirect:'manual',signal:AbortSignal.timeout(25000),headers:{'Content-Type':'application/json','Origin':ORIGIN,'X-CF-Proxy-Key':key,'X-CF-Visitor-IP':isIP(ip)?ip:'','Cookie':cookie},body});
  const cookies=upstream.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  const location=upstream.headers.get('location');if(location&&/^\/(account|login)\.html(?:\?|$)/.test(location))res.setHeader('Location',location);
  return res.status(upstream.status).json(await upstream.json());
 }catch{return res.status(502).json({error:'auth_unavailable'})}
};
