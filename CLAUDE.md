# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev           # Start dev server (Turbopack, outputs to .next/dev)
npm run build         # Production build (Turbopack by default)
npm run start         # Start production server
npm run lint          # Run ESLint (eslint directly — not next lint, which was removed in v16)
npm run format        # Format everything with Prettier
npm run format:check  # Check formatting without writing
npm run test:e2e      # Build, start and run the Playwright end-to-end tests
npm run test:e2e:report  # Open the HTML report of the last test run
```

**Tests:** Playwright end-to-end tests live in `e2e/` and run against a production build in two projects: desktop Chrome and iPhone Safari (WebKit). Several past bugs only reproduced in Safari, so keep both projects. Tests import the site's data files (`club-info.ts`, `disciplines.ts`) instead of duplicating expected values. The first run on a new machine needs `npx playwright install chromium webkit`. Run the suite before pushing changes that affect behavior.

**Dependencies:** both `pnpm-lock.yaml` and `package-lock.json` are committed. When adding a dependency, update both (`pnpm add <pkg>` and then `npm install --package-lock-only`) so the deploy installs the same versions whichever package manager runs.

## Architecture

Marketing site for Club S&D F.A. Domingo Matheu. Next.js **16.2.6** App Router, React 19.2, TypeScript (strict). Mostly static: the home page is a single route built from section components.

- `app/page.tsx` — home page: renders the sections in order plus the JSON-LD structured data.
- `app/preguntas-frecuentes/` — the FAQ page: the `Preguntas` section between `SubpageHeader` (a static stand-in for the home nav) and the `Footer`. The home only shows `PreguntasCta`, a short section linking to it. Questions live in `faqs.ts`, prices in `fees.ts`.
- `app/novedades/`, `app/not-found.tsx`, `app/error.tsx` — standalone pages built on the shared `StatusPage` layout.
- `app/_components/` — section components (`hero.tsx`, `disciplinas.tsx`, …), small shared components, hooks (`use-*.ts`) and static data:
  - `club-info.ts` — contact details, address, hours, social links. Single source of truth: never hard-code these anywhere else.
  - `disciplines.ts`, `facilities.ts` — the lists that drive the disciplines grid, the hero marquee and counters, and the facilities cards.
  - `nav-links.ts` — the nav links: the home sections, grouped under the "El club" dropdown (`NavDropdown`), and the pages outside the home (Novedades, Preguntas frecuentes), always in view.
- `app/_services/` — calls to external services (e.g. `contact.service.ts`, which posts the contact form to Web3Forms).
- `app/_types/` — request/response types for those services.
- `app/_lib/` — non-UI helpers (e.g. `site-url.ts`).
- `app/styles/` — one plain-CSS file per section, imported in order from `app/globals.css`.
- `public/` — static assets, referenced from `/`. Photos live in `public/club/`; their sources are documented in `docs/fuentes-imagenes.md`.
- `@/*` path alias maps to the repo root (configured in `tsconfig.json`).

**Styling:** plain CSS with design tokens as CSS variables in `app/styles/base.css`. Tailwind v4 is installed only for its base reset (preflight); its utility classes are not used. Do not remove the `@import "tailwindcss"` line without checking every page, since the reset affects margins and typography across the site.

**Nav logo animation:** `app/_components/logo-flight.ts` runs as an inline script (`LogoFlightScript`) right after the hero, before React hydrates, so it works on slow connections. It must stay self-contained (it is serialized with `toString()`). React does not run that inline script after a client-side navigation (e.g. a `<Link>` back to `/`), so `Nav` also starts it on mount through `use-logo-flight.ts`.

## Next.js 16 Breaking Changes

Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. Key v16 changes that differ from training data:

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now async-only. Always `await` them:
```tsx
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params
  const query = await searchParams
}
```
Run `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` type helpers.

**`middleware` → `proxy`** — The `middleware.ts` file and `middleware` export are deprecated. Rename to `proxy.ts` and export `proxy`. The proxy runtime is Node.js only (no edge runtime). Use `middleware` only if you need the edge runtime.

**Linting** — `next lint` is removed. Use `eslint` directly (already in `package.json` scripts). `next build` no longer runs the linter.

**Turbopack is default** — Both `next dev` and `next build` use Turbopack. To opt out: `next build --webpack`. Turbopack config is now a top-level `turbopack` key in `next.config.ts`, not under `experimental`.

**Caching APIs**
- `revalidateTag(tag, cacheLife)` now requires a second `cacheLife` argument (e.g. `'max'`).
- `updateTag(tag)` — new Server Actions-only API for immediate cache refresh (read-your-writes semantics).
- `refresh()` — refreshes the client router from a Server Action.
- `cacheLife` and `cacheTag` are stable (no `unstable_` prefix needed).

**PPR** — The `experimental.ppr` flag is removed. Use `cacheComponents: true` in `next.config.ts` instead.

**Parallel Routes** — All `@slot` parallel route slots require an explicit `default.js` file or the build fails.

**Removed entirely**: AMP support, `serverRuntimeConfig`/`publicRuntimeConfig` (use env vars), `devIndicators.appIsrStatus/buildActivity`, `experimental.dynamicIO` (renamed to `cacheComponents`).

**Images** — `next/legacy/image` is deprecated (use `next/image`). `images.domains` is deprecated (use `images.remotePatterns`). New defaults: `minimumCacheTTL` is 4 hours, `qualities` defaults to `[75]`, 16px removed from `imageSizes`.


## Development rules

@docs/rules/code-style.md
@docs/rules/components.md
@docs/rules/state-management.md
@docs/rules/data-fetching.md
@docs/rules/error-handling.md
@docs/rules/performance.md
@docs/rules/git.md

## Management system ("Sistema de gestión")

Besides the landing, this repo hosts the **club's internal management system**
under `/sistema`: a web replacement for the old system the club uses today
(apparently Hoost, `far.myhoost.com`: old, reachable only from some computers,
unclear features). Read `docs/sistema/propuesta.md` before touching anything
under `app/sistema/`: it holds the full idea, the modules, the feature list,
the data model, the migration plan, the phases for the quote and the technical
decisions, which are already taken. `PROMPTS.md` at the repo root has the
prompts, one per stage, used to build it in separate Claude Code sessions (the
API's own prompts are in `../api/PROMPTS.md`).

**Current stage: the demo.** It lives on branch `feat/sistema-demo`, with mock
data generated in memory and a fake cookie login, so the club can try the flows
before approving a quote. If they approve, the branch is merged to production;
if not, it is deleted and the landing stays as is.

- Everything is self-contained in `app/sistema/` (route groups `(auth)` for
  the login and `(app)` for the gated system; `_types/`, `_data/`, `_lib/`,
  `_components/`, `_actions/`) plus `app/styles/sistema/` (classes prefixed
  `sys-`, imported only from `app/sistema/layout.tsx`, never from
  `globals.css`). Reuse the landing's tokens, fonts, `club-info.ts`,
  `disciplines.ts`, `fees.ts`, `whatsapp.ts` and hooks instead of copying them.
- `app/sistema/_types/` is the domain contract (members, family groups, fees,
  payments, receipts, pool season, access control, employees, disciplines,
  users, roles). The API's DTOs and Prisma schema follow it; change it with
  care and keep both sides in sync.
- `/sistema` is `noindex`, out of the sitemap and disallowed in `robots.ts`.
- Demo conventions: fixed "today" in `_lib/clock.ts`, Context + `useReducer`
  store (`SystemProvider`, `useSystem()`) saved in the visitor's
  localStorage (`_lib/demo-storage.ts`; bump `DEMO_DATA_VERSION` when the
  seed or `SystemState` changes) with a "Reiniciar demo" button, derived
  states (overdue fees, pool access) computed in pure helpers, never stored.
- Same rules as the landing: code in English, copy in Rioplatense Spanish,
  plain CSS, hooks in `use-*.ts`, data in data files, no `console.log`.

**The real system.** The front stays here under `/sistema`; only the API is a
separate repo: `LumarSoft/fda-api` (NestJS + Prisma + MySQL, started from the
`LumarSoft/prisma_api` starter). The two repos sit side by side inside the
`fda-v2/` workspace folder: `front/` (this repo) and `api/`. Each is its own git
repository; run each one's commands from inside its folder. Migration from the
old system is defined once we know how it hands over its data.
