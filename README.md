# Cardigan Dashboard (Static)

A dark dashboard shell for GitHub Pages. Fork it, customize it, deploy — no build step required.

Cardigan gives you a responsive dashboard layout with sticky navigation, vim-style keyboard shortcuts, accessibility preferences (text size, high contrast), and automatic light/dark theme switching. Everything runs as vanilla HTML, CSS, and JS — no frameworks, no bundlers, no dependencies.

## Quick Start

1. **Fork** this repo (or click "Use this template")
2. Go to **Settings → Pages** and set the source to `main` branch
3. Your dashboard is live at `https://YOUR_USERNAME.github.io/cardigan-dashboard-static/`

## Adding a Tool

1. Create a new folder (e.g. `my-tool/`)
2. Add an `index.html` that imports the shared shell:
   ```html
   <link rel="stylesheet" href="../shared/shell.css">
   <link rel="stylesheet" href="styles.css">
   <!-- ... your content ... -->
   <script src="../shared/shell.js" type="module"></script>
   ```
3. Use `<shell-header current="my-tool">` and `<shell-footer>` for the shell chrome
4. Update `NAV_ITEMS` in `shared/shell.js` to add your tool to the navigation
5. Optionally add a keyboard shortcut to the `SHORTCUTS` array

## Customization

### Branding (`branding.json`)

Edit `branding.json` at the project root to override the accent color and app name:

```json
{
  "appName": "My Dashboard",
  "primaryColor": "#5b8af5",
  "primaryHoverColor": "#7aa2f7"
}
```

The branding loader runs on every page and applies these overrides at runtime. Delete the file to use defaults.

### CSS Tokens

All visual properties are controlled by CSS custom properties in `shared/shell.css`. Key tokens:

| Token | Default | Description |
|-------|---------|-------------|
| `--color-bg` | `#0f1117` | Page background |
| `--color-surface` | `#1a1d27` | Card/panel background |
| `--color-primary` | `#5b8af5` | Accent color |
| `--color-text` | `#e1e4ed` | Body text |
| `--font-sans` | System stack | Primary font |
| `--font-mono` | SF Mono stack | Monospace font |
| `--radius-md` | `10px` | Default border radius |
| `--shell-max-width` | `1400px` | Content max width |

Light theme colors are automatically applied via `prefers-color-scheme: light`.

## Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `g h` | Go to Home |
| `g e` | Go to Example Tool |
| `?` | Show shortcuts modal |

Shortcuts are disabled when an input, textarea, or select is focused.

## Accessibility Features

- **Skip to content** link (visible on Tab)
- **Text size** preference (Default / Large / Larger)
- **High contrast** mode toggle
- Preferences persist in `localStorage` across sessions
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
- All interactive elements have proper focus indicators via `:focus-visible`

## File Structure

```
cardigan-dashboard-static/
├── shared/
│   ├── shell.css          # Design tokens, layout, a11y, components
│   └── shell.js           # Custom elements, keyboard nav, preferences
├── example-tool/
│   ├── index.html          # Demo inner page
│   └── styles.css          # Tool-specific styles example
├── assets/
│   └── logo.svg            # Placeholder logo
├── branding.json           # Runtime customization (optional)
├── index.html              # Landing page
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deploy
├── .gitignore
└── README.md
```

## License

MIT
