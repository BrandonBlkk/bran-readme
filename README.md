# BranReadme

BranReadme is a React + Vite app for building GitHub profile README files with drag-and-drop sections, live preview, and template sharing.

<img width="1911" height="905" alt="image" src="https://github.com/user-attachments/assets/43da42df-3dc5-48a6-985b-9bc021f51e49" />

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor in Supabase.
3. Create the `templates` table and policies in SQL Editor (including `sections` jsonb and `markdown` text columns).
4. Copy your project URL + anon key into `.env`.

The Templates page reads public templates from Supabase and allows creating new public templates from your current builder snapshot.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run preview` - preview production build
