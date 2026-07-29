# Shindo Character Build Archive

A polished, local-first archive for manhwa-inspired Shindo Life builds. The app includes a portrait gallery, sortable spreadsheet view, build details, slot-limit variants, comparison tools, structured editing, CSV export, and browser-local persistence.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Production verification:

```bash
npm run build
npm run preview
```

## Project structure

- `src/data/characters.ts` — all starter character data and the blank-build factory
- `src/types.ts` — typed build, hotbar, combo, and rating models
- `src/components/` — gallery, table, details, editor, comparison, and shared UI
- `src/hooks/useBuilds.ts` — localStorage persistence and reset helpers
- `public/characters/` — local character portraits
- `IMAGE_SOURCES.md` — portrait source pages and resolved original assets

## Add a character

The easiest path is the **Add build** button in the app. The character is saved to this browser's localStorage.

To ship a permanent starter character, add a new seed in `src/data/characters.ts`. Use a unique kebab-case `id`; its default image resolves to:

```text
public/characters/<id>.jpg
```

Every build receives the required 12-key hotbar and five combo route templates. You can customize those fields in the generated object or through the app editor.

## Add or replace portraits

1. Place a JPG, PNG, or WebP file in `public/characters/`.
2. Use a clear kebab-case filename such as `james-lee.jpg`.
3. Set the build image field to `/characters/james-lee.jpg`.

Missing or broken image paths render a styled fallback automatically. The included portraits are normalized local copies of character images sourced from the linked community wikis; the app does not depend on remote image hosts at runtime. See `IMAGE_SOURCES.md` for attribution and direct asset links.

Refresh the bundled images and source manifest with:

```bash
npm run sync:portraits
```

## Local data and resets

Edits, duplicates, deletions, and new builds are stored under `shindo-build-archive:v1` in localStorage. Reset one build from its detail view, or restore the complete starter archive from the About page.

## Disclaimer

This is an unofficial fan-made project. It is not affiliated with RELL Games, Roblox, or the creators and publishers of referenced manhwa. Shindo Life balance and move behavior can change after updates.
