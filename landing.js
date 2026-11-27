const variant = Number(document.body.dataset.variant);
const bucket = new URLSearchParams(location.search).get('bucket') === 'ab' ? 'ab' : document.body.dataset.bucket;
const report = event => fetch('/api/landing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ variant, event, bucket }),
  keepalive: true,
}).catch(() => {});
report('view');
document.querySelector('#landing-cta').addEventListener('click', () => report('click'), { once: true });
