# TerraPulse — run doc

Next.js 14 app (npm). No database, no secrets; optional env only.

## Reproduce artifacts (data/artifacts)

Artifacts are committed, but regenerate them deterministically any time with:

```bash
npm install        # once per fresh checkout (package-lock.json present)
npm run pipeline   # rebuilds data/artifacts from data/registry.ts (~2 s, deterministic)
```

`npm run build` also self-checks artifacts via `scripts/serve-artifacts.mjs`.

There is no `.env.local` to copy — `.env.example` documents the optional vars
(`OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL`); the app runs fully without them.

## Run the server (dev)

```bash
npm run dev        # binds http://localhost:3000 by default
```

Port already taken? Use `npm run dev -- -p 3001` (or any free port).
Production alternative: `npm run build && npm start`.
