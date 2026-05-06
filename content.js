(() => {
  'use strict';
  const EXT_VERSION = '2.0.0';
  window.__kimiEnhancerVersion = EXT_VERSION;
  console.log('[Kimi Enhancer] v' + EXT_VERSION + ' loaded');

  const getBasename = (path) => {
    if (!path || typeof path !== 'string') return path;
    const trimmed = path.replace(/\/+$/, '');
    const idx = trimmed.lastIndexOf('/');
    return idx >= 0 ? trimmed.slice(idx + 1) : trimmed;
  };

  const isPath = (text) => {
    if (!text || typeof text !== 'string') return false;
    const t = text.trim();
    const hasSlash = t.includes('/') && t.length > 2 && !t.includes('\n');
    return hasSlash && (t.startsWith('/') || t.startsWith('...') || t.startsWith('…') || t.startsWith('~/'));
  };

  const truncatePaths = () => {
    const root = document.getElementById('sessions') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let count = 0;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      if (!text || !isPath(text)) continue;
      const trimmed = text.trim();
      if (trimmed.split('/').filter(Boolean).length < 2) continue;
      const basename = getBasename(trimmed);
      if (basename && basename !== trimmed) {
        node.textContent = node.textContent.replace(trimmed, basename);
        count++;
      }
    }
    if (count > 0) console.log('[Kimi Enhancer] Truncated', count, 'paths');
  };

  const injectStyles = () => {
    const styleId = 'kimi-enhancer-styles';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      #sessions ul > li:nth-child(even) > div > div:first-child > button:first-of-type {
        background-color: rgba(255, 255, 255, 0.10) !important;
        filter: brightness(1.10) !important;
        transition: filter 0.2s ease;
      }
      .kimi-turbo {
        color: #ff6600 !important;
      }
    `;
  };

  // ── Rebrand header: "Kimi Code" → "KCode Turbo" + version ──
  const rebrandHeader = () => {
    // Find the visible "Kimi Code" span (not inside hidden/off-screen containers)
    const allSpans = document.querySelectorAll('span.text-base.font-semibold.text-foreground');
    let kimiSpan = null;
    for (const s of allSpans) {
      if (s.textContent.trim() === 'Kimi Code') {
        const isHidden = s.closest('[class*="opacity-0"], [class*="pointer-events-none"]');
        if (!isHidden) {
          kimiSpan = s;
          break;
        }
      }
    }

    if (kimiSpan && !kimiSpan.dataset.kimiRebranded) {
      kimiSpan.innerHTML = 'KCode <span class="kimi-turbo">Turbo</span>';
      kimiSpan.dataset.kimiRebranded = 'true';
      console.log('[Kimi Enhancer] Rebranded header');
    }

    // Leave the original Kimi Code version badge untouched (e.g. v1.41.0)
  };

  let groupedClicked = false;

  const isGroupedViewActive = () => {
    const sessions = document.getElementById('sessions');
    if (!sessions) return false;
    return !!sessions.querySelector('li.group\\/dir, [data-slot="collapsible-trigger"]');
  };

  const enableGroupedViewOnce = () => {
    if (groupedClicked) return;
    if (isGroupedViewActive()) {
      console.log('[Kimi Enhancer] Already in grouped view');
      groupedClicked = true;
      return;
    }

    const selectors = [
      'button[title="Grouped by folder"]',
      'button[aria-label="Grouped by folder"]',
      'button[data-testid="grouped-by-folder-toggle"]',
      'button[role="switch"][aria-label*="folder"]',
      'button[role="switch"][title*="folder"]'
    ];

    let btn = null;
    for (const sel of selectors) {
      btn = document.querySelector(sel);
      if (btn) break;
    }

    if (!btn) {
      const allSwitches = document.querySelectorAll('button[role="switch"], button[data-state]');
      for (const b of allSwitches) {
        const text = (b.textContent || b.title || b.getAttribute('aria-label') || '').toLowerCase();
        if (text.includes('folder') || text.includes('group')) {
          btn = b;
          break;
        }
      }
    }

    if (btn) {
      const state = btn.getAttribute('data-state');
      console.log('[Kimi Enhancer] Found grouped toggle, data-state:', state);
      if (state === 'off') {
        btn.click();
        groupedClicked = true;
        console.log('[Kimi Enhancer] Clicked grouped by folder toggle');
      }
    } else {
      console.log('[Kimi Enhancer] Grouped toggle not found yet');
    }
  };

  // ── Session-change-aware auto-scroll ──
  let lastSessionId = null;
  let pendingAutoScroll = false;

  const getSessionId = () => {
    try {
      return new URLSearchParams(window.location.search).get('session') || '';
    } catch (e) {
      return '';
    }
  };

  const autoScrollToBottom = () => {
    if (!pendingAutoScroll) return;
    const chat = document.getElementById('chat');
    if (!chat) return;
    const btn = chat.querySelector(':scope > div > div > div > div:nth-child(2) > div > div:first-child > div > button');
    if (btn) {
      if (!btn.dataset.kimiAutoScrolled) {
        btn.dataset.kimiAutoScrolled = 'true';
        btn.click();
        console.log('[Kimi Enhancer] Auto-scrolled after session switch');
      }
      pendingAutoScroll = false;
    }
  };

  const checkSessionChange = () => {
    const current = getSessionId();
    if (lastSessionId !== null && current !== lastSessionId) {
      pendingAutoScroll = true;
      console.log('[Kimi Enhancer] Session changed, arming auto-scroll');
    }
    lastSessionId = current;
  };

  const run = () => {
    try {
      enableGroupedViewOnce();
      truncatePaths();
      injectStyles();
      rebrandHeader();
    } catch (e) {
      console.error('[Kimi Enhancer] Error in run():', e);
    }
  };

  const init = () => {
    if (!document.body) return;
    console.log('[Kimi Enhancer] Initializing');

    lastSessionId = getSessionId();

    run();

    let timer;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(run, 150);
    }).observe(document.body, { childList: true, subtree: true });

    setInterval(checkSessionChange, 300);
    setInterval(autoScrollToBottom, 200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
