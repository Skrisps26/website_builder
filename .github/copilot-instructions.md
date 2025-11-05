## Repo snapshot for AI agents

This is a Next.js (App Router) + TypeScript UI project with Tailwind and many Radix/utility UI components.

- Framework: Next.js 16 (app/ directory).
- Package manager: pnpm (repository includes `pnpm-lock.yaml`).
- UI: Tailwind CSS, `class-variance-authority` (cva) and `cn` utility in `src` style patterns under `components/ui/`.

## Quick commands

Use the workspace root (where `package.json` lives).

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev` (runs `next dev`)
- Build: `pnpm build` (runs `next build`)
- Start production: `pnpm start` (runs `next start`)
- Lint: `pnpm lint` (runs `eslint .`)

Notes: `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — builds may succeed despite type errors. Prefer fixing types, but be aware CI/build may allow type issues.

## Architecture & important files

- App entry & layout: `app/layout.tsx` — server layout, imports global CSS and analytics.
- Main page UI: `app/page.tsx` — client component (`"use client"`) that demonstrates API integration and polling logic.
- API layer: `lib/api.ts` — small fetch wrapper. Uses `NEXT_PUBLIC_AWS_API_URL` (fallback `http://localhost:3001`) to reach the backend. Example functions: `chatAPI(prompt)` and `checkProjectStatus(userId, projectId)`.
- Theme provider: `components/theme-provider.tsx` — wraps `next-themes` with a thin adapter (client component).
- Shared UI primitives: `components/ui/*` — consistent patterns (cva + `cn`). Example: `components/ui/button.tsx` shows the CVA-based `buttonVariants` and `Button` wrapper.

## Patterns & conventions an AI should follow

- File aliases: import using `@/` (see `tsconfig.json` paths). Use `@/components/...`, `@/lib/...`.
- UI components live under `components/ui/` and export both component and variant helpers (e.g., `Button` and `buttonVariants`). Follow the CVA pattern when adding variants.
- Client vs Server components: Interactive components include `"use client"` at the top. `app/layout.tsx` is a server component — avoid adding client-only APIs there.
- Styling: Tailwind utility classes are primary. Keep class composition small and use `cva`/`cn` helpers for reusable variants (see `components/ui/button.tsx`).

## Integration points to know

- Backend API: `lib/api.ts` expects `NEXT_PUBLIC_AWS_API_URL`. The frontend polls `checkProjectStatus` in `app/page.tsx` every 5s for generation status and displays `previewUrl` in an iframe.
- AWS response structure: Backend returns nested JSON with `build.Build.BuildStatus` and `upload.previewUrl`. The API layer transforms this to flat `{ status, previewUrl }` for the UI.
- Analytics: `@vercel/analytics` used in `app/layout.tsx`.

## Environment setup

1. Copy `.env.local.example` to `.env.local` in the project root
2. Set `NEXT_PUBLIC_AWS_API_URL` to your AWS API Gateway endpoint
   - Find in AWS Console: **API Gateway** → Select your API → **Stages** → Copy the "Invoke URL" from your deployed stage (e.g., `prod` or `dev`)
   - Format: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`
3. Restart the dev server (`pnpm dev`) after changing env vars

## What I did *not* find

- No `.github/copilot-instructions.md` or other agent docs were present prior to this file creation.
- There are no test scripts in `package.json` — there isn't an obvious test harness to run.

## How the AI should act when editing

- Preserve `components/ui/*` public APIs (named exports). When adding new primitives, follow the `cva` + `cn` + variant pattern.
- For changes that touch runtime behavior (API URL, polling, auth), prefer editing `lib/api.ts` and `app/page.tsx` so behavior is centralized.
- When introducing client-side stateful logic, ensure the file includes `"use client"` and keep server components free from browser-only code.

If any of the above is unclear or you'd like me to expand examples (e.g., add a short snippet showing how to add a new `cva`-based component), tell me which area to expand and I'll iterate.
