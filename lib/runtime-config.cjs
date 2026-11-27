function origin(value, name) {
  if (!value || !value.trim()) throw new Error(name + ' is required');
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || !/^\/*$/.test(url.pathname)) throw new Error(name + ' must be an origin without a path');
  return url.origin;
}
function getConfig() {
  const site = origin(process.env.SITE_ORIGIN, 'SITE_ORIGIN');
  const backend = origin(process.env.BACKEND_URL, 'BACKEND_URL');
  return { site, backend };
}
module.exports = { getConfig, origin };
