# Data fetching

## Today

- The site is static: content comes from data files in `app/_components/`, not from an API
- The only network call is the contact form, which posts to Web3Forms

## Services layer

- All calls to external services live in `app/_services/` (one file per domain, e.g. `contact.service.ts`)
- Components and hooks never call `fetch` directly — they call a service function
- Every service function has typed params and a typed return value

## Typing

- Request and response types live in `app/_types/`
- Never trust a response as `any` — parse it as `unknown` and narrow

## When real server data arrives

- If the site starts loading changing data (e.g. the Instagram feed for Novedades), prefer fetching it in Server Components with Next.js caching
- Add TanStack Query only if that data needs client-side fetching, refetching or mutations
