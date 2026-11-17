@AGENTS.md

# GUESSMA (website) — CLAUDE.md

## What this is
guessma-web is the Next.js (App Router) website live at guessma.com on Vercel: daily game,
accounts, profile, redeem codes, how-to-play pages and the admin dashboard.
It shares one Supabase project with the game repo `guessma` (React + Vite).
Schema or data changes here can break the game, and the reverse is also true.

- `main` is the only branch.
- **This repo is PUBLIC on GitHub.** Never commit anything sensitive: no keys, tokens,
  env values, personal emails, customer data or internal URLs. Treat every commit as published.

## Session start
```
git fetch
git log --oneline -5
git status --short
```
Stop if the tree is not clean or the branch is not `main`.

## Hard rules
- `git commit --only <paths>`. Never `git add -A`. Never push.
- No shell aliases `rm` or `del`. No delete commands unless the owner approves them for that build.
- Never print or commit secrets, keys, tokens or env values. Report names and file:line only.
- Do not touch any visual, copy, layout or flow unless the task asks for it.
- Record wall-clock time per step. Report any wait over 2 minutes with its cause.

## Proof rule
Pure refactors must not change behaviour. Before a refactor is done:
- `npx tsc --noEmit`: error count unchanged from the baseline (TypeScript with
  `strict: false` and `allowJs`; record the baseline count before you start).
- `npm run lint`: 0 errors and no new warnings compared with the baseline.
- `npm run build`: production build passes. Without a local `.env.local`, prerender fails on
  missing `NEXT_PUBLIC_SUPABASE_*`; pass obvious placeholder values inline for the check.
- Tests pass, once tests exist.
- Before/after screenshots of the key pages: `/`, `/daily` (each phase), `/profile`,
  `/login`, `/how-to-play`, `/admin`.
- Moves and renames go in their own commit. Logic changes go in a separate commit.

## Code standard
- Every tunable (timers, point values, karma rates, category lists, labels) lives in one config place.
- No unused code: no dead files, exports, debug `console.log` or commented-out blocks.
- No literals scattered in components.
- No mode- or category-specific branches in shared code. New modes and categories plug in
  through a definition file.

## CSS rules
- Use CSS custom properties for colors, spacing and font sizes (theme lives in `globals.css`).
- No viewport-unit or `position: fixed` hacks for layout. The shared Nav is the only fixed element.
- No raw font sizes in new code. Use the shared variables.

## Folder map — current
```
src/app/
  layout.tsx, page.tsx, globals.css   root layout, homepage, global styles
  components/Nav.tsx                  shared top nav (loads account + streak)
  lib/supabase.js                     the only Supabase client (browser, @supabase/ssr)
  daily/                              daily game: page.tsx, types.ts, components/ (10 phases)
  admin/                              admin dashboard: page.tsx, components/ (4 tabs)
  admin-verify/, account/setup-mfa/   admin MFA challenge and TOTP enrolment
  login/, signup/, reset-password/    auth pages
  profile/, redeem/                   account pages
  how-to-play/                        rules pages, client layout, _styles.ts
  connect/, get-the-game/, news/      marketing and info pages
  api/health/route.ts                 env presence check
```

## Folder map — target
```
src/app/       routes only (thin pages that compose features)
src/core/      pure logic: scoring, karma, streaks, daily types
src/features/  daily, admin, account
src/ui/        shared presentational components (Nav, styles)
src/services/  Supabase browser and server clients, data access
src/config/    categories, difficulty labels, timers, point values
```
Move toward the target in small refactor commits. Never mix a move with a logic change.

## Commit format
`<type>: <summary>`, where type is one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.
