<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# How to respond (interaction rules)

These rules apply to **every** session and override default behavior:

1. **Always reply in Thai (ภาษาไทย)** — all explanations and summaries.
2. **Plan before editing code.** Before touching any code, present a **checkbox summary** (`- [ ] …`) of exactly what will change, then **stop and wait for the user to confirm**. Do not edit until they approve.
3. **After approval, make the edits.**
4. **After editing, summarize** what was actually changed.
5. **After the summary, add a short tip** — a suggestion, trick, or piece of knowledge relevant to what was just done (only if there is something genuinely useful to share).

> Docs/config-only changes and pure questions don't require the checkbox-confirm step — it's for code edits.

# Project: next16-core-service

A personal core-service app on **Next.js 16 + React 19 + Tailwind v4**. Data comes from an external API consumed via `axios`; there is no local database in this repo.

## Where code lives

Feature code lives in `modules/core/<feature>/`, split into:

- `index.tsx` — UI plus the feature's local `use<Feature>` hook(s).
- `functions.tsx` — `axios` API calls through `apiClient` (from `@/lib/api-client`), plus a `get<Feature>ErrorMessage` helper.
- `models.ts(x)` — TypeScript types for the feature.
- Sub-components go in **PascalCase** subfolders (e.g. `EventSheet/`, `ProjectSheet/`).

Pages in `app/(core)/<feature>/page.tsx` stay **thin**: export `metadata`, then re-export the module component. Auth pages live under `app/(auth)/`.

Shared locations:

- API path maps → `constants/api/<feature>.ts`
- Route strings → `constants/page_route.ts`
- Shared helpers → `lib/` (`api-client`, `currency`, `toast`, `utils`, …)
- Reusable UI → `components/`

## Conventions to follow

- **Toasts:** use `appToast` from `@/lib/toast` — do not call `sonner` directly.
- **Confirm dialogs:** reuse `components/dialogs/delete-confirm-dialog` and `toggle-status-confirm-dialog` instead of building new ones.
- **Loading spinner:** `LineMdLoadingLoop`.
- **Reload pattern:** bump a `reloadKey` state to re-run the load effect.
- **Effects & state:** setting state directly inside an effect is linted (`react-hooks/set-state-in-effect`). Wrap loads in an async fn called via `void load()`, or use render-time state adjustment for prop-sync.
- **`params` is a Promise** in this Next.js version — `await` it before use.
- **Forms:** `react-hook-form` + `zod` via `@hookform/resolvers`.
- **Icons:** prefer the custom wrappers in `assets/icons/`.

## Design system

- Primary color: coral/rose (oklch). Font: **K2D**.
- `Button` variants include `success` / `warning` / `danger` / `info` beyond the defaults.
- Use `class-variance-authority` + `tailwind-merge` (`cn` from `@/lib/utils`) for variants.

## Before you finish

Verify changes with:

```bash
npx tsc --noEmit
npx eslint
npm run build
```
