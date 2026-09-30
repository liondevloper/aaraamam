# Aaraamam Restaurant

Kerala cuisine restaurant website (Karama, Dubai): menu, online ordering (delivery and pickup), order tracking with rider live location, table booking, admin panel.

Stack: Vite, React 19, TypeScript, Tailwind 4, Convex, Hercules Auth.

Images are hosted on the Hercules CDN (see `convex/lib/defaults.ts` and `convex/lib/menuData.ts`); no image files need to be copied.

## What is in this repo

All custom app code: `convex/` (backend), `src/pages`, `src/components` (custom), `src/lib`, `src/hooks`, `src/App.tsx`.

## What is NOT in this repo (still lives in the Hercules project)

Standard Hercules template files: `src/components/ui/*` (shadcn), `src/components/providers/{default,auth,convex,theme,query-client}.tsx`, `src/pages/auth/*`, `src/pages/NotFound.tsx`, `src/main.tsx`, `src/index.css`, `src/hooks/{use-auth,use-debounce,use-mobile}.ts`, `convex/_generated`, and the config files (tsconfig, vite, eslint). To run the site standalone these must be copied from the Hercules project.
