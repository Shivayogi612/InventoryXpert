# Smart Inventory Manager (SED Project)

This repo is a production-focused skeleton for Smart Inventory Manager with a zero perceived load caching strategy, Supabase backend integration, and polished UI components using React + Vite + Tailwind.

Quick start

1. Copy `.env.example` to `.env` and fill your Supabase project variables.

2. Install dependencies (PowerShell):

```powershell
cd path\to\smart-inventory-manager; npm install
```

3. Run dev server:

```powershell
npm run dev
```

What I scaffolded so far

- Vite + React project files
- Tailwind configuration
- Critical services: `cache.service.js`, `supabase.js`, `auth.service.js`
- `useCache` hook and initial UI (AuthContext, Login, Dashboard)

Next steps

- Expand pages and full features (forecasting, barcode scanning, reports)
- Add tests and CI
- Polish animations and production bundling

If you want, I can now install dependencies and run the dev server for you, or continue implementing more pages and features.
