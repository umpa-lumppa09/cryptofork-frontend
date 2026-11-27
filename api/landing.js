const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { randomInt } = require('node:crypto');
const { getConfig } = require('../lib/runtime-config.cjs');

async function request(method, data) {
  const proxyKey = process.env.ANALYTICS_PROXY_SECRET;
  if (!proxyKey) throw new Error('Proxy key missing');
  return fetch(getConfig().backend + '/api/landing', {
    method,
    headers: { 'X-CF-Proxy-Key': proxyKey, 'Content-Type': 'application/json' },
    body: data && JSON.stringify(data),
    signal: AbortSignal.timeout(1200),
  });
}

let cachedMode = '1';
let modeExpires = 0;
let refreshPending;
const pageCache = new Map();
function refreshMode() {
  if (!refreshPending) refreshPending = (async () => {
    try {
      const response = await request('GET');
      if (!response.ok) throw new Error('Mode unavailable');
      const { mode } = await response.json();
      if (!['1', '2', 'ab'].includes(mode)) throw new Error('Invalid mode');
      cachedMode = mode;
    } catch { /* Retain the last known public version during a backend outage. */ }
    modeExpires = Date.now() + 10000;
    return cachedMode;
  })().finally(() => { refreshPending = undefined; });
  return refreshPending;
}
async function activeMode() {
  if (Date.now() < modeExpires) return cachedMode;
  // Refresh in the request lifecycle so serverless freezing cannot cancel it.
  return refreshMode();
}
function pageHTML(variant) {
  if (!pageCache.has(variant)) pageCache.set(variant,
    readFileSync(join(__dirname, '../lib/pages', `webinar-${variant}.html`), 'utf8'));
  return pageCache.get(variant);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET' || req.method === 'HEAD') {
    const mode = await activeMode();
    const variant = mode === 'ab' ? randomInt(1, 3) : Number(mode);
    const bucket = mode === 'ab' ? 'ab' : 'fixed';
    if (bucket === 'fixed') res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10');
    res.setHeader('X-Landing-Variant', String(variant));
    const html = pageHTML(variant).replace('data-bucket="fixed"', `data-bucket="${bucket}"`);
    const target = process.env.WEBINAR_TELEGRAM_URL;
    if (target && !/^https:\/\/t\.me\/[A-Za-z0-9_+/-]+$/.test(target)) return res.status(503).send('Invalid WEBINAR_TELEGRAM_URL');
    const output = html.replaceAll('https://t.me/cryptofork_webinar', target || 'https://t.me/your_webinar');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(output);
  }
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') {
    return res.status(403).end();
  }
  const { variant, event, bucket } = req.body || {};
  if (![1, 2].includes(variant) || !['view', 'click'].includes(event) || !['fixed', 'ab'].includes(bucket)) return res.status(400).end();
  try {
    const response = await request('POST', { variant, event, bucket });
    return res.status(response.ok ? 204 : 502).end();
  } catch {
    return res.status(503).end();
  }
};
