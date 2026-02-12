/**
 * Cardigan Dashboard — Web Components + Keyboard Nav + A11y Preferences
 * =====================================================================
 * Defines <shell-header> and <shell-footer> custom elements,
 * vim-style keyboard shortcuts, a shortcuts modal, and
 * accessibility preferences (text size, high contrast).
 *
 * Security note: All innerHTML usage in this file is populated
 * exclusively from hardcoded constants (NAV_ITEMS, SHORTCUTS).
 * No user-supplied data is interpolated into HTML strings.
 *
 * Usage:
 *   <script src="../shared/shell.js" type="module"></script>
 *   <shell-header current="example-tool"></shell-header>
 *   <shell-footer></shell-footer>
 */

// ── Logo SVG (inline data URI) ──────────────────────────────────
// Rounded square with "CD" initials — works on both dark and light themes
const LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#5b8af5"/><text x="16" y="21" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="700" font-size="14" fill="#fff">CD</text></svg>`)}`;

// ── Nav items: single source of truth ──────────────────────────
const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'example-tool', label: 'Example Tool', href: '/example-tool/' },
];

// ── Site root derived from this script's own URL ────────────────
// shell.js always lives at {root}/shared/shell.js, so going up one
// directory gives the site root. Works on root domains, GitHub Pages
// subpath deploys (/repo-name/), and file:// URLs alike.
const SITE_ROOT = new URL('..', import.meta.url).href;

function resolveHref(href) {
  if (href === '/') return SITE_ROOT;
  return SITE_ROOT + href.replace(/^\//, '');
}

// ── Keyboard shortcuts ─────────────────────────────────────────
const SHORTCUTS = [
  { keys: 'g h', label: 'Go to Home', action: () => navigateTo('home') },
  { keys: 'g e', label: 'Go to Example Tool', action: () => navigateTo('example-tool') },
  { keys: '?', label: 'Show keyboard shortcuts', action: () => toggleShortcutsModal() },
];

function navigateTo(id) {
  const item = NAV_ITEMS.find(n => n.id === id);
  if (!item) return;
  window.location.href = resolveHref(item.href);
}

function toggleShortcutsModal() {
  const dialog = document.getElementById('shell-shortcuts-dialog');
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
  } else {
    dialog.showModal();
  }
}

// ── Two-key sequence handler ───────────────────────────────────
let pendingKey = null;
let pendingTimer = null;

function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return false;
}

document.addEventListener('keydown', (e) => {
  if (isInputFocused()) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key.toLowerCase();

  if (pendingKey) {
    const combo = `${pendingKey} ${key}`;
    clearTimeout(pendingTimer);
    pendingKey = null;

    const shortcut = SHORTCUTS.find(s => s.keys === combo);
    if (shortcut) {
      e.preventDefault();
      shortcut.action();
      return;
    }
  }

  const single = SHORTCUTS.find(s => s.keys === key);
  if (single) {
    e.preventDefault();
    single.action();
    return;
  }

  const couldBePrefix = SHORTCUTS.some(s => s.keys.startsWith(key + ' '));
  if (couldBePrefix) {
    pendingKey = key;
    pendingTimer = setTimeout(() => { pendingKey = null; }, 800);
  }
});

// ── A11y Preferences ───────────────────────────────────────────
const PREFS_KEY = 'shell_a11y_prefs';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function applyPrefs() {
  const prefs = loadPrefs();

  if (prefs.textScale && prefs.textScale !== 'default') {
    document.documentElement.setAttribute('data-text-scale', prefs.textScale);
  } else {
    document.documentElement.removeAttribute('data-text-scale');
  }

  if (prefs.highContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
}

applyPrefs();

// ── Helper: create element with attributes and children ────────
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'textContent') { node.textContent = v; continue; }
    if (k === 'className') { node.className = v; continue; }
    node.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else {
      node.appendChild(child);
    }
  }
  return node;
}

// ── <shell-header> Custom Element ──────────────────────────────
class ShellHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute('current') || '';
    this.classList.add('shell-header');
    this.setAttribute('role', 'banner');

    const rootHref = resolveHref('/');

    // Skip link
    const skipLink = el('a', { href: '#main-content', className: 'shell-skip-link', textContent: 'Skip to content' });

    // Logo
    const logoImg = el('img', { src: LOGO_SVG, alt: '', className: 'shell-logo-img' });
    const logoText = el('span', { textContent: 'Cardigan Dashboard' });
    const logo = el('a', { href: rootHref, className: 'shell-logo' }, [logoImg, logoText]);

    // Nav
    const nav = el('nav', { className: 'shell-nav', 'aria-label': 'Main navigation' });
    for (const item of NAV_ITEMS) {
      const href = resolveHref(item.href);
      const link = el('a', { href, textContent: item.label });
      if (item.id === current) link.setAttribute('aria-current', 'page');
      nav.appendChild(link);
    }

    // Prefs button
    const prefsBtn = el('button', {
      type: 'button',
      className: 'shell-icon-btn',
      id: 'shell-prefs-btn',
      'aria-label': 'Accessibility preferences',
      'aria-expanded': 'false',
      title: 'Preferences',
      textContent: '\u2699',
    });

    // Prefs panel
    const prefsPanel = el('div', { className: 'shell-prefs-panel', id: 'shell-prefs-panel', hidden: '' });

    const prefsTitle = el('div', { className: 'shell-prefs-title', textContent: 'Preferences' });

    // Text size row
    const textSizeLabel = el('span', { className: 'shell-prefs-label', textContent: 'Text size' });
    const textSizeSelect = el('select', { className: 'shell-prefs-select', id: 'shell-text-scale' }, [
      el('option', { value: 'default', textContent: 'Default' }),
      el('option', { value: 'large', textContent: 'Large' }),
      el('option', { value: 'larger', textContent: 'Larger' }),
    ]);
    const textSizeRow = el('div', { className: 'shell-prefs-row' }, [textSizeLabel, textSizeSelect]);

    // High contrast row
    const hcLabel = el('span', { className: 'shell-prefs-label', textContent: 'High contrast' });
    const hcInput = el('input', { type: 'checkbox', id: 'shell-high-contrast' });
    const hcSlider = el('span', { className: 'shell-toggle-slider' });
    const hcToggle = el('label', { className: 'shell-toggle' }, [hcInput, hcSlider]);
    const hcRow = el('div', { className: 'shell-prefs-row' }, [hcLabel, hcToggle]);

    prefsPanel.append(prefsTitle, textSizeRow, hcRow);

    const actionsWrap = el('div', { className: 'shell-header-actions', style: 'position: relative;' }, [prefsBtn, prefsPanel]);

    // Header inner
    const inner = el('div', { className: 'shell-header-inner' }, [logo, nav, actionsWrap]);

    this.append(skipLink, inner);

    this._setupPrefs();
    this._setupPrefsPanel();
  }

  _setupPrefs() {
    const prefs = loadPrefs();
    const scaleSelect = this.querySelector('#shell-text-scale');
    const contrastToggle = this.querySelector('#shell-high-contrast');

    if (scaleSelect) {
      scaleSelect.value = prefs.textScale || 'default';
      scaleSelect.addEventListener('change', () => {
        const p = loadPrefs();
        p.textScale = scaleSelect.value;
        savePrefs(p);
        applyPrefs();
      });
    }

    if (contrastToggle) {
      contrastToggle.checked = !!prefs.highContrast;
      contrastToggle.addEventListener('change', () => {
        const p = loadPrefs();
        p.highContrast = contrastToggle.checked;
        savePrefs(p);
        applyPrefs();
      });
    }
  }

  _setupPrefsPanel() {
    const btn = this.querySelector('#shell-prefs-btn');
    const panel = this.querySelector('#shell-prefs-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }
}

// ── <shell-footer> Custom Element ──────────────────────────────
class ShellFooter extends HTMLElement {
  connectedCallback() {
    this.classList.add('shell-footer');
    this.setAttribute('role', 'contentinfo');

    const logo = el('img', { src: LOGO_SVG, alt: '', className: 'shell-footer-logo' });
    const msg = document.createTextNode('Built with Cardigan Dashboard');
    const left = el('div', { className: 'shell-footer-left' }, [logo, msg]);

    const ghLink = el('a', { href: 'https://github.com/MarkOnFire/cardigan-dashboard-static', target: '_blank', rel: 'noopener', textContent: 'Source on GitHub' });
    const right = el('div', {}, [ghLink]);

    const inner = el('div', { className: 'shell-footer-inner' }, [left, right]);
    this.appendChild(inner);
  }
}

// ── Register custom elements ───────────────────────────────────
customElements.define('shell-header', ShellHeader);
customElements.define('shell-footer', ShellFooter);

// ── Shortcuts dialog (appended to body via DOM APIs) ───────────
function createShortcutsDialog() {
  if (document.getElementById('shell-shortcuts-dialog')) return;

  const dialog = el('dialog', { id: 'shell-shortcuts-dialog', className: 'shell-dialog' });
  const heading = el('h2', { textContent: 'Keyboard Shortcuts' });
  const list = el('ul', { className: 'shell-shortcuts-list' });

  for (const s of SHORTCUTS) {
    const labelSpan = el('span', { textContent: s.label });
    const keysContainer = document.createDocumentFragment();
    for (const k of s.keys.split(' ')) {
      keysContainer.appendChild(el('kbd', { className: 'shell-kbd', textContent: k }));
      keysContainer.appendChild(document.createTextNode(' '));
    }
    const li = el('li', {}, [labelSpan, keysContainer]);
    list.appendChild(li);
  }

  const closeBtn = el('button', { type: 'button', className: 'shell-dialog-close', textContent: 'Close' });
  closeBtn.addEventListener('click', () => dialog.close());

  dialog.append(heading, list, closeBtn);
  document.body.appendChild(dialog);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createShortcutsDialog);
} else {
  createShortcutsDialog();
}

// ── Optional: Branding loader ──────────────────────────────────
// Place branding.json at the root to customize the accent color
// and app name. Silently skipped if not found.
(async function loadBranding() {
  try {
    const res = await fetch(SITE_ROOT + 'branding.json');
    if (!res.ok) return;
    const branding = await res.json();
    const root = document.documentElement.style;
    if (branding.primaryColor) root.setProperty('--color-primary', branding.primaryColor);
    if (branding.primaryHoverColor) root.setProperty('--color-primary-hover', branding.primaryHoverColor);
    if (branding.appName) {
      const logoText = document.querySelector('.shell-logo span');
      if (logoText) logoText.textContent = branding.appName;
    }
  } catch {
    // Silently skip — branding.json is optional
  }
})();
