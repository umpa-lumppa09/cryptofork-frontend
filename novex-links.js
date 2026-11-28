(() => {
  'use strict';
  const destination = 'https://novex.us.com';
  const selector = '.zero-header, .sidebar-promo, [data-novex-referral], .novex-referral';
  function prepare(root) {
    const blocks = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) blocks.push(root);
    for (const block of blocks) {
      if (block.matches('a')) block.setAttribute('href', destination);
      else {
        const link = block.querySelector('a');
        if (link) link.setAttribute('href', destination);
        else {
          const anchor = document.createElement('a');
          anchor.href = destination;
          anchor.setAttribute('aria-label', 'Перейти на NOVEX');
          anchor.style.display = 'block';
          while (block.firstChild) anchor.appendChild(block.firstChild);
          block.appendChild(anchor);
        }
      }
    }
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const block = event.target.closest(selector);
    if (!block) return;
    const link = block.matches('a') ? block : block.querySelector('a');
    if (link) link.setAttribute('href', destination);
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(destination);
  }, true);
  function start() {
    prepare(document);
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes)
        if (node instanceof Element && !node.matches('a[aria-label="Перейти на NOVEX"]')) prepare(node);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

;(() => {
  const style = document.createElement('style');
  style.textContent = `
    .zero-header {
      display: block !important;
      overflow: hidden;
    }
    .zero-header > a {
      display: block;
      width: 100%;
      height: 100%;
    }
    .zero-header img {
      display: block;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
      object-fit: fill !important;
      object-position: center !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);
})();
